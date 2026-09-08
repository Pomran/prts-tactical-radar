import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  ExternalLink, 
  Search, 
  Globe, 
  Copy, 
  Check, 
  Github, 
  Layers, 
  BarChart3, 
  BookOpen, 
  Wrench, 
  Radio, 
  Sparkles,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { FRIEND_LINKS, LINK_CATEGORIES, LinkCategory, FriendLink } from '../data/friendLinks';
import { prtsAudio } from '../utils/audio';

interface FriendLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FriendLinksModal: React.FC<FriendLinksModalProps> = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<LinkCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = (link: FriendLink, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(link.url);
    prtsAudio.playClick();
    setCopiedId(link.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleImageError = (id: string) => {
    setImgErrors(prev => ({ ...prev, [id]: true }));
  };

  const filteredLinks = FRIEND_LINKS.filter(link => {
    const matchesCategory = selectedCategory === 'ALL' || link.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || 
      link.name.toLowerCase().includes(query) ||
      link.description.toLowerCase().includes(query) ||
      link.tags.some(t => t.toLowerCase().includes(query)) ||
      link.url.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (key: LinkCategory) => {
    switch (key) {
      case 'DATA_DROPS': return <BarChart3 size={13} className="mr-1" />;
      case 'WIKI_GUIDE': return <BookOpen size={13} className="mr-1" />;
      case 'TOOLS_ASSISTANT': return <Wrench size={13} className="mr-1" />;
      case 'NEWS_RADAR': return <Radio size={13} className="mr-1" />;
      case 'COMMUNITY': return <Globe size={13} className="mr-1" />;
      default: return <Layers size={13} className="mr-1" />;
    }
  };

  return createPortal(
    <div 
      id="friend-links-modal-overlay"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        id="friend-links-modal-container"
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#0b1320] border border-cyan-500/40 rounded-xl shadow-[0_0_40px_rgba(6,182,212,0.25)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Scanning Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800/90 bg-[#070e18]/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <Globe size={18} className="animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-widest uppercase font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                  PRTS NEURAL LINK // EXT-HUB
                </span>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                  PROTOCOL 0x7F · 泰拉生态友情链接
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                明日方舟生态导航与友情链接
                <span className="text-xs font-normal text-slate-400 font-mono">
                  ({FRIEND_LINKS.length} 站点收录)
                </span>
              </h2>
            </div>
          </div>

          <button
            id="friend-links-modal-close-btn"
            type="button"
            onClick={() => {
              prtsAudio.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent hover:border-slate-700 transition-colors"
            title="关闭窗口 (ESC)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 sm:px-6 pb-2 bg-[#09111c]/90 border-b border-slate-800/80 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/70" />
              <input
                id="friend-links-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索站点名称 / 关键词 / 标签 / 域名 (例如: 掉率, MAA, 剧情, 抽卡, prts...)"
                className="w-full bg-[#050b13] border border-slate-700/80 rounded-lg pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
            {LINK_CATEGORIES.map((cat) => {
              const count = cat.key === 'ALL' 
                ? FRIEND_LINKS.length 
                : FRIEND_LINKS.filter(l => l.category === cat.key).length;
              const isSelected = selectedCategory === cat.key;
              return (
                <button
                  id={`friend-links-cat-${cat.key}`}
                  type="button"
                  key={cat.key}
                  onClick={() => {
                    prtsAudio.playClick();
                    setSelectedCategory(cat.key);
                  }}
                  className={`flex items-center px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all font-medium ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-900/80 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-700/60'
                  }`}
                >
                  {getCategoryIcon(cat.key)}
                  <span>{cat.label}</span>
                  <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected ? 'bg-slate-950/25 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Links Grid List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#080d16] space-y-4 max-h-[62vh]">
          {filteredLinks.length === 0 ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center">
              <Search size={36} className="text-slate-600 mb-3 animate-bounce" />
              <p className="text-sm font-medium text-slate-300">未检索到匹配的明日方舟站点</p>
              <p className="text-xs text-slate-500 mt-1 font-mono">请尝试搜索其他关键字或清空筛选条件</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
                className="mt-4 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-xs border border-slate-700"
              >
                重置筛选条件
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredLinks.map((link) => {
                const isCopied = copiedId === link.id;
                const hasImgError = imgErrors[link.id];

                return (
                  <div
                    id={`friend-link-card-${link.id}`}
                    key={link.id}
                    className="group relative flex flex-col justify-between bg-[#0e1726]/80 hover:bg-[#121d30] border border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 transition-all duration-200 hover:shadow-[0_4px_20px_rgba(6,182,212,0.12)] hover:-translate-y-0.5"
                  >
                    {/* Top Row: Icon + Name + Badge */}
                    <div>
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Site Icon with Fallback */}
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-slate-700/80 overflow-hidden shadow-inner"
                            style={{ backgroundColor: `${link.themeColor}15` }}
                          >
                            {!hasImgError ? (
                              <img
                                src={link.iconUrl}
                                alt={link.name}
                                onError={() => handleImageError(link.id)}
                                className="w-6 h-6 object-contain"
                                loading="lazy"
                              />
                            ) : (
                              <span 
                                className="font-bold text-sm font-mono"
                                style={{ color: link.themeColor }}
                              >
                                {link.name.slice(0, 1)}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors truncate flex items-center gap-1.5">
                              {link.name}
                            </h3>
                            <div className="text-[11px] font-mono text-slate-400 truncate opacity-80 group-hover:opacity-100 transition-opacity">
                              {new URL(link.url).hostname}
                            </div>
                          </div>
                        </div>

                        {link.badge && (
                          <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                            {link.badge}
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {link.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900/90 text-slate-300 border border-slate-800"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                        {link.description}
                      </p>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {/* Copy Link Button */}
                        <button
                          type="button"
                          onClick={(e) => handleCopy(link, e)}
                          title="复制站点链接"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-colors"
                        >
                          {isCopied ? (
                            <Check size={14} className="text-emerald-400" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>

                        {/* GitHub Source Link if exists */}
                        {link.githubUrl && (
                          <a
                            href={link.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="查看 GitHub 开源仓库"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-colors"
                          >
                            <Github size={14} />
                          </a>
                        )}

                        {/* Mirror URL if exists */}
                        {link.mirrorUrl && (
                          <a
                            href={link.mirrorUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="全球/备用镜像"
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                          >
                            镜像
                          </a>
                        )}
                      </div>

                      {/* Direct Visit Primary Button */}
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/40 hover:border-cyan-400 transition-all shadow-[0_0_10px_rgba(6,182,212,0.15)] group-hover:shadow-[0_0_14px_rgba(6,182,212,0.3)]"
                      >
                        <span>访问站点</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer Statement & Friendship Exchange */}
        <div className="px-4 sm:px-6 py-3 bg-[#060b13] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Share2 size={13} className="text-cyan-400 shrink-0" />
            <span>
              欢迎明日方舟同好站、数据工具与开源作者互换友情链接，共同繁荣泰拉战术生态。
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[11px] font-mono text-slate-500">
              PRTS RADAR LINKWAY
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
