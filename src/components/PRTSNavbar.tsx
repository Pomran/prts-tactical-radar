import React, { useState, useEffect, useRef } from 'react';
import { 
  Radar, 
  Users, 
  Radio, 
  ShieldAlert, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Volume1,
  MapPin, 
  UserCircle,
  Zap,
  ChevronDown,
  Play,
  Sliders,
  Bell,
  Check
} from 'lucide-react';
import { DoctorProfile } from '../types';
import { prtsAudio } from '../utils/audio';

interface PRTSNavbarProps {
  activeTab: 'radar' | 'list' | 'logs';
  setActiveTab: (tab: 'radar' | 'list' | 'logs') => void;
  myProfile: DoctorProfile;
  onOpenProfile: () => void;
  onRelocate: () => void;
  onToggleCamouflage: () => void;
  nearbyCount: number;
  locationName: string;
}

export const PRTSNavbar: React.FC<PRTSNavbarProps> = ({
  activeTab,
  setActiveTab,
  myProfile,
  onOpenProfile,
  onRelocate,
  onToggleCamouflage,
  nearbyCount,
  locationName,
}) => {
  const [isMuted, setIsMuted] = useState(prtsAudio.getIsMuted());
  const [volume, setVolume] = useState(prtsAudio.getVolume());
  const [isAudioMenuOpen, setIsAudioMenuOpen] = useState(false);
  const [audioFeedbackText, setAudioFeedbackText] = useState<string | null>(null);
  const [terraTime, setTerraTime] = useState('');
  const audioMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setTerraTime(`${h}:${m}:${s}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Subscribe to global audio state
  useEffect(() => {
    const unsubscribe = prtsAudio.subscribe((muted, vol) => {
      setIsMuted(muted);
      setVolume(vol);
    });
    return () => unsubscribe();
  }, []);

  // Close audio menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (audioMenuRef.current && !audioMenuRef.current.contains(e.target as Node)) {
        setIsAudioMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabChange = (tab: 'radar' | 'list' | 'logs') => {
    prtsAudio.playClick();
    setActiveTab(tab);
  };

  const toggleSound = () => {
    const nextMuted = !isMuted;
    prtsAudio.setMuted(nextMuted);
    setIsMuted(nextMuted);
    if (!nextMuted) {
      prtsAudio.playClick();
      showAudioFeedback('PRTS 战术音效已开启');
    } else {
      showAudioFeedback('PRTS 战术音效已静音');
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    prtsAudio.setVolume(newVol);
    if (isMuted) {
      prtsAudio.setMuted(false);
    }
  };

  const showAudioFeedback = (text: string) => {
    setAudioFeedbackText(text);
    setTimeout(() => {
      setAudioFeedbackText(null);
    }, 2000);
  };

  const testAudioEffect = (type: 'click' | 'sonar' | 'sanity' | 'target' | 'boot' | 'combat', name: string) => {
    if (isMuted) {
      prtsAudio.setMuted(false);
    }
    switch (type) {
      case 'click':
        prtsAudio.playClick();
        break;
      case 'sonar':
        prtsAudio.playRadarPing();
        break;
      case 'sanity':
        prtsAudio.playSanityChime();
        break;
      case 'target':
        prtsAudio.playTargetDetected();
        break;
      case 'boot':
        prtsAudio.playPRTSBoot();
        break;
      case 'combat':
        prtsAudio.playCombatAlert();
        break;
    }
    showAudioFeedback(`试听: ${name}`);
  };

  return (
    <header className="w-full bg-[#0d121a]/95 border-b border-[#00e5ff]/20 px-3 py-2.5 backdrop-blur-md sticky top-0 z-50 flex flex-col md:flex-row items-center justify-between gap-2 select-none">
      {/* Left: PRTS Brand & Status */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 bg-[#00e5ff]/10 border border-[#00e5ff]/50 rounded">
            <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-ping absolute"></span>
            <span className="w-2 h-2 rounded-full bg-[#00e5ff]"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-black tracking-wider text-sm font-mono flex items-center gap-1.5">
                PRTS <span className="text-[#00e5ff]">方舟雷达</span>
              </span>
              <span className="px-1.5 py-0.2 bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30 text-[9px] font-mono rounded">
                v3.5 ONLINE
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
              <span>TERRA TIME: <b className="text-slate-200">{terraTime}</b></span>
              <span className="text-slate-600">|</span>
              <span className="text-[#ffde00]">在线博士: {nearbyCount}</span>
            </div>
          </div>
        </div>

        {/* Mobile quick icons */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            onClick={() => setIsAudioMenuOpen((prev) => !prev)}
            className={`p-1.5 border rounded flex items-center gap-1 transition-colors ${
              isMuted 
                ? 'bg-slate-900 border-slate-700 text-slate-500' 
                : 'bg-[#00e5ff]/15 border-[#00e5ff]/50 text-[#00e5ff]'
            }`}
            title="音效控制"
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          <button
            onClick={onOpenProfile}
            className="p-1 bg-[#00e5ff]/20 border border-[#00e5ff] rounded flex items-center"
          >
            <img src={myProfile.assistant.avatar} alt="Avatar" className="w-5 h-5 rounded-full" />
          </button>
        </div>
      </div>

      {/* Middle: Navigation Tabs */}
      <nav className="flex items-center gap-1 overflow-x-auto w-full md:w-auto py-1 md:py-0 border-t md:border-t-0 border-slate-800/60 justify-start md:justify-center">
        <button
          onClick={() => handleTabChange('radar')}
          className={`px-3 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'radar'
              ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.25)] font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Radar size={14} className={activeTab === 'radar' ? 'animate-spin' : ''} />
          雷达扫描
        </button>

        <button
          onClick={() => handleTabChange('list')}
          className={`px-3 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'list'
              ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff] font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Users size={14} />
          附近博士名录 ({nearbyCount})
        </button>

        <button
          onClick={() => handleTabChange('logs')}
          className={`px-3 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'logs'
              ? 'bg-[#a855f7]/20 text-[#c084fc] border border-[#a855f7] font-bold'
              : 'text-slate-400 hover:text-purple-300 hover:bg-slate-800/50'
          }`}
        >
          <Radio size={14} />
          战术密话与日志
        </button>
      </nav>

      {/* Right: Quick Controls (Location, Camouflage, Sound, Profile) */}
      <div className="hidden md:flex items-center gap-2 relative">
        {/* Location / Relocate */}
        <button
          onClick={() => {
            prtsAudio.playClick();
            onRelocate();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#141b24] hover:bg-[#1a2330] border border-slate-700 text-slate-300 rounded text-xs font-mono transition-colors"
          title="重新定位当前位置 (GPS / IP)"
        >
          <MapPin size={13} className="text-[#00e5ff]" />
          <span className="max-w-[110px] truncate text-slate-200">{locationName}</span>
        </button>

        {/* Tactical Camouflage Mode Switch */}
        <button
          onClick={() => {
            onToggleCamouflage();
            prtsAudio.playClick();
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono border transition-all ${
            myProfile.isCamouflaged
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/60 hover:bg-emerald-900/60 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
              : 'bg-amber-950/60 text-amber-300 border-amber-500/60 hover:bg-amber-900/60 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
          }`}
          title={myProfile.isCamouflaged ? `战术迷彩已开启 (±${myProfile.offsetRadiusMeters || 300}m 随机扰动保护)` : '战术迷彩未开启：正在广播精确真实坐标，点击开启安全防御'}
        >
          {myProfile.isCamouflaged ? (
            <>
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>战术迷彩: ON (±{myProfile.offsetRadiusMeters || 300}m)</span>
            </>
          ) : (
            <>
              <ShieldAlert size={13} className="text-amber-400" />
              <span>战术迷彩: OFF</span>
            </>
          )}
        </button>

        {/* Tactical Global Audio Master Button */}
        <div className="relative" ref={audioMenuRef}>
          <div className="flex items-center rounded bg-[#141b24] border border-slate-700 hover:border-[#00e5ff]/60 transition-all">
            <button
              onClick={toggleSound}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono transition-colors ${
                isMuted 
                  ? 'text-slate-400 hover:text-slate-200' 
                  : 'text-[#00e5ff] font-bold'
              }`}
              title={isMuted ? '点击开启 PRTS 战术音效' : '点击静音'}
            >
              {isMuted ? (
                <VolumeX size={14} className="text-rose-400" />
              ) : volume < 0.4 ? (
                <Volume1 size={14} className="text-[#00e5ff] animate-pulse" />
              ) : (
                <Volume2 size={14} className="text-[#00e5ff] animate-pulse" />
              )}
              <span className="text-[11px] hidden lg:inline">
                {isMuted ? '音效: OFF' : `音效: ${Math.round(volume * 100)}%`}
              </span>
            </button>

            <button
              onClick={() => {
                prtsAudio.playClick();
                setIsAudioMenuOpen((prev) => !prev);
              }}
              className="p-1.5 border-l border-slate-700 text-slate-400 hover:text-[#00e5ff] transition-colors"
              title="展开 PRTS 音效控制中枢与音效试听"
            >
              <ChevronDown size={12} className={`transition-transform duration-200 ${isAudioMenuOpen ? 'rotate-180 text-[#00e5ff]' : ''}`} />
            </button>
          </div>

          {/* Audio Dropdown / Popover Console */}
          {isAudioMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-[#0c121b] border border-[#00e5ff]/50 rounded-lg shadow-[0_0_25px_rgba(0,229,255,0.25)] p-3 text-xs text-slate-200 font-mono z-[100] animate-in fade-in slide-in-from-top-2">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sliders size={13} className="text-[#00e5ff]" /> PRTS 战术音效控制中枢
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  isMuted ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}>
                  {isMuted ? 'MUTED' : 'ACTIVE'}
                </span>
              </div>

              {/* Master Volume & Toggle */}
              <div className="bg-[#111925] p-2.5 rounded border border-slate-800 space-y-2 mb-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} className="text-[#00e5ff]" />} 主音量
                  </span>
                  <span className="font-bold text-[#00e5ff]">
                    {isMuted ? '已静音 (0%)' : `${Math.round(volume * 100)}%`}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full accent-[#00e5ff] cursor-pointer h-1.5 bg-slate-800 rounded"
                />

                <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
                  <button
                    onClick={toggleSound}
                    className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                      isMuted
                        ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]'
                        : 'bg-rose-950/40 text-rose-300 border border-rose-500/40 hover:bg-rose-900/50'
                    }`}
                  >
                    {isMuted ? <Volume2 size={11} /> : <VolumeX size={11} />}
                    {isMuted ? '开启全局音效' : '一键静音'}
                  </button>

                  <button
                    onClick={() => {
                      prtsAudio.setVolume(0.8);
                      prtsAudio.setMuted(false);
                      prtsAudio.playClick();
                      showAudioFeedback('已重置默认 80% 音量');
                    }}
                    className="text-[10px] text-slate-400 hover:text-slate-200 underline"
                  >
                    重置默认 (80%)
                  </button>
                </div>
              </div>

              {/* Sound FX Audition Matrix */}
              <div className="space-y-1.5">
                <div className="text-[10px] text-slate-400 font-bold flex items-center justify-between">
                  <span>战术音效预设自检与试听:</span>
                  {audioFeedbackText && (
                    <span className="text-[#ffde00] animate-pulse font-normal">{audioFeedbackText}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => testAudioEffect('sonar', '雷达声呐')}
                    className="p-1.5 bg-[#141d2b] hover:bg-[#1a2638] border border-slate-800 hover:border-[#00e5ff]/50 rounded text-left text-[10px] text-slate-300 hover:text-white flex items-center justify-between group transition-all"
                  >
                    <span>🔊 雷达声呐</span>
                    <Play size={10} className="text-[#00e5ff] opacity-60 group-hover:opacity-100" />
                  </button>

                  <button
                    onClick={() => testAudioEffect('sanity', '理智顶剂')}
                    className="p-1.5 bg-[#141d2b] hover:bg-[#1a2638] border border-slate-800 hover:border-[#ffde00]/50 rounded text-left text-[10px] text-slate-300 hover:text-white flex items-center justify-between group transition-all"
                  >
                    <span>⚡ 理智顶剂</span>
                    <Play size={10} className="text-[#ffde00] opacity-60 group-hover:opacity-100" />
                  </button>

                  <button
                    onClick={() => testAudioEffect('target', '干员截获')}
                    className="p-1.5 bg-[#141d2b] hover:bg-[#1a2638] border border-slate-800 hover:border-emerald-500/50 rounded text-left text-[10px] text-slate-300 hover:text-white flex items-center justify-between group transition-all"
                  >
                    <span>🎯 干员截获</span>
                    <Play size={10} className="text-emerald-400 opacity-60 group-hover:opacity-100" />
                  </button>

                  <button
                    onClick={() => testAudioEffect('combat', '突袭警报')}
                    className="p-1.5 bg-[#141d2b] hover:bg-[#1a2638] border border-slate-800 hover:border-rose-500/50 rounded text-left text-[10px] text-slate-300 hover:text-white flex items-center justify-between group transition-all"
                  >
                    <span>🚨 突袭警报</span>
                    <Play size={10} className="text-rose-400 opacity-60 group-hover:opacity-100" />
                  </button>

                  <button
                    onClick={() => testAudioEffect('boot', '终端链接')}
                    className="p-1.5 bg-[#141d2b] hover:bg-[#1a2638] border border-slate-800 hover:border-purple-400/50 rounded text-left text-[10px] text-slate-300 hover:text-white flex items-center justify-between group transition-all"
                  >
                    <span>💻 终端链接</span>
                    <Play size={10} className="text-purple-400 opacity-60 group-hover:opacity-100" />
                  </button>

                  <button
                    onClick={() => testAudioEffect('click', '战术触控')}
                    className="p-1.5 bg-[#141d2b] hover:bg-[#1a2638] border border-slate-800 hover:border-slate-600 rounded text-left text-[10px] text-slate-300 hover:text-white flex items-center justify-between group transition-all"
                  >
                    <span>🖱️ 战术触控</span>
                    <Play size={10} className="text-slate-400 group-hover:text-white" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* My Terminal Profile Card Button */}
        <button
          onClick={() => {
            prtsAudio.playClick();
            onOpenProfile();
          }}
          className="flex items-center gap-2 pl-2 pr-3 py-1 bg-gradient-to-r from-[#121c29] to-[#1a293b] border border-[#00e5ff]/40 rounded hover:border-[#00e5ff] transition-all group"
        >
          <div className="relative w-6 h-6 rounded-full overflow-hidden border border-[#00e5ff]/60">
            <img src={myProfile.assistant.avatar} alt="My Assistant" className="w-full h-full object-cover" />
          </div>
          <div className="text-left font-mono">
            <div className="text-[11px] text-white font-bold leading-none flex items-center gap-1">
              <span>{myProfile.name}</span>
              <span className="text-[9px] text-[#00e5ff]">Lv.{myProfile.level}</span>
            </div>
            <div className="text-[9px] text-slate-400 flex items-center gap-1">
              <Zap size={9} className="text-[#ffde00]" />
              <span>理智 {myProfile.sanity.current}/{myProfile.sanity.max}</span>
            </div>
          </div>
        </button>
      </div>

      {/* Floating Audio Menu for Mobile */}
      {isAudioMenuOpen && (
        <div className="md:hidden w-full bg-[#0c121b] border border-[#00e5ff]/50 rounded-lg shadow-[0_0_25px_rgba(0,229,255,0.25)] p-3 text-xs text-slate-200 font-mono mt-1 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sliders size={13} className="text-[#00e5ff]" /> PRTS 战术音效控制
            </span>
            <button
              onClick={() => setIsAudioMenuOpen(false)}
              className="text-slate-400 hover:text-white px-2 py-0.5"
            >
              关闭
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-[11px] text-slate-300">
              主音量: {isMuted ? '已静音' : `${Math.round(volume * 100)}%`}
            </span>
            <button
              onClick={toggleSound}
              className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                isMuted ? 'bg-[#00e5ff] text-slate-950' : 'bg-rose-900/60 text-rose-200 border border-rose-500/50'
              }`}
            >
              {isMuted ? '开启音效' : '一键静音'}
            </button>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-full accent-[#00e5ff] cursor-pointer h-1.5 bg-slate-800 rounded mb-2"
          />

          <div className="grid grid-cols-3 gap-1 pt-1">
            <button
              onClick={() => testAudioEffect('sonar', '声呐')}
              className="p-1 bg-[#141d2b] rounded text-[10px] text-center border border-slate-800 text-slate-300"
            >
              🔊 声呐
            </button>
            <button
              onClick={() => testAudioEffect('sanity', '理智')}
              className="p-1 bg-[#141d2b] rounded text-[10px] text-center border border-slate-800 text-slate-300"
            >
              ⚡ 理智
            </button>
            <button
              onClick={() => testAudioEffect('combat', '作战')}
              className="p-1 bg-[#141d2b] rounded text-[10px] text-center border border-slate-800 text-slate-300"
            >
              🚨 警报
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
