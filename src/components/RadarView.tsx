import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Scan, 
  Filter, 
  RotateCw, 
  Layers, 
  Copy, 
  Check, 
  Heart, 
  Swords, 
  Scroll, 
  Sparkles,
  SlidersHorizontal,
  Compass,
  AlertCircle,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Dices,
  EyeOff,
  ChevronDown,
  Radar,
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DoctorProfile, RadarFilter, ServerRegion } from '../types';
import { prtsAudio } from '../utils/audio';
import { esc, safeColor } from '../utils/html';

interface RadarViewProps {
  myProfile: DoctorProfile;
  nearbyDoctors: DoctorProfile[];
  onSelectDoctor: (doc: DoctorProfile) => void;
  onSendSanity: (doc: DoctorProfile) => void;
  onSendInvite: (doc: DoctorProfile) => void;
  onExchangeClue: (doc: DoctorProfile) => void;
  onRefreshScan: () => void;
  filter: RadarFilter;
  setFilter: React.Dispatch<React.SetStateAction<RadarFilter>>;
  isScanning: boolean;
  onToggleLocationOffset: () => void;
  onRegenerateOffset: () => void;
  onSetOffsetRadius: (radiusMeters: number) => void;
  onSetBeaconBroadcastRadius: (radiusKm: number) => void;
  onSetBroadcastVisibility: (vis: 'all' | 'radius') => void;
}

