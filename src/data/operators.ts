import { Operator, PromptTemplate } from '../types';

// Helper to create themed SVG chibi avatars with rich silhouettes, eyes, hair, ears, horns, halos and accessories
export const createOperatorAvatarSVG = (
  themeColor: string,
  hairColor: string,
  eyeColor: string,
  features: 
    | 'BUNNY_EARS' 
    | 'WOLF_EARS' 
    | 'LEOPARD_EARS' 
    | 'CAT_EARS'
    | 'DEVIL_HORNS' 
    | 'SHEEP_HORNS' 
    | 'CRYSTAL_SPINE' 
    | 'DRAGON_HORNS' 
    | 'PEGASUS_EARS'
    | 'ELF_EARS'
    | 'FOX_EARS'
    | 'BIRD_WINGS'
    | 'STAG_HORNS'
    | 'CROWN'
    | 'SARKAZ_GHOST'
    | 'BANSHEE_CROWN',
  accessory: string = ''
): string => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#192333"/>
      <stop offset="100%" stop-color="#0a101d"/>
    </radialGradient>
    <filter id="glow" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="1" stdDeviation="3" flood-color="${themeColor}" flood-opacity="0.7"/>
    </filter>
  </defs>

  <!-- Outer Ring with glowing accent -->
  <circle cx="50" cy="50" r="48" fill="url(#bgGrad)" stroke="${themeColor}" stroke-width="2.5" filter="url(#glow)"/>
  <circle cx="50" cy="50" r="44" fill="none" stroke="${themeColor}" stroke-dasharray="4,2.5" stroke-width="0.8" opacity="0.5"/>

  <!-- Features (Ears/Horns/Wings) behind hair -->
  ${
    features === 'BUNNY_EARS'
      ? `<path d="M 32 30 C 26 8 32 1 38 9 C 42 15 38 32 36 35 Z" fill="#33221a" stroke="#111" stroke-width="1.5"/>
         <path d="M 34 26 C 30 11 34 5 37 11 C 39 15 37 28 35 30 Z" fill="#f43f5e" opacity="0.6"/>
         <path d="M 68 30 C 74 8 68 1 62 9 C 58 15 62 32 64 35 Z" fill="#33221a" stroke="#111" stroke-width="1.5"/>
         <path d="M 66 26 C 70 11 66 5 63 11 C 61 15 63 28 65 30 Z" fill="#f43f5e" opacity="0.6"/>`
      : features === 'WOLF_EARS'
      ? `<polygon points="25,38 18,14 38,25" fill="#334155" stroke="#0f172a" stroke-width="1.5"/>
         <polygon points="27,34 22,18 35,26" fill="#f87171" opacity="0.5"/>
         <polygon points="75,38 82,14 62,25" fill="#334155" stroke="#0f172a" stroke-width="1.5"/>
         <polygon points="73,34 78,18 65,26" fill="#f87171" opacity="0.5"/>`
      : features === 'LEOPARD_EARS' || features === 'CAT_EARS'
      ? `<circle cx="27" cy="22" r="9" fill="${hairColor}" stroke="#1e293b" stroke-width="1.5"/>
         <circle cx="27" cy="22" r="5" fill="#f43f5e" opacity="0.45"/>
         <circle cx="73" cy="22" r="9" fill="${hairColor}" stroke="#1e293b" stroke-width="1.5"/>
         <circle cx="73" cy="22" r="5" fill="#f43f5e" opacity="0.45"/>`
      : features === 'DEVIL_HORNS'
      ? `<path d="M 28 32 C 15 20 20 5 18 3 C 28 9 34 23 34 32 Z" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.5"/>
         <path d="M 72 32 C 85 20 80 5 82 3 C 72 9 66 23 66 32 Z" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.5"/>`
      : features === 'SHEEP_HORNS'
      ? `<path d="M 26 34 C 12 24 10 40 22 45 C 30 47 32 38 26 34 Z" fill="#d97706" stroke="#78350f" stroke-width="1.5"/>
         <path d="M 74 34 C 88 24 90 40 78 45 C 70 47 68 38 74 34 Z" fill="#d97706" stroke="#78350f" stroke-width="1.5"/>`
      : features === 'CRYSTAL_SPINE'
      ? `<polygon points="50,2 43,20 57,20" fill="#10b981" stroke="#047857" stroke-width="1.5"/>
         <polygon points="36,10 32,25 44,23" fill="#059669" opacity="0.85"/>
         <polygon points="64,10 68,25 56,23" fill="#059669" opacity="0.85"/>`
      : features === 'DRAGON_HORNS'
      ? `<path d="M 30 28 C 16 14 24 2 20 1 C 32 8 36 21 36 28 Z" fill="${themeColor}" stroke="#0369a1" stroke-width="1.5"/>
         <path d="M 70 28 C 84 14 76 2 80 1 C 68 8 64 21 64 28 Z" fill="${themeColor}" stroke="#0369a1" stroke-width="1.5"/>`
      : features === 'PEGASUS_EARS'
      ? `<path d="M 28 32 C 20 12 28 4 36 14 C 38 20 36 30 34 33 Z" fill="#facc15" stroke="#a16207" stroke-width="1.5"/>
         <path d="M 72 32 C 80 12 72 4 64 14 C 62 20 64 30 66 33 Z" fill="#facc15" stroke="#a16207" stroke-width="1.5"/>`
      : features === 'FOX_EARS'
      ? `<polygon points="26,38 16,10 40,24" fill="#fbbf24" stroke="#d97706" stroke-width="1.5"/>
         <polygon points="28,33 20,16 36,25" fill="#ffffff" opacity="0.8"/>
         <polygon points="74,38 84,10 60,24" fill="#fbbf24" stroke="#d97706" stroke-width="1.5"/>
         <polygon points="72,33 80,16 64,25" fill="#ffffff" opacity="0.8"/>`
      : features === 'ELF_EARS'
      ? `<path d="M 24 45 C 8 40 4 34 10 32 C 18 30 24 40 26 44 Z" fill="#fed7aa" stroke="#fb923c" stroke-width="1.2"/>
         <path d="M 76 45 C 92 40 96 34 90 32 C 82 30 76 40 74 44 Z" fill="#fed7aa" stroke="#fb923c" stroke-width="1.2"/>`
      : features === 'BIRD_WINGS'
      ? `<path d="M 24 32 C 12 20 16 10 24 16 C 28 20 28 28 26 32 Z" fill="#f87171" stroke="#dc2626" stroke-width="1.2"/>
         <path d="M 76 32 C 88 20 84 10 76 16 C 72 20 72 28 74 32 Z" fill="#f87171" stroke="#dc2626" stroke-width="1.2"/>`
      : features === 'STAG_HORNS'
      ? `<path d="M 32 30 C 18 18 16 6 12 4 C 18 10 24 14 26 8 C 28 14 34 22 34 30 Z" fill="#60a5fa" stroke="#1d4ed8" stroke-width="1.5"/>
         <path d="M 68 30 C 82 18 84 6 88 4 C 82 10 76 14 74 8 C 72 14 66 22 66 30 Z" fill="#60a5fa" stroke="#1d4ed8" stroke-width="1.5"/>`
      : features === 'SARKAZ_GHOST'
      ? `<path d="M 28 32 C 14 18 18 4 16 2 C 26 8 32 20 32 30 Z" fill="#f43f5e" stroke="#881337" stroke-width="1.5"/>
         <path d="M 72 32 C 86 18 82 4 84 2 C 74 8 68 20 68 30 Z" fill="#f43f5e" stroke="#881337" stroke-width="1.5"/>
         <circle cx="82" cy="18" r="4" fill="#f43f5e" opacity="0.6" filter="url(#glow)"/>`
      : features === 'BANSHEE_CROWN'
      ? `<path d="M 30 26 C 22 10 28 2 24 1 C 32 6 36 18 36 26 Z" fill="#94a3b8" stroke="#475569" stroke-width="1.5"/>
         <path d="M 70 26 C 78 10 72 2 76 1 C 68 6 64 18 64 26 Z" fill="#94a3b8" stroke="#475569" stroke-width="1.5"/>
         <polygon points="50,6 44,18 56,18" fill="#e2e8f0" stroke="#64748b" stroke-width="1"/>`
      : ''
  }

  <!-- Back Hair Shape -->
  <path d="M 22 44 C 18 68 26 83 50 83 C 74 83 82 68 78 44 C 78 24 68 17 50 17 C 32 17 22 24 22 44 Z" fill="${hairColor}" />

  <!-- Chibi Face Base -->
  <ellipse cx="50" cy="53" rx="26" ry="24" fill="#ffe4d6" />
  
  <!-- Soft Blushing Cheeks -->
  <ellipse cx="33" cy="58" rx="4" ry="2.2" fill="#fda4af" opacity="0.7"/>
  <ellipse cx="67" cy="58" rx="4" ry="2.2" fill="#fda4af" opacity="0.7"/>

  <!-- Big Chibi Sparkling Eyes -->
  <g>
    <!-- Left Eye -->
    <ellipse cx="38" cy="52" rx="5.6" ry="7" fill="${eyeColor}" />
    <circle cx="36" cy="49" r="2.3" fill="#ffffff" />
    <circle cx="39.5" cy="55" r="1.3" fill="#ffffff" />
    <path d="M 32 44 Q 38 41 44 45" stroke="#1e293b" stroke-width="2" fill="none" stroke-linecap="round"/>
    
    <!-- Right Eye -->
    <ellipse cx="62" cy="52" rx="5.6" ry="7" fill="${eyeColor}" />
    <circle cx="60" cy="49" r="2.3" fill="#ffffff" />
    <circle cx="63.5" cy="55" r="1.3" fill="#ffffff" />
    <path d="M 56 45 Q 62 41 68 44" stroke="#1e293b" stroke-width="2" fill="none" stroke-linecap="round"/>
  </g>

  <!-- Cute Expressive Mouth -->
  <path d="M 47 62 Q 50 65 53 62" stroke="#e11d48" stroke-width="1.6" fill="none" stroke-linecap="round"/>

  <!-- Front Hair Bangs Layer -->
  <path d="M 23 38 C 30 46 40 39 44 48 C 48 41 56 46 62 44 C 68 41 74 48 77 38 C 77 23 64 19 50 19 C 36 19 23 23 23 38 Z" fill="${hairColor}" />

  <!-- Tactical Rhodes / Faction Collar & Outfit -->
  <path d="M 32 74 C 36 70 64 70 68 74 L 72 90 C 60 94 40 94 28 90 Z" fill="#1e293b" stroke="${themeColor}" stroke-width="1.5"/>
  <polygon points="50,72 46,80 54,80" fill="${themeColor}" />

  <!-- Distinct Accessories -->
  ${
    accessory === 'GLASSES'
      ? `<rect x="30" y="47" width="16" height="11" rx="2" fill="none" stroke="#e2e8f0" stroke-width="1.6"/>
         <rect x="54" y="47" width="16" height="11" rx="2" fill="none" stroke="#e2e8f0" stroke-width="1.6"/>
         <line x1="46" y1="52" x2="54" y2="52" stroke="#e2e8f0" stroke-width="1.6"/>`
      : accessory === 'HEADPHONE'
      ? `<rect x="19" y="45" width="6" height="14" rx="2" fill="${themeColor}"/>
         <rect x="75" y="45" width="6" height="14" rx="2" fill="${themeColor}"/>
         <path d="M 22 45 C 22 26 78 26 78 45" fill="none" stroke="${themeColor}" stroke-width="2.2"/>`
      : accessory === 'HALO'
      ? `<ellipse cx="50" cy="11" rx="17" ry="4" fill="none" stroke="#facc15" stroke-width="2.2" filter="url(#glow)"/>`
      : accessory === 'DARK_HALO'
      ? `<ellipse cx="50" cy="11" rx="17" ry="4.5" fill="none" stroke="#a855f7" stroke-width="2.2" stroke-dasharray="6,3" filter="url(#glow)"/>`
      : accessory === 'NUN_HAT'
      ? `<path d="M 22 28 C 30 14 70 14 78 28 L 84 56 C 80 44 80 32 74 30 L 26 30 C 20 32 20 44 16 56 Z" fill="#0f172a" stroke="#38bdf8" stroke-width="1.2"/>
         <rect x="32" y="28" width="36" height="5" fill="#f8fafc"/>`
      : accessory === 'WATER_DROP'
      ? `<circle cx="28" cy="18" r="4.5" fill="#2dd4bf" opacity="0.85" filter="url(#glow)"/>
         <circle cx="72" cy="16" r="3.5" fill="#2dd4bf" opacity="0.85" filter="url(#glow)"/>`
      : accessory === 'SPARK'
      ? `<polygon points="26,16 28,10 34,14 28,18" fill="#f43f5e" filter="url(#glow)"/>
         <polygon points="74,16 72,10 66,14 72,18" fill="#f43f5e" filter="url(#glow)"/>`
      : accessory === 'WHEAT'
      ? `<ellipse cx="50" cy="11" rx="18" ry="4" fill="none" stroke="#84cc16" stroke-width="2" stroke-dasharray="3,3" filter="url(#glow)"/>`
      : accessory === 'SUN_CROWN'
      ? `<polygon points="50,4 46,14 54,14" fill="#facc15" filter="url(#glow)"/>
         <polygon points="38,8 38,16 46,14" fill="#eab308"/>
         <polygon points="62,8 62,16 54,14" fill="#eab308"/>`
      : accessory === 'BERET'
      ? `<ellipse cx="48" cy="20" rx="26" ry="9" fill="#1e293b" stroke="#e11d48" stroke-width="1.2"/>
         <circle cx="48" cy="14" r="2.5" fill="#e11d48"/>`
      : ''
  }

  <!-- PRTS 6★ Tactical Badge in corner -->
  <rect x="69" y="71" width="23" height="21" rx="3" fill="#0b1320" stroke="${themeColor}" stroke-width="1.2"/>
  <text x="80.5" y="85" font-family="monospace" font-size="9" fill="${themeColor}" text-anchor="middle" font-weight="bold">6★</text>
