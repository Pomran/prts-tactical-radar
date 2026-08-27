import React from 'react';
import { 
  Radio, 
  Zap, 
  Swords, 
  Scroll, 
  Clock, 
  Trash2, 
  ShieldCheck, 
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { TacticalInteraction } from '../types';
import { prtsAudio } from '../utils/audio';

interface CommsLogModalProps {
  logs: TacticalInteraction[];
  onClearLogs: () => void;
}

export const CommsLogModal: React.FC<CommsLogModalProps> = ({ logs, onClearLogs }) => {
  return (
    <div className="w-full flex-1 min-h-0 overflow-y-auto bg-[#080b10] text-slate-200 p-4 md:p-6 font-mono">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#a855f7]/20 text-[#c084fc] border border-[#a855f7]/50 rounded text-xs font-bold">
                TACTICAL COMMS LOG
              </span>
              <h1 className="text-xl font-bold text-white tracking-wide">
                PRTS 神经拟态密话与战术互动日志
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              记录所有雷达信标范围内的理智投递、联合突袭演习演练与线索传递记录。
            </p>
          </div>

          {logs.length > 0 && (
            <button
              onClick={() => {
                prtsAudio.playClick();
                onClearLogs();
              }}
              className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/40 rounded text-xs flex items-center gap-1.5 transition-colors"
            >
              <Trash2 size={13} /> 清空日志
            </button>
          )}
        </div>

        {/* Logs List */}
        {logs.length > 0 ? (
          <div className="space-y-3">
            {logs.map((log) => {
              const timeStr = new Date(log.timestamp).toLocaleTimeString();

              return (
                <div
                  key={log.id}
                  className="bg-[#0e1624] border border-slate-800 hover:border-slate-700 rounded-lg p-3.5 shadow-lg flex items-start gap-3 transition-colors"
                >
                  {/* Type Icon */}
                  <div className="p-2 rounded bg-[#141f30] border border-slate-700 flex-shrink-0 mt-0.5">
                    {log.type === 'SANITY' && <Zap size={16} className="text-[#ffde00]" />}
                    {log.type === 'INVITE' && <Swords size={16} className="text-rose-400" />}
                    {log.type === 'CLUE' && <Scroll size={16} className="text-emerald-400" />}
                    {log.type === 'PING' && <Radio size={16} className="text-[#00e5ff]" />}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 text-xs">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">{log.fromDoctorName}</span>
                        <span className="text-[10px] text-slate-500">({log.fromAssistantName})</span>
                        <ArrowRight size={11} className="text-slate-600" />
                        <span className="text-[#00e5ff] font-bold">目标终端</span>
                      </div>
                      <span className="text-[10px] flex items-center gap-1 text-slate-500">
                        <Clock size={10} /> {timeStr}
                      </span>
                    </div>

                    <p className="text-slate-200 leading-relaxed font-mono bg-[#070b12] p-2 rounded border border-slate-800/80">
                      {log.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#0e1624] border border-slate-800 rounded-lg p-12 text-center text-slate-400 text-xs space-y-2">
            <Radio size={28} className="mx-auto text-slate-600" />
            <p>暂无战术联络记录。在雷达地图上点击附近博士即可投递理智顶剂或发起演习！</p>
          </div>
        )}
      </div>
    </div>
  );
};
