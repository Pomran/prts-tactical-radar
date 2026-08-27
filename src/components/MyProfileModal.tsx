import React, { useState, useMemo } from 'react';
import { 
  X, 
  Save, 
  ShieldCheck, 
  ShieldAlert, 
  Zap, 
  User, 
  Sparkles, 
  Radio,
  Radar,
  Check,
  Search,
  Quote
} from 'lucide-react';
import { DoctorProfile, ServerRegion, Operator, OperatorClass } from '../types';
import { OPERATOR_DATABASE } from '../data/operators';
import { prtsAudio } from '../utils/audio';

interface MyProfileModalProps {
  profile: DoctorProfile;
  onSave: (updated: DoctorProfile) => void;
  onClose: () => void;
}

export const MyProfileModal: React.FC<MyProfileModalProps> = ({
  profile,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(profile.name);
  const [level, setLevel] = useState(profile.level);
  const [uid, setUid] = useState(profile.uid);
  const [server, setServer] = useState<ServerRegion>(profile.server);
  const [motto, setMotto] = useState(profile.motto);
  const [selectedAssistant, setSelectedAssistant] = useState<Operator>(profile.assistant);
  const [currentSanity, setCurrentSanity] = useState(profile.sanity.current);
  const [isCamouflaged, setIsCamouflaged] = useState(profile.isCamouflaged);
  const [offsetRadiusMeters, setOffsetRadiusMeters] = useState(profile.offsetRadiusMeters || 300);
  const [beaconBroadcastRadiusKm, setBeaconBroadcastRadiusKm] = useState(profile.beaconBroadcastRadiusKm || 5);
  const [broadcastVisibility, setBroadcastVisibility] = useState<'all' | 'radius'>(profile.broadcastVisibility || 'all');
  
  // Operator filter & search state
  const [operatorSearch, setOperatorSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState<OperatorClass | 'ALL'>('ALL');

  const filteredOperators = useMemo(() => {
    return OPERATOR_DATABASE.filter(op => {
      const matchClass = selectedClass === 'ALL' || op.classType === selectedClass;
      const matchQuery = 
        !operatorSearch.trim() || 
        op.cnName.toLowerCase().includes(operatorSearch.toLowerCase()) || 
        op.name.toLowerCase().includes(operatorSearch.toLowerCase()) ||
        op.faction.toLowerCase().includes(operatorSearch.toLowerCase());
      return matchClass && matchQuery;
    });
  }, [operatorSearch, selectedClass]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    prtsAudio.playPRTSBoot();
    const updated: DoctorProfile = {
      ...profile,
      name,
      level,
      uid,
      server,
      motto,
      assistant: selectedAssistant,
      sanity: {
        ...profile.sanity,
        current: currentSanity,
      },
      isCamouflaged,
      offsetRadiusMeters,
      beaconBroadcastRadiusKm,
      broadcastVisibility,
    };
    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative w-full max-w-xl bg-[#0d1420] border border-[#00e5ff]/50 rounded-lg shadow-[0_0_30px_rgba(0,229,255,0.2)] overflow-hidden font-mono text-slate-200">
        {/* Header */}
        <div className="bg-[#121c2c] border-b border-[#00e5ff]/30 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ffde00] animate-ping"></span>
            <span className="text-xs font-bold tracking-wider text-[#ffde00]">
              PRTS // 个人指挥官终端档案配置
            </span>
          </div>
          <button
            onClick={() => {
              prtsAudio.playClick();
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 max-h-[80vh] overflow-y-auto space-y-4 text-xs">
          {/* Assistant Selector Section */}
          <div className="bg-[#121c2a] p-3.5 rounded border border-slate-800 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-bold flex items-center gap-1.5 text-xs">
                <Sparkles size={13} className="text-[#00e5ff]" /> 助理干员预设 (全阵营干员库 · 共 {OPERATOR_DATABASE.length} 位)
              </span>
              <span className="text-[10px] text-[#00e5ff] font-bold">
                当前: {selectedAssistant.cnName} ({selectedAssistant.name})
              </span>
            </div>

            {/* Selected Assistant Banner Card */}
            <div className="bg-[#0a0f18] p-2.5 rounded border border-[#00e5ff]/30 flex items-center gap-3">
              <img 
                src={selectedAssistant.avatar} 
                alt={selectedAssistant.cnName} 
                className="w-12 h-12 rounded-full border border-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.4)]"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white tracking-wide">{selectedAssistant.cnName}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({selectedAssistant.name})</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/40 rounded">
                    {selectedAssistant.classType}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded border border-slate-700">
                    {selectedAssistant.faction}
                  </span>
                </div>
                <div className="text-[10px] text-slate-300 mt-1 italic flex items-center gap-1 truncate">
                  <Quote size={10} className="text-[#00e5ff] shrink-0" />
                  <span className="truncate">{selectedAssistant.quote}</span>
                </div>
              </div>
            </div>

            {/* Search & Class Filter */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <div className="relative flex-1">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索干员姓名 / 英文 / 阵营 (例如 维什戴尔, 临光, 岁...)"
                  value={operatorSearch}
                  onChange={(e) => setOperatorSearch(e.target.value)}
                  className="w-full bg-[#0a0f16] border border-slate-700 text-slate-100 rounded pl-7 pr-2 py-1 text-[11px] focus:border-[#00e5ff] outline-none"
                />
              </div>
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-[10px]">
                {(['ALL', 'Guard', 'Caster', 'Sniper', 'Specialist', 'Defender', 'Medic', 'Supporter', 'Vanguard'] as const).map(cls => (
                  <button
                    type="button"
                    key={cls}
                    onClick={() => {
                      prtsAudio.playClick();
                      setSelectedClass(cls);
                    }}
                    className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                      selectedClass === cls
                        ? 'bg-[#00e5ff] text-slate-950 font-bold'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700'
                    }`}
                  >
                    {cls === 'ALL' ? '全部' : 
                     cls === 'Guard' ? '近卫' :
                     cls === 'Caster' ? '术士' :
                     cls === 'Sniper' ? '狙击' :
                     cls === 'Specialist' ? '特种' :
                     cls === 'Defender' ? '重装' :
                     cls === 'Medic' ? '医疗' :
                     cls === 'Supporter' ? '辅助' : '先锋'}
                  </button>
                ))}
              </div>
            </div>

            {/* Operator Grid List */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1 max-h-44 overflow-y-auto pr-1">
              {filteredOperators.map((op) => (
                <button
                  type="button"
                  key={op.id}
                  onClick={() => {
                    prtsAudio.playClick();
                    setSelectedAssistant(op);
                  }}
                  className={`p-1.5 rounded border flex flex-col items-center gap-1 transition-all group ${
                    selectedAssistant.id === op.id
                      ? 'bg-[#00e5ff]/20 border-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.4)] ring-1 ring-[#00e5ff]'
                      : 'bg-slate-800/60 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                  }`}
                  title={`${op.cnName} (${op.name}) - ${op.classType} / ${op.faction}`}
                >
                  <div className="relative">
                    <img src={op.avatar} alt={op.cnName} className="w-9 h-9 rounded-full group-hover:scale-105 transition-transform" />
                    {selectedAssistant.id === op.id && (
                      <span className="absolute -bottom-1 -right-1 bg-[#00e5ff] text-slate-950 rounded-full p-0.5 shadow">
                        <Check size={9} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold truncate max-w-full ${
                    selectedAssistant.id === op.id ? 'text-[#00e5ff]' : 'text-slate-300'
                  }`}>
                    {op.cnName}
                  </span>
                </button>
              ))}
              {filteredOperators.length === 0 && (
                <div className="col-span-4 sm:col-span-6 py-6 text-center text-slate-500 text-xs">
                  未探查到符合关键词的干员
                </div>
              )}
            </div>
          </div>

          {/* Identity Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">博士昵称</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#0a0f16] border border-slate-700 text-slate-100 rounded px-2.5 py-1.5 focus:border-[#00e5ff] outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">指挥官等级</label>
              <input
                type="number"
                min={1}
                max={120}
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                className="w-full bg-[#0a0f16] border border-slate-700 text-slate-100 rounded px-2.5 py-1.5 focus:border-[#00e5ff] outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">游戏区服</label>
              <select
                value={server}
                onChange={(e) => setServer(e.target.value as ServerRegion)}
                className="w-full bg-[#0a0f16] border border-slate-700 text-slate-100 rounded px-2 py-1.5 focus:border-[#00e5ff] outline-none font-mono"
              >
                <option value="CN_OFFICIAL">官服 (鹰角网络)</option>
                <option value="CN_BILIBILI">B服 (哔哩哔哩)</option>
                <option value="GLOBAL">国际服 (Yostar Global)</option>
                <option value="JP">日服 (Yostar JP)</option>
                <option value="KR">韩服 (Yostar KR)</option>
                <option value="TW">繁中服 (龙成)</option>
              </select>
            </div>
          </div>

          {/* UID & Sanity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">游戏内 UID (方便其他博士加好友)</label>
              <input
                type="text"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                required
                className="w-full bg-[#0a0f16] border border-slate-700 text-slate-100 rounded px-2.5 py-1.5 focus:border-[#00e5ff] outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">
                当前理智值: <span className="text-[#ffde00] font-bold">{currentSanity} / 135</span>
              </label>
              <input
                type="range"
                min={0}
                max={135}
                value={currentSanity}
                onChange={(e) => setCurrentSanity(Number(e.target.value))}
                className="w-full accent-[#ffde00] mt-2"
              />
            </div>
          </div>

          {/* Motto */}
          <div>
            <label className="text-slate-400 block mb-1">个人签名 / 助战简介</label>
            <input
              type="text"
              value={motto}
              onChange={(e) => setMotto(e.target.value)}
              className="w-full bg-[#0a0f16] border border-slate-700 text-slate-100 rounded px-2.5 py-1.5 focus:border-[#00e5ff] outline-none"
            />
          </div>

          {/* Beacon Broadcast Range (信标广播可侦测范围设置) */}
          <div className="bg-[#121c2a] p-3 rounded border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Radar size={14} className="text-[#00e5ff]" />
                  <span>信标广播范围 (Beacon Broadcast Range)</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {broadcastVisibility === 'all'
                    ? '当前设为「所有人可见」:任何在线博士雷达都能看到您的讯号(全域)。'
                    : '设定罗德岛个人信标对外广播的有效半径。在此距离内的其他博士雷达方可探查到您的讯号。'}
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-[#0a0f16] px-2 py-1 rounded border border-[#00e5ff]/40">
                {broadcastVisibility === 'all' ? (
                  <span className="text-[#00e5ff] font-bold text-xs">全域</span>
                ) : (
                  <>
                    <input
                      type="number"
                      min={0.5}
                      max={100}
                      step={0.5}
                      value={beaconBroadcastRadiusKm}
                      onChange={(e) => setBeaconBroadcastRadiusKm(Math.max(0.5, Math.min(100, Number(e.target.value) || 0.5)))}
                      className="w-14 bg-transparent text-[#00e5ff] font-bold text-xs text-right outline-none"
                    />
                    <span className="text-[11px] text-slate-400 font-bold">km</span>
                  </>
                )}
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-1">
              <input
                type="range"
                min={0.5}
                max={100}
                step={0.5}
                value={beaconBroadcastRadiusKm}
                onChange={(e) => setBeaconBroadcastRadiusKm(Number(e.target.value))}
                className={`w-full accent-[#00e5ff] cursor-pointer ${broadcastVisibility === 'all' ? 'opacity-40 pointer-events-none' : ''}`}
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>0.5 km (近距同好)</span>
                <span>10 km (同城同好)</span>
                <span>100 km (战区广域)</span>
              </div>
            </div>

            {/* Broadcast Visibility Toggle — 信标可见范围 */}
            <div className="bg-[#0a0f16] rounded border border-slate-800 p-2.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-[11px] font-bold">信标可见范围:</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                  broadcastVisibility === 'all'
                    ? 'bg-[#ffde00]/20 text-[#ffde00] border-[#ffde00]/50'
                    : 'bg-slate-800/60 text-slate-300 border-slate-600'
                }`}>
                  {broadcastVisibility === 'all' ? '全体在线博士可见' : '仅限广播半径内'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => { prtsAudio.playClick(); setBroadcastVisibility('all'); }}
                  className={`px-2 py-1.5 rounded text-[10px] font-bold border transition-all ${
                    broadcastVisibility === 'all'
                      ? 'bg-[#ffde00]/25 text-[#ffde00] border-[#ffde00]'
                      : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  所有人可见 (默认)
                </button>
                <button
                  type="button"
                  onClick={() => { prtsAudio.playClick(); setBroadcastVisibility('radius'); }}
                  className={`px-2 py-1.5 rounded text-[10px] font-bold border transition-all ${
                    broadcastVisibility === 'radius'
                      ? 'bg-[#00e5ff]/25 text-[#00e5ff] border-[#00e5ff]'
                      : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  仅广播半径内
                </button>
              </div>
              <p className="text-[9px] text-slate-500 mt-1.5 leading-relaxed">
                所有人可见:任何在线博士雷达都能看到你(默认)。仅广播半径内:只有在你广播半径内的博士能看到你。
              </p>
            </div>
          </div>

          {/* Tactical Camouflage Toggle */}
          <div className="bg-[#121c2a] p-3 rounded border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-bold text-white flex items-center gap-1.5">
                  {isCamouflaged ? <ShieldCheck size={14} className="text-emerald-400" /> : <ShieldAlert size={14} className="text-amber-400" />}
                  <span>战术迷彩防御 (Tactical Camouflage)</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  开启后向 PRTS 网络广播时自动施加随机位置偏移扰动，对外隐匿真实物理坐标。
                </p>
              </div>

              <input
                type="checkbox"
                checked={isCamouflaged}
                onChange={(e) => setIsCamouflaged(e.target.checked)}
                className="w-5 h-5 rounded bg-slate-800 border-slate-600 text-emerald-500 focus:ring-0 cursor-pointer"
              />
            </div>

            {isCamouflaged && (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">设定迷彩扰动半径:</span>
                  <div className="flex items-center gap-1.5 bg-[#0a0f16] px-2 py-0.5 rounded border border-emerald-500/40">
                    <span className="text-emerald-400 font-bold">±</span>
                    <input
                      type="number"
                      min={10}
                      max={3000}
                      step={10}
                      value={offsetRadiusMeters}
                      onChange={(e) => setOffsetRadiusMeters(Math.max(10, Math.min(3000, Number(e.target.value) || 10)))}
                      className="w-14 bg-transparent text-emerald-400 font-bold text-xs text-right outline-none"
                    />
                    <span className="text-[11px] text-slate-400 font-bold">m</span>
                  </div>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min={50}
                  max={2000}
                  step={25}
                  value={offsetRadiusMeters}
                  onChange={(e) => setOffsetRadiusMeters(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>±50m (微扰动)</span>
                  <span>±500m (街区级)</span>
                  <span>±2000m (行政区级)</span>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-2.5 bg-[#00e5ff] hover:bg-[#38bdf8] text-slate-950 font-bold rounded text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all"
          >
            <Save size={14} /> 保存并向 PRTS 信标网络广播更新
          </button>
        </form>
      </div>
    </div>
  );
};
