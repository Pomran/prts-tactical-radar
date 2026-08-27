import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Copy, 
  Check, 
  Zap, 
  Swords, 
  Scroll, 
  ShieldCheck, 
  ExternalLink,
  Filter,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DoctorProfile, ServerRegion } from '../types';
import { prtsAudio } from '../utils/audio';

interface DoctorListViewProps {
  doctors: DoctorProfile[];
  onSelectDoctor: (doc: DoctorProfile) => void;
  onSendSanity: (doc: DoctorProfile) => void;
  onSendInvite: (doc: DoctorProfile) => void;
}

export const DoctorListView: React.FC<DoctorListViewProps> = ({
  doctors,
  onSelectDoctor,
  onSendSanity,
  onSendInvite,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedUid, setCopiedUid] = useState<string | null>(null);
  const [selectedServer, setSelectedServer] = useState<string>('ALL');

  const filteredDoctors = doctors.filter((doc) => {
    const matchSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.assistant.cnName.includes(searchTerm) ||
      doc.assistant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.uid.includes(searchTerm);

    const matchServer = selectedServer === 'ALL' || doc.server === selectedServer;
    return matchSearch && matchServer;
  });

  const handleCopyUid = (uid: string) => {
    navigator.clipboard.writeText(uid);
    setCopiedUid(uid);
    prtsAudio.playClick();
    setTimeout(() => setCopiedUid(null), 2000);
  };

  const handleSanityGift = (doc: DoctorProfile) => {
    prtsAudio.playSanityChime();
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#ffde00', '#00e5ff']
    });
    onSendSanity(doc);
  };

  return (
    <div className="w-full flex-1 min-h-0 overflow-y-auto bg-[#080b10] text-slate-200 p-4 md:p-6 font-mono">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header with Search & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40 rounded text-xs font-bold">
                PRTS PERSONNEL DIRECTORY
              </span>
              <h1 className="text-xl font-bold text-white tracking-wide">
                周围在线博士战术名录
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              当前信标范围内共侦测到 <b className="text-[#ffde00]">{doctors.length}</b> 位罗德岛指挥官
            </p>
          </div>

          {/* Search inputs & Server selector */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索博士、干员、UID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#0e1624] border border-slate-700 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:border-[#00e5ff] outline-none w-56"
              />
            </div>

            <select
              value={selectedServer}
              onChange={(e) => setSelectedServer(e.target.value)}
              className="bg-[#0e1624] border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-[#00e5ff] outline-none font-mono"
            >
              <option value="ALL">全部区服</option>
              <option value="CN_OFFICIAL">官服</option>
              <option value="CN_BILIBILI">B服</option>
              <option value="GLOBAL">国际服</option>
              <option value="JP">日服</option>
            </select>
          </div>
        </div>

        {/* Doctor Grid Cards */}
        {filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-[#0d1420] border border-slate-800 hover:border-[#00e5ff]/60 rounded-lg p-4 shadow-xl transition-all flex flex-col justify-between group hover:bg-[#101927]"
              >
                <div>
                  {/* Top Bar: Level, Server, Online badge */}
                  <div className="flex items-center justify-between text-xs mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40 rounded text-[10px] font-bold">
                        Lv.{doc.level}
                      </span>
                      <span className="text-[10px] text-slate-400">{doc.server}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[#ffde00] font-bold">
                        {doc.distance ? (doc.distance < 1000 ? `${doc.distance}m` : `${(doc.distance/1000).toFixed(1)}km`) : '附近'}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${doc.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
                    </div>
                  </div>

                  {/* Doctor & Assistant Info */}
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-full border-2 p-0.5 overflow-hidden bg-[#0a0f16] flex-shrink-0 shadow-md group-hover:scale-105 transition-transform"
                      style={{ borderColor: doc.assistant.color }}
                    >
                      <img src={doc.assistant.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white truncate group-hover:text-[#00e5ff] transition-colors">
                        {doc.name}
                      </h3>
                      <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                        <span>助理:</span>
                        <b className="text-slate-200">{doc.assistant.cnName}</b>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        {doc.title}
                      </div>
                    </div>
                  </div>

                  {/* Motto Quote */}
                  <div className="bg-[#070b12] p-2 rounded border-l-2 border-[#ffde00] text-[11px] text-slate-300 italic mb-3 line-clamp-2 min-h-[38px]">
                    {doc.motto}
                  </div>

                  {/* Support units badges */}
                  <div className="mb-3">
                    <span className="text-[10px] text-slate-500 block mb-1">精二助战干员:</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {doc.supportOperators.map((sup, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-[#141f30] text-slate-300 border border-slate-700 rounded text-[10px] flex items-center gap-1"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff]"></span>
                          {sup.operator.cnName} ({sup.skillLevel})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  {/* UID Copy row */}
                  <div className="flex justify-between items-center text-[10px] text-slate-400 bg-[#080d14] px-2 py-1 rounded">
                    <span>UID: <b className="text-slate-200">{doc.uid}</b></span>
                    <button
                      onClick={() => handleCopyUid(doc.uid)}
                      className="text-[#00e5ff] hover:text-white flex items-center gap-1 font-bold"
                    >
                      {copiedUid === doc.uid ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      <span>{copiedUid === doc.uid ? '已复制' : '复制UID'}</span>
                    </button>
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleSanityGift(doc)}
                      className="py-1.5 bg-[#ffde00]/15 hover:bg-[#ffde00]/25 text-[#ffde00] border border-[#ffde00]/40 rounded text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Zap size={12} /> 赠理智顶剂
                    </button>

                    <button
                      onClick={() => {
                        prtsAudio.playClick();
                        onSelectDoctor(doc);
                      }}
                      className="py-1.5 bg-[#00e5ff]/15 hover:bg-[#00e5ff]/25 text-[#00e5ff] border border-[#00e5ff]/40 rounded text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      详细档案
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#0e1624] border border-slate-800 rounded-lg p-12 text-center text-slate-400 text-xs">
            未找到符合筛选条件的在线博士，请尝试调整搜索词或区服。
          </div>
        )}
      </div>
    </div>
  );
};