</svg>
`)}`;
};

export const OPERATOR_DATABASE: Operator[] = [
  // 1. 阿米娅
  {
    id: 'amiya',
    name: 'Amiya',
    cnName: '阿米娅',
    rarity: 6,
    classType: 'Caster',
    faction: 'Rhodes Island',
    color: '#00e5ff',
    avatar: createOperatorAvatarSVG('#00e5ff', '#451a03', '#38bdf8', 'BUNNY_EARS'),
    quote: '博士，工作辛苦了！无论发生什么，我都会一直在您身边。',
    masterySkill: '奇迹之吻 (专三)',
    moduleLevel: 3
  },
  // 2. 凯尔希
  {
    id: 'kaltsit',
    name: "Kal'tsit",
    cnName: '凯尔希',
    rarity: 6,
    classType: 'Medic',
    faction: 'Rhodes Island',
    color: '#10b981',
    avatar: createOperatorAvatarSVG('#10b981', '#cbd5e1', '#059669', 'CRYSTAL_SPINE', 'HEADPHONE'),
    quote: 'Mon3tr 已经就绪。博士，希望你的战术判断依然值得信任。',
    masterySkill: '指令：熔毁 (专三)',
    moduleLevel: 3
  },
  // 3. 维什戴尔 (异格W)
  {
    id: 'wisadel',
    name: "Wis'adel",
    cnName: '维什戴尔',
    rarity: 6,
    classType: 'Sniper',
    faction: 'Sarkaz',
    color: '#f43f5e',
    avatar: createOperatorAvatarSVG('#f43f5e', '#ffffff', '#e11d48', 'SARKAZ_GHOST', 'SPARK'),
    quote: '别眨眼哦！让烟火与灵魂，在这片大地上尽情绽放吧！',
    masterySkill: '“就你叫神啊？” (专三)',
    moduleLevel: 3
  },
  // 4. 洛戈斯 (Logos)
  {
    id: 'logos',
    name: 'Logos',
    cnName: '洛戈斯',
    rarity: 6,
    classType: 'Caster',
    faction: 'Sarkaz',
    color: '#94a3b8',
    avatar: createOperatorAvatarSVG('#94a3b8', '#e2e8f0', '#0ea5e9', 'BANSHEE_CROWN'),
    quote: '以咒术为律，言灵所及之处，一切毁灭与创生皆被铭刻。',
    masterySkill: '除尽尘埃 (专三)',
    moduleLevel: 3
  },
  // 5. 玛恩纳 (Młynar)
  {
    id: 'mlynar',
    name: 'Młynar',
    cnName: '玛恩纳',
    rarity: 6,
    classType: 'Guard',
    faction: 'Kazimierz',
    color: '#eab308',
    avatar: createOperatorAvatarSVG('#eab308', '#fef08a', '#854d0e', 'PEGASUS_EARS', 'GLASSES'),
    quote: '……今日份的报纸还没看完。如果不是必要的工作，请不要打扰我。',
    masterySkill: '未照耀的荣光 (专三)',
    moduleLevel: 3
  },
  // 6. 耀骑士临光
  {
    id: 'nearl_radiant',
    name: 'Nearl the Radiant Knight',
    cnName: '耀骑士临光',
    rarity: 6,
    classType: 'Guard',
    faction: 'Kazimierz',
    color: '#fbbf24',
    avatar: createOperatorAvatarSVG('#fbbf24', '#fef08a', '#d97706', 'PEGASUS_EARS', 'HALO'),
    quote: '长夜终尽，天光已至！我的光芒与长枪，将为博士劈开前路！',
    masterySkill: '逐夜烁光 (专三)',
    moduleLevel: 3
  },
  // 7. 能天使 (Exusiai)
  {
    id: 'exusiai',
    name: 'Exusiai',
    cnName: '能天使',
    rarity: 6,
    classType: 'Sniper',
    faction: 'Penguin Logistics',
    color: '#f59e0b',
    avatar: createOperatorAvatarSVG('#f59e0b', '#ea580c', '#38bdf8', 'CAT_EARS', 'HALO'),
    quote: '老板！今天任务完成后，一定要请我吃最新鲜的苹果派哦！过载模式，开火！',
    masterySkill: '过载模式 (专三)',
    moduleLevel: 3
  },
  // 8. 缄默德克萨斯 (Texas Alter)
  {
    id: 'texas_omertosa',
    name: 'Texas the Omertosa',
    cnName: '缄默德克萨斯',
    rarity: 6,
    classType: 'Specialist',
    faction: 'Penguin Logistics',
    color: '#ef4444',
    avatar: createOperatorAvatarSVG('#ef4444', '#1e293b', '#dc2626', 'WOLF_EARS'),
    quote: '剑雨已经落下。企鹅物流，准时送达，不留后患。',
    masterySkill: '剑雨交加 (专三)',
    moduleLevel: 3
  },
  // 9. 拉普兰德 (Lappland)
  {
    id: 'lappland',
    name: 'Lappland',
    cnName: '拉普兰德',
    rarity: 6,
    classType: 'Guard',
    faction: 'Siracusa',
    color: '#a855f7',
    avatar: createOperatorAvatarSVG('#a855f7', '#f1f5f9', '#9333ea', 'WOLF_EARS'),
    quote: '哈哈……太有趣了！德克萨斯那家伙，也在雷达附近吗？',
    masterySkill: '狼魂 (专三)',
    moduleLevel: 3
  },
  // 10. 史尔特尔 (Surtr)
  {
    id: 'surtr',
    name: 'Surtr',
    cnName: '史尔特尔',
    rarity: 6,
    classType: 'Guard',
    faction: 'Rhodes Island',
    color: '#f43f5e',
    avatar: createOperatorAvatarSVG('#f43f5e', '#ef4444', '#b91c1c', 'DEVIL_HORNS'),
    quote: '黄昏已至。莱瓦汀，把妨碍博士的家伙全部燃尽！别忘了我的冰淇淋。',
    masterySkill: '黄昏 (专三)',
    moduleLevel: 3
  },
  // 11. 银灰 (SilverAsh)
  {
    id: 'silverash',
    name: 'SilverAsh',
    cnName: '银灰',
    rarity: 6,
    classType: 'Guard',
    faction: 'Kjerag',
    color: '#38bdf8',
    avatar: createOperatorAvatarSVG('#38bdf8', '#e2e8f0', '#0284c7', 'LEOPARD_EARS'),
    quote: '盟友，喀兰贸易随时可以为你提供全方位支援。真银斩，即刻出鞘！',
    masterySkill: '真银斩 (专三)',
    moduleLevel: 3
  },
  // 12. 锏 (Degenbrecher)
  {
    id: 'degenbrecher',
    name: 'Degenbrecher',
    cnName: '锏',
    rarity: 6,
    classType: 'Guard',
    faction: 'Kjerag',
    color: '#64748b',
    avatar: createOperatorAvatarSVG('#64748b', '#cbd5e1', '#334155', 'SHEEP_HORNS'),
    quote: '源石技艺？那种花哨的把戏在我双剑面前毫无意义。',
    masterySkill: '无声狂欢 (专三)',
    moduleLevel: 3
  },
  // 13. 艾雅法拉 (Eyjafjalla)
  {
    id: 'eyjafjalla',
    name: 'Eyjafjalla',
    cnName: '艾雅法拉',
    rarity: 6,
    classType: 'Caster',
    faction: 'Rhodes Island',
    color: '#f97316',
    avatar: createOperatorAvatarSVG('#f97316', '#fed7aa', '#ea580c', 'SHEEP_HORNS'),
    quote: '前、前辈！火山的温度稍微有点高，请小心不要烫到了……',
    masterySkill: '火山 (专三)',
    moduleLevel: 3
  },
  // 14. 浊心斯卡蒂 (Skadi Alter)
  {
    id: 'skadi_corrupting',
    name: 'Skadi the Corrupting Heart',
    cnName: '浊心斯卡蒂',
    rarity: 6,
    classType: 'Supporter',
    faction: 'Abyssal Hunters',
    color: '#ec4899',
    avatar: createOperatorAvatarSVG('#ec4899', '#fdf2f8', '#db2777', 'CAT_EARS', 'DARK_HALO'),
    quote: '在大海的歌声里，你愿意与我一同沉入深渊吗，博士？',
    masterySkill: '“潮涌，潮落” (专三)',
    moduleLevel: 3
  },
  // 15. 归溟幽灵鲨 (Specter Alter)
  {
    id: 'specter_unchained',
    name: 'Specter the Unchained',
    cnName: '归溟幽灵鲨',
    rarity: 6,
    classType: 'Specialist',
    faction: 'Abyssal Hunters',
    color: '#06b6d4',
    avatar: createOperatorAvatarSVG('#06b6d4', '#f1f5f9', '#0891b2', 'CAT_EARS', 'NUN_HAT'),
    quote: '呵呵呵……电锯的旋律如此美妙，要和我来一支圆舞曲吗？',
    masterySkill: '渴欲清算 (专三)',
    moduleLevel: 3
  },
  // 16. 歌蕾蒂娅 (Gladiia)
  {
    id: 'gladiia',
    name: 'Gladiia',
    cnName: '歌蕾蒂娅',
    rarity: 6,
    classType: 'Specialist',
    faction: 'Abyssal Hunters',
    color: '#38bdf8',
    avatar: createOperatorAvatarSVG('#38bdf8', '#e2e8f0', '#0284c7', 'CAT_EARS', 'BERET'),
    quote: '潮汐将洗刷一切污秽。阿戈尔的荣耀，必在枪尖之上重现。',
    masterySkill: '碎浪 (专三)',
    moduleLevel: 3
  },
  // 17. 棘刺 (Thorns)
  {
    id: 'thorns',
    name: 'Thorns',
    cnName: '棘刺',
    rarity: 6,
    classType: 'Guard',
    faction: 'Iberia',
    color: '#eab308',
    avatar: createOperatorAvatarSVG('#eab308', '#0f172a', '#ca8a04', 'CROWN'),
    quote: '至高之术已成。无论敌人有多少，我的剑与毒素都不会迟疑。',
    masterySkill: '至高之术 (专三)',
    moduleLevel: 3
  },
  // 18. 艾丽妮 (Irene)
  {
    id: 'irene',
    name: 'Irene',
    cnName: '艾丽妮',
    rarity: 6,
    classType: 'Guard',
    faction: 'Iberia',
    color: '#f87171',
    avatar: createOperatorAvatarSVG('#f87171', '#f1f5f9', '#dc2626', 'BIRD_WINGS'),
    quote: '审判之火在此燃起！伊比利亚的信条，绝不会熄灭！',
    masterySkill: '判决 (专三)',
    moduleLevel: 3
  },
  // 19. 缪尔赛思 (Muelsyse)
  {
    id: 'muelsyse',
    name: 'Muelsyse',
    cnName: '缪尔赛思',
    rarity: 6,
    classType: 'Supporter',
    faction: 'Rhine Lab',
    color: '#14b8a6',
    avatar: createOperatorAvatarSVG('#14b8a6', '#99f6e4', '#0d9488', 'ELF_EARS', 'WATER_DROP'),
    quote: '水流是有记忆的哦～博士，今天也让我们一起在阳光下做生态观察吧！',
    masterySkill: '生态派系 (专三)',
    moduleLevel: 3
  },
  // 20. 塞雷娅 (Saria)
  {
    id: 'saria',
    name: 'Saria',
    cnName: '塞雷娅',
    rarity: 6,
    classType: 'Defender',
    faction: 'Rhine Lab',
    color: '#78716c',
    avatar: createOperatorAvatarSVG('#78716c', '#f5f5f4', '#44403c', 'DRAGON_HORNS'),
    quote: '一切都在计算之中。只要我站在前方，防线就绝不会崩溃。',
    masterySkill: '钙质化 (专三)',
    moduleLevel: 3
  },
  // 21. 泥岩 (Mudrock)
  {
    id: 'mudrock',
    name: 'Mudrock',
    cnName: '泥岩',
    rarity: 6,
    classType: 'Defender',
    faction: 'Rhodes Island',
    color: '#84cc16',
    avatar: createOperatorAvatarSVG('#84cc16', '#f8fafc', '#65a30d', 'DEVIL_HORNS'),
    quote: '大地与岩石会保护大家。博士，这里由我来驻守，安心指挥吧。',
    masterySkill: '秽壤的血脉 (专三)',
    moduleLevel: 3
  },
  // 22. 伊内丝 (Ines)
  {
    id: 'ines',
    name: 'Ines',
    cnName: '伊内丝',
    rarity: 6,
    classType: 'Vanguard',
    faction: 'Sarkaz',
    color: '#6366f1',
    avatar: createOperatorAvatarSVG('#6366f1', '#312e81', '#4338ca', 'DEVIL_HORNS'),
    quote: '影子里藏着所有秘密。雷达上的杂鱼，就由我先去清理。',
    masterySkill: '独行暗影 (专三)',
    moduleLevel: 3
  },
  // 23. 澄闪 (Goldenglow)
  {
    id: 'goldenglow',
    name: 'Goldenglow',
    cnName: '澄闪',
    rarity: 6,
    classType: 'Caster',
    faction: 'Rhodes Island',
    color: '#ec4899',
    avatar: createOperatorAvatarSVG('#ec4899', '#f472b6', '#db2777', 'CAT_EARS', 'SPARK'),
    quote: '发、发型师澄闪为您服务！静电好像有点不受控制……全域火花！',
    masterySkill: '澄亮闪耀 (专三)',
    moduleLevel: 3
  },
  // 24. 铃兰 (Suzuran)
  {
    id: 'suzuran',
    name: 'Suzuran',
    cnName: '铃兰',
    rarity: 6,
    classType: 'Supporter',
    faction: 'Rhodes Island',
    color: '#fbbf24',
    avatar: createOperatorAvatarSVG('#fbbf24', '#fef08a', '#d97706', 'FOX_EARS'),
    quote: '博士，我是罗德岛的光芒！九条尾巴今天也很蓬松柔顺哦！',
    masterySkill: '狐火渺然 (专三)',
    moduleLevel: 3
  },
  // 25. 提丰 (Typhon)
  {
    id: 'typhon',
    name: 'Typhon',
    cnName: '提丰',
    rarity: 6,
    classType: 'Sniper',
    faction: 'Sami',
    color: '#3b82f6',
    avatar: createOperatorAvatarSVG('#3b82f6', '#93c5fd', '#1d4ed8', 'STAG_HORNS'),
    quote: '萨米的冰原在呼唤。锁定目标，巨弓连射绝不落空。',
    masterySkill: '“终末的视界” (专三)',
    moduleLevel: 3
  },
  // 26. 重岳 (Chongyue)
  {
    id: 'chongyue',
    name: 'Chongyue',
    cnName: '重岳',
    rarity: 6,
    classType: 'Guard',
    faction: 'Sui',
    color: '#94a3b8',
    avatar: createOperatorAvatarSVG('#94a3b8', '#f1f5f9', '#475569', 'DRAGON_HORNS'),
    quote: '千招百式，融汇一炉！拳意所指，山海平息！',
    masterySkill: '“形意兼备” (专三)',
    moduleLevel: 3
  },
  // 27. 令 (Ling)
  {
    id: 'ling',
    name: 'Ling',
    cnName: '令',
    rarity: 6,
    classType: 'Supporter',
    faction: 'Sui',
    color: '#0284c7',
    avatar: createOperatorAvatarSVG('#0284c7', '#7dd3fc', '#0369a1', 'DRAGON_HORNS'),
    quote: '醉卧沙场君莫笑，古来征战几人回。好酒，好诗，好战局！',
    masterySkill: '“宁作吾” (专三)',
    moduleLevel: 3
  },
  // 28. 黍 (Shu)
  {
    id: 'shu',
    name: 'Shu',
    cnName: '黍',
    rarity: 6,
    classType: 'Defender',
    faction: 'Sui',
    color: '#22c55e',
    avatar: createOperatorAvatarSVG('#22c55e', '#bbf7d0', '#15803d', 'DRAGON_HORNS', 'WHEAT'),
    quote: '春种一粒粟，秋收万颗子。大地滋养众生，也保护博士。',
    masterySkill: '“百谷甘霖” (专三)',
    moduleLevel: 3
  },
  // 29. 假日威龙陈 (Ch'en Alter)
  {
    id: 'chen_holungday',
    name: 'Ch\'en the Holungday',
    cnName: '假日威龙陈',
    rarity: 6,
    classType: 'Sniper',
    faction: 'Lungmen',
    color: '#06b6d4',
    avatar: createOperatorAvatarSVG('#06b6d4', '#0284c7', '#0891b2', 'DRAGON_HORNS', 'HEADPHONE'),
    quote: '龙门治安官陈，现在是度假模式！水铳的威力可不比赤霄弱。',
    masterySkill: '“假日清算” (专三)',
    moduleLevel: 3
  },
  // 30. 塑心 (Virtuosa)
  {
    id: 'virtuosa',
    name: 'Virtuosa',
    cnName: '塑心',
    rarity: 6,
    classType: 'Supporter',
    faction: 'Laterano',
    color: '#8b5cf6',
    avatar: createOperatorAvatarSVG('#8b5cf6', '#1e1b4b', '#7c3aed', 'DEVIL_HORNS', 'DARK_HALO'),
    quote: '倾听心底最真实的乐章吧。在音符的律动中，寻找真正的自我。',
    masterySkill: '“自由的狂想” (专三)',
    moduleLevel: 3
  },
  // 31. 焰影苇草 (Reed Alter)
  {
    id: 'reed_flame',
    name: 'Reed the Flame Shadow',
    cnName: '焰影苇草',
    rarity: 6,
    classType: 'Medic',
    faction: 'Victoria',
    color: '#f97316',
    avatar: createOperatorAvatarSVG('#f97316', '#fed7aa', '#c2410c', 'DRAGON_HORNS', 'SPARK'),
    quote: '哪怕只是微弱的火种，也能在寒夜中带给博士温暖与生机。',
    masterySkill: '生命之火 (专三)',
    moduleLevel: 3
  },
  // 32. 号角 (Horn)
  {
    id: 'horn',
    name: 'Horn',
    cnName: '号角',
    rarity: 6,
    classType: 'Defender',
    faction: 'Victoria',
    color: '#eab308',
    avatar: createOperatorAvatarSVG('#eab308', '#fef08a', '#a16207', 'WOLF_EARS'),
    quote: '风暴突击队集结！白狼的风骨绝不容辱没，全弹发射！',
    masterySkill: '终极防线 (专三)',
    moduleLevel: 3
  },
  // 33. 鸿雪 (Pozëmka)
  {
    id: 'pozemka',
    name: 'Pozëmka',
    cnName: '鸿雪',
    rarity: 6,
    classType: 'Sniper',
    faction: 'Ursus',
    color: '#fb7185',
    avatar: createOperatorAvatarSVG('#fb7185', '#fecdd3', '#e11d48', 'WOLF_EARS', 'GLASSES'),
    quote: '打字机的声音，就是杜林地下城最动听的诗篇。自动打字机，校准射程！',
    masterySkill: '打字机之怒 (专三)',
    moduleLevel: 3
  },
  // 34. 斥罪 (Penance)
  {
    id: 'penance',
    name: 'Penance',
    cnName: '斥罪',
    rarity: 6,
    classType: 'Defender',
    faction: 'Siracusa',
    color: '#ef4444',
    avatar: createOperatorAvatarSVG('#ef4444', '#7f1d1d', '#b91c1c', 'WOLF_EARS'),
    quote: '法律与秩序是文明最后的壁垒。以正义之名，敲碎一切罪恶！',
    masterySkill: '坚固裁决 (专三)',
    moduleLevel: 3
  },
  // 35. 山 (Mountain)
  {
    id: 'mountain',
    name: 'Mountain',
    cnName: '山',
    rarity: 6,
    classType: 'Guard',
    faction: 'Rhine Lab',
    color: '#d97706',
    avatar: createOperatorAvatarSVG('#d97706', '#fef3c7', '#b45309', 'LEOPARD_EARS'),
    quote: '力量应当用于守护同伴。博士，这双铁拳随时准备为你挥出。',
    masterySkill: '左勾扫拳 (专三)',
    moduleLevel: 3
  },
  // 36. 佩佩 (Pepe)
  {
    id: 'pepe',
    name: 'Pepe',
    cnName: '佩佩',
    rarity: 6,
    classType: 'Guard',
    faction: 'Minos',
    color: '#facc15',
    avatar: createOperatorAvatarSVG('#facc15', '#fef08a', '#ca8a04', 'CAT_EARS', 'SUN_CROWN'),
    quote: '太阳神的庇护与古老的黄金杖！博士，今天也元气满满地出发吧！',
    masterySkill: '太阳神之光 (专三)',
    moduleLevel: 3
  }
];

