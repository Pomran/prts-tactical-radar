import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PRTSNavbar } from './components/PRTSNavbar';
import { RadarView } from './components/RadarView';
import { DoctorListView } from './components/DoctorListView';
import { CommsLogModal } from './components/CommsLogModal';
import { DoctorDetailModal } from './components/DoctorDetailModal';
import { MyProfileModal } from './components/MyProfileModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { DoctorProfile, RadarFilter, TacticalInteraction, LightPresence } from './types';
import { OPERATOR_DATABASE } from './data/operators';
import { TACTICAL_HOTSPOTS, applyJitter, wgs84ToGcj02, calculateDistance } from './utils/geoutils';
import { getRadarCellSignature } from '@/shared/radarSpatial';
import { prtsAudio } from './utils/audio';
import { radarApi, getDeviceId, loadProfileSettings, saveProfileSettings, loadFilterSettings, saveFilterSettings, toLightPresence, toDoctorProfile } from './utils/api';
import { PresenceSocket } from './utils/ws';

// 全域扫描哨兵半径：默认探测半径即为「全域」，向后端传一个超大的哨兵值以返回广域所有在线博士。
export const GLOBAL_SCAN_SENTINEL = 10000;

// ---------------------------------------------------------------------------
// IP Geolocation via Worker (uses Cloudflare's built-in request.cf geo data)
// ---------------------------------------------------------------------------
async function fetchIPGeolocation(): Promise<{ lat: number; lng: number; city: string } | null> {
  try {
    const res = await fetch('/api/radar/geoip');
    const data = await res.json();
    console.log('[PRTS] geoip 响应:', data);
    if (data.ok && data.lat && data.lng) {
      return { lat: data.lat, lng: data.lng, city: data.city || '' };
    }
  } catch (e) {
    console.warn('[PRTS] AMap JS API not loaded');
  }
  return null;
}

// ---------------------------------------------------------------------------
// Layer 1: Browser native geolocation (GPS/Wi-Fi, highest precision)
// ---------------------------------------------------------------------------
function browserGeolocate(): Promise<{ lat: number; lng: number; accuracy: number } | null> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        // WGS-84 → GCJ-02，否则在高德瓦片上偏移 300~600 米
        const gcj = wgs84ToGcj02(latitude, longitude);
        console.log('[PRTS] browser GPS:', { wgs: [latitude, longitude], gcj: [gcj.lat, gcj.lng], accuracy });
        if (Number.isFinite(gcj.lat) && Number.isFinite(gcj.lng)) {
          resolve({ lat: gcj.lat, lng: gcj.lng, accuracy: accuracy ?? 9999 });
        } else {
          resolve(null);
        }
      },
      (err) => {
        console.warn('[PRTS] browser GPS failed:', err.code, err.message);
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
  });
}

