import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PRTSNavbar } from './components/PRTSNavbar';
import { RadarView } from './components/RadarView';
import { DoctorListView } from './components/DoctorListView';
import { CommsLogModal } from './components/CommsLogModal';
import { DoctorDetailModal } from './components/DoctorDetailModal';
import { MyProfileModal } from './components/MyProfileModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { DoctorProfile, RadarFilter, TacticalInteraction } from './types';
import { OPERATOR_DATABASE } from './data/operators';
import { TACTICAL_HOTSPOTS, applyJitter, wgs84ToGcj02 } from './utils/geoutils';
import { prtsAudio } from './utils/audio';
import { radarApi, getDeviceId, loadProfileSettings, saveProfileSettings, loadFilterSettings, saveFilterSettings } from './utils/api';

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

  // -----------------------------------------------------------------------
  // Filters
  // -----------------------------------------------------------------------
  const [filter, setFilter] = useState<RadarFilter>(() => {
    const defaults: RadarFilter = {
      radiusKm: 5,
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
  // Scan nearby doctors via real API
  // -----------------------------------------------------------------------
  const refreshNearby = useCallback(async (lat: number, lng: number, radiusKm?: number) => {
    setIsScanning(true);
    try {
      const docs = await radarApi.scan(lat, lng, radiusKm ?? filterRef.current.radiusKm, profileRef.current.id);
      setNearbyDoctors(docs);
    } catch (err) {
      console.warn('[PRTS] AMap JS API not loaded');
    } finally {
      setIsScanning(false);
    }
  }, []);

  // -----------------------------------------------------------------------
  // Manual refresh: report presence (ping) + rescan nearby doctors.
  // Only happens when the user clicks the sonar refresh button.
  // -----------------------------------------------------------------------
  const handleManualRefresh = useCallback(() => {
    const p = profileRef.current;
    radarApi.ping({ ...p, lat: p.lat, lng: p.lng }).catch(() => {});
    return refreshNearby(p.lat, p.lng);
  }, [refreshNearby]);

  // -----------------------------------------------------------------------
  // Heartbeat: ping only on initial mount + explicit user actions.
  // Intentionally NOT on a timer — Cloudflare KV free tier caps writes at
  // 1000/day, and a frequent heartbeat would blow that quota quickly.
  // -----------------------------------------------------------------------
  useEffect(() => {
    radarApi.ping(profileRef.current).catch(() => {});
  }, []);

  // -----------------------------------------------------------------------
  // Inbox poll: fetch incoming interactions every 15s
  // -----------------------------------------------------------------------
  useEffect(() => {
    let stopped = false;
    const poll = async () => {
      try {
        const items = await radarApi.inbox(profileRef.current.id);
        if (stopped || items.length === 0) return;
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
      } catch { /* ignore */ }
    };
    const t = setInterval(poll, 15000);
    return () => { stopped = true; clearInterval(t); };
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
        radarApi.ping({ ...profileRef.current, lat: browserGeo.lat, lng: browserGeo.lng }).catch(() => {});
        return;
      }

      // 2. Gaode AMap.Geolocation (browser → IP fallback)
      const gaodeGeo = await gaodeLocate();
      if (!cancelled && gaodeGeo && Number.isFinite(gaodeGeo.lat) && Number.isFinite(gaodeGeo.lng)) {
        const jitter = applyJitter(gaodeGeo.lat, gaodeGeo.lng);
        setMyProfile((prev) => ({ ...prev, lat: gaodeGeo.lat, lng: gaodeGeo.lng, jitterLat: jitter.lat, jitterLng: jitter.lng }));
        setLocationName(`Gaode 定位 · ${gaodeGeo.city} [${gaodeGeo.lat.toFixed(2)}, ${gaodeGeo.lng.toFixed(2)}]`);
        refreshNearby(gaodeGeo.lat, gaodeGeo.lng);
        radarApi.ping({ ...profileRef.current, lat: gaodeGeo.lat, lng: gaodeGeo.lng }).catch(() => {});
        return;
      }

      // 3. Worker-side Cloudflare geoip
      const geo = await fetchIPGeolocation();
      if (!cancelled && geo && Number.isFinite(geo.lat) && Number.isFinite(geo.lng)) {
        const jitter = applyJitter(geo.lat, geo.lng);
        setMyProfile((prev) => ({ ...prev, lat: geo.lat, lng: geo.lng, jitterLat: jitter.lat, jitterLng: jitter.lng }));
        setLocationName(`IP 定位 · ${geo.city} [${geo.lat.toFixed(2)}, ${geo.lng.toFixed(2)}]`);
        refreshNearby(geo.lat, geo.lng);
        radarApi.ping({ ...profileRef.current, lat: geo.lat, lng: geo.lng }).catch(() => {});
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
        setIsScanning(false);
        beginGpsWatch();
        return;
      }
      alert('定位失败，请检查网络后重试');
      setIsScanning(false);
    };

    setIsScanning(true);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          const gcj = wgs84ToGcj02(latitude, longitude);
          const jitter = applyJitter(gcj.lat, gcj.lng);
          setMyProfile((prev) => ({ ...prev, lat: gcj.lat, lng: gcj.lng, jitterLat: jitter.lat, jitterLng: jitter.lng, accuracy }));
          setLocationName(`GPS 定位 · 精度 ±${Math.round(accuracy)}m [${gcj.lat.toFixed(4)}, ${gcj.lng.toFixed(4)}]`);
          refreshNearby(gcj.lat, gcj.lng);
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
    radarApi.interact({
      type: 'PING',
      fromDoctorId: myProfile.id,
      fromDoctorName: myProfile.name,
      fromAssistantName: myProfile.assistant.cnName,
      toDoctorId: doc.id,
      message: logMsg,
    });
      alert('定位失败，请检查网络后重试');
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
