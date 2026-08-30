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
    | 'BANSHEE_CROWN'
    | 'BEAR_EARS'
    | 'LION_EARS'
    | 'FISH_FIN'
    | 'SARKAZ_CROWN'
    | 'FEATHER_EARS'
    | 'DOG_EARS'
    | 'SNAKE_WINGS'
    | 'DEER_HORNS',
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

  <!-- Features (Ears/Horns/Wings/Fins) behind hair -->
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
      : features === 'DOG_EARS'
      ? `<path d="M 24 35 C 16 38 18 56 26 52 C 30 48 28 36 24 35 Z" fill="${hairColor}" stroke="#1e293b" stroke-width="1.5"/>
         <path d="M 76 35 C 84 38 82 56 74 52 C 70 48 72 36 76 35 Z" fill="${hairColor}" stroke="#1e293b" stroke-width="1.5"/>`
      : features === 'LEOPARD_EARS' || features === 'CAT_EARS'
      ? `<circle cx="27" cy="22" r="9" fill="${hairColor}" stroke="#1e293b" stroke-width="1.5"/>
         <circle cx="27" cy="22" r="5" fill="#f43f5e" opacity="0.45"/>
         <circle cx="73" cy="22" r="9" fill="${hairColor}" stroke="#1e293b" stroke-width="1.5"/>
         <circle cx="73" cy="22" r="5" fill="#f43f5e" opacity="0.45"/>`
      : features === 'BEAR_EARS' || features === 'LION_EARS'
      ? `<circle cx="25" cy="24" r="10" fill="${hairColor}" stroke="#1e293b" stroke-width="1.5"/>
         <circle cx="25" cy="24" r="6" fill="#fed7aa" opacity="0.5"/>
         <circle cx="75" cy="24" r="10" fill="${hairColor}" stroke="#1e293b" stroke-width="1.5"/>
         <circle cx="75" cy="24" r="6" fill="#fed7aa" opacity="0.5"/>`
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
      : features === 'BIRD_WINGS' || features === 'FEATHER_EARS'
      ? `<path d="M 24 32 C 12 20 16 10 24 16 C 28 20 28 28 26 32 Z" fill="#f87171" stroke="#dc2626" stroke-width="1.2"/>
         <path d="M 76 32 C 88 20 84 10 76 16 C 72 20 72 28 74 32 Z" fill="#f87171" stroke="#dc2626" stroke-width="1.2"/>`
      : features === 'STAG_HORNS' || features === 'DEER_HORNS'
      ? `<path d="M 32 30 C 18 18 16 6 12 4 C 18 10 24 14 26 8 C 28 14 34 22 34 30 Z" fill="#60a5fa" stroke="#1d4ed8" stroke-width="1.5"/>
         <path d="M 68 30 C 82 18 84 6 88 4 C 82 10 76 14 74 8 C 72 14 66 22 66 30 Z" fill="#60a5fa" stroke="#1d4ed8" stroke-width="1.5"/>`
      : features === 'SNAKE_WINGS'
      ? `<path d="M 24 24 C 8 12 12 2 22 6 C 26 12 26 22 24 24 Z" fill="#a855f7" stroke="#7e22ce" stroke-width="1.2"/>
         <path d="M 76 24 C 92 12 88 2 78 6 C 74 12 74 22 76 24 Z" fill="#a855f7" stroke="#7e22ce" stroke-width="1.2"/>`
      : features === 'SARKAZ_GHOST'
      ? `<path d="M 28 32 C 14 18 18 4 16 2 C 26 8 32 20 32 30 Z" fill="#f43f5e" stroke="#881337" stroke-width="1.5"/>
         <path d="M 72 32 C 86 18 82 4 84 2 C 74 8 68 20 68 30 Z" fill="#f43f5e" stroke="#881337" stroke-width="1.5"/>
         <circle cx="82" cy="18" r="4" fill="#f43f5e" opacity="0.6" filter="url(#glow)"/>`
      : features === 'BANSHEE_CROWN' || features === 'SARKAZ_CROWN'
      ? `<path d="M 30 26 C 22 10 28 2 24 1 C 32 6 36 18 36 26 Z" fill="#94a3b8" stroke="#475569" stroke-width="1.5"/>
         <path d="M 70 26 C 78 10 72 2 76 1 C 68 6 64 18 64 26 Z" fill="#94a3b8" stroke="#475569" stroke-width="1.5"/>
         <polygon points="50,6 44,18 56,18" fill="#e2e8f0" stroke="#64748b" stroke-width="1"/>`
      : features === 'FISH_FIN'
      ? `<path d="M 24 38 C 10 32 12 18 20 22 C 24 24 26 32 26 38 Z" fill="#38bdf8" stroke="#0284c7" stroke-width="1.2"/>
         <path d="M 76 38 C 90 32 88 18 80 22 C 76 24 74 32 74 38 Z" fill="#38bdf8" stroke="#0284c7" stroke-width="1.2"/>`
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
      : accessory === 'INK'
      ? `<circle cx="26" cy="16" r="5" fill="#0f172a" opacity="0.8"/>
         <path d="M 68 12 Q 78 18 72 26" stroke="#0f172a" stroke-width="3" fill="none"/>`
      : accessory === 'FLAG'
      ? `<polygon points="72,8 88,14 72,20" fill="#38bdf8" stroke="#0284c7" stroke-width="1"/>
         <line x1="72" y1="6" x2="72" y2="35" stroke="#cbd5e1" stroke-width="1.5"/>`
      : accessory === 'LANTERN'
      ? `<rect x="70" y="16" width="10" height="14" rx="2" fill="#38bdf8" opacity="0.85" filter="url(#glow)"/>
         <line x1="75" y1="10" x2="75" y2="16" stroke="#94a3b8" stroke-width="1.5"/>`
      : accessory === 'ANCHOR'
      ? `<path d="M 70 24 C 70 34 82 34 82 24" fill="none" stroke="#64748b" stroke-width="2"/>
         <line x1="76" y1="14" x2="76" y2="30" stroke="#64748b" stroke-width="2"/>`
      : accessory === 'APPLES'
      ? `<circle cx="50" cy="11" rx="5" ry="5" fill="#ef4444" filter="url(#glow)"/>
         <path d="M 50 6 Q 52 4 54 5" stroke="#15803d" stroke-width="1.2" fill="none"/>`
      : accessory === 'FLUTE'
      ? `<line x1="28" y1="36" x2="16" y2="16" stroke="#e2e8f0" stroke-width="2"/>
         <circle cx="16" cy="16" r="2" fill="#f59e0b"/>`
      : accessory === 'CANDLE'
      ? `<rect x="74" y="12" width="6" height="12" rx="1" fill="#fef08a"/>
         <ellipse cx="77" cy="8" rx="2.5" ry="4" fill="#f97316" filter="url(#glow)"/>`
      : accessory === 'BELL'
      ? `<path d="M 46 8 C 46 4 54 4 54 8 L 58 16 L 42 16 Z" fill="#facc15" stroke="#ca8a04" stroke-width="1"/>`
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
  // 5. 荒芜拉普兰德 (Lappland the Decadenza)
  {
    id: 'lappland_alter',
    name: 'Lappland the Decadenza',
    cnName: '荒芜拉普兰德',
    rarity: 6,
    classType: 'Caster',
    faction: 'Siracusa',
    color: '#9333ea',
    avatar: createOperatorAvatarSVG('#9333ea', '#f8fafc', '#a855f7', 'WOLF_EARS', 'SPARK'),
    quote: '荒芜的叙拉古，落下的雪与血。德克萨斯，来看看这幕狂欢剧的高潮吧！',
    masterySkill: '狂欢盛宴 (专三)',
    moduleLevel: 3
  },
  // 6. 玛恩纳 (Młynar)
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
  // 7. 耀骑士临光
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
  // 8. 能天使 (Exusiai)
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
  // 9. 缄默德克萨斯 (Texas Alter)
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
  // 10. 德克萨斯 (Texas 原版先锋)
  {
    id: 'texas',
    name: 'Texas',
    cnName: '德克萨斯',
    rarity: 5,
    classType: 'Vanguard',
    faction: 'Penguin Logistics',
    color: '#0284c7',
    avatar: createOperatorAvatarSVG('#0284c7', '#334155', '#0ea5e9', 'WOLF_EARS'),
    quote: '任务内容确认。博士，请下达行动指令。',
    masterySkill: '剑雨 (专三)',
    moduleLevel: 3
  },
  // 11. 拉普兰德 (Lappland 原版近卫)
  {
    id: 'lappland',
    name: 'Lappland',
    cnName: '拉普兰德',
    rarity: 5,
    classType: 'Guard',
    faction: 'Siracusa',
    color: '#a855f7',
    avatar: createOperatorAvatarSVG('#a855f7', '#f1f5f9', '#9333ea', 'WOLF_EARS'),
    quote: '哈哈……太有趣了！德克萨斯那家伙，也在雷达附近吗？',
    masterySkill: '狼魂 (专三)',
    moduleLevel: 3
  },
  // 12. 史尔特尔 (Surtr)
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
  // 13. 银灰 (SilverAsh)
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
  // 14. 锏 (Degenbrecher)
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
  // 15. 艾雅法拉 (Eyjafjalla)
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
  // 16. 纯烬艾雅法拉 (Eyjafjalla Alter)
  {
    id: 'eyjafjalla_alter',
    name: 'Eyjafjalla the Hwætstân',
    cnName: '纯烬艾雅法拉',
    rarity: 6,
    classType: 'Medic',
    faction: 'Rhodes Island',
    color: '#fb923c',
    avatar: createOperatorAvatarSVG('#fb923c', '#ffedd5', '#ea580c', 'SHEEP_HORNS', 'SUN_CROWN'),
    quote: '火山的灰烬会化为滋润大地的沃土。前辈，无论风雨多大，我都会守护大家的健康。',
    masterySkill: '绝唱的余烬 (专三)',
    moduleLevel: 3
  },
  // 17. 浊心斯卡蒂 (Skadi Alter)
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
  // 18. 归溟幽灵鲨 (Specter Alter)
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
  // 19. 斯卡蒂 (Skadi 原版)
  {
    id: 'skadi',
    name: 'Skadi',
    cnName: '斯卡蒂',
    rarity: 6,
    classType: 'Guard',
    faction: 'Abyssal Hunters',
    color: '#38bdf8',
    avatar: createOperatorAvatarSVG('#38bdf8', '#f8fafc', '#0284c7', 'CAT_EARS', 'BERET'),
    quote: '我习惯了独自斩杀巨兽。但博士，如果是你的指令，我愿意挥剑。',
    masterySkill: '涌潮悲歌 (专三)',
    moduleLevel: 3
  },
  // 20. 幽灵鲨 (Specter 原版近卫)
  {
    id: 'specter',
    name: 'Specter',
    cnName: '幽灵鲨',
    rarity: 5,
    classType: 'Guard',
    faction: 'Abyssal Hunters',
    color: '#0ea5e9',
    avatar: createOperatorAvatarSVG('#0ea5e9', '#e2e8f0', '#0369a1', 'CAT_EARS', 'NUN_HAT'),
    quote: '肉斩骨断，不死之躯！电锯转动起来，什么都无法阻挡我。',
    masterySkill: '肉斩骨断 (专三)',
    moduleLevel: 3
  },
  // 21. 歌蕾蒂娅 (Gladiia)
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
  // 22. 乌尔比安 (Ulpian)
  {
    id: 'ulpian',
    name: 'Ulpian',
    cnName: '乌尔比安',
    rarity: 6,
    classType: 'Guard',
    faction: 'Abyssal Hunters',
    color: '#0284c7',
    avatar: createOperatorAvatarSVG('#0284c7', '#334155', '#38bdf8', 'CAT_EARS', 'ANCHOR'),
    quote: '巨锚所落之处，海浪与大群皆需退避。深海猎人三队长，执裁深渊。',
    masterySkill: '破浪重锚 (专三)',
    moduleLevel: 3
  },
  // 23. 棘刺 (Thorns)
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
  // 24. 艾丽妮 (Irene)
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
  // 25. 流明 (Lumen)
  {
    id: 'lumen',
    name: 'Lumen',
    cnName: '流明',
    rarity: 6,
    classType: 'Medic',
    faction: 'Iberia',
    color: '#38bdf8',
    avatar: createOperatorAvatarSVG('#38bdf8', '#bae6fd', '#0284c7', 'FISH_FIN', 'LANTERN'),
    quote: '提灯的光芒，一定会为迷雾中的人们照亮归途。博士，请让我协助您。',
    masterySkill: '灯火不熄 (专三)',
    moduleLevel: 3
  },
  // 26. 缪尔赛思 (Muelsyse)
  {
    id: 'muelsyse',
    name: 'Muelsyse',
    cnName: '缪尔赛思',
    rarity: 6,
    classType: 'Vanguard',
    faction: 'Rhine Lab',
    color: '#14b8a6',
    avatar: createOperatorAvatarSVG('#14b8a6', '#99f6e4', '#0d9488', 'ELF_EARS', 'WATER_DROP'),
    quote: '水流是有记忆的哦～博士，今天也让我们一起在阳光下做生态观察吧！',
    masterySkill: '生态派系 (专三)',
    moduleLevel: 3
  },
  // 27. 塞雷娅 (Saria)
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
  // 28. 泥岩 (Mudrock)
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
  // 29. 伊内丝 (Ines)
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
  // 30. 澄闪 (Goldenglow)
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
  // 31. 铃兰 (Suzuran)
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
  // 32. 提丰 (Typhon)
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
  // 33. 重岳 (Chongyue)
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
  // 34. 令 (Ling)
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
  // 35. 黍 (Shu)
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
  // 36. 夕 (Dusk)
  {
    id: 'dusk',
    name: 'Dusk',
    cnName: '夕',
    rarity: 6,
    classType: 'Caster',
    faction: 'Sui',
    color: '#10b981',
    avatar: createOperatorAvatarSVG('#10b981', '#064e3b', '#34d399', 'DRAGON_HORNS', 'INK'),
    quote: '笔落生万物，画中自乾坤。烦劳之人莫要打扰我作画。',
    masterySkill: '写意胜形 (专三)',
    moduleLevel: 3
  },
  // 37. 年 (Nian)
  {
    id: 'nian',
    name: 'Nian',
    cnName: '年',
    rarity: 6,
    classType: 'Defender',
    faction: 'Sui',
    color: '#ef4444',
    avatar: createOperatorAvatarSVG('#ef4444', '#ffffff', '#dc2626', 'DRAGON_HORNS', 'SPARK'),
    quote: '百炼成钢，无坚不摧！博士，今天的火锅要加麻加辣哦！',
    masterySkill: '铁御 (专三)',
    moduleLevel: 3
  },
  // 38. 假日威龙陈 (Ch'en Alter)
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
  // 39. 陈 (Ch'en 原版近卫)
  {
    id: 'chen',
    name: 'Ch\'en',
    cnName: '陈',
    rarity: 6,
    classType: 'Guard',
    faction: 'Lungmen',
    color: '#0284c7',
    avatar: createOperatorAvatarSVG('#0284c7', '#0f172a', '#0369a1', 'DRAGON_HORNS'),
    quote: '赤霄出鞘！龙门高级警司陈，绝不会向任何恶势力妥协。',
    masterySkill: '绝影 (专三)',
    moduleLevel: 3
  },
  // 40. 塑心 (Virtuosa)
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
  // 41. 薇薇安娜 (Viviana - 烛骑士)
  {
    id: 'viviana',
    name: 'Viviana',
    cnName: '薇薇安娜',
    rarity: 6,
    classType: 'Guard',
    faction: 'Leithanien',
    color: '#facc15',
    avatar: createOperatorAvatarSVG('#facc15', '#fef08a', '#ca8a04', 'DEER_HORNS', 'CANDLE'),
    quote: '微光虽弱，亦能驱散漫漫长夜。烛光剑影，与博士并肩前行。',
    masterySkill: '“明灯烛照” (专三)',
    moduleLevel: 3
  },
  // 42. 止颂 (Lessing)
  {
    id: 'lessing',
    name: 'Lessing',
    cnName: '止颂',
    rarity: 6,
    classType: 'Guard',
    faction: 'Leithanien',
    color: '#64748b',
    avatar: createOperatorAvatarSVG('#64748b', '#cbd5e1', '#334155', 'SHEEP_HORNS'),
    quote: '以意志之名斩断枷锁，莱塔尼亚的重剑誓不低头。',
    masterySkill: '“叹息绝响” (专三)',
    moduleLevel: 3
  },
  // 43. 焰影苇草 (Reed Alter)
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
  // 44. 号角 (Horn)
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
  // 45. 鸿雪 (Pozëmka)
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
  // 46. 斥罪 (Penance)
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
  // 47. 山 (Mountain)
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
  // 48. 佩佩 (Pepe)
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
  },
  // 49. 风笛 (Bagpipe)
  {
    id: 'bagpipe',
    name: 'Bagpipe',
    cnName: '风笛',
    rarity: 6,
    classType: 'Vanguard',
    faction: 'Victoria',
    color: '#f97316',
    avatar: createOperatorAvatarSVG('#f97316', '#ea580c', '#fbbf24', 'DRAGON_HORNS', 'WHEAT'),
    quote: '破城矛上膛，拖拉机马力全开！博士，随时听候冲锋号令！',
    masterySkill: '闭膛连发 (专三)',
    moduleLevel: 3
  },
  // 50. 琴柳 (Saileach)
  {
    id: 'saileach',
    name: 'Saileach',
    cnName: '琴柳',
    rarity: 6,
    classType: 'Vanguard',
    faction: 'Victoria',
    color: '#facc15',
    avatar: createOperatorAvatarSVG('#facc15', '#fef08a', '#ca8a04', 'ELF_EARS', 'FLAG'),
    quote: '旗帜升起，希望与信念指引胜利的前路！维多利亚的荣耀与自由同在。',
    masterySkill: '光辉圣徽 (专三)',
    moduleLevel: 3
  },
  // 51. 白铁 (Stainless)
  {
    id: 'stainless',
    name: 'Stainless',
    cnName: '白铁',
    rarity: 6,
    classType: 'Supporter',
    faction: 'Victoria',
    color: '#64748b',
    avatar: createOperatorAvatarSVG('#64748b', '#e2e8f0', '#0284c7', 'CAT_EARS', 'HEADPHONE'),
    quote: '扳手和焊枪准备就绪！只要有足够的零件，我能帮你把整个罗德岛武装到牙齿！',
    masterySkill: '铁卫复合装甲 (专三)',
    moduleLevel: 3
  },
  // 52. 推进之王 (Siege)
  {
    id: 'siege',
    name: 'Siege',
    cnName: '推进之王',
    rarity: 6,
    classType: 'Vanguard',
    faction: 'Victoria',
    color: '#eab308',
    avatar: createOperatorAvatarSVG('#eab308', '#facc15', '#854d0e', 'LION_EARS', 'CROWN'),
    quote: '格拉斯哥帮的信条从未改变。重锤所向，王者自当君临！',
    masterySkill: '碎颅击 (专三)',
    moduleLevel: 3
  },
  // 53. 赫德雷 (Hoederer)
  {
    id: 'hoederer',
    name: 'Hoederer',
    cnName: '赫德雷',
    rarity: 6,
    classType: 'Guard',
    faction: 'Sarkaz',
    color: '#b91c1c',
    avatar: createOperatorAvatarSVG('#b91c1c', '#18181b', '#ef4444', 'DEVIL_HORNS'),
    quote: '佣兵在泥泞中寻找活路。剑与重甲，就是萨卡兹最忠诚的同伴。',
    masterySkill: '死战不退 (专三)',
    moduleLevel: 3
  },
  // 54. 阿斯卡纶 (Ascalon)
  {
    id: 'ascalon',
    name: 'Ascalon',
    cnName: '阿斯卡纶',
    rarity: 6,
    classType: 'Specialist',
    faction: 'Babel',
    color: '#e11d48',
    avatar: createOperatorAvatarSVG('#e11d48', '#0f172a', '#f43f5e', 'SARKAZ_CROWN'),
    quote: '罗德岛的阴影里，所有的威胁都会在无声中被抹除。博士，注意安全。',
    masterySkill: '无声肃清 (专三)',
    moduleLevel: 3
  },
  // 55. 妮芙 (Nymph)
  {
    id: 'nymph',
    name: 'Nymph',
    cnName: '妮芙',
    rarity: 6,
    classType: 'Caster',
    faction: 'Sarkaz',
    color: '#a855f7',
    avatar: createOperatorAvatarSVG('#a855f7', '#f3e8ff', '#9333ea', 'DEVIL_HORNS', 'SPARK'),
    quote: '恐惧是情绪的养料。在妖精的轻语中，噩梦即将降临哦。',
    masterySkill: '恐慌狂欢 (专三)',
    moduleLevel: 3
  },
  // 56. 黑键 (Ebenholz)
  {
    id: 'ebenholz',
    name: 'Ebenholz',
    cnName: '黑键',
    rarity: 6,
    classType: 'Caster',
    faction: 'Leithanien',
    color: '#d97706',
    avatar: createOperatorAvatarSVG('#d97706', '#18181b', '#b45309', 'SHEEP_HORNS', 'FLUTE'),
    quote: '哪怕尘世的乐章终将凋零，我也要用这支独奏，击碎命运的枷锁。',
    masterySkill: '荒诞之舞 (专三)',
    moduleLevel: 3
  },
  // 57. 霍尔海雅 (Ho'olheyak)
  {
    id: 'hoolheyak',
    name: "Ho'olheyak",
    cnName: '霍尔海雅',
    rarity: 6,
    classType: 'Caster',
    faction: 'Rhine Lab',
    color: '#059669',
    avatar: createOperatorAvatarSVG('#059669', '#10b981', '#047857', 'SNAKE_WINGS', 'SPARK'),
    quote: '过去与未来的羽毛都在旋风中飘扬。博士，你眼中的真相究竟是什么呢？',
    masterySkill: '“漫游风暴” (专三)',
    moduleLevel: 3
  },
  // 58. 淬羽赫默 (Silence Alter)
  {
    id: 'silence_alter',
    name: 'Silence the Paradigmatic',
    cnName: '淬羽赫默',
    rarity: 6,
    classType: 'Supporter',
    faction: 'Rhine Lab',
    color: '#0284c7',
    avatar: createOperatorAvatarSVG('#0284c7', '#38bdf8', '#0369a1', 'FEATHER_EARS', 'GLASSES'),
    quote: '科学的光芒绝不能被欲望吞噬。我将作为范式，守护这片天空。',
    masterySkill: '“无声呼唤” (专三)',
    moduleLevel: 3
  },
  // 59. 伊芙利特 (Ifrit)
  {
    id: 'ifrit',
    name: 'Ifrit',
    cnName: '伊芙利特',
    rarity: 6,
    classType: 'Caster',
    faction: 'Rhine Lab',
    color: '#ea580c',
    avatar: createOperatorAvatarSVG('#ea580c', '#fb923c', '#9a3412', 'DEVIL_HORNS', 'SPARK'),
    quote: '赫默说我可以尽情烧了！一整条直线上的敌人，全部变成烤肉吧！',
    masterySkill: '灼地 (专三)',
    moduleLevel: 3
  },
  // 60. 麦哲伦 (Magallan)
  {
    id: 'magallan',
    name: 'Magallan',
    cnName: '麦哲伦',
    rarity: 6,
    classType: 'Supporter',
    faction: 'Rhine Lab',
    color: '#38bdf8',
    avatar: createOperatorAvatarSVG('#38bdf8', '#e2e8f0', '#0284c7', 'CAT_EARS', 'HEADPHONE'),
    quote: '无人机“龙腾”启动！极地探险家麦哲伦，随时为博士提供全方位侦察！',
    masterySkill: '武装打击模块 (专三)',
    moduleLevel: 3
  },
  // 61. 煌 (Blaze)
  {
    id: 'blaze',
    name: 'Blaze',
    cnName: '煌',
    rarity: 6,
    classType: 'Guard',
    faction: 'Rhodes Island',
    color: '#dc2626',
    avatar: createOperatorAvatarSVG('#dc2626', '#18181b', '#ef4444', 'CAT_EARS', 'SPARK'),
    quote: '电锯轰鸣，热血沸腾！精英干员煌，带着整座罗德岛的热情杀进前线！',
    masterySkill: '链锯延伸模块 (专三)',
    moduleLevel: 3
  },
  // 62. 迷迭香 (Rosmontis)
  {
    id: 'rosmontis',
    name: 'Rosmontis',
    cnName: '迷迭香',
    rarity: 6,
    classType: 'Sniper',
    faction: 'Rhodes Island',
    color: '#94a3b8',
    avatar: createOperatorAvatarSVG('#94a3b8', '#f8fafc', '#475569', 'CAT_EARS'),
    quote: '巨剑会记住所有名字……博士，请不要忘记我和大家。',
    masterySkill: '“末世的拥抱” (专三)',
    moduleLevel: 3
  },
  // 63. 夜莺 (Nightingale)
  {
    id: 'nightingale',
    name: 'Nightingale',
    cnName: '夜莺',
    rarity: 6,
    classType: 'Medic',
    faction: 'Rhodes Island',
    color: '#67e8f9',
    avatar: createOperatorAvatarSVG('#67e8f9', '#f8fafc', '#0891b2', 'DEVIL_HORNS', 'SUN_CROWN'),
    quote: '圣域展开。即便在战火中，也能为痛苦的灵魂寻得片刻安宁。',
    masterySkill: '圣域 (专三)',
    moduleLevel: 3
  },
  // 64. 闪灵 (Shining)
  {
    id: 'shining',
    name: 'Shining',
    cnName: '闪灵',
    rarity: 6,
    classType: 'Medic',
    faction: 'Rhodes Island',
    color: '#0f172a',
    avatar: createOperatorAvatarSVG('#0f172a', '#f8fafc', '#475569', 'DEVIL_HORNS', 'NUN_HAT'),
    quote: '剑虽入鞘，教条永存。我的立场将庇护每一位并肩作战的同伴。',
    masterySkill: '教条立场 (专三)',
    moduleLevel: 3
  },
  // 65. 瑕光 (Blemishine)
  {
    id: 'blemishine',
    name: 'Blemishine',
    cnName: '瑕光',
    rarity: 6,
    classType: 'Defender',
    faction: 'Kazimierz',
    color: '#fbbf24',
    avatar: createOperatorAvatarSVG('#fbbf24', '#fef08a', '#ca8a04', 'PEGASUS_EARS'),
    quote: '玛莉娅·临光前来报道！即使没有耀骑士那么耀眼，我也会成为守护大家的坚实护盾！',
    masterySkill: '无暇赞歌 (专三)',
    moduleLevel: 3
  },
  // 66. 远牙 (Fartooth)
  {
    id: 'fartooth',
    name: 'Fartooth',
    cnName: '远牙',
    rarity: 6,
    classType: 'Sniper',
    faction: 'Kazimierz',
    color: '#fb923c',
    avatar: createOperatorAvatarSVG('#fb923c', '#fed7aa', '#c2410c', 'FEATHER_EARS', 'GLASSES'),
    quote: '红松的飞羽超越视界。不管敌人藏在多远的高台，一箭必中！',
    masterySkill: '同盟者 (专三)',
    moduleLevel: 3
  },
  // 67. 灵知 (Gnosis)
  {
    id: 'gnosis',
    name: 'Gnosis',
    cnName: '灵知',
    rarity: 6,
    classType: 'Supporter',
    faction: 'Kjerag',
    color: '#0284c7',
    avatar: createOperatorAvatarSVG('#0284c7', '#e2e8f0', '#0369a1', 'BIRD_WINGS', 'GLASSES'),
    quote: '低温是绝对理性的体现。让寒霜冻结战局，银灰的宏图不容阻挡。',
    masterySkill: '“零度封冻” (专三)',
    moduleLevel: 3
  },
  // 68. 初雪 (Pramanix)
  {
    id: 'pramanix',
    name: 'Pramanix',
    cnName: '初雪',
    rarity: 5,
    classType: 'Supporter',
    faction: 'Kjerag',
    color: '#38bdf8',
    avatar: createOperatorAvatarSVG('#38bdf8', '#f8fafc', '#0284c7', 'LEOPARD_EARS', 'BELL'),
    quote: '喀兰圣女初雪，为博士摇动神圣的风铃。神圣的白雪会洗涤一切。',
    masterySkill: '自然震慑 (专三)',
    moduleLevel: 3
  },
  // 69. 崖心 (Cliffheart)
  {
    id: 'cliffheart',
    name: 'Cliffheart',
    cnName: '崖心',
    rarity: 5,
    classType: 'Specialist',
    faction: 'Kjerag',
    color: '#06b6d4',
    avatar: createOperatorAvatarSVG('#06b6d4', '#e2e8f0', '#0891b2', 'LEOPARD_EARS'),
    quote: '抓钩发射！无论多么险峻的山峰，我都能翻过去！',
    masterySkill: '束缚之链 (专三)',
    moduleLevel: 3
  },
  // 70. 涤火杰西卡 (Jessica Alter)
  {
    id: 'jessica_alter',
    name: 'Jessica the Liberated',
    cnName: '涤火杰西卡',
    rarity: 6,
    classType: 'Defender',
    faction: 'Columbia',
    color: '#d97706',
    avatar: createOperatorAvatarSVG('#d97706', '#fef3c7', '#b45309', 'CAT_EARS', 'SHIELD'),
    quote: '黑钢警长杰西卡！我不再是那个只会哭泣的女孩了，护盾就位！',
    masterySkill: '机动盾击 (专三)',
    moduleLevel: 3
  },
  // 71. 刻俄柏 (Ceobe)
  {
    id: 'ceobe',
    name: 'Ceobe',
    cnName: '刻俄柏',
    rarity: 6,
    classType: 'Caster',
    faction: 'Rhodes Island',
    color: '#f97316',
    avatar: createOperatorAvatarSVG('#f97316', '#fed7aa', '#ea580c', 'DOG_EARS'),
    quote: '博士！小刻找到好多武器！这把刀很热，那把枪很重，还有好吃的蜜饼吗？',
    masterySkill: '“很热的刀” (专三)',
    moduleLevel: 3
  },
  // 72. 黑 (Schwarz)
  {
    id: 'schwarz',
    name: 'Schwarz',
    cnName: '黑',
    rarity: 6,
    classType: 'Sniper',
    faction: 'Siesta',
    color: '#18181b',
    avatar: createOperatorAvatarSVG('#18181b', '#0f172a', '#0284c7', 'CAT_EARS', 'BERET'),
    quote: '大小姐的安全高于一切。重弩已瞄准破甲线，战术终结！',
    masterySkill: '暮眼锐瞳 (专三)',
    moduleLevel: 3
  },
  // 73. 安洁莉娜 (Angelina)
  {
    id: 'angelina',
    name: 'Angelina',
    cnName: '安洁莉娜',
    rarity: 6,
    classType: 'Supporter',
    faction: 'Rhodes Island',
    color: '#f59e0b',
    avatar: createOperatorAvatarSVG('#f59e0b', '#fed7aa', '#ea580c', 'FOX_EARS'),
    quote: '信使安洁莉娜送货上门！反重力模式开启，让敌人全部飘起来吧！',
    masterySkill: '反重力模式 (专三)',
    moduleLevel: 3
  },
  // 74. 异客 (Passenger)
  {
    id: 'passenger',
    name: 'Passenger',
    cnName: '异客',
    rarity: 6,
    classType: 'Caster',
    faction: 'Columbia',
    color: '#06b6d4',
    avatar: createOperatorAvatarSVG('#06b6d4', '#e2e8f0', '#0891b2', 'BIRD_WINGS'),
    quote: '伊巴特荒原的雷霆为我驱动。神之手所至，辉煌裂变，瞬息灰飞烟灭。',
    masterySkill: '辉煌裂变 (专三)',
    moduleLevel: 3
  },
  // 75. 傀影 (Phantom)
  {
    id: 'phantom',
    name: 'Phantom',
    cnName: '傀影',
    rarity: 6,
    classType: 'Specialist',
    faction: 'Rhodes Island',
    color: '#7c3aed',
    avatar: createOperatorAvatarSVG('#7c3aed', '#1e1b4b', '#a855f7', 'CAT_EARS', 'DARK_HALO'),
    quote: '虚影随行，黑夜交织。猩红剧团的帷幕拉开，该由我来献上次幕了。',
    masterySkill: '夜幕低垂 (专三)',
    moduleLevel: 3
  },
  // 76. 温蒂 (Weedy)
  {
    id: 'weedy',
    name: 'Weedy',
    cnName: '温蒂',
    rarity: 6,
    classType: 'Specialist',
    faction: 'Rhodes Island',
    color: '#10b981',
    avatar: createOperatorAvatarSVG('#10b981', '#a7f3d0', '#059669', 'DRAGON_HORNS', 'WATER_DROP'),
    quote: '水炮压力加压至最高！卫生与整洁第一，所有不卫生的敌人都要冲走！',
    masterySkill: '液氮高压水炮 (专三)',
    moduleLevel: 3
  },
  // 77. 红 (Projekt Red)
  {
    id: 'projekt_red',
    name: 'Projekt Red',
    cnName: '红',
    rarity: 5,
    classType: 'Specialist',
    faction: 'Rhodes Island',
    color: '#dc2626',
    avatar: createOperatorAvatarSVG('#dc2626', '#f8fafc', '#ef4444', 'WOLF_EARS', 'BERET'),
    quote: '红想摸尾巴……狼群的气味在这里消失了，处决开始。',
    masterySkill: '狼群 (专三)',
    moduleLevel: 3
  },
  // 78. 弑君者 (Crownslayer - 自机)
  {
    id: 'crownslayer',
    name: 'Crownslayer',
    cnName: '弑君者',
    rarity: 6,
    classType: 'Specialist',
    faction: 'Siracusa',
    color: '#475569',
    avatar: createOperatorAvatarSVG('#475569', '#1e293b', '#94a3b8', 'WOLF_EARS'),
    quote: '烟雾已散去，仇恨已释怀。博士，现在的我是为了保护新的伙伴而潜行。',
    masterySkill: '影匿绝杀 (专三)',
    moduleLevel: 3
  },
  // 79. 埃拉 (Ela)
  {
    id: 'ela',
    name: 'Ela',
    cnName: '埃拉',
    rarity: 6,
    classType: 'Specialist',
    faction: 'Rhodes Island',
    color: '#10b981',
    avatar: createOperatorAvatarSVG('#10b981', '#34d399', '#059669', 'CAT_EARS', 'HEADPHONE'),
    quote: '雷鸣地雷布设完成！彩虹小队埃拉，让敌人在震撼中瘫痪吧！',
    masterySkill: '雷鸣爆轰 (专三)',
    moduleLevel: 3
  },
  // 80. 灰烬 (Ash)
  {
    id: 'ash',
    name: 'Ash',
    cnName: '灰烬',
    rarity: 6,
    classType: 'Sniper',
    faction: 'Rhodes Island',
    color: '#0284c7',
    avatar: createOperatorAvatarSVG('#0284c7', '#b45309', '#0369a1', 'CAT_EARS', 'GLASSES'),
    quote: '突击霰弹枪与闪光弹就绪。彩虹小队队长Ash，坚守战术纪律！',
    masterySkill: '突击战术 (专三)',
    moduleLevel: 3
  },
  // 81. 白面鸮 (Ptilopsis)
  {
    id: 'ptilopsis',
    name: 'Ptilopsis',
    cnName: '白面鸮',
    rarity: 5,
    classType: 'Medic',
    faction: 'Rhine Lab',
    color: '#06b6d4',
    avatar: createOperatorAvatarSVG('#06b6d4', '#e2e8f0', '#0891b2', 'FEATHER_EARS', 'HEADPHONE'),
    quote: '系统自检正常。正在为博士同步技力光环与生命体征监测。',
    masterySkill: '脑啡肽 (专三)',
    moduleLevel: 3
  },
  // 82. 星熊 (Hoshiguma)
  {
    id: 'hoshiguma',
    name: 'Hoshiguma',
    cnName: '星熊',
    rarity: 6,
    classType: 'Defender',
    faction: 'Lungmen',
    color: '#15803d',
    avatar: createOperatorAvatarSVG('#15803d', '#166534', '#22c55e', 'DEVIL_HORNS'),
    quote: '般若盾在此！龙门近卫局星熊，愿做博士最坚实的铜墙铁壁！',
    masterySkill: '力挽狂澜 (专三)',
    moduleLevel: 3
  },
  // 83. 极境 (Elysium)
  {
    id: 'elysium',
    name: 'Elysium',
    cnName: '极境',
    rarity: 5,
    classType: 'Vanguard',
    faction: 'Iberia',
    color: '#0284c7',
    avatar: createOperatorAvatarSVG('#0284c7', '#f8fafc', '#0369a1', 'FEATHER_EARS', 'FLAG'),
    quote: '罗德岛最帅先锋极境登场！通讯信标已校准，狙击干员们，看我的信号！',
    masterySkill: '聆听 (专三)',
    moduleLevel: 3
  },
  // 84. 水月 (Mizuki)
  {
    id: 'mizuki',
    name: 'Mizuki',
    cnName: '水月',
    rarity: 6,
    classType: 'Specialist',
    faction: 'Rhodes Island',
    color: '#0ea5e9',
    avatar: createOperatorAvatarSVG('#0ea5e9', '#0284c7', '#38bdf8', 'FISH_FIN', 'WATER_DROP'),
    quote: '水母的伞盖软绵绵的～如果能让大家都吃得饱饱的，那就最棒了！',
    masterySkill: '触手蔓生 (专三)',
    moduleLevel: 3
  },
  // 85. 阿 (Aak)
  {
    id: 'aak',
    name: 'Aak',
    cnName: '阿',
    rarity: 6,
    classType: 'Specialist',
    faction: 'Yan',
    color: '#10b981',
    avatar: createOperatorAvatarSVG('#10b981', '#fef08a', '#059669', 'LEOPARD_EARS', 'GLASSES'),
    quote: '嘿嘿，来一针兴奋剂试试？别怕疼，保证下一秒战力爆表！',
    masterySkill: '“爆发剂·榴莲味” (专三)',
    moduleLevel: 3
  },
  // 86. 莫斯提马 (Mostima)
  {
    id: 'mostima',
    name: 'Mostima',
    cnName: '莫斯提马',
    rarity: 6,
    classType: 'Caster',
    faction: 'Penguin Logistics',
    color: '#3b82f6',
    avatar: createOperatorAvatarSVG('#3b82f6', '#1e40af', '#60a5fa', 'DEVIL_HORNS', 'DARK_HALO'),
    quote: '时间的洪流奔涌不息。无论走到哪里，企鹅物流永远是我的归宿。',
    masterySkill: '序时残响 (专三)',
    moduleLevel: 3
  },
  // 87. 菲亚梅塔 (Fiammetta)
  {
    id: 'fiammetta',
    name: 'Fiammetta',
    cnName: '菲亚梅塔',
    rarity: 6,
    classType: 'Sniper',
    faction: 'Laterano',
    color: '#dc2626',
    avatar: createOperatorAvatarSVG('#dc2626', '#fca5a5', '#991b1b', 'FEATHER_EARS', 'HALO'),
    quote: '苦难陈述者、灼热烈焰、苦难苦难……别叫我那些外号！迫击炮，无间断轰炸！',
    masterySkill: '烈焰洗礼 (专三)',
    moduleLevel: 3
  },
  // 88. 圣约送葬人 (Executor Alter)
  {
    id: 'executor_alter',
    name: 'Executor the Ex Foedere',
    cnName: '圣约送葬人',
    rarity: 6,
    classType: 'Guard',
    faction: 'Laterano',
    color: '#64748b',
    avatar: createOperatorAvatarSVG('#64748b', '#cbd5e1', '#334155', 'CAT_EARS', 'HALO'),
    quote: '依据公证所第38条特别契约，我将在此执行律法清算。双铳就绪。',
    masterySkill: '近身肃清 (专三)',
    moduleLevel: 3
  },
  // 89. 空弦 (Archetto)
  {
    id: 'archetto',
    name: 'Archetto',
    cnName: '空弦',
    rarity: 6,
    classType: 'Sniper',
    faction: 'Kazimierz',
    color: '#3b82f6',
    avatar: createOperatorAvatarSVG('#3b82f6', '#93c5fd', '#1d4ed8', 'FEATHER_EARS', 'CROWN'),
    quote: '兰登修道院的箭术传承绝不会断绝！为了修道院的啤酒与重建，放箭！',
    masterySkill: '箭雨连发 (专三)',
    moduleLevel: 3
  },
  // 90. 焰尾 (Flametail)
  {
    id: 'flametail',
    name: 'Flametail',
    cnName: '焰尾',
    rarity: 6,
    classType: 'Vanguard',
    faction: 'Kazimierz',
    color: '#f97316',
    avatar: createOperatorAvatarSVG('#f97316', '#ea580c', '#c2410c', 'FOX_EARS'),
    quote: '红松骑士团团长索娜在此！闪避与剑舞，卡西米尔的感染者骑士绝不屈服！',
    masterySkill: '焰尾剑舞 (专三)',
    moduleLevel: 3
  },
  // 91. 仇白 (Qiubai)
  {
    id: 'qiubai',
    name: 'Qiubai',
    cnName: '仇白',
    rarity: 6,
    classType: 'Guard',
    faction: 'Yan',
    color: '#059669',
    avatar: createOperatorAvatarSVG('#059669', '#10b981', '#047857', 'CAT_EARS', 'INK'),
    quote: '秋水长天，一剑霜寒。江湖恩怨难分明，但博士的命令自当遵从。',
    masterySkill: '问霜 (专三)',
    moduleLevel: 3
  },
  // 92. 左乐 (Zuo Le)
  {
    id: 'zuole',
    name: 'Zuo Le',
    cnName: '左乐',
    rarity: 6,
    classType: 'Guard',
    faction: 'Yan',
    color: '#dc2626',
    avatar: createOperatorAvatarSVG('#dc2626', '#18181b', '#ef4444', 'CAT_EARS'),
    quote: '大理寺秉公执法！此身化刃，断奸佞，护苍生，决不后退半步！',
    masterySkill: '“一意孤行” (专三)',
    moduleLevel: 3
  },
  // 93. 莱伊 (Ray)
  {
    id: 'ray',
    name: 'Ray',
    cnName: '莱伊',
    rarity: 6,
    classType: 'Sniper',
    faction: 'Rim Billiton',
    color: '#f59e0b',
    avatar: createOperatorAvatarSVG('#f59e0b', '#fed7aa', '#b45309', 'BUNNY_EARS', 'GLASSES'),
    quote: '雷姆必拓的巡林猎手已就位。小帮手沙包锁定距离，超视距狙击！',
    masterySkill: '精准猎杀 (专三)',
    moduleLevel: 3
  },
  // 94. 桃金娘 (Myrtle)
  {
    id: 'myrtle',
    name: 'Myrtle',
    cnName: '桃金娘',
    rarity: 4,
    classType: 'Vanguard',
    faction: 'Rhodes Island',
    color: '#f43f5e',
    avatar: createOperatorAvatarSVG('#f43f5e', '#fecdd3', '#e11d48', 'CAT_EARS', 'APPLES'),
    quote: '太阳出来啦！白旗摇一摇，全员技力快速恢复！博士，大将军来支援你啦！',
    masterySkill: '治愈之翼 (专三)',
    moduleLevel: 3
  },
  // 95. 多萝西 (Dorothy)
  {
    id: 'dorothy',
    name: 'Dorothy',
    cnName: '多萝西',
    rarity: 6,
    classType: 'Specialist',
    faction: 'Rhine Lab',
    color: '#8b5cf6',
    avatar: createOperatorAvatarSVG('#8b5cf6', '#ddd6fe', '#7c3aed', 'ELF_EARS', 'GLASSES'),
    quote: '共鸣地雷已埋设完毕。在梦想与现实的交界处，科学会保护大家。',
    masterySkill: '谐振地雷 (专三)',
    moduleLevel: 3
  },
  // 96. 琳琅诗怀雅 (Swire Alter)
  {
    id: 'swire_alter',
    name: 'Swire the Elegant Wit',
    cnName: '琳琅诗怀雅',
    rarity: 6,
    classType: 'Specialist',
    faction: 'Lungmen',
    color: '#fbbf24',
    avatar: createOperatorAvatarSVG('#fbbf24', '#ea580c', '#d97706', 'LEOPARD_EARS', 'BERET'),
    quote: 'Gaoooo！有钱真的可以为所欲为哦～香槟塔与无人机，全部给我砸上去！',
    masterySkill: '千金一掷 (专三)',
    moduleLevel: 3
  },
  // 97. 早露 (Rosa)
  {
    id: 'rosa',
    name: 'Rosa',
    cnName: '早露',
    rarity: 6,
    classType: 'Sniper',
    faction: 'Ursus',
    color: '#60a5fa',
    avatar: createOperatorAvatarSVG('#60a5fa', '#f8fafc', '#2563eb', 'BEAR_EARS', 'BERET'),
    quote: '乌萨斯贵族的荣光在重型攻城弩中重铸。骨针与钢索，束缚住最沉重的猎物！',
    masterySkill: '雪崩击 (专三)',
    moduleLevel: 3
  },
  // 98. 凛冬 (Zima)
  {
    id: 'zima',
    name: 'Zima',
    cnName: '凛冬',
    rarity: 5,
    classType: 'Vanguard',
    faction: 'Ursus',
    color: '#dc2626',
    avatar: createOperatorAvatarSVG('#dc2626', '#334155', '#ef4444', 'BEAR_EARS'),
    quote: '丢人，给我退出战场！乌萨斯学生自治团，冲锋！',
    masterySkill: '乌萨斯怒吼 (专三)',
    moduleLevel: 3
  },
  // 99. 耶拉 (Kjera)
  {
    id: 'kjera',
    name: 'Kjera',
    cnName: '耶拉',
    rarity: 5,
    classType: 'Caster',
    faction: 'Kjerag',
    color: '#38bdf8',
    avatar: createOperatorAvatarSVG('#38bdf8', '#cbd5e1', '#0284c7', 'ELF_EARS', 'WATER_DROP'),
    quote: '雪山的大神在注视着你们哦。今天初雪小姐也很有精神呢。',
    masterySkill: '雪境恩赐 (专三)',
    moduleLevel: 3
  },
  // 100. 苇草 (Reed 原版先锋)
  {
    id: 'reed',
    name: 'Reed',
    cnName: '苇草',
    rarity: 5,
    classType: 'Vanguard',
    faction: 'Victoria',
    color: '#ea580c',
    avatar: createOperatorAvatarSVG('#ea580c', '#fed7aa', '#c2410c', 'DRAGON_HORNS'),
    quote: '影子里的火种不会熄灭。长枪所指，灵魂将得到安歇。',
    masterySkill: '灵魂汲取 (专三)',
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
    description: '维什戴尔、洛戈斯、荒芜拉普兰德、玛恩纳、锏、黍、提丰、史尔特尔',
    tag: '3x3 幻神组',
    gridSize: '3x3',
    operators: ["Wis'adel", 'Logos', 'Lappland the Decadenza', 'Mlynar', 'Degenbrecher', 'Shu', 'Typhon', 'Surtr', 'Ines'],
    prompt: `A 3x3 sprite sheet of super deformed chibi Arknights meta characters, including Wis'adel with cute ghost cannons, Logos with banshee quill, Lappland the Decadenza with wild white hair, Mlynar reading newspaper casually, Degenbrecher with double swords, Shu with golden wheat halo, Typhon with giant bow, and Ines with shadow blade. Kawaii game avatar style, flat color, clean lineart, soft cell shading, cute proportions, plain white background, spaced layout for easy cutout, 4k resolution, sticker pack style`,
    negativePrompt: `dark background, noisy artifacts, realistic proportions, ugly faces, bad hands, merged characters`,
    params: `--ar 1:1 --v 6.1 --q 2`
  },
  {
    id: 'sui_siblings',
    title: '大荒岁家神明同堂 (Sui Siblings 2x2)',
    description: '重岳、令、黍、夕、年 五兄妹全家福',
    tag: '2x2 岁家组',
    gridSize: '2x2',
    operators: ['Chongyue', 'Ling', 'Shu', 'Dusk', 'Nian'],
    prompt: `A 2x2 grid sticker sheet of chibi Arknights Sui siblings: Chongyue in martial arts stance, Ling drinking wine with blue dragon horn, Shu holding golden wheat stalks, and Dusk painting with Chinese ink splashes. Oriental fantasy aesthetics, cute SD proportions, crisp vectors, clean white background, evenly spaced quadrants`,
    negativePrompt: `blurry, low resolution, messy border, complex realistic painting`,
    params: `--ar 1:1 --v 6.1`
  },
  {
    id: 'penguin_logistics',
    title: '企鹅物流与龙门近卫 (Penguin Logistics 2x2)',
    description: '德克萨斯、能天使吃苹果派、莫斯提马、荒芜拉狗',
    tag: '2x2 企鹅物流',
    gridSize: '2x2',
    operators: ['Texas', 'Exusiai', 'Mostima', 'Lappland'],
    prompt: `A 2x2 grid sticker sheet of chibi Arknights Penguin Logistics crew: Exusiai happily eating an apple pie with glowing halo, Texas holding Pocky stick, Mostima with dark halo, and Lappland laughing with twin swords. Cute chibi 2D anime illustration, thick lineart, vivid colors, clean white background, 4 evenly separated quadrants, perfect for sticker cutout`,
    negativePrompt: `blurry, realistic, low resolution, messy grid, dark gradient background`,
    params: `--ar 1:1 --v 6.1`
  },
  {
    id: 'abyssal_hunters',
    title: '深海猎人与伊比利亚 (Abyssal & Iberia 2x2)',
    description: '乌尔比安破浪重锚、歌蕾蒂娅高速挥戟、斯卡蒂抱虎鲸抱枕、幽灵鲨狂笑',
    tag: '2x2 深海组',
    gridSize: '2x2',
    operators: ['Ulpian', 'Gladiia', 'Skadi Alter', 'Specter Alter', 'Thorns'],
    prompt: `A 2x2 grid of chibi Arknights Abyssal Hunters: Ulpian holding heavy anchor, Gladiia with swordfish hat, Skadi holding a cute plush orca, and Specter spinning a toy buzzsaw with dizzy cute eyes. High contrast, clean vector style, super kawaii SD proportions, isolated on pure white background, distinct margins between 4 characters`,
    negativePrompt: `photorealistic, complex scenery, overlapping, dark borders`,
    params: `--ar 1:1 --v 6.1`
  }
];