// ---------------------------------------------------------------------------
// Layer 2: Gaode AMap.Geolocation (browser → IP fallback, China-optimized)
// ---------------------------------------------------------------------------
function gaodeLocate(): Promise<{ lat: number; lng: number; city: string } | null> {
  return new Promise((resolve) => {
    const AMap = (window as any).AMap;
    if (!AMap || !AMap.Geolocation) { resolve(null); return; }
    const geolocation = new AMap.Geolocation({
      enableHighAccuracy: true,
      timeout: 10000,
      noIpLocation: false,
      getCityWhenFail: true,
      needAddress: true,
      zoomToAccuracy: true,
    });
    geolocation.getCurrentPosition((status: string, result: any) => {
      console.log('[PRTS] Gaode locate:', status, result?.location_type, result);
      // position 可能是 LngLat 对象(.lat/.lng)、数组([lng, lat])或带 getLat/getLng 方法
      const p = result?.position;
      let lat = Number.isFinite(Number(p?.lat)) ? Number(p.lat) : Number.NaN;
      let lng = Number.isFinite(Number(p?.lng)) ? Number(p.lng) : Number.NaN;
      if (!Number.isFinite(lat)) lat = Number(typeof p?.getLat === 'function' ? p.getLat() : p?.[1]);
      if (!Number.isFinite(lng)) lng = Number(typeof p?.getLng === 'function' ? p.getLng() : p?.[0]);
      if (status === 'complete' && Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0) {
        const city = result.formattedAddress || result.addressComponent?.city || result.addressComponent?.province || '';
        console.log('[PRTS] Gaode located:', { lat, lng, city, type: result.location_type });
        resolve({ lat, lng, city });
      } else {
        resolve(null);
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Layer 1.5: watchPosition 持续精化 — 首次粗定位立即显示，随后持续等待更高精度
// 精度 >200m 的点丢弃；accuracy <=30m 视为街道级，自动停止省电
// ---------------------------------------------------------------------------
function startGpsWatch(
  onUpdate: (lat: number, lng: number, accuracy: number) => void,
  onDone: (lat: number | null, lng: number | null, accuracy: number) => void,
): () => void {
  if (!('geolocation' in navigator)) { onDone(null, null, Infinity); return () => {}; }
  let lastLat: number | null = null;
  let lastLng: number | null = null;
  let lastAcc = Infinity;
  let stopped = false;
  const watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;
      const gcj = wgs84ToGcj02(latitude, longitude);
      const acc = accuracy ?? 9999;
      console.log('[PRTS] GPS watch:', { gcj: [gcj.lat, gcj.lng], acc });
      if (!Number.isFinite(gcj.lat) || !Number.isFinite(gcj.lng)) return;
      // 精度门槛：太差的点不更新地图（避免抖动）
      if (acc > 200) {
        console.log(`[PRTS] 等待更高精度定位，当前 ±${Math.round(acc)}m`);
        return;
      }
      lastLat = gcj.lat; lastLng = gcj.lng; lastAcc = acc;
      onUpdate(gcj.lat, gcj.lng, acc);
      // 街道级精度达成，停止监听
      if (acc <= 30) {
        stop();
      }
    },
    (err) => {
      // TIMEOUT (code 3): device is still trying to acquire a fix — keep
      // watching so a later update can refine our position. Only stop on
      // hard failures (permission denied / position unavailable).
      if (err.code === 3) {
        console.warn('[PRTS] GPS watch timeout, keep waiting for fix...');
        return;
      }
      console.warn('[PRTS] GPS watch error:', err.code, err.message);
      stop();
    },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 },
  );
  // 兜底：若长时间未能拿到可用的高精度点，用已有点结束，避免永久挂起
  const watchdog = setTimeout(() => {
    if (!stopped && (lastLat === null || lastAcc > 200)) {
      console.warn('[PRTS] GPS watch timed out without usable fix, stopping');
      stop();
    }
  }, 60000);
  function stop() {
    if (stopped) return;
    stopped = true;
    navigator.geolocation.clearWatch(watchId);
    clearTimeout(watchdog);
    onDone(lastLat, lastLng, lastAcc);
  }
  return stop;
}

// ---------------------------------------------------------------------------
// Reverse geocoding: 坐标 → 街道地址文本（高德 Geocoder）
// ---------------------------------------------------------------------------
function gaodeRegeo(lat: number, lng: number): Promise<string | null> {
  return new Promise((resolve) => {
    const AMap = (window as any).AMap;
    if (!AMap) { resolve(null); return; }
    AMap.plugin('AMap.Geocoder', () => {
      try {
        const geocoder = new AMap.Geocoder({});
        geocoder.getAddress([lng, lat], (status: string, result: any) => {
          if (status === 'complete' && result?.regeocode?.formattedAddress) {
            resolve(result.regeocode.formattedAddress as string);
          } else {
            resolve(null);
          }
        });
      } catch {
        resolve(null);
      }
    });
  });
}

export default function App() {
  // -----------------------------------------------------------------------
  // Boot sequence
  // -----------------------------------------------------------------------
  const [isBooting, setIsBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(15);
  const [bootLog, setBootLog] = useState('PRTS NEURAL LINK INITIATING...');

  // -----------------------------------------------------------------------
  // Navigation
  // -----------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<'radar' | 'list' | 'logs'>('radar');

  // -----------------------------------------------------------------------
  // Modals
  // -----------------------------------------------------------------------
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // -----------------------------------------------------------------------
  // Location
  // -----------------------------------------------------------------------
    const [locationName, setLocationName] = useState('上海国家会展中心 (CP区)');

  // -----------------------------------------------------------------------
  // Player Profile — ID persisted via getDeviceId()
  // -----------------------------------------------------------------------
  const [myProfile, setMyProfile] = useState<DoctorProfile>(() => {
    const defaultOp = OPERATOR_DATABASE[0]; // Amiya
    const initialLat = TACTICAL_HOTSPOTS[0].lat;
    const initialLng = TACTICAL_HOTSPOTS[0].lng;

    const base: DoctorProfile = {
      id: getDeviceId(),
      name: 'Doctor.Rhodes',
      title: '罗德岛核心指挥官',
      level: 120,
      uid: '89427103',
      server: 'CN_OFFICIAL',
      assistant: defaultOp,
      sanity: { current: 128, max: 135 },
      motto: '"理智已就绪，随时接受突袭演练与线索传递！"',
      supportOperators: [
        { operator: OPERATOR_DATABASE[3], level: 90, elite: 2, skillLevel: '专精 3' },
        { operator: OPERATOR_DATABASE[2], level: 90, elite: 2, skillLevel: '专精 3' },
      ],
      wantedClues: [4, 5],
      extraClues: [7, 2],
      lat: initialLat,
      lng: initialLng,
      isCamouflaged: true,
      offsetRadiusMeters: 300,
      beaconBroadcastRadiusKm: 5,
      broadcastVisibility: 'all',
      lastActive: '刚刚',
      receivedSanityCount: 18,
      isOnline: true,
    };

    // Merge persisted user settings (if any). Location re-detects on boot.
    const saved = loadProfileSettings();
    if (saved) {
      return { ...base, ...saved, lat: initialLat, lng: initialLng };
    }
    return base;
  });

  // -----------------------------------------------------------------------
  // Nearby Doctors
  // -----------------------------------------------------------------------
  const [nearbyDoctors, setNearbyDoctors] = useState<DoctorProfile[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  // Persistent beacon deployed at my current location (常驻信标).
  const [beaconActive, setBeaconActive] = useState(false);

  // -----------------------------------------------------------------------
  // Filters
  // -----------------------------------------------------------------------
  const [filter, setFilter] = useState<RadarFilter>(() => {
    const defaults: RadarFilter = {
      radiusKm: 5,
      scanGlobal: true,
      server: 'ALL',
      minLevel: 0,
      onlyOnline: false,
      hasSupport: false,
      lookingForClues: false,
    };
    const saved = loadFilterSettings();
    return saved ? { ...defaults, ...saved } : defaults;
  });

  // -----------------------------------------------------------------------
  // Comms Logs
  // -----------------------------------------------------------------------
  const [commsLogs, setCommsLogs] = useState<TacticalInteraction[]>([]);

  // -----------------------------------------------------------------------
  // Refs for latest values (avoid stale closures in intervals)
  // -----------------------------------------------------------------------
  const profileRef = useRef(myProfile);
  profileRef.current = myProfile;
  const filterRef = useRef(filter);
  filterRef.current = filter;
  // Cache the last successful scan's spatial cell signature for client-side dedup.
  const lastScanSigRef = useRef<string>('');
  // P3: last time the user sent an interaction — drives a temporary faster inbox poll.
  const lastInteractAtRef = useRef<number>(0);
  // Presence WS (Level 1 realtime) + the live visible-user map it maintains.
  const presenceSocketRef = useRef<PresenceSocket | null>(null);
  const visibleUsersRef = useRef<Map<string, DoctorProfile>>(new Map());
  const lastWsPresenceAtRef = useRef<number>(0);
  // Persistent beacons (Level 3) — offline discoverable doctors, fetched via HTTP scan.
  const beaconsRef = useRef<Map<string, DoctorProfile>>(new Map());

  // -----------------------------------------------------------------------
  // Persist user settings to localStorage whenever they change (debounced-ish)
  // -----------------------------------------------------------------------
  useEffect(() => {
    saveProfileSettings(myProfile);
  }, [myProfile.isCamouflaged, myProfile.offsetRadiusMeters, myProfile.beaconBroadcastRadiusKm,
     myProfile.broadcastVisibility,
     myProfile.name, myProfile.title, myProfile.level, myProfile.uid, myProfile.server,
     myProfile.assistant, myProfile.sanity, myProfile.motto, myProfile.supportOperators,
     myProfile.wantedClues, myProfile.extraClues]);

  useEffect(() => {
    saveFilterSettings(filter);
  }, [filter]);

  // -----------------------------------------------------------------------
  // Boot animation
  // -----------------------------------------------------------------------
  useEffect(() => {
    const steps = [
      { p: 35, log: 'SYNAPSE PROTOCOL ALIGNED // 神经递质校准中...' },
      { p: 65, log: 'LOADING TACTICAL GRID MAP // 加载战术暗夜切片...' },
      { p: 90, log: 'GEOHASH BEACON CONNECTED // 罗德岛信标已连接...' },
      { p: 100, log: 'PRTS ONLINE // 战术雷达系统就绪' },
    ];
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setBootProgress(steps[currentStep].p);
        setBootLog(steps[currentStep].log);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => { setIsBooting(false); prtsAudio.bindUserGesture(); }, 300);
      }
    }, 280);
    return () => clearInterval(interval);
  }, []);

  // -----------------------------------------------------------------------
  // Inbox items — shared by the HTTP poll AND the WS `inbox:deliver` push.
  // -----------------------------------------------------------------------
  const handleInboxItems = useCallback((items: TacticalInteraction[]) => {
    if (!items || items.length === 0) return;
    setCommsLogs((prev) => [...items, ...prev].slice(0, 200));

    // Apply received sanity potions
    const sanityCount = items.filter((i) => i.type === 'SANITY').length;
    if (sanityCount > 0) {
      setMyProfile((p) => ({
        ...p,
        sanity: {
          ...p.sanity,
          current: Math.min(p.sanity.max, p.sanity.current + sanityCount * 10),
        },
        receivedSanityCount: p.receivedSanityCount + sanityCount,
      }));
      prtsAudio.playSanityChime();
    }
  }, []);

  // -----------------------------------------------------------------------
  // Recompute the visible radar list from the WS presence map (Level 1).
  // The server already pushed ONLY doctors I'm allowed to see (privacy gate),
  // so this is a pure client-side radius/filter/sort. Merges live WS users
  // (visibleUsersRef) + persistent beacons (beaconsRef).
  // -----------------------------------------------------------------------
  const recomputeNearbyFromPresence = useCallback(() => {
    const p = profileRef.current;
    const f = filterRef.current;
    const radiusKm = f.scanGlobal ? GLOBAL_SCAN_SENTINEL : f.radiusKm;
    const out: DoctorProfile[] = [];

    // The DO only pushes LIVE presences (memory map), so no TTL check needed here.
    for (const doc of visibleUsersRef.current.values()) {
      if (doc.id === p.id) continue;
      const dist = calculateDistance(p.lat, p.lng, doc.lat, doc.lng);
      if (!f.scanGlobal && dist > radiusKm * 1000) continue;
      out.push({ ...doc, distance: dist });
    }
    // Merge persistent beacons (offline discoverable users).
    for (const b of beaconsRef.current.values()) {
      if (b.id === p.id) continue;
      const dist = calculateDistance(p.lat, p.lng, b.lat, b.lng);
      if (!f.scanGlobal && dist > radiusKm * 1000) continue;
      out.push({ ...b, distance: dist, isOnline: false });
    }
    out.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
    setNearbyDoctors(out);
  }, []);

  // -----------------------------------------------------------------------
  // Scan nearby doctors via real API (HTTP fallback) — primary is the WS.
  // Results are folded into the same refs the WS path uses, then recomputed,
  // so manual refresh and WS deltas share one source of truth (no race).
  // -----------------------------------------------------------------------
  const refreshNearby = useCallback(async (lat: number, lng: number, force = false) => {
    // 全域扫描时向后端传一个极大的哨兵半径，用于返回广域内的所有在线博士
    const r = filterRef.current.scanGlobal ? GLOBAL_SCAN_SENTINEL : filterRef.current.radiusKm;

    // P1 去重：同一空间 cell 集的重复 scan（如 GPS 抖动）不再发请求。
    const sig = getRadarCellSignature(lat, lng, r);
    if (!force && sig === lastScanSigRef.current) return;
    lastScanSigRef.current = sig;

    setIsScanning(true);
    try {
      // Worker 的 /scan 已把信标合并进 doctors（含 isBeacon 标记）。
      const docs = await radarApi.scan(lat, lng, r, profileRef.current.id);
      // 在线用户 → visibleUsersRef；信标 → beaconsRef；统一 recompute 展示。
      const nextLive = new Map(visibleUsersRef.current);
      const beacons = new Map<string, DoctorProfile>();
      for (const d of docs) {
        if (d.isBeacon) beacons.set(d.id, d);
        else nextLive.set(d.id, d);
      }
      visibleUsersRef.current = nextLive;
      beaconsRef.current = beacons;
      recomputeNearbyFromPresence();
    } catch (err) {
      console.warn('[PRTS] AMap JS API not loaded');
    } finally {
      setIsScanning(false);
    }
  }, [recomputeNearbyFromPresence]);

  // -----------------------------------------------------------------------
  // Refresh only the beacon set (WS mode: live users stream over WS, beacons
  // are persistent and fetched periodically / on location change).
  // -----------------------------------------------------------------------
  const refreshBeacons = useCallback(async (lat: number, lng: number) => {
    const r = filterRef.current.scanGlobal ? GLOBAL_SCAN_SENTINEL : filterRef.current.radiusKm;
    try {
      const docs = await radarApi.scan(lat, lng, r, profileRef.current.id);
      const beacons = new Map<string, DoctorProfile>();
      for (const d of docs) if (d.isBeacon) beacons.set(d.id, d);
      beaconsRef.current = beacons;
      recomputeNearbyFromPresence();
    } catch { /* ignore */ }
  }, [recomputeNearbyFromPresence]);

  // -----------------------------------------------------------------------
  // Push my presence over WS (register + heartbeat on location change).
  // Falls back to HTTP ping when the socket is down.
  // -----------------------------------------------------------------------
  const pushPresence = useCallback((lat?: number, lng?: number) => {
    const sock = presenceSocketRef.current;
    const p = profileRef.current;
    if (sock && sock.isConnected()) {
      const payload = toLightPresence({
        ...p,
        lat: lat ?? p.lat,
        lng: lng ?? p.lng,
      });
      sock.sendPresence(payload);
      return;
    }
    // HTTP fallback (throttled client-side by api.ts)
    radarApi.ping({ ...p, lat: lat ?? p.lat, lng: lng ?? p.lng }).catch(() => {});
  }, []);

  // -----------------------------------------------------------------------
  // Re-run the local radar list when filters or my location change (WS mode
  // recomputes purely client-side; HTTP mode already fetched filtered results).
  // -----------------------------------------------------------------------
  useEffect(() => {
    const sock = presenceSocketRef.current;
    if (sock && sock.isConnected()) recomputeNearbyFromPresence();
    const p = profileRef.current;
    if (Number.isFinite(p.lat) && Number.isFinite(p.lng)) refreshBeacons(p.lat, p.lng);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, myProfile.lat, myProfile.lng, myProfile.id]);

  // -----------------------------------------------------------------------
  // Presence WS lifecycle: connect, apply deltas into the visible map,
  // recompute the radar, and deliver inbox items pushed over the socket.
  // -----------------------------------------------------------------------
  useEffect(() => {
    const sock = new PresenceSocket();
    presenceSocketRef.current = sock;

    const unsubMsg = sock.subscribe((msg) => {
      if (msg.type === 'presence:init') {
        const map = new Map<string, DoctorProfile>();
        for (const u of msg.users) map.set(u.id, toDoctorProfile(u));
        visibleUsersRef.current = map;
        recomputeNearbyFromPresence();
      } else if (msg.type === 'presence:join') {
        visibleUsersRef.current.set(msg.user.id, toDoctorProfile(msg.user));
        recomputeNearbyFromPresence();
      } else if (msg.type === 'presence:update') {
        visibleUsersRef.current.set(msg.user.id, toDoctorProfile(msg.user));
        recomputeNearbyFromPresence();
      } else if (msg.type === 'presence:leave') {
        visibleUsersRef.current.delete(msg.userId);
        recomputeNearbyFromPresence();
      } else if (msg.type === 'inbox:deliver') {
        handleInboxItems(msg.items);
      }
    });

    const unsubStatus = sock.onStatus((connected) => {
      if (connected) {
        pushPresence();
        lastWsPresenceAtRef.current = Date.now();
        // Pull the persistent beacon set once on connect (live users stream via WS).
        const p = profileRef.current;
        if (Number.isFinite(p.lat) && Number.isFinite(p.lng)) refreshBeacons(p.lat, p.lng);
      }
    });

    sock.start();

    return () => {
      unsubMsg();
      unsubStatus();
      sock.stop();
      presenceSocketRef.current = null;
    };
  }, [pushPresence, recomputeNearbyFromPresence, handleInboxItems, refreshBeacons]);

  // -----------------------------------------------------------------------
  // Manual refresh: report presence (ping) + rescan nearby doctors.
  // Only happens when the user clicks the sonar refresh button. Force bypasses
  // the P1 dedup so the user always gets a fresh scan.
  // -----------------------------------------------------------------------
  const handleManualRefresh = useCallback(() => {
    const p = profileRef.current;
    pushPresence(p.lat, p.lng);
    return refreshNearby(p.lat, p.lng, true);
  }, [pushPresence, refreshNearby]);

  // -----------------------------------------------------------------------
  // P1: rescan (forced) when the app returns to the foreground, so data is
  // fresh after the tab was backgrounded without letting GPS jitter spam scans.
  // -----------------------------------------------------------------------
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      const p = profileRef.current;
      if (Number.isFinite(p.lat) && Number.isFinite(p.lng)) refreshNearby(p.lat, p.lng, true);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refreshNearby]);

  // -----------------------------------------------------------------------
  // Heartbeat: register presence on mount. Over WS this is the socket's first
  // presence:set; HTTP ping is the fallback. Presence updates happen over WS
  // as the user moves; there is deliberately no periodic ping timer.
  // -----------------------------------------------------------------------
  useEffect(() => {
    pushPresence();
    // Restore beacon status on load (so the navbar toggle reflects reality).
    radarApi.hasBeacon(profileRef.current.id).then((h) => setBeaconActive(h)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------------------------------------------------------
  // Inbox poll (P3 adaptive): fetch incoming interactions.
  //  - hidden tab → stop polling
  //  - visible + idle → every 30s
  //  - visible + recently interacted (boost window) → every 15s
  //  - returning to foreground → immediate poll
  // -----------------------------------------------------------------------
  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      try {
        const items = await radarApi.inbox(profileRef.current.id);
        if (stopped) return;
        handleInboxItems(items);
      } catch { /* ignore */ }
    };

    const step = async () => {
      await poll();
      if (stopped) return;
      if (document.visibilityState !== 'visible') return; // hidden → stop scheduling
      const recentlyActive = Date.now() - lastInteractAtRef.current < 60_000;
      timer = setTimeout(step, recentlyActive ? 15000 : 30000);
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        if (timer) { clearTimeout(timer); timer = null; }
        step();
      } else if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    if (document.visibilityState === 'visible') step();

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // -----------------------------------------------------------------------
  // Offline beacon on page close
  // -----------------------------------------------------------------------
  useEffect(() => {
    const h = () => radarApi.offline(profileRef.current);
    window.addEventListener('pagehide', h);
    return () => window.removeEventListener('pagehide', h);
  }, []);

  // -----------------------------------------------------------------------
  // GPS 持续精化：watchPosition 后台提升精度到街道级，完成后逆地理编码显示街道
  // -----------------------------------------------------------------------
  const stopGpsWatchRef = useRef<(() => void) | null>(null);

  const beginGpsWatch = () => {
    stopGpsWatchRef.current?.();
    stopGpsWatchRef.current = startGpsWatch(
      (lat, lng, acc) => {
        const jitter = applyJitter(lat, lng);
        setMyProfile((prev) => ({ ...prev, lat, lng, jitterLat: jitter.lat, jitterLng: jitter.lng, accuracy: acc }));
        setLocationName(`GPS 定位 · 精度 ±${Math.round(acc)}m`);
        // WS mode: push live position (throttled ~10s); HTTP fallback: scan.
        const sock = presenceSocketRef.current;
        if (sock && sock.isConnected()) {
          const now = Date.now();
          if (now - lastWsPresenceAtRef.current > 10_000) {
            lastWsPresenceAtRef.current = now;
            pushPresence(lat, lng);
          }
          return;
        }
        refreshNearby(lat, lng);
      },
      async (lat, lng, acc) => {
        if (lat === null || lng === null || !Number.isFinite(acc) || acc > 1000) return;
        // 达到可用精度后做一次逆地理编码，把街道名显示出来
        const addr = await gaodeRegeo(lat, lng);
        if (addr) {
          setLocationName(`📍 ${addr} · 精度 ±${Math.round(acc)}m`);
          console.log('[PRTS] 街道定位完成:', addr);
        }
      },
    );
  };

  useEffect(() => () => { stopGpsWatchRef.current?.(); }, []);

  // -----------------------------------------------------------------------
  // Auto-detect location on boot: Gaode precise (browser Wi-Fi/GPS + IP fallback) -> Worker geoip -> default coords
  // -----------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    const locate = async () => {
      // 1. Browser native GPS (direct navigator.geolocation, bypasses AMap)
      const browserGeo = await browserGeolocate();
      if (!cancelled && browserGeo && Number.isFinite(browserGeo.lat) && Number.isFinite(browserGeo.lng)) {
        const jitter = applyJitter(browserGeo.lat, browserGeo.lng);
        setMyProfile((prev) => ({ ...prev, lat: browserGeo.lat, lng: browserGeo.lng, jitterLat: jitter.lat, jitterLng: jitter.lng, accuracy: browserGeo.accuracy }));
        setLocationName(`GPS 定位 · 精度 ±${Math.round(browserGeo.accuracy)}m`);
        refreshNearby(browserGeo.lat, browserGeo.lng);
        pushPresence(browserGeo.lat, browserGeo.lng);
        return;
      }

      // 2. Gaode AMap.Geolocation (browser → IP fallback)
      const gaodeGeo = await gaodeLocate();
      if (!cancelled && gaodeGeo && Number.isFinite(gaodeGeo.lat) && Number.isFinite(gaodeGeo.lng)) {
        const jitter = applyJitter(gaodeGeo.lat, gaodeGeo.lng);
        setMyProfile((prev) => ({ ...prev, lat: gaodeGeo.lat, lng: gaodeGeo.lng, jitterLat: jitter.lat, jitterLng: jitter.lng }));
        setLocationName(`Gaode 定位 · ${gaodeGeo.city} [${gaodeGeo.lat.toFixed(2)}, ${gaodeGeo.lng.toFixed(2)}]`);
        refreshNearby(gaodeGeo.lat, gaodeGeo.lng);
        pushPresence(gaodeGeo.lat, gaodeGeo.lng);
        return;
      }

      // 3. Worker-side Cloudflare geoip
      const geo = await fetchIPGeolocation();
      if (!cancelled && geo && Number.isFinite(geo.lat) && Number.isFinite(geo.lng)) {
        const jitter = applyJitter(geo.lat, geo.lng);
        setMyProfile((prev) => ({ ...prev, lat: geo.lat, lng: geo.lng, jitterLat: jitter.lat, jitterLng: jitter.lng }));
        setLocationName(`IP 定位 · ${geo.city} [${geo.lat.toFixed(2)}, ${geo.lng.toFixed(2)}]`);
        refreshNearby(geo.lat, geo.lng);
        pushPresence(geo.lat, geo.lng);
        return;
      }

      // 4. Final fallback
      if (!cancelled) {
        console.log('[PRTS] Auto-detect failed, using default coords');
      }
    };

    locate().then(() => {
      if (!cancelled) beginGpsWatch();
    });
    return () => { cancelled = true; stopGpsWatchRef.current?.(); };
  }, []);

  // -----------------------------------------------------------------------
  // Manual relocate: GPS -> Gaode precise locate -> Worker geoip
  // -----------------------------------------------------------------------
  const handleUseRealGPS = () => {
    const fallbackToIP = async () => {
      const gaodeGeo = await gaodeLocate();
      if (gaodeGeo && Number.isFinite(gaodeGeo.lat) && Number.isFinite(gaodeGeo.lng)) {
        const jitter = applyJitter(gaodeGeo.lat, gaodeGeo.lng);
        setMyProfile((prev) => ({ ...prev, lat: gaodeGeo.lat, lng: gaodeGeo.lng, jitterLat: jitter.lat, jitterLng: jitter.lng }));
        setLocationName(`Gaode 定位 · ${gaodeGeo.city} [${gaodeGeo.lat.toFixed(2)}, ${gaodeGeo.lng.toFixed(2)}]`);
        refreshNearby(gaodeGeo.lat, gaodeGeo.lng);
        pushPresence(gaodeGeo.lat, gaodeGeo.lng);
        setIsScanning(false);
        beginGpsWatch();
        return;
      }
      const geo = await fetchIPGeolocation();
      if (geo && Number.isFinite(geo.lat) && Number.isFinite(geo.lng)) {
        const jitter = applyJitter(geo.lat, geo.lng);
        setMyProfile((prev) => ({ ...prev, lat: geo.lat, lng: geo.lng, jitterLat: jitter.lat, jitterLng: jitter.lng }));
        setLocationName(`IP 定位 · ${geo.city} [${geo.lat.toFixed(2)}, ${geo.lng.toFixed(2)}]`);
        refreshNearby(geo.lat, geo.lng);
        pushPresence(geo.lat, geo.lng);
        setIsScanning(false);
        beginGpsWatch();
        return;
      }
      alert('定位失败，请检查网络后重试');
      setIsScanning(false);
    };

    setIsScanning(true);

    // 在手势同步阶段解锁音频,否则异步定位回调里的音效会被浏览器静音
    prtsAudio.unlock();

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          const gcj = wgs84ToGcj02(latitude, longitude);
          const jitter = applyJitter(gcj.lat, gcj.lng);
          setMyProfile((prev) => ({ ...prev, lat: gcj.lat, lng: gcj.lng, jitterLat: jitter.lat, jitterLng: jitter.lng, accuracy }));
          setLocationName(`GPS 定位 · 精度 ±${Math.round(accuracy)}m [${gcj.lat.toFixed(4)}, ${gcj.lng.toFixed(4)}]`);
          refreshNearby(gcj.lat, gcj.lng);
          pushPresence(gcj.lat, gcj.lng);
          prtsAudio.playTargetDetected();
          setIsScanning(false);
          beginGpsWatch();
        },
        () => { fallbackToIP(); },
        { enableHighAccuracy: true, timeout: 6000 },
      );
    } else {
      fallbackToIP();
    }
  };

  // -----------------------------------------------------------------------
  // Camouflage
  // -----------------------------------------------------------------------
  const handleToggleCamouflage = () => {
    setMyProfile((prev) => {
      const next = !prev.isCamouflaged;
      const r = prev.offsetRadiusMeters || 300;
      const jitter = next ? applyJitter(prev.lat, prev.lng, r) : { lat: prev.lat, lng: prev.lng, offsetDist: 0 };
      return { ...prev, isCamouflaged: next, jitterLat: jitter.lat, jitterLng: jitter.lng };
    });
  };

  const handleRegenerateOffset = () => {
    setMyProfile((prev) => {
      const r = prev.offsetRadiusMeters || 300;
      const jitter = applyJitter(prev.lat, prev.lng, r);
      return { ...prev, isCamouflaged: true, jitterLat: jitter.lat, jitterLng: jitter.lng };
    });
    prtsAudio.playRadarPing();
  };

  const handleSetOffsetRadius = (radiusMeters: number) => {
    const r = Math.max(10, Math.min(5000, radiusMeters));
    setMyProfile((prev) => {
      const jitter = prev.isCamouflaged ? applyJitter(prev.lat, prev.lng, r) : { lat: prev.lat, lng: prev.lng, offsetDist: 0 };
      return { ...prev, offsetRadiusMeters: r, jitterLat: jitter.lat, jitterLng: jitter.lng };
    });
    prtsAudio.playClick();
  };

  const handleSetBeaconBroadcastRadius = (radiusKm: number) => {
    setMyProfile((prev) => ({ ...prev, beaconBroadcastRadiusKm: Math.max(0.1, Math.min(100, radiusKm)) }));
    prtsAudio.playClick();
  };

  const handleSetBroadcastVisibility = (vis: 'all' | 'radius') => {
    setMyProfile((prev) => ({ ...prev, broadcastVisibility: vis }));
    prtsAudio.playClick();
  };

  // -----------------------------------------------------------------------
  // Persistent beacon (常驻信标) — stay discoverable even when offline.
  // -----------------------------------------------------------------------
  const handlePlaceBeacon = useCallback(async (message = '') => {
    const p = profileRef.current;
    if (!Number.isFinite(p.lat) || !Number.isFinite(p.lng)) return false;
    try {
      await radarApi.placeBeacon(p, message);
      setBeaconActive(true);
      await refreshBeacons(p.lat, p.lng);
      prtsAudio.playRadarPing();
      return true;
    } catch {
      return false;
    }
  }, [refreshBeacons]);

  const handleRemoveBeacon = useCallback(async () => {
    const p = profileRef.current;
    try {
      await radarApi.removeBeacon(p.id);
      beaconsRef.current.delete(p.id);
      setBeaconActive(false);
      recomputeNearbyFromPresence();
      return true;
    } catch {
      return false;
    }
  }, [recomputeNearbyFromPresence]);

  /** Quick toggle used by the navbar: deploy (at current location) or retract. */
  const handleToggleBeacon = useCallback(async () => {
    if (beaconActive) {
      return handleRemoveBeacon();
    }
    return handlePlaceBeacon('');
  }, [beaconActive, handlePlaceBeacon, handleRemoveBeacon]);

  // -----------------------------------------------------------------------
  // Interactions — local log + fire-and-forget API call
  // -----------------------------------------------------------------------
  const addLog = (type: string, fromName: string, fromAssistant: string, toId: string, msg: string): TacticalInteraction => {
    const log: TacticalInteraction = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: type as any,
      fromDoctorId: myProfile.id,
      fromDoctorName: fromName,
      fromAssistantName: fromAssistant,
      toDoctorId: toId,
      timestamp: Date.now(),
      message: msg,
    };
    setCommsLogs((prev) => [log, ...prev]);
    return log;
  };

  const handleSendSanity = (doc: DoctorProfile) => {
    setNearbyDoctors((prev) =>
      prev.map((d) =>
        d.id === doc.id
          ? { ...d, sanity: { ...d.sanity, current: Math.min(d.sanity.max, d.sanity.current + 10) }, receivedSanityCount: d.receivedSanityCount + 1 }
          : d,
      ),
    );
        const msg = `向 ${doc.name} 投递了一瓶【应急理智顶剂】(+10 Sanity)，对方理智已补给！`;
    addLog('SANITY', myProfile.name, myProfile.assistant.cnName, doc.id, msg);
    lastInteractAtRef.current = Date.now();
    radarApi.interact({
      type: 'SANITY',
      fromDoctorId: myProfile.id,
      fromDoctorName: myProfile.name,
      fromAssistantName: myProfile.assistant.cnName,
      toDoctorId: doc.id,
      message: msg,
    });
  };

  const handleSendInvite = (doc: DoctorProfile, drillType: string = '危机合约演练') => {
    const code = `PRTS-${Math.floor(1000 + Math.random() * 9000)}-EX`;
        const msg = `已向 ${doc.name} 发起【${drillType}】组队邀请！演练作战识别码：${code}`;
    addLog('INVITE', myProfile.name, myProfile.assistant.cnName, doc.id, msg);
    lastInteractAtRef.current = Date.now();
    radarApi.interact({
      type: 'INVITE',
      fromDoctorId: myProfile.id,
      fromDoctorName: myProfile.name,
      fromAssistantName: myProfile.assistant.cnName,
      toDoctorId: doc.id,
      message: msg,
    });
    alert(`作战邀请已发送至 ${doc.name}！演习暗号：${code}`);
  };

  const handleSendClue = (doc: DoctorProfile, clueNum: number) => {
        const msg = `已将【线索 ${clueNum}】投递至 ${doc.name} 的罗德岛会客室！`;
    addLog('CLUE', myProfile.name, myProfile.assistant.cnName, doc.id, msg);
    lastInteractAtRef.current = Date.now();
    radarApi.interact({
      type: 'CLUE',
      fromDoctorId: myProfile.id,
      fromDoctorName: myProfile.name,
      fromAssistantName: myProfile.assistant.cnName,
      toDoctorId: doc.id,
      message: msg,
    });
    alert(`线索 ${clueNum} 已成功传递至 ${doc.name}！`);
  };

  const handleSendMessage = (doc: DoctorProfile, msg: string) => {
        const logMsg = `战术密话 ➔ ${doc.name}：“${msg}”`;
    addLog('PING', myProfile.name, myProfile.assistant.cnName, doc.id, logMsg);
    lastInteractAtRef.current = Date.now();
    radarApi.interact({
      type: 'PING',
      fromDoctorId: myProfile.id,
      fromDoctorName: myProfile.name,
      fromAssistantName: myProfile.assistant.cnName,
      toDoctorId: doc.id,
      message: logMsg,
    });
    alert(`战术密话已发送至 ${doc.name}！`);
  };

  // -----------------------------------------------------------------------
  // Filtering
  // -----------------------------------------------------------------------
  const filteredDoctors = nearbyDoctors.filter((doc) => {
    if (filter.server !== 'ALL' && doc.server !== filter.server) return false;
    if (filter.onlyOnline && !doc.isOnline) return false;
    if (filter.hasSupport && doc.supportOperators.length === 0) return false;
    return true;
  });

  // -----------------------------------------------------------------------
  // Boot splash
  // -----------------------------------------------------------------------
  if (isBooting) {
    return (
      <div className="w-screen h-dvh bg-[#080a0e] flex flex-col items-center justify-center text-[#00e5ff] font-mono p-6 select-none prts-hex-grid">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full border-2 border-[#00e5ff] flex items-center justify-center shadow-[0_0_30px_rgba(0,229,255,0.5)]">
            <span className="w-8 h-8 rounded-full border border-[#00e5ff] animate-ping"></span>
            <span className="w-4 h-4 rounded-full bg-[#ffde00] absolute"></span>
          </div>
        </div>
        <h1 className="text-xl md:text-2xl font-bold tracking-widest text-white mb-2 text-center">PRTS TACTICAL RADAR TERMINAL</h1>
        <p className="text-xs text-slate-400 mb-6 tracking-widest">RHODES ISLAND // 神经拟态信标雷达系统 v3.5</p>
        <div className="w-64 max-w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-[#00e5ff]/30 mb-3">
          <div className="h-full bg-gradient-to-r from-[#00e5ff] to-[#ffde00] transition-all duration-300" style={{ width: `${bootProgress}%` }}></div>
        </div>
        <div className="text-[11px] text-[#00e5ff] tracking-wider animate-pulse flex items-center gap-2">
          <span>{bootLog}</span>
          <span className="text-[#ffde00] font-bold">{bootProgress}%</span>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Main app
  // -----------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#080a0e] text-slate-100 flex flex-col font-mono select-none">
      <PRTSNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        myProfile={myProfile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onRelocate={handleUseRealGPS}
        onToggleCamouflage={handleToggleCamouflage}
        beaconActive={beaconActive}
        onToggleBeacon={handleToggleBeacon}
        nearbyCount={filteredDoctors.length}
        locationName={locationName}
      />

      <main className="flex-1 w-full relative overflow-hidden flex flex-col">
        {activeTab === 'radar' && (
          <RadarView
            myProfile={myProfile}
            nearbyDoctors={filteredDoctors}
            onSelectDoctor={(doc) => setSelectedDoctor(doc)}
            onSendSanity={handleSendSanity}
            onSendInvite={(doc) => handleSendInvite(doc)}
            onExchangeClue={(doc) => handleSendClue(doc, 7)}
            onRefreshScan={() => handleManualRefresh()}
            filter={filter}
            setFilter={setFilter}
            isScanning={isScanning}
            onToggleLocationOffset={handleToggleCamouflage}
            onRegenerateOffset={handleRegenerateOffset}
            onSetOffsetRadius={handleSetOffsetRadius}
            onSetBeaconBroadcastRadius={handleSetBeaconBroadcastRadius}
            onSetBroadcastVisibility={handleSetBroadcastVisibility}
          />
        )}
        {activeTab === 'list' && (
          <DoctorListView
            doctors={filteredDoctors}
            onSelectDoctor={(doc) => setSelectedDoctor(doc)}
            onSendSanity={handleSendSanity}
            onSendInvite={(doc) => handleSendInvite(doc)}
          />
        )}
        {activeTab === 'logs' && <CommsLogModal logs={commsLogs} onClearLogs={() => setCommsLogs([])} />}
      </main>

      {selectedDoctor && (
        <DoctorDetailModal
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          onSendSanity={handleSendSanity}
          onSendInvite={(doc, drill) => handleSendInvite(doc, drill)}
          onSendClue={(doc, clue) => handleSendClue(doc, clue)}
          onSendMessage={(doc, msg) => handleSendMessage(doc, msg)}
        />
      )}

      {isProfileModalOpen && (
        <MyProfileModal
          profile={myProfile}
          onSave={(updated) => { setMyProfile(updated); setIsProfileModalOpen(false); }}
          onClose={() => setIsProfileModalOpen(false)}
          hasBeacon={beaconActive}
          onPlaceBeacon={handlePlaceBeacon}
          onRemoveBeacon={handleRemoveBeacon}
        />
      )}

      {isPrivacyOpen && <PrivacyPolicyModal onClose={() => setIsPrivacyOpen(false)} />}

      <footer className="w-full border-t border-slate-800/80 bg-[#0a0e13]/95 px-3 py-1.5 flex items-center justify-center gap-4 text-[10px] text-slate-500 font-mono">
        <span>PRTS 战术雷达 · 非商业同人项目</span>
        <button
          onClick={() => setIsPrivacyOpen(true)}
          className="text-slate-400 hover:text-[#00e5ff] underline underline-offset-2 transition-colors"
        >
          隐私政策
        </button>
        <a
          href="https://github.com/Pomran/prts-tactical-radar"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-[#00e5ff] underline underline-offset-2 transition-colors"
        >
          开源仓库
        </a>
      </footer>
    </div>
  );
}
