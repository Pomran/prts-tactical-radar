import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Zap, 
  Swords, 
  Scroll, 
  ShieldCheck, 
  ShieldAlert, 
  Send, 
  Sparkles,
  Award,
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DoctorProfile } from '../types';
import { prtsAudio } from '../utils/audio';

interface DoctorDetailModalProps {
  doctor: DoctorProfile | null;
  onClose: () => void;
  onSendSanity: (doc: DoctorProfile) => void;
  onSendInvite: (doc: DoctorProfile, drillName: string) => void;
  onSendClue: (doc: DoctorProfile, clueNum: number) => void;
  onSendMessage: (doc: DoctorProfile, msg: string) => void;
}

const CLUE_NAMES = [
  '线索1 (莱茵生命)',
  '线索2 (企鹅物流)',
  '线索3 (黑钢国际)',
  '线索4 (乌萨斯学生自治团)',
  '线索5 (格拉斯哥帮)',
  '线索6 (喀兰贸易)',
  '线索7 (罗德岛制药)'
];

const PRESET_MESSAGES = [
  '“博士，需要线索7吗？我这边多了一张！”',
  '“肉鸽 N15 组队切磋暗号已发，随时可进！”',
  '“求借专三至高之术棘刺打剿灭，谢谢大佬！”',
  '“理智已送到，今晚保全派驻一起冲！”'
];

