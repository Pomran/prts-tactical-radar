export type LinkCategory = 'ALL' | 'DATA_DROPS' | 'WIKI_GUIDE' | 'TOOLS_ASSISTANT' | 'NEWS_RADAR' | 'COMMUNITY';

export interface FriendLink {
  id: string;
  name: string;
  category: LinkCategory;
  categoryLabel: string;
  tags: string[];
  description: string;
  url: string;
  mirrorUrl?: string;
  githubUrl?: string;
  iconUrl: string;
  themeColor: string;
  badge?: string;
  recommended?: boolean;
}

export const LINK_CATEGORIES: { key: LinkCategory; label: string; icon: string }[] = [
  { key: 'ALL', label: '全部站点', icon: 'Layers' },
  { key: 'DATA_DROPS', label: '数据与掉率', icon: 'BarChart3' },
  { key: 'WIKI_GUIDE', label: '百科与攻略', icon: 'BookOpen' },
  { key: 'TOOLS_ASSISTANT', label: '效率与辅助', icon: 'Wrench' },
  { key: 'NEWS_RADAR', label: '资讯与情报', icon: 'Radio' },
  { key: 'COMMUNITY', label: '社区与生态', icon: 'Globe' }
];

export const FRIEND_LINKS: FriendLink[] = [
  // 1. 企鹅物流数据统计
  {
    id: 'penguin-stats',
    name: '企鹅物流数据统计',
    category: 'DATA_DROPS',
    categoryLabel: '数据与掉率',
    tags: ['掉率统计', '材料掉落', '全球数据'],
    description: '全社区公认的明日方舟掉落物数据收集与掉率统计平台，提供全球各服务器掉落率基准。',
    url: 'https://penguin-stats.cn',
    mirrorUrl: 'https://penguin-stats.io',
    iconUrl: 'https://penguin-stats.cn/favicon.ico',
    themeColor: '#0284c7',
    badge: '官方互链',
    recommended: true
  },
  // 2. 明日方舟一图流
  {
    id: 'yituliu',
    name: '明日方舟一图流',
    category: 'DATA_DROPS',
    categoryLabel: '数据与掉率',
    tags: ['材料规划', '性价比计算', '攒抽规划'],
    description: '关卡掉落性价比量化计算、商店兑换优先度分析、礼包价值评定与干员养成规划工具。',
    url: 'https://ark.yituliu.cn',
    iconUrl: 'https://ark.yituliu.cn/favicon.ico',
    themeColor: '#059669',
    badge: '核心推荐',
    recommended: true
  },
  // 3. PRTS.WIKI
  {
    id: 'prts-wiki',
    name: 'PRTS.WIKI',
    category: 'WIKI_GUIDE',
    categoryLabel: '百科与攻略',
    tags: ['专业百科', '全剧情档案', '干员数据'],
    description: '泰拉大陆最详尽的数据百科，全干员语音立绘、敌方抗性数值、活动机制与全剧情文字录。',
    url: 'https://prts.wiki',
    iconUrl: 'https://prts.wiki/favicon.ico',
    themeColor: '#0f172a',
    badge: '权威百科',
    recommended: true
  },
  // 4. 明日方舟BWIKI
  {
    id: 'bwiki',
    name: '明日方舟BWIKI',
    category: 'WIKI_GUIDE',
    categoryLabel: '百科与攻略',
    tags: ['B站官方合作', '新手教程', '干员测评'],
    description: '哔哩哔哩游戏中心明日方舟官方合作攻略站，聚合海量视频作业、干员图鉴及保姆级过关攻略。',
    url: 'https://wiki.biligame.com/arknights',
    iconUrl: 'https://www.bilibili.com/favicon.ico',
    themeColor: '#00aeec',
    recommended: true
  },
  // 5. MAA (MaaAssistantArknights)
  {
    id: 'maa',
    name: 'MAA (明日方舟小助手)',
    category: 'TOOLS_ASSISTANT',
    categoryLabel: '效率与辅助',
    tags: ['全自动刷图', '基建换班', '自动肉鸽'],
    description: '图像识别驱动的现代化小助手。支持一键全自动刷理智、智能基建排班、肉鸽全自动探索及生息演算。',
    url: 'https://maa.plus',
    githubUrl: 'https://github.com/MaaAssistantArknights/MaaAssistantArknights',
    iconUrl: 'https://maa.plus/favicon.ico',
    themeColor: '#10b981',
    badge: '开源神兵',
    recommended: true
  },
  // 6. PRTS.Map
  {
    id: 'prts-map',
    name: 'PRTS.Map (关卡地图规划)',
    category: 'TOOLS_ASSISTANT',
    categoryLabel: '效率与辅助',
    tags: ['地图模拟', '出怪波次', '射程演算'],
    description: '高度还原关卡地图的战术部署模拟器，支持干员高低台部署、射程覆盖测算与敌人移动路线演算。',
    url: 'https://prts.maa.plus',
    iconUrl: 'https://prts.maa.plus/favicon.ico',
    themeColor: '#3b82f6',
    recommended: true
  },
  // 7. 小刻食堂
  {
    id: 'ceobe-canteen',
    name: '小刻食堂 (Ceobe Canteen)',
    category: 'NEWS_RADAR',
    categoryLabel: '资讯与情报',
    tags: ['蹲饼必备', '全网情报源', '即时推送'],
    description: '专注于明日方舟官方多平台动态实时推送与蹲饼工具，监控鹰角全网30+官方发布源。',
    url: 'https://ceobecanteen.top',
    githubUrl: 'https://github.com/Ceobe/ceobe.github.io',
    iconUrl: 'https://ceobecanteen.top/favicon.ico',
    themeColor: '#f97316',
    badge: '蹲饼神器',
    recommended: true
  },
  // 8. tomimi.dev
  {
    id: 'tomimi-dev',
    name: 'tomimi.dev (集成战略小帮手)',
    category: 'WIKI_GUIDE',
    categoryLabel: '百科与攻略',
    tags: ['集成战略', '肉鸽图鉴', '事件藏品'],
    description: '专为集成战略（肉鸽）设计的藏品图鉴、分队策略、密境事件分支与遗物效果速查指南。',
    url: 'https://tomimi.dev',
    iconUrl: 'https://tomimi.dev/favicon.ico',
    themeColor: '#14b8a6'
  },
  // 9. DPS计算器
  {
    id: 'dps-calc',
    name: 'DPS计算器',
    category: 'DATA_DROPS',
    categoryLabel: '数据与掉率',
    tags: ['伤害测算', '护甲穿透', '技能周期'],
    description: '干员单体与群体输出期望伤害测算、敌方护甲抗性穿透曲线对齐及拐力收益对比。',
    url: 'https://prts.wiki/w/DPS%E6%A6%82%E5%BF%B5',
    iconUrl: 'https://prts.wiki/favicon.ico',
    themeColor: '#ef4444'
  },
  // 10. 罗德岛助理
  {
    id: 'rhodes-assistant',
    name: '罗德岛助理 (App)',
    category: 'TOOLS_ASSISTANT',
    categoryLabel: '效率与辅助',
    tags: ['移动App', '理智提醒', '公招识别'],
    description: '移动端随身助理应用，支持理智溢出倒计时通知、公招截图识别与干员满练度材料一键清单。',
    url: 'https://apps.apple.com/cn/app/id1494951478',
    iconUrl: 'https://apps.apple.com/favicon.ico',
    themeColor: '#06b6d4'
  },
  // 11. 寻访记录分析
  {
    id: 'ark-gacha',
    name: '寻访记录分析',
    category: 'DATA_DROPS',
    categoryLabel: '数据与掉率',
    tags: ['抽卡统计', '欧非验证', '卡池分布'],
    description: '游戏内寻访记录抓取与抽卡概率分析，支持全卡池六星平均抽数、保底分布图表与欧气曲线。',
    url: 'https://arkgacha.kwer.top',
    iconUrl: 'https://arkgacha.kwer.top/favicon.ico',
    themeColor: '#eab308'
  },
  // 12. 阿米娅BOT
  {
    id: 'amiya-bot',
    name: '阿米娅BOT (Amiya-Bot)',
    category: 'COMMUNITY',
    categoryLabel: '社区与生态',
    tags: ['QQ机器人', '社群助手', '开源生态'],
    description: '基于 Python 开发的高拓展性明日方舟群聊机器人，支持干员百科、抽卡模拟与战术娱乐互动。',
    url: 'https://github.com/AmiyaBot/Amiya-Bot',
    githubUrl: 'https://github.com/AmiyaBot/Amiya-Bot',
    iconUrl: 'https://github.com/favicon.ico',
    themeColor: '#6366f1'
  },
  // 13. Mirror酱
  {
    id: 'mirror-chyan',
    name: 'Mirror酱',
    category: 'TOOLS_ASSISTANT',
    categoryLabel: '效率与辅助',
    tags: ['高速下载', '开源分发', '镜像加速'],
    description: '专注于明日方舟相关开源辅助工具（MAA等）的高速分发通道、自动更新与国内镜像加速平台。',
    url: 'https://mirrorchyan.com',
    iconUrl: 'https://mirrorchyan.com/favicon.ico',
    themeColor: '#d946ef'
  },
  // 14. Bilibili游戏中心
  {
    id: 'bilibili-arknights',
    name: 'Bilibili游戏中心 明日方舟专区',
    category: 'COMMUNITY',
    categoryLabel: '社区与生态',
    tags: ['官方活动', '同人创作', '前瞻直播'],
    description: '官方合作大型社区，版本前瞻特辑直播预告、官方创作者激励活动与同人二创交流基地。',
    url: 'https://game.bilibili.com/platform/arknights',
    iconUrl: 'https://www.bilibili.com/favicon.ico',
    themeColor: '#fb7299'
  }
];
