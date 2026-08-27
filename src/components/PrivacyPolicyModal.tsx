import React from 'react';
import { X, Shield } from 'lucide-react';

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0c121b] border border-[#00e5ff]/40 rounded-lg shadow-[0_0_40px_rgba(0,229,255,0.15)] w-full max-w-lg max-h-[80dvh] flex flex-col animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <h2 className="font-mono font-bold text-white flex items-center gap-2">
            <Shield size={16} className="text-[#00e5ff]" />
            隐私政策
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="关闭"
          >
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto p-4 text-xs text-slate-300 font-mono leading-relaxed space-y-3">
          <section>
            <h3 className="text-[#00e5ff] font-bold mb-1">1. 我们收集哪些数据</h3>
            <p>本应用为「博士在线雷达」社区项目。使用过程中会收集以下信息：</p>
            <ul className="list-disc pl-4 mt-1 space-y-1">
              <li><b>位置信息</b>：你的经纬度坐标（用于显示在雷达上，让附近博士看到你）</li>
              <li><b>逆地理编码地址</b>：通过坐标转换的街道/城市文本（仅用于显示定位名称）</li>
              <li><b>干员档案</b>：你选择的干员形象、昵称、等级、理智值等（用于雷达展示）</li>
              <li><b>设备标识</b>：本地生成的匿名设备 ID（用于身份识别，不含设备真实信息）</li>
              <li><b>IP 地址</b>：仅在定位失败时用于粗略的 IP 定位（通过 Cloudflare 边缘节点）</li>
            </ul>
          </section>

          <section>
            <h3 className="text-[#00e5ff] font-bold mb-1">2. 数据如何存储</h3>
            <ul className="list-disc pl-4 space-y-1">
              <li>位置和档案数据存储在 Cloudflare KV（全球分布式键值存储）</li>
              <li>数据有有效期（TTL），超过 10 分钟未活动将自动过期删除</li>
              <li>你的浏览器本地会保存设置（localStorage），仅存储在你自己设备上</li>
            </ul>
          </section>

          <section>
            <h3 className="text-[#00e5ff] font-bold mb-1">3. 迷彩与隐私保护</h3>
            <p>应用内置「战术迷彩」功能：开启后你的实际坐标会随机偏移（默认 ±300m），雷达上显示的是模糊位置而非真实位置。建议开启迷彩保护个人隐私。你的真实坐标在迷彩开启时不会被广播。</p>
          </section>

          <section>
            <h3 className="text-[#00e5ff] font-bold mb-1">4. 数据分享与第三方</h3>
            <ul className="list-disc pl-4 space-y-1">
              <li>雷达数据对其他在线用户可见（这是雷达的核心功能）</li>
              <li>使用高德地图(AMap) JS API 与 WebService 进行地图渲染和逆地理编码</li>
              <li>不使用任何广告 SDK，不向任何第三方出售数据</li>
            </ul>
          </section>

          <section>
            <h3 className="text-[#00e5ff] font-bold mb-1">5. 你的权利</h3>
            <p>你可以随时关闭页面停止广播位置；刷新或离线后数据将在 TTL 到期后自动删除。若需立即删除你的数据，关闭浏览器即可，数据不会持久保留。</p>
          </section>

          <section>
            <h3 className="text-[#00e5ff] font-bold mb-1">6. 声明</h3>
            <p>本项目为非商业同人项目，与《明日方舟》官方（Hypergraph / Yostar）无关。数据存储基于 Cloudflare 免费层，请勿依赖其作为生产数据保障。使用即视为同意本政策。</p>
          </section>
        </div>
      </div>
    </div>
  );
};