export const DoctorDetailModal: React.FC<DoctorDetailModalProps> = ({
  doctor,
  onClose,
  onSendSanity,
  onSendInvite,
  onSendClue,
  onSendMessage,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedClue, setSelectedClue] = useState<number>(7);
  const [customMsg, setCustomMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'support' | 'interact'>('overview');

  if (!doctor) return null;

  const handleCopyUid = () => {
    navigator.clipboard.writeText(doctor.uid);
    setCopied(true);
    prtsAudio.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSanityClick = () => {
    prtsAudio.playSanityChime();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#ffde00', '#00e5ff', '#ffffff']
    });
    onSendSanity(doctor);
  };

  const handleInviteClick = (drillType: string) => {
    prtsAudio.playCombatAlert();
    onSendInvite(doctor, drillType);
  };

  const handleClueTrade = () => {
    prtsAudio.playClick();
    onSendClue(doctor, selectedClue);
  };

  const handleSendPing = () => {
    if (!customMsg.trim()) return;
    prtsAudio.playClick();
    onSendMessage(doctor, customMsg);
    setCustomMsg('');
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative w-full max-w-lg bg-[#0d1420] border border-[#00e5ff]/50 rounded-lg shadow-[0_0_30px_rgba(0,229,255,0.2)] overflow-hidden font-mono text-slate-200">
        {/* Header Ribbon */}
        <div className="bg-[#121c2c] border-b border-[#00e5ff]/30 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-ping"></span>
            <span className="text-xs font-bold tracking-wider text-[#00e5ff]">
              PRTS // 战术指挥官加密档案 [ID: {doctor.uid.slice(0, 5)}***]
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

        {/* Doctor Header Banner */}
        <div className="p-4 bg-gradient-to-b from-[#101b2a] to-[#0d1420] border-b border-slate-800">
          <div className="flex items-start gap-4">
            {/* Assistant Avatar */}
            <div className="relative group">
              <div 
                className="w-16 h-16 rounded-full border-2 p-0.5 overflow-hidden shadow-lg bg-[#0a0f16]" 
                style={{ borderColor: doctor.assistant.color }}
              >
                <img src={doctor.assistant.avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-[#00e5ff] text-slate-950 text-[9px] font-bold rounded">
                6★
              </span>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-bold text-white tracking-wide">{doctor.name}</h3>
                <span className="text-[10px] px-1.5 py-0.5 bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40 rounded">
                  Lv.{doctor.level}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 bg-[#ffde00]/20 text-[#ffde00] border border-[#ffde00]/40 rounded">
                  {doctor.server}
                </span>
              </div>

              <div className="text-xs text-slate-400 mb-2 flex items-center gap-2">
                <span>助理干员: <b className="text-slate-200">{doctor.assistant.cnName}</b></span>
                <span className="text-slate-600">|</span>
                <span>{doctor.title}</span>
              </div>

              {/* UID & Distance row */}
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <div className="flex items-center gap-1 bg-[#15202e] px-2 py-0.5 rounded border border-slate-700">
                  <span className="text-slate-400">UID:</span>
                  <span className="text-[#00e5ff] font-bold">{doctor.uid}</span>
                  <button
                    onClick={handleCopyUid}
                    className="ml-1 text-slate-400 hover:text-white"
                    title="复制游戏UID"
                  >
                    {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-[#15202e] px-2 py-0.5 rounded border border-slate-700">
                  <span className="text-slate-400">直线距离:</span>
                  <span className="text-[#ffde00] font-bold">
                    {doctor.distance ? (doctor.distance < 1000 ? `${doctor.distance} 米` : `${(doctor.distance/1000).toFixed(2)} 公里`) : '附近'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Motto quote */}
          <div className="mt-3 p-2 bg-[#090e17] rounded border-l-2 border-[#ffde00] text-xs text-slate-300 italic">
            {doctor.motto}
          </div>
        </div>

        {/* Tabs for Navigation */}
        <div className="flex border-b border-slate-800 bg-[#0a0f18] px-4 text-xs">
          <button
            onClick={() => {
              prtsAudio.playClick();
              setActiveTab('overview');
            }}
            className={`py-2 px-3 border-b-2 font-bold transition-all ${
              activeTab === 'overview'
                ? 'border-[#00e5ff] text-[#00e5ff]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            战术概况
          </button>
          <button
            onClick={() => {
              prtsAudio.playClick();
              setActiveTab('support');
            }}
            className={`py-2 px-3 border-b-2 font-bold transition-all ${
              activeTab === 'support'
                ? 'border-[#00e5ff] text-[#00e5ff]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            助战干员 ({doctor.supportOperators.length})
          </button>
          <button
            onClick={() => {
              prtsAudio.playClick();
              setActiveTab('interact');
            }}
            className={`py-2 px-3 border-b-2 font-bold transition-all ${
              activeTab === 'interact'
                ? 'border-[#ffde00] text-[#ffde00]'
                : 'border-transparent text-slate-400 hover:text-[#ffde00]'
            }`}
          >
            战术互动 & 密话
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 max-h-[320px] overflow-y-auto space-y-4">
          {activeTab === 'overview' && (
            <div className="space-y-3">
              {/* Sanity & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#121c2a] p-2.5 rounded border border-slate-800">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center gap-1"><Zap size={12} className="text-[#ffde00]" /> 当前理智</span>
                    <span className="text-[#ffde00] font-bold">{doctor.sanity.current} / {doctor.sanity.max}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                      style={{ width: `${Math.min(100, (doctor.sanity.current / doctor.sanity.max) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-[#121c2a] p-2.5 rounded border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">安全与迷彩状态</div>
                  <div className="flex items-center gap-1.5 text-xs">
                    {doctor.isCamouflaged ? (
                      <>
                        <ShieldCheck size={14} className="text-emerald-400" />
                        <span className="text-emerald-300 font-bold">迷彩伪装中 (±200m)</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert size={14} className="text-amber-400" />
                        <span className="text-amber-300 font-bold">公开信标广播</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Clues Wanted and Surplus */}
              <div className="bg-[#121c2a] p-3 rounded border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-[#00e5ff] font-bold mb-2">
                  <Scroll size={13} /> 罗德岛会客室线索动态
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block mb-1">急需线索:</span>
                    <div className="flex gap-1 flex-wrap">
                      {doctor.wantedClues.map((c) => (
                        <span key={c} className="px-2 py-0.5 bg-rose-950/60 text-rose-300 border border-rose-600/40 rounded text-[10px] font-bold">
                          线索 {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] block mb-1">多余可赠送:</span>
                    <div className="flex gap-1 flex-wrap">
                      {doctor.extraClues.map((c) => (
                        <span key={c} className="px-2 py-0.5 bg-emerald-950/60 text-emerald-300 border border-emerald-600/40 rounded text-[10px] font-bold">
                          线索 {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Sanity Potion Delivery Button */}
              <button
                onClick={handleSanityClick}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 hover:from-amber-500/30 hover:to-yellow-400/30 text-[#ffde00] border border-[#ffde00]/60 rounded text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,222,0,0.25)] transition-all active:scale-[0.99]"
              >
                <Zap size={15} /> 投递【应急理智顶剂】(+10 Sanity & 点赞)
              </button>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-400">已部署的公招/助战单位：</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {doctor.supportOperators.map((sup, idx) => (
                  <div key={idx} className="bg-[#121c2a] p-2.5 rounded border border-slate-800 flex items-center gap-3">
                    <img src={sup.operator.avatar} className="w-10 h-10 rounded-full border border-slate-600" />
                    <div className="text-xs leading-tight flex-1">
                      <div className="font-bold text-white">{sup.operator.cnName}</div>
                      <div className="text-[10px] text-slate-400">{sup.operator.name}</div>
                      <div className="text-[10px] text-[#00e5ff] mt-0.5 flex items-center gap-2">
                        <span>精二 Lv.{sup.level}</span>
                        <span>{sup.skillLevel}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'interact' && (
            <div className="space-y-3">
              {/* Tactical Exercise Invites */}
              <div className="bg-[#121c2a] p-3 rounded border border-slate-800">
                <span className="text-xs text-[#00e5ff] font-bold block mb-2 flex items-center gap-1.5">
                  <Swords size={13} /> 发起联合突袭 / 危机合约切磋演习
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleInviteClick('危机合约 18级')}
                    className="py-1.5 px-2 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/40 rounded text-[11px] font-bold transition-colors text-left"
                  >
                    ⚔️ 危机合约 18级联习
                  </button>
                  <button
                    onClick={() => handleInviteClick('萨卡兹肉鸽 N15')}
                    className="py-1.5 px-2 bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 border border-purple-500/40 rounded text-[11px] font-bold transition-colors text-left"
                  >
                    🎲 探索者的银凇肉鸽
                  </button>
                </div>
              </div>

              {/* Clue Gifting */}
              <div className="bg-[#121c2a] p-3 rounded border border-slate-800">
                <span className="text-xs text-[#00e5ff] font-bold block mb-2 flex items-center gap-1.5">
                  <Scroll size={13} /> 投递线索至其会客室
                </span>
                <div className="flex gap-1.5 items-center">
                  <select
                    value={selectedClue}
                    onChange={(e) => setSelectedClue(Number(e.target.value))}
                    className="bg-[#0a0f16] border border-slate-700 text-slate-200 text-xs rounded p-1.5 flex-1 font-mono"
                  >
                    {CLUE_NAMES.map((name, idx) => (
                      <option key={idx + 1} value={idx + 1}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleClueTrade}
                    className="py-1.5 px-3 bg-[#00e5ff]/20 hover:bg-[#00e5ff]/30 text-[#00e5ff] border border-[#00e5ff]/60 rounded text-xs font-bold transition-colors"
                  >
                    发送线索
                  </button>
                </div>
              </div>

              {/* Custom PRTS Encrypted Ping */}
              <div className="bg-[#121c2a] p-3 rounded border border-slate-800">
                <span className="text-xs text-[#00e5ff] font-bold block mb-2 flex items-center gap-1.5">
                  <Radio size={13} /> PRTS 神经拟态密话广播
                </span>
                
                {/* Preset quick message buttons */}
                <div className="space-y-1 mb-2">
                  {PRESET_MESSAGES.map((msg, i) => (
                    <button
                      key={i}
                      onClick={() => setCustomMsg(msg)}
                      className="w-full text-left text-[10px] text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 p-1 rounded truncate transition-colors"
                    >
                      {msg}
                    </button>
                  ))}
                </div>

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customMsg}
                    onChange={(e) => setCustomMsg(e.target.value)}
                    placeholder="输入战术联络密话..."
                    className="bg-[#0a0f16] border border-slate-700 text-slate-200 text-xs rounded px-2 py-1.5 flex-1 font-mono focus:border-[#00e5ff] outline-none"
                  />
                  <button
                    onClick={handleSendPing}
                    className="py-1.5 px-3 bg-[#ffde00]/20 hover:bg-[#ffde00]/30 text-[#ffde00] border border-[#ffde00]/60 rounded text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Send size={12} /> 发送
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