export const RadarView: React.FC<RadarViewProps> = ({
  myProfile,
  nearbyDoctors,
  onSelectDoctor,
  onSendSanity,
  onSendInvite,
  onExchangeClue,
  onRefreshScan,
  filter,
  setFilter,
  isScanning,
  onToggleLocationOffset,
  onRegenerateOffset,
  onSetOffsetRadius,
  onSetBeaconBroadcastRadius,
  onSetBroadcastVisibility,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const radarCircleRef = useRef<L.Circle | null>(null);
  const offsetSecurityCircleRef = useRef<L.Circle | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const broadcastCircleRef = useRef<L.Circle | null>(null);

  const [copiedUid, setCopiedUid] = useState<string | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showOffsetPanel, setShowOffsetPanel] = useState(false);
  const [showBroadcastPanel, setShowBroadcastPanel] = useState(false);
  const [activeSonarAnimation, setActiveSonarAnimation] = useState(true);
  const [offsetToast, setOffsetToast] = useState<string | null>(null);

  const activeRadius = myProfile.offsetRadiusMeters || 300;
  const broadcastRadiusKm = myProfile.beaconBroadcastRadiusKm || 5;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const centerLat = myProfile.isCamouflaged && myProfile.jitterLat ? myProfile.jitterLat : myProfile.lat;
      const centerLng = myProfile.isCamouflaged && myProfile.jitterLng ? myProfile.jitterLng : myProfile.lng;

      // Fall back to Shanghai if coords are invalid
      const safeLat = Number.isFinite(centerLat) ? centerLat : 31.1925;
      const safeLng = Number.isFinite(centerLng) ? centerLng : 121.3039;

      const map = L.map(mapContainerRef.current, {
        center: [safeLat, safeLng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      // Tactical Map Tile Layer (AMap GCJ-02, fast in China, no watermark)
      L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}', {
        maxZoom: 18,
        subdomains: '1234',
        attribution: '',
      }).addTo(map);

      // Markers Layer Group
      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;

      mapInstanceRef.current = map;
    }

    return () => {
      // Keep map alive during tab switches or clean up on unmount
    };
  }, []);

  // Update center, range circle, and markers when location or nearbyDoctors change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const myLat = myProfile.isCamouflaged && myProfile.jitterLat ? myProfile.jitterLat : myProfile.lat;
    const myLng = myProfile.isCamouflaged && myProfile.jitterLng ? myProfile.jitterLng : myProfile.lng;

    // Guard against undefined coordinates
    if (!Number.isFinite(myLat) || !Number.isFinite(myLng)) return;

    // Pan smoothly to player location
    map.setView([myLat, myLng], map.getZoom(), { animate: true });

    // Update Radar Radius Range Circle
    if (radarCircleRef.current) {
      radarCircleRef.current.remove();
    }

    radarCircleRef.current = L.circle([myLat, myLng], {
      radius: filter.radiusKm * 1000,
      color: '#00e5ff',
      weight: 1.5,
      opacity: 0.6,
      fillColor: '#00e5ff',
      fillOpacity: 0.03,
      dashArray: '6, 6',
    }).addTo(map);

    // Update Beacon Broadcast Range Circle (本人可被识别范围)
    if (broadcastCircleRef.current) {
      broadcastCircleRef.current.remove();
    }

    broadcastCircleRef.current = L.circle([myLat, myLng], {
      radius: broadcastRadiusKm * 1000,
      color: '#ffde00',
      weight: 1.2,
      opacity: 0.5,
      fillColor: '#ffde00',
      fillOpacity: 0.02,
      dashArray: '3, 6',
    }).addTo(map);

    // Update Location Privacy Obfuscation Circle if Camouflage is ON
    if (offsetSecurityCircleRef.current) {
      offsetSecurityCircleRef.current.remove();
    }

    if (myProfile.isCamouflaged) {
      offsetSecurityCircleRef.current = L.circle([myProfile.lat, myProfile.lng], {
        radius: activeRadius,
        color: '#10b981',
        weight: 1.2,
        opacity: 0.8,
        fillColor: '#10b981',
        fillOpacity: 0.08,
        dashArray: '4, 4',
      }).addTo(map);
    }

    // Update GPS Accuracy Circle (真实位置不确定范围)
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.remove();
      accuracyCircleRef.current = null;
    }
    if (!myProfile.isCamouflaged && myProfile.accuracy && myProfile.accuracy > 0 && myProfile.accuracy < 5000) {
      accuracyCircleRef.current = L.circle([myProfile.lat, myProfile.lng], {
        radius: myProfile.accuracy,
        color: '#94a3b8',
        weight: 1,
        opacity: 0.5,
        fillColor: '#94a3b8',
        fillOpacity: 0.06,
      }).addTo(map);
    }

    // Rebuild Markers
    if (markersGroupRef.current) {
      markersGroupRef.current.clearLayers();

      // 1. Player's Beacon Marker (Crisp Rhodes Island Commander Tactical Marker)
      const selfIconHtml = `
        <div class="relative flex flex-col items-center group cursor-pointer tactical-marker-card">
          <!-- Subtle clean radar ping -->
          <div class="absolute -inset-2 rounded-full border border-[#ffde00]/70 animate-beacon-ping pointer-events-none"></div>

          <!-- Commander Portrait Frame with Sharp Tactical Border -->
          <div class="w-12 h-12 rounded-full border-2 border-[#ffde00] bg-[#0c121d] p-0.5 overflow-hidden relative z-10 transition-transform group-hover:scale-105 duration-150">
            <img src="${myProfile.assistant.avatar}" class="w-full h-full object-cover rounded-full" />
          </div>

          <!-- Sharp Tactical Tag -->
          <div class="mt-1 px-2 py-0.5 bg-[#090e17] border border-[#ffde00]/90 text-[10px] text-[#ffde00] tracking-wider font-mono font-bold rounded shadow-lg whitespace-nowrap z-10 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-[#ffde00] animate-pulse"></span>
            <span>YOU (指挥官)</span>
            ${myProfile.isCamouflaged ? '<span class="text-[8px] px-1 bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 rounded">战术迷彩</span>' : ''}
          </div>
        </div>
      `;

      const selfIcon = L.divIcon({
        className: 'custom-self-marker',
        html: selfIconHtml,
        iconSize: [52, 68],
        iconAnchor: [26, 34],
      });

      const selfMarker = L.marker([myLat, myLng], { icon: selfIcon, zIndexOffset: 1000 });
      selfMarker.bindPopup(`
        <div class="p-3 bg-[#0f1724] text-white font-mono rounded border border-[#ffde00]/50 text-xs min-w-[210px]">
          <div class="flex items-center justify-between border-b border-slate-700/60 pb-1.5 mb-2">
            <span class="font-bold text-[#ffde00]">${esc(myProfile.name)}</span>
            <span class="text-[10px] text-slate-400">Lv.${myProfile.level}</span>
          </div>
          <div class="text-[11px] text-slate-300 mb-1">
            <b class="text-[#00e5ff]">助理:</b> ${esc(myProfile.assistant.cnName)} (${esc(myProfile.assistant.name)})
          </div>
          <div class="text-[10px] text-slate-400 mb-2">
            <b>理智:</b> <span class="text-[#ffde00] font-bold">${myProfile.sanity.current}/${myProfile.sanity.max}</span>
          </div>
          <div class="text-[9px] ${myProfile.isCamouflaged ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' : 'text-amber-400 bg-amber-950/40 border-amber-500/30'} p-1.5 rounded border">
            ${myProfile.isCamouflaged ? `🛡️ 战术迷彩生效中：对外广播伪装信标 (±${activeRadius}m 随机扰动)` : '⚠️ 战术迷彩未开启：正在广播精确物理信标'}
          </div>
        </div>
      `);
      markersGroupRef.current.addLayer(selfMarker);

      // 2. Nearby Doctors Markers (Clean, Sharp Tactical Markers)
      nearbyDoctors.forEach((doc) => {
        const docLat = doc.isCamouflaged && doc.jitterLat ? doc.jitterLat : doc.lat;
        const docLng = doc.isCamouflaged && doc.jitterLng ? doc.jitterLng : doc.lng;

        const isOnline = doc.isOnline;
        const accentColor = safeColor(doc.assistant.color);

        const doctorIconHtml = `
          <div class="relative flex flex-col items-center group cursor-pointer tactical-marker-card">
            <!-- Avatar Core Frame with Sharp Solid Color Border -->
            <div 
              class="w-10 h-10 rounded-full border-2 bg-[#0c121d] p-0.5 relative z-10 transition-transform group-hover:scale-110 duration-150" 
              style="border-color: ${accentColor};"
            >
              <img src="${esc(doc.assistant.avatar)}" class="w-full h-full object-cover rounded-full" />
              ${isOnline ? `
                <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#0c121d]"></span>
              ` : ''}
            </div>

            <!-- Crisp Floating Identity Capsule -->
            <div class="mt-1 px-2 py-0.5 bg-[#090e17] border border-slate-700/80 group-hover:border-slate-500 text-[10px] text-slate-200 tracking-wide font-mono rounded shadow-lg whitespace-nowrap z-10 flex items-center gap-1.5 transition-colors">
              <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" style="background-color: ${accentColor};"></span>
              <span class="max-w-[70px] truncate font-medium text-slate-100">${esc(doc.name)}</span>
              <span class="text-[9px] font-semibold text-[#00e5ff]">
                ${doc.distance ? (doc.distance < 1000 ? `${doc.distance}m` : `${(doc.distance/1000).toFixed(1)}km`) : '附近'}
              </span>
            </div>
          </div>
        `;

        const doctorIcon = L.divIcon({
          className: 'custom-doctor-marker',
          html: doctorIconHtml,
          iconSize: [48, 64],
          iconAnchor: [24, 32],
        });

        const docMarker = L.marker([docLat, docLng], { icon: doctorIcon });
        
        // Custom Popup on Marker click
        docMarker.on('click', () => {
          prtsAudio.playTargetDetected();
        });

        // Popup Content
        const popupContainer = document.createElement('div');
        popupContainer.className = 'p-3 bg-[#0d1420] text-slate-100 font-mono rounded border border-[#00e5ff]/40 text-xs min-w-[240px] max-w-[270px] select-none';
        popupContainer.innerHTML = `
          <div class="flex items-center justify-between border-b border-slate-700/60 pb-1.5 mb-2">
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-white text-xs">${esc(doc.name)}</span>
              <span class="text-[9px] px-1 bg-[#00e5ff]/20 text-[#00e5ff] rounded font-mono">Lv.${doc.level}</span>
            </div>
            <span class="text-[9px] text-amber-300 font-mono">${esc(doc.server)}</span>
          </div>

          <div class="flex items-center gap-2 mb-2 bg-[#121c2b] p-1.5 rounded border border-slate-800">
            <img src="${esc(doc.assistant.avatar)}" class="w-8 h-8 rounded-full border border-[${safeColor(doc.assistant.color)}]" />
            <div class="text-[10px] leading-tight">
              <div class="text-[#00e5ff] font-bold">${esc(doc.assistant.cnName)} · ${esc(doc.assistant.name)}</div>
              <div class="text-[9px] text-slate-400">${esc(doc.assistant.masterySkill || '精二专三')}</div>
            </div>
          </div>

          <p class="text-[10px] text-slate-300 italic mb-2 bg-[#080d14]/70 p-1.5 rounded border-l-2 border-[#ffde00]">
            ${esc(doc.motto)}
          </p>

          <div class="flex justify-between items-center text-[9px] text-slate-400 mb-2.5">
            <span>距离: <b class="text-[#00e5ff]">${doc.distance ? (doc.distance < 1000 ? `${doc.distance}米` : `${(doc.distance/1000).toFixed(1)}公里`) : '附近'}</b></span>
            <span>理智: <b class="text-[#ffde00]">${doc.sanity.current}/${doc.sanity.max}</b></span>
          </div>

          <div class="grid grid-cols-2 gap-1.5">
            <button id="popup-sanity-${doc.id}" class="py-1.5 bg-[#ffde00]/15 hover:bg-[#ffde00]/30 text-[#ffde00] border border-[#ffde00]/50 rounded text-[10px] flex items-center justify-center gap-1 transition-colors font-bold">
              ⚡ 赠送理智顶剂
            </button>
            <button id="popup-dossier-${doc.id}" class="py-1.5 bg-[#00e5ff]/15 hover:bg-[#00e5ff]/30 text-[#00e5ff] border border-[#00e5ff]/50 rounded text-[10px] flex items-center justify-center gap-1 transition-colors font-bold">
              📄 查看完整档案
            </button>
          </div>
        `;

        docMarker.bindPopup(popupContainer);

        // Bind events inside popup once opened
        docMarker.on('popupopen', () => {
          const sanityBtn = document.getElementById(`popup-sanity-${doc.id}`);
          const dossierBtn = document.getElementById(`popup-dossier-${doc.id}`);

          if (sanityBtn) {
            sanityBtn.onclick = (e) => {
              e.stopPropagation();
              onSendSanity(doc);
            };
          }
          if (dossierBtn) {
            dossierBtn.onclick = (e) => {
              e.stopPropagation();
              onSelectDoctor(doc);
              map.closePopup();
            };
          }
        });

        markersGroupRef.current.addLayer(docMarker);
      });
    }
  }, [nearbyDoctors, myProfile, filter.radiusKm, activeRadius, broadcastRadiusKm]);

  // Copy UID function
  const handleCopyUid = (uid: string) => {
    navigator.clipboard.writeText(uid);
    setCopiedUid(uid);
    prtsAudio.playClick();
    setTimeout(() => setCopiedUid(null), 2000);
  };

  // Center on player
  const handleLocateSelf = () => {
    prtsAudio.playClick();
    const map = mapInstanceRef.current;
    if (!map) return;
    const myLat = myProfile.isCamouflaged && myProfile.jitterLat ? myProfile.jitterLat : myProfile.lat;
    const myLng = myProfile.isCamouflaged && myProfile.jitterLng ? myProfile.jitterLng : myProfile.lng;
    map.flyTo([myLat, myLng], 15, { duration: 1 });
  };

  const showToast = (msg: string) => {
    setOffsetToast(msg);
    setTimeout(() => setOffsetToast(null), 2500);
  };

  return (
    <div className="relative w-full flex-1 min-h-0 bg-[#080a0e] overflow-hidden flex flex-col">
      {/* Top Floating Tactical HUD Control Overlay */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left Status pill */}
        <div className="pointer-events-auto prts-bracket bg-[#0d1420]/90 px-3 py-2 rounded backdrop-blur-md text-white shadow-xl flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00e5ff] animate-ping"></span>
            <div className="font-mono leading-tight">
              <div className="text-[10px] text-slate-400">PRTS SONAR RADAR</div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>探测半径:</span>
                <span className="text-[#00e5ff]">{filter.radiusKm} KM</span>
                <span className="text-slate-600">|</span>
                <span>目标:</span>
                <span className="text-[#ffde00] font-bold">{nearbyDoctors.length} 博士</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              onRefreshScan();
              prtsAudio.playRadarPing();
            }}
            disabled={isScanning}
            className="p-1.5 bg-[#00e5ff]/20 hover:bg-[#00e5ff]/30 text-[#00e5ff] border border-[#00e5ff]/60 rounded transition-all disabled:opacity-50"
            title="重新声呐扫描"
          >
            <RotateCw size={14} className={isScanning ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Center/Right Controls: Tactical Camouflage Switch, Beacon Broadcast Setting, and Filter */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Beacon Broadcast Radius Quick Setting (信标广播范围) */}
          <div className="relative">
            <button
              onClick={() => {
                prtsAudio.playClick();
                setShowBroadcastPanel((prev) => !prev);
                setShowOffsetPanel(false);
                setShowFilterPanel(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded border backdrop-blur-md transition-all shadow-lg ${
                showBroadcastPanel
                  ? 'bg-[#ffde00]/25 text-[#ffde00] border-[#ffde00]'
                  : 'bg-slate-900/80 text-yellow-300 border-yellow-500/50 hover:bg-slate-800'
              }`}
              title="设定本人信标对外可被侦测范围"
            >
              <Radar size={14} className="text-[#ffde00]" />
              <span>信标广播: {myProfile.broadcastVisibility === 'all' ? '全域' : `${broadcastRadiusKm}km`}</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${showBroadcastPanel ? 'rotate-180' : ''}`} />
            </button>

            {/* Beacon Broadcast Popover */}
            {showBroadcastPanel && (
              <div className="fixed right-3 top-24 z-[420] w-[min(18rem,calc(100vw-1.5rem))] bg-[#0c121c]/95 border border-[#ffde00]/50 rounded-lg shadow-2xl p-3 text-xs text-slate-200 font-mono backdrop-blur-xl animate-in fade-in slide-in-from-top-2 max-h-[calc(100dvh-7rem)] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Radar size={13} className="text-[#ffde00]" /> 信标广播范围
                  </span>
                  <button
                    onClick={() => setShowBroadcastPanel(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 mb-2.5 leading-relaxed">
                  设定罗德岛个人信标的对外广播半径。只有在该距离以内的其他博士雷达才能探查到您的讯号。
                </p>

                {/* Input & Slider */}
                <div className="bg-[#111925] p-2.5 rounded border border-slate-800 space-y-2">
                  {myProfile.broadcastVisibility === 'all' ? (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">有效广播半径:</span>
                      <span className="text-[11px] text-[#ffde00] font-bold">全域</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">有效广播半径:</span>
                      <div className="flex items-center gap-1 bg-[#0a0f16] px-2 py-0.5 rounded border border-[#ffde00]/40">
                        <input
                          type="number"
                          min={0.5}
                          max={100}
                          step={0.5}
                          value={broadcastRadiusKm}
                          onChange={(e) => {
                            const val = Math.max(0.1, Math.min(100, Number(e.target.value) || 0.1));
                            onSetBeaconBroadcastRadius(val);
                          }}
                          className="w-12 bg-transparent text-[#ffde00] font-bold text-xs text-right outline-none"
                        />
                        <span className="text-[11px] text-slate-400 font-bold">km</span>
                      </div>
                    </div>
                  )}

                  <input
                    type="range"
                    min={0.5}
                    max={100}
                    step={0.5}
                    value={broadcastRadiusKm}
                    onChange={(e) => {
                      onSetBeaconBroadcastRadius(Number(e.target.value));
                    }}
                    className={`w-full accent-[#ffde00] cursor-pointer ${myProfile.broadcastVisibility === 'all' ? 'opacity-40 pointer-events-none' : ''}`}
                  />

                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>0.5 km (同好近邻)</span>
                    <span>10 km (同城)</span>
                    <span>100 km (战区)</span>
                  </div>
                </div>

                {/* Broadcast Visibility Toggle — 信标可见范围 */}
                <div className="bg-[#111925] p-2.5 rounded border border-slate-800 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 text-[11px] font-bold">信标可见范围:</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                      myProfile.broadcastVisibility === 'all'
                        ? 'bg-[#ffde00]/20 text-[#ffde00] border-[#ffde00]/50'
                        : 'bg-slate-800/60 text-slate-300 border-slate-600'
                    }`}>
                      {myProfile.broadcastVisibility === 'all' ? '全体在线博士可见' : '仅限广播半径内'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => {
                        prtsAudio.playClick();
                        onSetBroadcastVisibility('all');
                        showToast('信标已设为全体在线博士可见');
                      }}
                      className={`px-2 py-1.5 rounded text-[10px] font-bold border transition-all ${
                        myProfile.broadcastVisibility === 'all'
                          ? 'bg-[#ffde00]/25 text-[#ffde00] border-[#ffde00]'
                          : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      所有人可见 (默认)
                    </button>
                    <button
                      onClick={() => {
                        prtsAudio.playClick();
                        onSetBroadcastVisibility('radius');
                        showToast(`信标已限为 ${broadcastRadiusKm}km 内可见`);
                      }}
                      className={`px-2 py-1.5 rounded text-[10px] font-bold border transition-all ${
                        myProfile.broadcastVisibility === 'radius'
                          ? 'bg-[#00e5ff]/25 text-[#00e5ff] border-[#00e5ff]'
                          : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      仅广播半径内
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1.5 leading-relaxed">
                    选择「所有人可见」后,任何在线博士的雷达都能看到你;选择「仅广播半径内」则只有在你广播半径内的博士能看到你。
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tactical Camouflage Quick Switch */}
          <div className="relative">
            <div className={`flex items-center rounded border backdrop-blur-md transition-all shadow-lg ${
              myProfile.isCamouflaged
                ? 'bg-emerald-950/80 border-emerald-500/70 text-emerald-300'
                : 'bg-amber-950/80 border-amber-500/70 text-amber-300'
            }`}>
              <button
                onClick={() => {
                  prtsAudio.playClick();
                  onToggleLocationOffset();
                  showToast(!myProfile.isCamouflaged ? `已启动战术迷彩防御 (±${activeRadius}m)` : '已解除战术迷彩，恢复真实物理坐标');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold hover:brightness-110 transition-all"
                title={myProfile.isCamouflaged ? '点击解除战术迷彩 (切换为真实物理坐标)' : '点击启动战术迷彩防御'}
              >
                {myProfile.isCamouflaged ? (
                  <ShieldCheck size={14} className="text-emerald-400" />
                ) : (
                  <ShieldAlert size={14} className="text-amber-400" />
                )}
                <span>
                  {myProfile.isCamouflaged ? `战术迷彩: ON (±${activeRadius}m)` : '战术迷彩: OFF'}
                </span>
              </button>

              <button
                onClick={() => {
                  prtsAudio.playClick();
                  setShowOffsetPanel((prev) => !prev);
                  setShowBroadcastPanel(false);
                  setShowFilterPanel(false);
                }}
                className={`p-1.5 border-l transition-colors ${
                  myProfile.isCamouflaged ? 'border-emerald-500/40 hover:bg-emerald-900/40' : 'border-amber-500/40 hover:bg-amber-900/40'
                }`}
                title="展开战术迷彩安全参数与扰动设置"
              >
                <ChevronDown size={12} className={`transition-transform duration-200 ${showOffsetPanel ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Tactical Camouflage Settings Dropdown Popover */}
            {showOffsetPanel && (
              <div className="fixed right-3 top-24 z-[420] w-[min(18rem,calc(100vw-1.5rem))] bg-[#0c121c]/95 border border-emerald-500/50 rounded-lg shadow-2xl p-3 text-xs text-slate-200 font-mono backdrop-blur-xl animate-in fade-in slide-in-from-top-2 max-h-[calc(100dvh-7rem)] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Shield size={13} className="text-emerald-400" /> 战术迷彩防御系统
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    myProfile.isCamouflaged ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}>
                    {myProfile.isCamouflaged ? 'CAMO ACTIVE (迷彩激活)' : 'EXPOSED (信号裸露)'}
                  </span>
                  <button
                    onClick={() => setShowOffsetPanel(false)}
                    className="text-slate-400 hover:text-white"
                    title="关闭"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 mb-2.5 leading-relaxed">
                  {myProfile.isCamouflaged 
                    ? '🛡️ 已对周围雷达隐匿精确物理坐标，对外信标投射在预设半径内的随机伪装点。'
                    : '⚠️ 当前正在对外广播精确物理信标，在公众网络或漫展面基时建议启动战术迷彩。'}
                </p>

                {/* Quick Toggle Button */}
                <button
                  onClick={() => {
                    prtsAudio.playClick();
                    onToggleLocationOffset();
                    showToast(!myProfile.isCamouflaged ? `已启动战术迷彩防御 (±${activeRadius}m)` : '已解除战术迷彩，恢复真实物理坐标');
                  }}
                  className={`w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1.5 mb-2.5 transition-all ${
                    myProfile.isCamouflaged
                      ? 'bg-rose-950/60 text-rose-300 border border-rose-500/50 hover:bg-rose-900/60'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-md'
                  }`}
                >
                  {myProfile.isCamouflaged ? <EyeOff size={13} /> : <ShieldCheck size={13} />}
                  {myProfile.isCamouflaged ? '一键停用迷彩 (恢复真实坐标)' : '立即启动战术迷彩防御'}
                </button>

                {/* Radius Slider & Custom Input */}
                <div className="space-y-2 mb-3 bg-[#111925] p-2.5 rounded border border-slate-800">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">迷彩扰动半径:</span>
                    <div className="flex items-center gap-1 bg-[#0a0f16] px-2 py-0.5 rounded border border-emerald-500/40">
                      <span className="text-emerald-400 font-bold">±</span>
                      <input
                        type="number"
                        min={10}
                        max={3000}
                        step={10}
                        value={activeRadius}
                        onChange={(e) => {
                          const val = Math.max(10, Math.min(3000, Number(e.target.value) || 10));
                          onSetOffsetRadius(val);
                        }}
                        className="w-12 bg-transparent text-emerald-400 font-bold text-xs text-right outline-none"
                      />
                      <span className="text-[11px] text-slate-400 font-bold">m</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={50}
                    max={2000}
                    step={25}
                    value={activeRadius}
                    onChange={(e) => {
                      onSetOffsetRadius(Number(e.target.value));
                    }}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />

                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>±50m (微扰动)</span>
                    <span>±500m (街区级)</span>
                    <span>±2000m (区域级)</span>
                  </div>
                </div>

                {/* Randomize / Re-jitter Button */}
                {myProfile.isCamouflaged && (
                  <button
                    onClick={() => {
                      onRegenerateOffset();
                      showToast('🎲 战术迷彩扰动方位已重新生成！');
                    }}
                    className="w-full py-1.5 bg-[#141e2e] hover:bg-[#1a293f] border border-slate-700 hover:border-emerald-500 text-slate-200 rounded text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Dices size={13} className="text-emerald-400" />
                    <span>重新生成迷彩扰动方位</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sonar Beam Toggle */}
          <button
            onClick={() => {
              prtsAudio.playClick();
              setActiveSonarAnimation(!activeSonarAnimation);
            }}
            className={`px-2.5 py-1.5 rounded text-xs font-mono border backdrop-blur-md transition-colors ${
              activeSonarAnimation
                ? 'bg-[#00e5ff]/20 text-[#00e5ff] border-[#00e5ff]/60'
                : 'bg-slate-900/80 text-slate-400 border-slate-700'
            }`}
            title="声呐扫描光束动效开关"
          >
            <Scan size={13} className="inline mr-1" />
            {activeSonarAnimation ? '声呐束: ON' : '声呐束: OFF'}
          </button>

          {/* Filter Dropdown Toggle */}
          <button
            onClick={() => {
              prtsAudio.playClick();
              setShowFilterPanel(!showFilterPanel);
              setShowOffsetPanel(false);
              setShowBroadcastPanel(false);
            }}
            className={`px-3 py-1.5 rounded text-xs font-mono border backdrop-blur-md flex items-center gap-1.5 transition-colors ${
              showFilterPanel
                ? 'bg-[#ffde00]/20 text-[#ffde00] border-[#ffde00]'
                : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <SlidersHorizontal size={13} />
            <span>战术筛选</span>
            {filter.server !== 'ALL' || filter.onlyOnline || filter.minLevel > 0 ? (
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffde00]"></span>
            ) : null}
          </button>
        </div>
      </div>

      {/* Floating Status Toast */}
      {offsetToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[450] px-4 py-2 bg-[#09101a]/95 border border-emerald-500/80 text-emerald-300 text-xs font-mono rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2 pointer-events-none">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>{offsetToast}</span>
        </div>
      )}

      {/* Filter Drawer / Panel */}
      {showFilterPanel && (
        <div className="absolute top-14 right-3 z-[410] w-[min(20rem,calc(100vw-1.5rem))] bg-[#0e1624]/95 border border-[#00e5ff]/40 rounded-lg p-3.5 backdrop-blur-lg shadow-2xl font-mono text-xs text-slate-200 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-3">
            <span className="font-bold text-[#00e5ff] flex items-center gap-1.5">
              <Filter size={13} /> 雷达战术参数配置
            </span>
            <button
              onClick={() => setShowFilterPanel(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Radius Selector with Slider & Input */}
          <div className="mb-3 bg-[#111925] p-2.5 rounded border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">探测扫描范围:</span>
              <div className="flex items-center gap-1 bg-[#0a0f16] px-2 py-0.5 rounded border border-[#00e5ff]/40">
                <input
                  type="number"
                  min={0.5}
                  max={50}
                  step={0.5}
                  value={filter.radiusKm}
                  onChange={(e) => {
                    const val = Math.max(0.5, Math.min(50, Number(e.target.value) || 0.5));
                    setFilter((prev) => ({ ...prev, radiusKm: val }));
                  }}
                  className="w-12 bg-transparent text-[#00e5ff] font-bold text-xs text-right outline-none"
                />
                <span className="text-[11px] text-[#00e5ff] font-bold">KM</span>
              </div>
            </div>

            <input
              type="range"
              min={0.5}
              max={30}
              step={0.5}
              value={filter.radiusKm}
              onChange={(e) => {
                setFilter((prev) => ({ ...prev, radiusKm: Number(e.target.value) }));
              }}
              className="w-full accent-[#00e5ff] cursor-pointer"
            />

            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
              <span>0.5 km (近距)</span>
              <span>5.0 km (标配)</span>
              <span>30.0 km (广域)</span>
            </div>
          </div>

          {/* Server Filter */}
          <div className="mb-3">
            <span className="text-slate-400 text-[11px] block mb-1">游戏区服:</span>
            <div className="grid grid-cols-3 gap-1">
              {(['ALL', 'CN_OFFICIAL', 'CN_BILIBILI', 'GLOBAL', 'JP', 'TW'] as (ServerRegion | 'ALL')[]).map((srv) => (
                <button
                  key={srv}
                  onClick={() => {
                    prtsAudio.playClick();
                    setFilter((prev) => ({ ...prev, server: srv }));
                  }}
                  className={`py-1 px-1.5 rounded text-center text-[9px] border truncate transition-colors ${
                    filter.server === srv
                      ? 'bg-[#ffde00]/20 text-[#ffde00] border-[#ffde00] font-bold'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {srv === 'ALL' ? '全部区服' : srv.replace('CN_', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles: Only Online & Clue Request */}
          <div className="space-y-2 pt-1 border-t border-slate-800">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300 text-[11px]">仅显示当前在线博士</span>
              <input
                type="checkbox"
                checked={filter.onlyOnline}
                onChange={(e) => {
                  prtsAudio.playClick();
                  setFilter((prev) => ({ ...prev, onlyOnline: e.target.checked }));
                }}
                className="rounded bg-slate-800 border-slate-600 text-[#00e5ff] focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300 text-[11px]">包含高练度助战干员</span>
              <input
                type="checkbox"
                checked={filter.hasSupport}
                onChange={(e) => {
                  prtsAudio.playClick();
                  setFilter((prev) => ({ ...prev, hasSupport: e.target.checked }));
                }}
                className="rounded bg-slate-800 border-slate-600 text-[#00e5ff] focus:ring-0"
              />
            </label>
          </div>
        </div>
      )}

      {/* Rotating Sonar Beam Animation Layer (Centered on screen) */}
      {activeSonarAnimation && (
        <div className="absolute inset-0 pointer-events-none z-[300] flex items-center justify-center overflow-hidden">
          <div className="relative w-[700px] h-[700px] rounded-full border border-[#00e5ff]/10">
            {/* Concentric distance rings */}
            <div className="absolute inset-[15%] rounded-full border border-[#00e5ff]/15"></div>
            <div className="absolute inset-[30%] rounded-full border border-[#00e5ff]/20"></div>
            <div className="absolute inset-[45%] rounded-full border border-[#00e5ff]/25"></div>
            {/* Crosshairs */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-[#00e5ff]/15 -translate-x-1/2"></div>
            <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-[#00e5ff]/15 -translate-y-1/2"></div>
            {/* Rotating Sonar Gradient Sweep */}
            <div className="w-full h-full rounded-full animate-radar-sweep bg-[conic-gradient(from_0deg,transparent_0deg,transparent_280deg,rgba(0,229,255,0.02)_320deg,rgba(0,229,255,0.22)_360deg)]"></div>
          </div>
        </div>
      )}

      {/* Main Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0 prts-scanlines" />

      {/* Bottom Floating Quick Carousel / Nearby Doctors Quick Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-[400] pointer-events-none">
        {/* Carousel of nearby doctor badges — pr-14 reserves room for the
            locate button so cards never slide under it */}
        <div className="pointer-events-auto flex items-center gap-2 overflow-x-auto py-1 pr-14 scrollbar-none">
          {nearbyDoctors.slice(0, 6).map((doc) => (
            <div
              key={doc.id}
              onClick={() => {
                onSelectDoctor(doc);
                prtsAudio.playClick();
              }}
              className="bg-[#0e1624]/90 border border-[#00e5ff]/30 hover:border-[#00e5ff] rounded px-2.5 py-1.5 backdrop-blur-md cursor-pointer transition-all flex items-center gap-2 min-w-[170px] shadow-lg group hover:bg-[#131f33] shrink-0"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden border" style={{ borderColor: doc.assistant.color }}>
                <img src={doc.assistant.avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="font-mono text-left text-[11px] leading-tight">
                <div className="text-white font-bold truncate max-w-[85px] group-hover:text-[#00e5ff] transition-colors">
                  {doc.name}
                </div>
                <div className="text-[9px] text-slate-400 flex items-center gap-1">
                  <span className="text-[#00e5ff]">Lv.{doc.level}</span>
                  <span>·</span>
                  <span className="text-[#ffde00]">{doc.distance ? (doc.distance < 1000 ? `${doc.distance}m` : `${(doc.distance/1000).toFixed(1)}k`) : ''}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Locate Me Button — pinned absolute to bottom-right so it can never be
            pushed off-screen by the carousel or map */}
        <button
          onClick={handleLocateSelf}
          className="absolute right-0 bottom-0 pointer-events-auto shrink-0 p-3 bg-[#00e5ff] hover:bg-[#38bdf8] text-slate-950 font-bold rounded-full shadow-[0_0_20px_rgba(0,229,255,0.6)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
          title="定位中心至我的信标"
        >
          <Compass size={20} className="animate-pulse" />
        </button>
      </div>
    </div>
  );
};