export const PROMPT_PRESETS: PromptTemplate[] = [
  {
    id: 'rhodes_core',
    title: '经典罗德岛核心组 (Rhodes Core 3x3)',
    description: '阿米娅、凯尔希、陈、银灰、德克萨斯、拉普兰德等9人经典网格贴纸',
    tag: '3x3 经典组',
    gridSize: '3x3',
    operators: ['Amiya', "Kal'tsit", 'Ch\'en', 'SilverAsh', 'Texas', 'Lappland', 'Eyjafjalla', 'Thorns', 'Surtr'],
    prompt: `A 3x3 grid sticker sheet of chibi Arknights characters, including Amiya with cute bunny ears, Kal'tsit with emerald crystal, Ch'en with dragon horns, SilverAsh with snow leopard cub, Texas with energy blade, Lappland with wild wolf smirk, Eyjafjalla with fluffy sheep horns, Thorns with blade, and Surtr with flame sword. Cute chibi anime style, bold clean outlines, vibrant colors, expressive faces, Rhodes Island tactical casual outfits, uniform scale, pure white background, multiple characters evenly spaced on one sheet, high resolution, 2D vector sticker aesthetics, no overlap, easy for cutout`,
    negativePrompt: `low quality, blurry, cropped, overlapping characters, complex textured background, realistic style, 3D render, dark background`,
    params: `--ar 1:1 --v 6.1 --style raw --q 2`
  },
  {
    id: 'meta_monsters',
    title: '幻神与高难对策组 (Meta 6★ 3x3)',
    description: '维什戴尔、洛戈斯、玛恩纳、锏、黍、提丰、史尔特尔',
    tag: '3x3 幻神组',
    gridSize: '3x3',
    operators: ["Wis'adel", 'Logos', 'Mlynar', 'Degenbrecher', 'Shu', 'Typhon', 'Surtr', 'Ines', 'Goldenglow'],
    prompt: `A 3x3 sprite sheet of super deformed chibi Arknights meta characters, including Wis'adel with cute ghost cannons, Logos with banshee quill, Mlynar reading newspaper casually, Degenbrecher with double swords, Shu with golden wheat halo, Typhon with giant bow, and Ines with shadow blade. Kawaii game avatar style, flat color, clean lineart, soft cell shading, cute proportions, plain white background, spaced layout for easy cutout, 4k resolution, sticker pack style`,
    negativePrompt: `dark background, noisy artifacts, realistic proportions, ugly faces, bad hands, merged characters`,
    params: `--ar 1:1 --v 6.1 --q 2`
  },
  {
    id: 'penguin_logistics',
    title: '企鹅物流与龙门近卫 (Penguin Logistics 2x2)',
    description: '德克萨斯、能天使吃苹果派、可颂、大帝DJ',
    tag: '2x2 企鹅物流',
    gridSize: '2x2',
    operators: ['Texas', 'Exusiai', 'Croissant', 'Emperor'],
    prompt: `A 2x2 grid sticker sheet of chibi Arknights Penguin Logistics crew: Exusiai happily eating an apple pie with glowing halo, Texas holding Pocky stick, Croissant with giant shield and croissant bread, and Emperor the penguin wearing sunglasses and gold chains as DJ. Cute chibi 2D anime illustration, thick lineart, vivid colors, clean white background, 4 evenly separated quadrants, perfect for sticker cutout`,
    negativePrompt: `blurry, realistic, low resolution, messy grid, dark gradient background`,
    params: `--ar 1:1 --v 6.1`
  },
  {
    id: 'abyssal_hunters',
    title: '深海猎人与伊比利亚 (Abyssal & Iberia 2x2)',
    description: '歌蕾蒂娅高速挥戟、斯卡蒂抱虎鲸抱枕、幽灵鲨狂笑、棘刺至高之术',
    tag: '2x2 深海组',
    gridSize: '2x2',
    operators: ['Gladiia', 'Skadi Alter', 'Specter Alter', 'Thorns'],
    prompt: `A 2x2 grid of chibi Arknights Abyssal Hunters: Gladiia with swordfish hat, Skadi holding a cute plush orca, Specter spinning a toy buzzsaw with dizzy cute eyes, and Thorns drinking coconut juice. High contrast, clean vector style, super kawaii SD proportions, isolated on pure white background, distinct margins between 4 characters`,
    negativePrompt: `photorealistic, complex scenery, overlapping, dark borders`,
    params: `--ar 1:1 --v 6.1`
  }
];
