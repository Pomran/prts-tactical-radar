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
    | 'DEER_HORNS'
    | 'ROBOT_EARS'
    | 'JERBOA_EARS'
    | 'HORNS'
    | 'HUMAN',
  accessory: string = '',
  badgeText: string = '6★'
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
      : features === 'SHEEP_HORNS' || features === 'HORNS'
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
      : features === 'ROBOT_EARS'
      ? `<rect x="16" y="32" width="10" height="18" rx="2" fill="#94a3b8" stroke="#38bdf8" stroke-width="1.5"/>
         <circle cx="21" cy="41" r="2.5" fill="#38bdf8" filter="url(#glow)"/>
         <rect x="74" y="32" width="10" height="18" rx="2" fill="#94a3b8" stroke="#38bdf8" stroke-width="1.5"/>
         <circle cx="79" cy="41" r="2.5" fill="#38bdf8" filter="url(#glow)"/>`
      : features === 'JERBOA_EARS'
      ? `<ellipse cx="27" cy="18" rx="10" ry="16" fill="${hairColor}" stroke="#1e293b" stroke-width="1.5"/>
         <ellipse cx="27" cy="18" rx="6" ry="11" fill="#fed7aa" opacity="0.6"/>
         <ellipse cx="73" cy="18" rx="10" ry="16" fill="${hairColor}" stroke="#1e293b" stroke-width="1.5"/>
         <ellipse cx="73" cy="18" rx="6" ry="11" fill="#fed7aa" opacity="0.6"/>`
      : features === 'HUMAN'
      ? `<circle cx="23" cy="48" r="4" fill="#ffe4d6" stroke="#fb923c" stroke-width="1"/>
         <circle cx="77" cy="48" r="4" fill="#ffe4d6" stroke="#fb923c" stroke-width="1"/>`
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
      : accessory === 'EVOKER'
      ? `<circle cx="78" cy="68" r="10" fill="#0284c7" opacity="0.4" filter="url(#glow)"/>
         <rect x="68" y="65" width="14" height="5" rx="1" fill="#cbd5e1" stroke="#0284c7" stroke-width="1"/>
         <rect x="74" y="69" width="4" height="8" rx="1" fill="#1e293b" stroke="#0284c7" stroke-width="1"/>
         <circle cx="50" cy="10" r="5" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3,2" filter="url(#glow)"/>`
      : accessory === 'AIGIS_BAND'
      ? `<path d="M 24 33 Q 50 22 76 33" stroke="#ef4444" stroke-width="3" fill="none"/>
         <circle cx="22" cy="39" r="3" fill="#38bdf8" filter="url(#glow)"/>
         <circle cx="78" cy="39" r="3" fill="#38bdf8" filter="url(#glow)"/>`
      : accessory === 'SEES_BOW'
      ? `<circle cx="50" cy="71" r="3" fill="#f43f5e"/>
         <polygon points="43,71 47,68 47,74" fill="#f43f5e"/>
         <polygon points="57,71 53,68 53,74" fill="#f43f5e"/>
         <path d="M 76 16 Q 84 30 78 44" stroke="#f43f5e" stroke-width="2" fill="none"/>`
      : accessory === 'DAGGER'
      ? `<rect x="34" y="62" width="28" height="3" rx="1" fill="#e2e8f0" stroke="#475569" stroke-width="1"/>
         <polygon points="62,60.5 70,63.5 62,66.5" fill="#cbd5e1"/>
         <rect x="30" y="61.5" width="6" height="4" rx="1" fill="#7f1d1d"/>
         <circle cx="50" cy="73" r="3" fill="#ef4444" filter="url(#glow)"/>`
      : accessory === 'WHITE_FLAG'
      ? `<line x1="74" y1="12" x2="74" y2="40" stroke="#f8fafc" stroke-width="2"/>
         <polygon points="74,12 88,18 74,24" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
         <circle cx="28" cy="22" r="5" fill="#eab308" filter="url(#glow)"/>
         <path d="M 28 17 Q 30 14 32 15" stroke="#15803d" stroke-width="1.2" fill="none"/>`
      : accessory === 'SUSHI_KNIFE'
      ? `<rect x="72" y="16" width="12" height="18" rx="1" fill="#e2e8f0" stroke="#475569" stroke-width="1.2"/>
         <rect x="76" y="34" width="4" height="8" rx="1" fill="#78350f"/>`
      : accessory === 'BASEBALL_CAP'
      ? `<path d="M 24 28 C 28 14 72 14 76 28 Z" fill="#0284c7"/>
         <path d="M 20 28 Q 50 22 80 28" stroke="#38bdf8" stroke-width="2.5" fill="none"/>`
      : accessory === 'BAMBOO_HAT'
      ? `<polygon points="50,12 18,28 82,28" fill="#d97706" stroke="#92400e" stroke-width="1.5"/>
         <line x1="50" y1="12" x2="50" y2="28" stroke="#78350f" stroke-width="1"/>`
      : accessory === 'SYRINGE'
      ? `<rect x="74" y="16" width="6" height="14" rx="1" fill="#bae6fd" stroke="#0284c7" stroke-width="1"/>
         <line x1="77" y1="10" x2="77" y2="16" stroke="#94a3b8" stroke-width="1.5"/>
         <rect x="75" y="20" width="4" height="8" fill="#ef4444"/>`
      : ''
  }

  <!-- PRTS Tactical Badge in corner -->
  <rect x="64" y="71" width="30" height="21" rx="3" fill="#0b1320" stroke="${themeColor}" stroke-width="1.2"/>
  <text x="79" y="85" font-family="monospace" font-size="${badgeText.length > 2 ? '7.5' : '9'}" fill="${themeColor}" text-anchor="middle" font-weight="bold">${badgeText}</text>
</svg>
`)}`;
};

/**
 * 虎狼丸专属高精白柴犬形象 SVG 头像渲染器
 * 忠实还原《Persona 3 Reload》白柴、豆豆眉、口衔战术短刃、S.E.E.S.红色战术背带与召魔器装置
 */
export const createKoromaruAvatarSVG = (): string => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <!-- Dark Hour P3R Cobalt/Crimson Radial Gradient -->
    <radialGradient id="koroBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="55%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    
    <!-- Tactical Blade Metallic Sheen Gradient -->
    <linearGradient id="bladeMetal" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="35%" stop-color="#e2e8f0"/>
      <stop offset="50%" stop-color="#ffffff"/>
      <stop offset="75%" stop-color="#cbd5e1"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>

    <!-- Cerberus Crimson & Nether Fire Gradient -->
    <linearGradient id="cerberusFlame" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#7f1d1d"/>
      <stop offset="40%" stop-color="#dc2626"/>
      <stop offset="80%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#fca5a5"/>
    </linearGradient>

    <!-- Alert Shiba Amber Eyes -->
    <radialGradient id="shibaEye" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#f87171"/>
      <stop offset="35%" stop-color="#dc2626"/>
      <stop offset="75%" stop-color="#991b1b"/>
      <stop offset="100%" stop-color="#450a0a"/>
    </radialGradient>

    <!-- Inner Shiba Ear Gradient -->
    <linearGradient id="earInner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fecdd3"/>
      <stop offset="65%" stop-color="#fda4af"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>

    <!-- P3R Neon Glow Filter -->
    <filter id="p3rGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1" stdDeviation="2.5" flood-color="#ef4444" flood-opacity="0.8"/>
    </filter>
    <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="#00e5ff" flood-opacity="0.9"/>
    </filter>
  </defs>

  <!-- Outer Tactical Combat Ring (P3R Theme) -->
  <circle cx="50" cy="50" r="48" fill="url(#koroBg)" stroke="#ef4444" stroke-width="2.2" filter="url(#p3rGlow)"/>
  <circle cx="50" cy="50" r="44.5" fill="none" stroke="#00e5ff" stroke-width="0.8" stroke-dasharray="4,2.5" opacity="0.6"/>
  
  <!-- Clock ticks for Dark Hour midnight -->
  <line x1="50" y1="3" x2="50" y2="7" stroke="#00e5ff" stroke-width="1.5"/>
  <line x1="97" y1="50" x2="93" y2="50" stroke="#00e5ff" stroke-width="1.5"/>
  <line x1="50" y1="97" x2="50" y2="93" stroke="#00e5ff" stroke-width="1.5"/>
  <line x1="3" y1="50" x2="7" y2="50" stroke="#00e5ff" stroke-width="1.5"/>

  <!-- ==================== SHIBA INU ANATOMY ==================== -->

  <!-- Shiba Ears (Pointed, alert, with fluffy tufts) -->
  <!-- Left Ear -->
  <g>
    <path d="M 21 38 L 15 13 C 19 9 32 15 37 24 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
    <path d="M 22 33 L 18 17 C 22 14 30 19 33 25 Z" fill="url(#earInner)"/>
    <!-- Fluff in ear base -->
    <path d="M 25 31 Q 23 27 28 29 Q 25 24 31 27" stroke="#ffffff" stroke-width="1.2" fill="none"/>
  </g>

  <!-- Right Ear -->
  <g>
    <path d="M 79 38 L 85 13 C 81 9 68 15 63 24 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
    <path d="M 78 33 L 82 17 C 78 14 70 19 67 25 Z" fill="url(#earInner)"/>
    <!-- Fluff in ear base -->
    <path d="M 75 31 Q 77 27 72 29 Q 75 24 69 27" stroke="#ffffff" stroke-width="1.2" fill="none"/>
  </g>

  <!-- Fluffy White Chest Fur Base -->
  <path d="M 33 66 C 24 72 22 84 28 95 C 42 98 58 98 72 95 C 78 84 76 72 67 66 Z" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>

  <!-- Shiba Head & Fluffy Cheeks -->
  <path d="M 30 25 C 18 29 15 46 22 58 C 25 64 34 68 41 68 C 46 68 48 69 50 69 C 52 69 54 68 59 68 C 66 68 75 64 78 58 C 85 46 82 29 70 25 C 60 21 40 21 30 25 Z" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2"/>

  <!-- Distinct Shiba Cheek Fur Tufts -->
  <path d="M 19 48 Q 13 52 18 56 Q 14 59 23 61" stroke="#cbd5e1" stroke-width="1.2" fill="#ffffff"/>
  <path d="M 81 48 Q 87 52 82 56 Q 86 59 77 61" stroke="#cbd5e1" stroke-width="1.2" fill="#ffffff"/>

  <!-- Forehead Center Soft Fur Texture -->
  <path d="M 50 24 L 50 36" stroke="#e2e8f0" stroke-width="1.2" stroke-linecap="round"/>
  <path d="M 47 28 L 47 34" stroke="#f1f5f9" stroke-width="0.8" stroke-linecap="round"/>
  <path d="M 53 28 L 53 34" stroke="#f1f5f9" stroke-width="0.8" stroke-linecap="round"/>

  <!-- Iconic Shiba "Mame-Mayu" (Adorable White Brow Spots) -->
  <ellipse cx="37" cy="38" rx="4" ry="2.6" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
  <ellipse cx="63" cy="38" rx="4" ry="2.6" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>

  <!-- Alert, Loyal & Heroic Shiba Eyes -->
  <!-- Left Eye -->
  <g>
    <path d="M 31 46 Q 37 41 43 45" stroke="#0f172a" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <ellipse cx="38" cy="46" rx="4.5" ry="4.2" fill="url(#shibaEye)"/>
    <circle cx="38" cy="46" r="2.2" fill="#0f172a"/>
    <!-- Catchlights -->
    <circle cx="36.5" cy="44.2" r="1.5" fill="#ffffff"/>
    <circle cx="39.8" cy="47.5" r="0.8" fill="#ffffff"/>
    <path d="M 33 48 Q 38 51 42 47" stroke="#0f172a" stroke-width="1" fill="none"/>
  </g>

  <!-- Right Eye -->
  <g>
    <path d="M 57 45 Q 63 41 69 46" stroke="#0f172a" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <ellipse cx="62" cy="46" rx="4.5" ry="4.2" fill="url(#shibaEye)"/>
    <circle cx="62" cy="46" r="2.2" fill="#0f172a"/>
    <!-- Catchlights -->
    <circle cx="60.5" cy="44.2" r="1.5" fill="#ffffff"/>
    <circle cx="63.8" cy="47.5" r="0.8" fill="#ffffff"/>
    <path d="M 58 47 Q 62 51 67 48" stroke="#0f172a" stroke-width="1" fill="none"/>
  </g>

  <!-- Rosy Cute Blush under eyes -->
  <ellipse cx="29" cy="53" rx="3.5" ry="1.8" fill="#fda4af" opacity="0.6"/>
  <ellipse cx="71" cy="53" rx="3.5" ry="1.8" fill="#fda4af" opacity="0.6"/>

  <!-- ==================== SHIBA MUZZLE & SNOUT ==================== -->
  <ellipse cx="50" cy="56" rx="13" ry="9.5" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>

  <!-- Cute Wet Black Nose -->
  <path d="M 46 51 C 47 48.5 53 48.5 54 51 C 54 54.5 51 56.5 50 56.5 C 49 56.5 46 54.5 46 51 Z" fill="#0f172a"/>
  <!-- Nose Highlight -->
  <ellipse cx="49" cy="50.8" rx="1.6" ry="0.9" fill="#ffffff" opacity="0.85"/>

  <!-- Whisker dots -->
  <circle cx="43" cy="57" r="0.6" fill="#94a3b8"/>
  <circle cx="41" cy="59" r="0.6" fill="#94a3b8"/>
  <circle cx="57" cy="57" r="0.6" fill="#94a3b8"/>
  <circle cx="59" cy="59" r="0.6" fill="#94a3b8"/>

  <!-- ==================== TACTICAL DAGGER IN MOUTH ==================== -->
  <!-- Blade Hilt / Guard on Left -->
  <g>
    <!-- Pommel ring with tactical red tassel -->
    <circle cx="16" cy="62" r="3.2" fill="none" stroke="#64748b" stroke-width="1.4"/>
    <path d="M 14 65 C 12 70 15 74 13 78" stroke="#ef4444" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    
    <!-- Grip with wrapped cords -->
    <rect x="19" y="59" width="22" height="6" rx="1.5" fill="#0f172a" stroke="#334155" stroke-width="0.8"/>
    <line x1="23" y1="59" x2="25" y2="65" stroke="#ef4444" stroke-width="1.2"/>
    <line x1="28" y1="59" x2="30" y2="65" stroke="#ef4444" stroke-width="1.2"/>
    <line x1="33" y1="59" x2="35" y2="65" stroke="#ef4444" stroke-width="1.2"/>
    <line x1="38" y1="59" x2="40" y2="65" stroke="#ef4444" stroke-width="1.2"/>

    <!-- Guard -->
    <rect x="41" y="56.5" width="3" height="11" rx="1" fill="#334155" stroke="#94a3b8" stroke-width="0.8"/>
  </g>

  <!-- Dagger Blade extending to right -->
  <g>
    <path d="M 44 58 L 83 57 L 88 61 L 80 65 L 44 64 Z" fill="url(#bladeMetal)" stroke="#334155" stroke-width="1"/>
    <!-- Blade center ridge line (Glint) -->
    <line x1="44" y1="61" x2="84" y2="59.5" stroke="#ffffff" stroke-width="1.2"/>
    <!-- Blade tip highlight sparkle -->
    <polygon points="83,57 88,61 80,61" fill="#ffffff"/>
    
    <!-- Cerberus Crimson Flame Aura curling off blade -->
    <path d="M 74 54 C 78 49 84 51 81 45 C 87 49 87 55 84 60 Z" fill="url(#cerberusFlame)" opacity="0.9" filter="url(#p3rGlow)"/>
    <path d="M 64 56 C 68 51 72 52 70 48 C 75 51 74 56 72 59 Z" fill="#8b5cf6" opacity="0.75"/>
    <circle cx="85" cy="46" r="1" fill="#fca5a5"/>
    <circle cx="89" cy="55" r="1.2" fill="#ef4444"/>
  </g>

  <!-- Muzzle overlapping the dagger (firm bite grip) -->
  <path d="M 46 59 C 48 62 52 62 54 59" stroke="#0f172a" stroke-width="1.6" fill="#ffffff" stroke-linecap="round"/>
  <path d="M 44 60 Q 50 63 56 60" stroke="#cbd5e1" stroke-width="0.8" fill="none"/>

  <!-- ==================== S.E.E.S. TACTICAL HARNESS & EVOKER ==================== -->
  <!-- S.E.E.S. Signature Crimson Combat Strap -->
  <g>
    <path d="M 28 75 C 36 73 64 73 72 75 L 75 87 C 64 89 36 89 25 87 Z" fill="#dc2626" stroke="#991b1b" stroke-width="1"/>
    
    <!-- Top & Bottom Edge Accents -->
    <path d="M 28 75 C 36 73 64 73 72 75" stroke="#ef4444" stroke-width="1" fill="none"/>
    <path d="M 25 87 C 36 89 64 89 75 87" stroke="#b91c1c" stroke-width="1" fill="none"/>

    <!-- Central S.E.E.S. Evoker Mini Module / Buckle -->
    <rect x="45" y="74" width="10" height="13" rx="2" fill="#1e293b" stroke="#94a3b8" stroke-width="1"/>
    <rect x="47" y="76" width="6" height="4" rx="1" fill="#0f172a"/>
    <!-- Cyan Evoker Active Power LED -->
    <circle cx="50" cy="83" r="1.8" fill="#00e5ff" filter="url(#cyanGlow)"/>

    <!-- "SEES" Armband Text -->
    <text x="36" y="82.5" font-family="sans-serif" font-weight="900" font-size="5.2" fill="#ffffff" letter-spacing="0.5" text-anchor="middle">S</text>
    <text x="64" y="82.5" font-family="sans-serif" font-weight="900" font-size="5.2" fill="#ffffff" letter-spacing="0.5" text-anchor="middle">E</text>
  </g>

  <!-- ==================== CORNER BADGES ==================== -->
  <!-- Left P3R Collab Badge -->
  <rect x="6" y="77" width="22" height="15" rx="3" fill="#09101d" stroke="#00e5ff" stroke-width="1.2"/>
  <text x="17" y="88" font-family="sans-serif" font-size="6.5" font-weight="900" fill="#38bdf8" text-anchor="middle">P3R</text>

  <!-- Right 1★ Emerald Rarity Badge -->
  <rect x="66" y="73" width="28" height="20" rx="4" fill="#022c22" stroke="#10b981" stroke-width="1.5"/>
  <text x="80" y="87" font-family="monospace" font-size="9" font-weight="900" fill="#34d399" text-anchor="middle">1★</text>
</svg>
`)}`;
};

/**
 * 企鹅物流大老板 · 大帝 (Emperor) 专属黑胶说唱皇帝企鹅 SVG 渲染器
 */
export const createEmperorAvatarSVG = (): string => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <radialGradient id="empBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="60%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    <linearGradient id="goldChain" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="30%" stop-color="#eab308"/>
      <stop offset="70%" stop-color="#ca8a04"/>
      <stop offset="100%" stop-color="#a16207"/>
    </linearGradient>
    <linearGradient id="empNeck" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="50%" stop-color="#facc15"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
    <filter id="empGoldGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1" stdDeviation="2.5" flood-color="#f59e0b" flood-opacity="0.8"/>
    </filter>
  </defs>

  <!-- Outer Vinyl DJ Ring -->
  <circle cx="50" cy="50" r="48" fill="url(#empBg)" stroke="#f59e0b" stroke-width="2.5" filter="url(#empGoldGlow)"/>
  <circle cx="50" cy="50" r="44.5" fill="none" stroke="#e2e8f0" stroke-width="0.8" stroke-dasharray="3,3" opacity="0.5"/>

  <!-- Emperor Penguin Head & Body -->
  <!-- Back Black Plumage -->
  <path d="M 32 20 C 18 25 15 48 20 66 C 24 78 35 88 50 88 C 65 88 76 78 80 66 C 85 48 82 25 68 20 C 58 16 42 16 32 20 Z" fill="#090d16" stroke="#1e293b" stroke-width="1.5"/>

  <!-- Golden-Orange Emperor Neck Markings -->
  <path d="M 23 42 C 20 54 28 62 38 64 C 33 56 31 46 34 38 C 28 38 25 40 23 42 Z" fill="url(#empNeck)"/>
  <path d="M 77 42 C 80 54 72 62 62 64 C 67 56 69 46 66 38 C 72 38 75 40 77 42 Z" fill="url(#empNeck)"/>

  <!-- Pure White Fluffy Chest / Belly -->
  <path d="M 36 60 C 33 72 38 88 50 88 C 62 88 67 72 64 60 C 59 58 41 58 36 60 Z" fill="#f8fafc"/>

  <!-- Penguin Beak (Sharp, hooked tip, with pink/orange stripe) -->
  <path d="M 43 45 L 57 45 L 50 59 Z" fill="#0f172a" stroke="#334155" stroke-width="0.8"/>
  <!-- Beak lateral orange-pink stripe -->
  <path d="M 44 48 Q 50 56 50 58 Q 50 56 56 48" stroke="#fb923c" stroke-width="1.4" fill="none"/>

  <!-- Pro Hip-Hop DJ Studio Headphones -->
  <path d="M 22 36 C 22 14 78 14 78 36" fill="none" stroke="#eab308" stroke-width="3" stroke-linecap="round"/>
  <!-- Left Ear Cushion -->
  <rect x="15" y="32" width="10" height="18" rx="4" fill="#0f172a" stroke="#f59e0b" stroke-width="1.5"/>
  <!-- Right Ear Cushion -->
  <rect x="75" y="32" width="10" height="18" rx="4" fill="#0f172a" stroke="#f59e0b" stroke-width="1.5"/>

  <!-- Iconic Pure Black Badass Sunglasses (With Gold Rims & White Reflection Glint) -->
  <!-- Bridge -->
  <rect x="44" y="36" width="12" height="3.5" rx="1" fill="#facc15"/>
  <!-- Left Lens & Frame -->
  <rect x="23" y="32" width="23" height="15" rx="4" fill="#020617" stroke="#eab308" stroke-width="1.6"/>
  <line x1="26" y1="35" x2="35" y2="44" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>
  <!-- Right Lens & Frame -->
  <rect x="54" y="32" width="23" height="15" rx="4" fill="#020617" stroke="#eab308" stroke-width="1.6"/>
  <line x1="57" y1="35" x2="66" y2="44" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>

  <!-- Burning Cuban Cigar in Beak -->
  <g>
    <!-- Cigar Body -->
    <rect x="52" y="52" width="24" height="4" rx="1.5" transform="rotate(-8 52 52)" fill="#78350f" stroke="#451a03" stroke-width="0.8"/>
    <!-- Gold Cigar Band -->
    <rect x="62" y="50.5" width="4" height="4.5" transform="rotate(-8 62 50.5)" fill="#eab308"/>
    <!-- Glowing Ash Tip -->
    <circle cx="75" cy="49" r="2.2" fill="#ef4444" filter="url(#empGoldGlow)"/>
    <!-- Smoke trails -->
    <path d="M 77 47 Q 82 43 80 38 Q 85 34 83 29" stroke="#cbd5e1" stroke-width="1.2" fill="none" opacity="0.75" stroke-linecap="round"/>
  </g>

  <!-- Heavy Gold Cuban Chain with Penguin Logistics "PL" Medallion -->
  <g>
    <!-- Gold Chain Loops -->
    <path d="M 28 66 Q 50 82 72 66" fill="none" stroke="url(#goldChain)" stroke-width="3.2" stroke-linecap="round" filter="url(#empGoldGlow)"/>
    <path d="M 31 69 Q 50 85 69 69" fill="none" stroke="url(#goldChain)" stroke-width="2.2" stroke-linecap="round"/>
    <!-- Giant Round Gold PL Medallion -->
    <circle cx="50" cy="80" r="8" fill="url(#goldChain)" stroke="#78350f" stroke-width="1" filter="url(#empGoldGlow)"/>
    <circle cx="50" cy="80" r="6.2" fill="#0f172a"/>
    <text x="50" y="83" font-family="sans-serif" font-weight="900" font-size="6.5" fill="#facc15" text-anchor="middle">PL</text>
  </g>

  <!-- Left Bottom Tag: PL -->
  <rect x="6" y="75" width="20" height="16" rx="3" fill="#09101d" stroke="#eab308" stroke-width="1.2"/>
  <text x="16" y="86.5" font-family="sans-serif" font-size="7" font-weight="900" fill="#facc15" text-anchor="middle">PL</text>

  <!-- Right Bottom Tag: 6★ BOSS -->
  <rect x="64" y="73" width="30" height="20" rx="4" fill="#451a03" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="79" y="87" font-family="monospace" font-size="8.5" font-weight="900" fill="#fbbf24" text-anchor="middle">6★</text>
</svg>
`)}`;
};

/**
 * 萨米肉鸽传奇怪盗 · 鸭爵 (Duck Lord) 专属绅士鸭鸭 SVG 渲染器
 */
export const createDuckLordAvatarSVG = (): string => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <radialGradient id="duckBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#2e1065"/>
      <stop offset="60%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    <radialGradient id="duckGold" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="45%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#854d0e"/>
    </radialGradient>
    <filter id="duckGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1" stdDeviation="2.5" flood-color="#a855f7" flood-opacity="0.8"/>
    </filter>
  </defs>

  <!-- Outer Victorian Aristocrat Ring -->
  <circle cx="50" cy="50" r="48" fill="url(#duckBg)" stroke="#c084fc" stroke-width="2.5" filter="url(#duckGlow)"/>
  <circle cx="50" cy="50" r="44.5" fill="none" stroke="#eab308" stroke-width="0.8" stroke-dasharray="4,2.5" opacity="0.6"/>

  <!-- Flying Gold Coins / Originium Ingots Sparkles -->
  <circle cx="16" cy="24" r="3" fill="url(#duckGold)"/>
  <circle cx="84" cy="26" r="2.5" fill="url(#duckGold)"/>
  <polygon points="20,16 22,12 24,16 26,18 22,18" fill="#facc15"/>

  <!-- Duck Body & Head (Plump, Bright Golden Yellow Duck) -->
  <path d="M 32 36 C 22 42 20 62 26 74 C 32 84 42 88 50 88 C 58 88 68 84 74 74 C 80 62 78 42 68 36 C 58 32 42 32 32 36 Z" fill="#facc15" stroke="#ca8a04" stroke-width="1.2"/>
  
  <!-- Fluffy Cheeks -->
  <ellipse cx="27" cy="62" rx="4" ry="2.5" fill="#f59e0b" opacity="0.5"/>
  <ellipse cx="73" cy="62" rx="4" ry="2.5" fill="#f59e0b" opacity="0.5"/>

  <!-- Plump Orange Duck Bill (Broad flat bill with slight witty smirk) -->
  <path d="M 33 58 C 30 62 38 69 50 69 C 62 69 70 62 67 58 C 63 53 37 53 33 58 Z" fill="#f97316" stroke="#c2410c" stroke-width="1.2"/>
  <!-- Bill Nostrils -->
  <ellipse cx="46" cy="58" rx="1.2" ry="0.8" fill="#7c2d12"/>
  <ellipse cx="54" cy="58" rx="1.2" ry="0.8" fill="#7c2d12"/>

  <!-- Expressive Eyes -->
  <!-- Left Eye (Sharp, curious) -->
  <ellipse cx="38" cy="48" rx="4" ry="4.5" fill="#0f172a"/>
  <circle cx="37" cy="46.5" r="1.4" fill="#ffffff"/>

  <!-- Right Eye with Gold Chain Monocle -->
  <g>
    <ellipse cx="62" cy="48" rx="4" ry="4.5" fill="#0f172a"/>
    <circle cx="61" cy="46.5" r="1.4" fill="#ffffff"/>
    <!-- Gold Monocle Rim & Glint -->
    <circle cx="62" cy="48" r="7.5" fill="#38bdf8" fill-opacity="0.2" stroke="#eab308" stroke-width="1.6"/>
    <line x1="58" y1="44" x2="65" y2="51" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity="0.8"/>
    <!-- Hanging Gold Chain -->
    <path d="M 69 52 Q 74 62 70 74" fill="none" stroke="#eab308" stroke-width="1.2" stroke-dasharray="2,1.5"/>
  </g>

  <!-- Victorian Silk Top Hat (Black with Crimson Velvet Ribbon) -->
  <g>
    <!-- Hat Brim -->
    <ellipse cx="50" cy="34" rx="28" ry="6" fill="#0f172a" stroke="#334155" stroke-width="1"/>
    <!-- Hat Crown -->
    <path d="M 28 34 L 32 10 L 68 10 L 72 34 Z" fill="#090d16" stroke="#1e293b" stroke-width="1"/>
    <!-- Hat Top Flat Lid -->
    <ellipse cx="50" cy="10" rx="18" ry="4" fill="#1e293b"/>
    <!-- Crimson Ribbon -->
    <path d="M 29.5 30 L 30.5 24 L 69.5 24 L 70.5 30 Z" fill="#dc2626" stroke="#991b1b" stroke-width="0.8"/>
    <!-- Gold Pin on Ribbon -->
    <circle cx="50" cy="27" r="2.2" fill="url(#duckGold)"/>
  </g>

  <!-- Aristocrat Outfit (Black Tuxedo Collar & Dashing Red Bowtie) -->
  <g>
    <!-- White Shirt Collar -->
    <polygon points="43,73 50,78 57,73 54,88 46,88" fill="#f8fafc"/>
    <!-- Black Tuxedo Lapels -->
    <path d="M 34 76 L 44 88 L 30 92 Z" fill="#0f172a" stroke="#1e293b" stroke-width="1"/>
    <path d="M 66 76 L 56 88 L 70 92 Z" fill="#0f172a" stroke="#1e293b" stroke-width="1"/>
    <!-- Crimson Bowtie -->
    <polygon points="44,72 50,75 44,78" fill="#dc2626"/>
    <polygon points="56,72 50,75 56,78" fill="#dc2626"/>
    <circle cx="50" cy="75" r="2.2" fill="#ef4444"/>
  </g>

  <!-- Left Bottom Tag: DUCK -->
  <rect x="6" y="75" width="24" height="16" rx="3" fill="#0f172a" stroke="#c084fc" stroke-width="1.2"/>
  <text x="18" y="86.5" font-family="sans-serif" font-size="6.5" font-weight="900" fill="#e9d5ff" text-anchor="middle">DUCK</text>

  <!-- Right Bottom Tag: 5★ -->
  <rect x="66" y="73" width="28" height="20" rx="4" fill="#3b0764" stroke="#c084fc" stroke-width="1.5"/>
  <text x="80" y="87" font-family="monospace" font-size="9" font-weight="900" fill="#f3e8ff" text-anchor="middle">5★</text>
</svg>
`)}`;
};

/**
 * 萨尔贡密林阿达克利斯神鸟 · 大祭司 (High Priest) 专属金刚鹦鹉 SVG 渲染器
 */
export const createHighPriestAvatarSVG = (): string => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <radialGradient id="priestBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#064e3b"/>
      <stop offset="60%" stop-color="#022c22"/>
      <stop offset="100%" stop-color="#011612"/>
    </radialGradient>
    <linearGradient id="macawCrest" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#dc2626"/>
      <stop offset="45%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <filter id="priestGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1" stdDeviation="2.5" flood-color="#10b981" flood-opacity="0.8"/>
    </filter>
  </defs>

  <!-- Rainforest God Feathered Ring -->
  <circle cx="50" cy="50" r="48" fill="url(#priestBg)" stroke="#10b981" stroke-width="2.5" filter="url(#priestGlow)"/>
  <circle cx="50" cy="50" r="44.5" fill="none" stroke="#facc15" stroke-width="0.8" stroke-dasharray="4,2.5" opacity="0.6"/>

  <!-- Majestic Scarlet Macaw Crest Feathers (Standing tall with wild tropical gradient) -->
  <path d="M 44 26 C 40 12 46 2 54 1 C 56 8 54 18 50 26 Z" fill="url(#macawCrest)"/>
  <path d="M 36 28 C 30 16 34 6 42 6 C 43 14 42 22 40 28 Z" fill="#dc2626"/>
  <path d="M 54 28 C 62 16 68 8 64 6 C 61 14 58 22 56 28 Z" fill="#0284c7"/>

  <!-- Parrot Head Body (Vibrant Scarlet Red Feathering) -->
  <path d="M 30 32 C 18 38 18 64 26 76 C 34 86 46 88 50 88 C 54 88 66 86 74 76 C 82 64 82 38 70 32 C 60 28 40 28 30 32 Z" fill="#dc2626" stroke="#991b1b" stroke-width="1.2"/>

  <!-- Tropical Blue Wing Mantle on Shoulders -->
  <path d="M 20 68 C 22 80 32 90 40 92 C 32 86 26 78 24 68 Z" fill="#0284c7"/>
  <path d="M 80 68 C 78 80 68 90 60 92 C 68 86 74 78 76 68 Z" fill="#0284c7"/>

  <!-- Characteristic White Macaw Facial Bare Skin Patch with Dark Feather Lines -->
  <path d="M 33 42 C 30 46 32 58 38 60 C 44 60 46 54 46 48 C 46 42 40 40 33 42 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
  <path d="M 67 42 C 70 46 68 58 62 60 C 56 60 54 54 54 48 C 54 42 60 40 67 42 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
  <!-- Feather Line Accents around eyes -->
  <path d="M 34 46 Q 38 48 42 47" stroke="#334155" stroke-width="0.8" fill="none"/>
  <path d="M 33 51 Q 38 52 43 51" stroke="#334155" stroke-width="0.8" fill="none"/>
  <path d="M 66 46 Q 62 48 58 47" stroke="#334155" stroke-width="0.8" fill="none"/>
  <path d="M 67 51 Q 62 52 57 51" stroke="#334155" stroke-width="0.8" fill="none"/>

  <!-- Sharp, Arrogant, Godly Eyes (Golden yellow iris) -->
  <!-- Left Eye -->
  <circle cx="39" cy="46" r="3.6" fill="#facc15" stroke="#854d0e" stroke-width="0.6"/>
  <circle cx="39" cy="46" r="1.8" fill="#0f172a"/>
  <circle cx="38" cy="45" r="0.8" fill="#ffffff"/>
  <!-- Right Eye -->
  <circle cx="61" cy="46" r="3.6" fill="#facc15" stroke="#854d0e" stroke-width="0.6"/>
  <circle cx="61" cy="46" r="1.8" fill="#0f172a"/>
  <circle cx="60" cy="45" r="0.8" fill="#ffffff"/>

  <!-- Powerful Hooked Macaw Beak (Ivory Top with Obsidian Black Base/Underbeak) -->
  <!-- Black Lower Beak -->
  <path d="M 44 62 L 50 68 L 56 62 Z" fill="#0f172a"/>
  <!-- Heavy Ivory Curved Upper Beak -->
  <path d="M 41 50 C 41 46 59 46 59 50 L 58 64 C 54 72 46 72 42 64 Z" fill="#fef08a" stroke="#ca8a04" stroke-width="1"/>
  <path d="M 50 50 L 50 69" stroke="#eab308" stroke-width="0.8"/>

  <!-- Tribal Gold Earring & Beaded Choker of the Great Chief -->
  <g>
    <!-- Gold Ring on Left Feather -->
    <ellipse cx="23" cy="52" rx="3.5" ry="5" fill="none" stroke="#facc15" stroke-width="1.8" filter="url(#priestGlow)"/>
    <!-- Bone & Jade Beads at Neck -->
    <circle cx="38" cy="80" r="3.2" fill="#10b981"/>
    <circle cx="46" cy="83" r="3.5" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <circle cx="54" cy="83" r="3.5" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <circle cx="62" cy="80" r="3.2" fill="#10b981"/>
    <!-- Central Sargon Sun Talisman -->
    <polygon points="50,85 45,94 55,94" fill="#f59e0b"/>
  </g>

  <!-- Left Bottom Tag: SARGON -->
  <rect x="6" y="75" width="25" height="16" rx="3" fill="#022c22" stroke="#10b981" stroke-width="1.2"/>
  <text x="18.5" y="86.5" font-family="sans-serif" font-size="6" font-weight="900" fill="#6ee7b7" text-anchor="middle">SARGON</text>

  <!-- Right Bottom Tag: 1★ GOD -->
  <rect x="66" y="73" width="28" height="20" rx="4" fill="#022c22" stroke="#10b981" stroke-width="1.5"/>
  <text x="80" y="87" font-family="monospace" font-size="9" font-weight="900" fill="#34d399" text-anchor="middle">1★</text>
</svg>
`)}`;
};

export const OPERATOR_DATABASE: Operator[] = [
  // 1. 阿米娅
  {
    id: 'amiya',
    name: 'Amiya',
    cnName: '阿米娅',
    rarity: 5,
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
  // 94. 多萝西 (Dorothy)
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
  },
  // ===== 女神异闻录3 Reload (P3R) 联动特勤组 =====
  // 101. 结城理 (Makoto Yuki)
  {
    id: 'makoto_yuki',
    name: 'Makoto Yuki',
    cnName: '结城理',
    rarity: 6,
    classType: 'Specialist',
    faction: 'S.E.E.S.',
    color: '#0284c7',
    avatar: createOperatorAvatarSVG('#0284c7', '#1e293b', '#38bdf8', 'HUMAN', 'EVOKER', 'P3R'),
    quote: '哪怕终焉降临，我也绝不逃避。出来吧——俄耳甫斯（Orpheus）！',
    masterySkill: '降临：弥赛亚 (专三)',
    moduleLevel: 3
  },
  // 102. 埃癸斯 (Aigis)
  {
    id: 'aigis',
    name: 'Aigis',
    cnName: '埃癸斯',
    rarity: 5,
    classType: 'Sniper',
    faction: 'S.E.E.S.',
    color: '#f59e0b',
    avatar: createOperatorAvatarSVG('#f59e0b', '#fef08a', '#0ea5e9', 'ROBOT_EARS', 'AIGIS_BAND', 'P3R'),
    quote: '对暗影压制特化机装埃癸斯，全系统启动。由我来守护博士的安全！',
    masterySkill: '狂宴扫射 (专三)',
    moduleLevel: 3
  },
  // 103. 岳羽由加莉 (Yukari Takeba)
  {
    id: 'yukari',
    name: 'Yukari Takeba',
    cnName: '岳羽由加莉',
    rarity: 5,
    classType: 'Supporter',
    faction: 'S.E.E.S.',
    color: '#f43f5e',
    avatar: createOperatorAvatarSVG('#f43f5e', '#78350f', '#f43f5e', 'HUMAN', 'SEES_BOW', 'P3R'),
    quote: '风之箭已上弦！别小看我哦，S.E.E.S.的支援就交给我吧！',
    masterySkill: '疾风破甲箭 (专三)',
    moduleLevel: 3
  },
  // 104. 虎狼丸 (Koromaru)
  {
    id: 'koromaru',
    name: 'Koromaru',
    cnName: '虎狼丸',
    rarity: 1,
    classType: 'Specialist',
    faction: 'S.E.E.S.',
    color: '#ef4444',
    avatar: createKoromaruAvatarSVG(),
    quote: '汪！(嘴叼短刃警戒四周，身畔升腾起刻耳柏洛斯的暗炎，忠诚地护在博士身前。一星特勤干员，不占部署位！)',
    masterySkill: '黑色狩猎 (满潜)',
    moduleLevel: 1
  },
  // ===== 经典四星战神干员 (4★ Core Operators) =====
  // 105. 桃金娘 (Myrtle)
  {
    id: 'myrtle',
    name: 'Myrtle',
    cnName: '桃金娘',
    rarity: 4,
    classType: 'Vanguard',
    faction: 'Rim Billiton',
    color: '#eab308',
    avatar: createOperatorAvatarSVG('#eab308', '#fed7aa', '#ca8a04', 'HUMAN', 'WHITE_FLAG', '4★'),
    quote: '金苹果举高高！白旗一摇，部署费用哗哗地来！',
    masterySkill: '治愈之翼 (专三)',
    moduleLevel: 3
  },
  // 106. 讯使 (Courier)
  {
    id: 'courier',
    name: 'Courier',
    cnName: '讯使',
    rarity: 4,
    classType: 'Vanguard',
    faction: 'Kjerag',
    color: '#0284c7',
    avatar: createOperatorAvatarSVG('#0284c7', '#334155', '#0284c7', 'DEER_HORNS', 'BELL', '4★'),
    quote: '谢拉格的信使随时听候差遣。博士，这份信件请您查收。',
    masterySkill: '冲锋号令·防御 (专三)',
    moduleLevel: 3
  },
  // 107. 红豆 (Vigna)
  {
    id: 'vigna',
    name: 'Vigna',
    cnName: '红豆',
    rarity: 4,
    classType: 'Vanguard',
    faction: 'Rhodes Island',
    color: '#ef4444',
    avatar: createOperatorAvatarSVG('#ef4444', '#7f1d1d', '#ef4444', 'DEVIL_HORNS', '', '4★'),
    quote: '摇滚就是我的生命！长矛一出，没有敌人能挡住我的冲锋！',
    masterySkill: '攻击力强化·β (专三)',
    moduleLevel: 3
  },
  // 108. 孑 (Jaye)
  {
    id: 'jaye',
    name: 'Jaye',
    cnName: '孑',
    rarity: 4,
    classType: 'Specialist',
    faction: 'Lungmen',
    color: '#0d9488',
    avatar: createOperatorAvatarSVG('#0d9488', '#1e293b', '#0d9488', 'HUMAN', 'SUSHI_KNIFE', '4★'),
    quote: '生鱼片摊位收摊了……博士，要切点什么刺身或者肉排吗？',
    masterySkill: '刺身技巧 (专三)',
    moduleLevel: 3
  },
  // 109. 砾 (Gravel)
  {
    id: 'gravel',
    name: 'Gravel',
    cnName: '砾',
    rarity: 4,
    classType: 'Specialist',
    faction: 'Kazimierz',
    color: '#f59e0b',
    avatar: createOperatorAvatarSVG('#f59e0b', '#78350f', '#f59e0b', 'HUMAN', 'HEART', '4★'),
    quote: '啾～亲爱的博士，砾随时都会替您挡下一切危险与刀刃哦。',
    masterySkill: '鼠群 (专三)',
    moduleLevel: 3
  },
  // 110. 蛇屠箱 (Cuora)
  {
    id: 'cuora',
    name: 'Cuora',
    cnName: '蛇屠箱',
    rarity: 4,
    classType: 'Defender',
    faction: 'Columbia',
    color: '#06b6d4',
    avatar: createOperatorAvatarSVG('#06b6d4', '#1e293b', '#06b6d4', 'HUMAN', 'BASEBALL_CAP', '4★'),
    quote: '全垒打！龟壳一缩，谁也别想从我身边过去！',
    masterySkill: '壳状防御 (专三)',
    moduleLevel: 3
  },
  // 111. 古米 (Gummy)
  {
    id: 'gummy',
    name: 'Gummy',
    cnName: '古米',
    rarity: 4,
    classType: 'Defender',
    faction: 'Ursus',
    color: '#f97316',
    avatar: createOperatorAvatarSVG('#f97316', '#fdba74', '#ea580c', 'BEAR_EARS', 'APPLES', '4★'),
    quote: '古米习惯了，平底锅既能煎牛排，也能拍晕坏蛋！',
    masterySkill: '备用军粮 (专三)',
    moduleLevel: 3
  },
  // 112. 白雪 (Shirayuki)
  {
    id: 'shirayuki',
    name: 'Shirayuki',
    cnName: '白雪',
    rarity: 4,
    classType: 'Sniper',
    faction: 'Lungmen',
    color: '#64748b',
    avatar: createOperatorAvatarSVG('#64748b', '#f8fafc', '#334155', 'LEOPARD_EARS', 'BLADE', '4★'),
    quote: '大手里剑，飞刃破阵。文月大人的安危由在下誓死守护。',
    masterySkill: '凝霜 (专三)',
    moduleLevel: 3
  },
  // 113. 梅 (May)
  {
    id: 'may',
    name: 'May',
    cnName: '梅',
    rarity: 4,
    classType: 'Sniper',
    faction: 'Victoria',
    color: '#eab308',
    avatar: createOperatorAvatarSVG('#eab308', '#fed7aa', '#854d0e', 'FEATHER_EARS', '', '4★'),
    quote: '嘎！皇家侦探梅在此，所有可疑人员统统束手就擒！',
    masterySkill: '束缚电击枪 (专三)',
    moduleLevel: 3
  },
  // 114. 流星 (Meteor)
  {
    id: 'meteor',
    name: 'Meteor',
    cnName: '流星',
    rarity: 4,
    classType: 'Sniper',
    faction: 'Kazimierz',
    color: '#16a34a',
    avatar: createOperatorAvatarSVG('#16a34a', '#854d0e', '#15803d', 'PEGASUS_EARS', 'BOW', '4★'),
    quote: '穿甲猎弓，直取重骑。大森林的清风引导着我的箭矢。',
    masterySkill: '碎甲击 (专三)',
    moduleLevel: 3
  },
  // 115. 远山 (Gitano)
  {
    id: 'gitano',
    name: 'Gitano',
    cnName: '远山',
    rarity: 4,
    classType: 'Caster',
    faction: 'Sami',
    color: '#7c3aed',
    avatar: createOperatorAvatarSVG('#7c3aed', '#c084fc', '#6b21a8', 'DEER_HORNS', '', '4★'),
    quote: '命运的塔罗牌已揭示结局。命运由天定，亦由博士之手谱写。',
    masterySkill: '命运 (专三)',
    moduleLevel: 3
  },
  // 116. 调香师 (Perfumer)
  {
    id: 'perfumer',
    name: 'Perfumer',
    cnName: '调香师',
    rarity: 4,
    classType: 'Medic',
    faction: 'Minos',
    color: '#84cc16',
    avatar: createOperatorAvatarSVG('#84cc16', '#d9f99d', '#65a30d', 'FOX_EARS', 'WATER_DROP', '4★'),
    quote: '薰衣草与迷迭香的安神芬芳，无论战线多远，都能治愈大家的身心。',
    masterySkill: '熏衣草调香 (专三)',
    moduleLevel: 3
  },
  // 117. 苏苏洛 (Sussurro)
  {
    id: 'sussurro',
    name: 'Sussurro',
    cnName: '苏苏洛',
    rarity: 4,
    classType: 'Medic',
    faction: 'Siracusa',
    color: '#06b6d4',
    avatar: createOperatorAvatarSVG('#06b6d4', '#fed7aa', '#0891b2', 'FOX_EARS', 'SYRINGE', '4★'),
    quote: '别放弃！只要我还有一口气，深度医疗泵就能把重伤员救回来！',
    masterySkill: '深度治疗 (专三)',
    moduleLevel: 3
  },
  // 118. 末药 (Myrrh)
  {
    id: 'myrrh',
    name: 'Myrrh',
    cnName: '末药',
    rarity: 4,
    classType: 'Medic',
    faction: 'Rim Billiton',
    color: '#10b981',
    avatar: createOperatorAvatarSVG('#10b981', '#a7f3d0', '#047857', 'LEOPARD_EARS', '', '4★'),
    quote: '草药研磨完毕，立刻给前线干员敷上止血散。',
    masterySkill: '急救包 (专三)',
    moduleLevel: 3
  },
  // 119. 波登可 (Podenco)
  {
    id: 'podenco',
    name: 'Podenco',
    cnName: '波登可',
    rarity: 4,
    classType: 'Supporter',
    faction: 'Victoria',
    color: '#a855f7',
    avatar: createOperatorAvatarSVG('#a855f7', '#f3e8ff', '#9333ea', 'DOG_EARS', 'WHEAT', '4★'),
    quote: '温室里的花朵开得真好呢。这一瓶孢子雾气，可以让烦人的敌人安静下来。',
    masterySkill: '孢子扩散 (专三)',
    moduleLevel: 3
  },
  // 120. 地灵 (Earthspirit)
  {
    id: 'earthspirit',
    name: 'Earthspirit',
    cnName: '地灵',
    rarity: 4,
    classType: 'Supporter',
    faction: 'Leithanien',
    color: '#b45309',
    avatar: createOperatorAvatarSVG('#b45309', '#fed7aa', '#92400e', 'SHEEP_HORNS', '', '4★'),
    quote: '地壳脉动异常。法杖共振，大地将绊住所有侵犯者的步伐。',
    masterySkill: '地质震荡 (专三)',
    moduleLevel: 3
  },
  // 121. 阿消 (Shaw)
  {
    id: 'shaw',
    name: 'Shaw',
    cnName: '阿消',
    rarity: 4,
    classType: 'Specialist',
    faction: 'Lungmen',
    color: '#ea580c',
    avatar: createOperatorAvatarSVG('#ea580c', '#fdba74', '#c2410c', 'FOX_EARS', 'WATER_DROP', '4★'),
    quote: '报告长官消防管道水压已充满准备发射高压水枪把敌人通通冲下悬崖！',
    masterySkill: '高压水枪 (专三)',
    moduleLevel: 3
  },
  // 122. 暗索 (Rope)
  {
    id: 'rope',
    name: 'Rope',
    cnName: '暗索',
    rarity: 4,
    classType: 'Specialist',
    faction: 'Rim Billiton',
    color: '#f97316',
    avatar: createOperatorAvatarSVG('#f97316', '#ffedd5', '#ea580c', 'BUNNY_EARS', '', '4★'),
    quote: '抓钩甩出去咯！嘿咻，不管是什么大块头，都给我乖乖掉进坑里吧！',
    masterySkill: '勾爪突击 (专三)',
    moduleLevel: 3
  },
  // 123. 霜叶 (Frostleaf)
  {
    id: 'frostleaf',
    name: 'Frostleaf',
    cnName: '霜叶',
    rarity: 4,
    classType: 'Guard',
    faction: 'Columbia',
    color: '#0284c7',
    avatar: createOperatorAvatarSVG('#0284c7', '#e2e8f0', '#0369a1', 'FOX_EARS', 'HEADPHONE', '4★'),
    quote: '少年兵的战斧，寒冰冻结。随身听里的音乐，是战场上唯一的平静。',
    masterySkill: '凝冰之刃 (专三)',
    moduleLevel: 3
  },
  // 124. 刻刀 (Cutter)
  {
    id: 'cutter',
    name: 'Cutter',
    cnName: '刻刀',
    rarity: 4,
    classType: 'Guard',
    faction: 'Columbia',
    color: '#dc2626',
    avatar: createOperatorAvatarSVG('#dc2626', '#451a03', '#b91c1c', 'FOX_EARS', 'BLADE', '4★'),
    quote: '双刀出鞘，红光闪过。四连斩击，敌人防线瞬息瓦解。',
    masterySkill: '赤霄飞刃 (专三)',
    moduleLevel: 3
  },
  // 125. 宴 (Utage)
  {
    id: 'utage',
    name: 'Utage',
    cnName: '宴',
    rarity: 4,
    classType: 'Guard',
    faction: 'Higashi',
    color: '#db2777',
    avatar: createOperatorAvatarSVG('#db2777', '#fbcfe8', '#be185d', 'HUMAN', '', '4★'),
    quote: '血量越少攻击越狂暴！鵺的妖刀出鞘，切开一切烦恼！',
    masterySkill: '落地生根 (专三)',
    moduleLevel: 3
  },
  // 126. 芳汀 (Arene)
  {
    id: 'arene',
    name: 'Arene',
    cnName: '芳汀',
    rarity: 4,
    classType: 'Guard',
    faction: 'Laterano',
    color: '#6366f1',
    avatar: createOperatorAvatarSVG('#6366f1', '#e0e7ff', '#4f46e5', 'HUMAN', 'HALO', '4★'),
    quote: '萨科塔的法术剑刃。不管是地面的重甲还是空中的无人机，一斩即碎。',
    masterySkill: '致命打击 (专三)',
    moduleLevel: 3
  },
  // 127. 罗小黑 (Luo Xiaohei)
  {
    id: 'luo_xiaohei',
    name: 'Luo Xiaohei',
    cnName: '罗小黑',
    rarity: 4,
    classType: 'Guard',
    faction: 'Rhodes Island',
    color: '#10b981',
    avatar: createOperatorAvatarSVG('#10b981', '#0f172a', '#34d399', 'CAT_EARS', '', '4★'),
    quote: '喵～尾巴变成嘿咻！空间领域展开，保护博士！',
    masterySkill: '嘿咻领域 (专三)',
    moduleLevel: 3
  },

  // ===== 经典五星核心干员 (5★ Core Operators) =====
  // 128. 蓝毒 (Blue Poison)
  {
    id: 'blue_poison',
    name: 'Blue Poison',
    cnName: '蓝毒',
    rarity: 5,
    classType: 'Sniper',
    faction: 'Rhodes Island',
    color: '#06b6d4',
    avatar: createOperatorAvatarSVG('#06b6d4', '#bae6fd', '#0891b2', 'FISH_FIN', '', '5★'),
    quote: '毒液淬炼的箭矢……博士，我亲手烤的蓝莓蛋糕，您愿意尝一口吗？',
    masterySkill: '毒液散射 (专三)',
    moduleLevel: 3
  },
  // 129. 白金 (Platinum)
  {
    id: 'platinum',
    name: 'Platinum',
    cnName: '白金',
    rarity: 5,
    classType: 'Sniper',
    faction: 'Kazimierz',
    color: '#38bdf8',
    avatar: createOperatorAvatarSVG('#38bdf8', '#f8fafc', '#0284c7', 'PEGASUS_EARS', 'BOW', '5★'),
    quote: '无胄盟天马大弓，蓄力完毕。今天也可以准时打卡下班了吗？',
    masterySkill: '天马视界 (专三)',
    moduleLevel: 3
  },
  // 130. 陨星 (Meteorite)
  {
    id: 'meteorite',
    name: 'Meteorite',
    cnName: '陨星',
    rarity: 5,
    classType: 'Sniper',
    faction: 'Rhodes Island',
    color: '#dc2626',
    avatar: createOperatorAvatarSVG('#dc2626', '#334155', '#ef4444', 'DEVIL_HORNS', '', '5★'),
    quote: '高爆榴弹装填！大范围火力覆盖，硝烟弥漫即是敌人的丧钟。',
    masterySkill: '高爆弹头 (专三)',
    moduleLevel: 3
  },
  // 131. 临光 (Nearl 原版耀骑士重装)
  {
    id: 'nearl_defender',
    name: 'Nearl',
    cnName: '临光',
    rarity: 5,
    classType: 'Defender',
    faction: 'Kazimierz',
    color: '#eab308',
    avatar: createOperatorAvatarSVG('#eab308', '#fef08a', '#ca8a04', 'PEGASUS_EARS', 'SHIELD', '5★'),
    quote: '卡西米尔的耀骑士临光在此！以黄金之光庇护全阵线！',
    masterySkill: '急救守护 (专三)',
    moduleLevel: 3
  },
  // 132. 雷蛇 (Liskarm)
  {
    id: 'liskarm',
    name: 'Liskarm',
    cnName: '雷蛇',
    rarity: 5,
    classType: 'Defender',
    faction: 'Columbia',
    color: '#3b82f6',
    avatar: createOperatorAvatarSVG('#3b82f6', '#475569', '#60a5fa', 'DRAGON_HORNS', '', '5★'),
    quote: '黑钢国际雷蛇。战术防暴盾受击充电，为身旁队友源源不断充能！',
    masterySkill: '反击电弧 (专三)',
    moduleLevel: 3
  },
  // 133. 华法琳 (Warfarin)
  {
    id: 'warfarin',
    name: 'Warfarin',
    cnName: '华法琳',
    rarity: 5,
    classType: 'Medic',
    faction: 'Rhodes Island',
    color: '#dc2626',
    avatar: createOperatorAvatarSVG('#dc2626', '#f1f5f9', '#dc2626', 'DEVIL_HORNS', 'SYRINGE', '5★'),
    quote: '博士的血液……真是极品诱人。不稳定血浆注入，战力狂暴飙升！',
    masterySkill: '不稳定血浆 (专三)',
    moduleLevel: 3
  },
  // 134. 赫默 (Silence 原版医疗)
  {
    id: 'silence_medic',
    name: 'Silence',
    cnName: '赫默',
    rarity: 5,
    classType: 'Medic',
    faction: 'Rhine Lab',
    color: '#0891b2',
    avatar: createOperatorAvatarSVG('#0891b2', '#f8fafc', '#0e7490', 'FEATHER_EARS', 'GLASSES', '5★'),
    quote: '莱茵生命医疗无人机已部署至目标区域，远程急救覆盖完毕。',
    masterySkill: '医疗无人机 (专三)',
    moduleLevel: 3
  },
  // 135. 巫恋 (Shamane)
  {
    id: 'shamane',
    name: 'Shamane',
    cnName: '巫恋',
    rarity: 5,
    classType: 'Supporter',
    faction: 'Siracusa',
    color: '#9333ea',
    avatar: createOperatorAvatarSVG('#9333ea', '#581c87', '#c084fc', 'FOX_EARS', '', '5★'),
    quote: '小莫提，抱抱～诅咒娃娃降临之处，敌人的护甲与攻击尽数崩溃。',
    masterySkill: '诅咒娃娃 (专三)',
    moduleLevel: 3
  },
  // 136. 狮蝎 (Manticore)
  {
    id: 'manticore',
    name: 'Manticore',
    cnName: '狮蝎',
    rarity: 5,
    classType: 'Specialist',
    faction: 'Rhodes Island',
    color: '#6366f1',
    avatar: createOperatorAvatarSVG('#6366f1', '#4338ca', '#818cf8', 'DEVIL_HORNS', '', '5★'),
    quote: '隐身蝎刺……博士，我不是故意吓您的……只是不想被别人看见……',
    masterySkill: '蓄力毒刺 (专三)',
    moduleLevel: 3
  },
  // 137. 食铁兽 (FEater)
  {
    id: 'feater',
    name: 'FEater',
    cnName: '食铁兽',
    rarity: 5,
    classType: 'Specialist',
    faction: 'Lungmen',
    color: '#059669',
    avatar: createOperatorAvatarSVG('#059669', '#1e293b', '#10b981', 'BEAR_EARS', 'GLASSES', '5★'),
    quote: '功夫电影主角登场！崩拳寸劲，一掌把大盾哥轰下悬崖！',
    masterySkill: '铁意六合拳 (专三)',
    moduleLevel: 3
  },
  // 138. 羽毛笔 (La Pluma)
  {
    id: 'la_pluma',
    name: 'La Pluma',
    cnName: '羽毛笔',
    rarity: 5,
    classType: 'Guard',
    faction: 'Bolivar',
    color: '#0284c7',
    avatar: createOperatorAvatarSVG('#0284c7', '#38bdf8', '#0284c7', 'FEATHER_EARS', '', '5★'),
    quote: '巨大的死神镰刀挥舞，收割一切！攻速叠加，势不可挡！',
    masterySkill: '收割风暴 (专三)',
    moduleLevel: 3
  },
  // 139. 龙舌兰 (Tequila)
  {
    id: 'tequila',
    name: 'Tequila',
    cnName: '龙舌兰',
    rarity: 5,
    classType: 'Guard',
    faction: 'Bolivar',
    color: '#d97706',
    avatar: createOperatorAvatarSVG('#d97706', '#fed7aa', '#b45309', 'DOG_EARS', 'BLADE', '5★'),
    quote: '解放者拔刀术！蓄能完毕，一剑破万甲！',
    masterySkill: '剑鞘裂斩 (专三)',
    moduleLevel: 3
  },
  // 140. 晓歌 (Cantabile)
  {
    id: 'cantabile',
    name: 'Cantabile',
    cnName: '晓歌',
    rarity: 5,
    classType: 'Vanguard',
    faction: 'Bolivar',
    color: '#0d9488',
    avatar: createOperatorAvatarSVG('#0d9488', '#ccfbf1', '#0f766e', 'FEATHER_EARS', 'BOW', '5★'),
    quote: '谍影特勤，暗夜迅捷。射箭回收部署费用，随时重返战场。',
    masterySkill: '暗影箭影 (专三)',
    moduleLevel: 3
  },
  // 141. 蜜莓 (Honeyberry)
  {
    id: 'honeyberry',
    name: 'Honeyberry',
    cnName: '蜜莓',
    rarity: 5,
    classType: 'Medic',
    faction: 'Rim Billiton',
    color: '#f43f5e',
    avatar: createOperatorAvatarSVG('#f43f5e', '#fed7aa', '#e11d48', 'BUNNY_EARS', 'APPLES', '5★'),
    quote: '野果蜜汁调制的元素药剂！侵蚀与神经损伤，通通消散！',
    masterySkill: '甘露抚慰 (专三)',
    moduleLevel: 3
  },
  // 142. 桑葚 (Mulberry)
  {
    id: 'mulberry',
    name: 'Mulberry',
    cnName: '桑葚',
    rarity: 5,
    classType: 'Medic',
    faction: 'Yan',
    color: '#84cc16',
    avatar: createOperatorAvatarSVG('#84cc16', '#ecfccb', '#65a30d', 'FEATHER_EARS', 'LANTERN', '5★'),
    quote: '大炎司岁台行脚医。青灯摇曳，抚平一切紊乱与灼热。',
    masterySkill: '素心清露 (专三)',
    moduleLevel: 3
  },
  // 143. 火龙S黑角 (Rathalos S Noir Corne)
  {
    id: 'noir_corne_alter',
    name: 'Rathalos S Noir Corne',
    cnName: '火龙S黑角',
    rarity: 5,
    classType: 'Guard',
    faction: 'Monster Hunter',
    color: '#dc2626',
    avatar: createOperatorAvatarSVG('#dc2626', '#1e293b', '#ef4444', 'DEVIL_HORNS', 'BLADE', 'MH'),
    quote: '太刀气刃兜割！火龙防具赋予的力量，必斩破一切凶兽！',
    masterySkill: '居合拔刀气刃斩 (专三)',
    moduleLevel: 3
  },

  // ===== 更多高人气六星战神干员 (Iconic 6★ Operators) =====
  // 144. 嵯峨 (Saga)
  {
    id: 'saga',
    name: 'Saga',
    cnName: '嵯峨',
    rarity: 6,
    classType: 'Vanguard',
    faction: 'Higashi',
    color: '#ca8a04',
    avatar: createOperatorAvatarSVG('#ca8a04', '#1e293b', '#a16207', 'DOG_EARS', 'BELL', '6★'),
    quote: '六根清净！纳豆拌饭真香啊！怒目圆睁，斩杀留一滴血让队友充能！',
    masterySkill: '怒目圆睁 (专三)',
    moduleLevel: 3
  },
  // 151. 娜仁图亚 (Narantuya)
  {
    id: 'narantuya',
    name: 'Narantuya',
    cnName: '娜仁图亚',
    rarity: 6,
    classType: 'Sniper',
    faction: 'Yan',
    color: '#10b981',
    avatar: createOperatorAvatarSVG('#10b981', '#1e293b', '#059669', 'HORNS', 'BOW', '6★'),
    quote: '长生天的风吹拂草原。破风鸣镝，贯穿一切阴谋与阴霾！',
    masterySkill: '破风裂空 (专三)',
    moduleLevel: 3
  },
  // 152. 卡涅利安 (Carnelian)
  {
    id: 'carnelian',
    name: 'Carnelian',
    cnName: '卡涅利安',
    rarity: 6,
    classType: 'Caster',
    faction: 'Leithanien',
    color: '#c2410c',
    avatar: createOperatorAvatarSVG('#c2410c', '#fed7aa', '#9a3412', 'SHEEP_HORNS', '', '6★'),
    quote: '荒野狂沙漫卷！沙尘暴蓄力轰击，食肉之沙吞噬一切进犯之敌。',
    masterySkill: '食肉之沙 (专三)',
    moduleLevel: 3
  },
  // 153. 帕拉斯 (Pallas)
  {
    id: 'pallas',
    name: 'Pallas',
    cnName: '帕拉斯',
    rarity: 6,
    classType: 'Guard',
    faction: 'Minos',
    color: '#ca8a04',
    avatar: createOperatorAvatarSVG('#ca8a04', '#fed7aa', '#a16207', 'SHEEP_HORNS', '', '6★'),
    quote: '胜利女神之冠！米诺斯圣泉指引，只要身处战线前排，鼓舞全军战意！',
    masterySkill: '信念的传承 (专三)',
    moduleLevel: 3
  },
  // 154. 伺夜 (Vigil)
  {
    id: 'vigil',
    name: 'Vigil',
    cnName: '伺夜',
    rarity: 6,
    classType: 'Vanguard',
    faction: 'Siracusa',
    color: '#475569',
    avatar: createOperatorAvatarSVG('#475569', '#1e293b', '#64748b', 'WOLF_EARS', 'BLADE', '6★'),
    quote: '贝洛内家族的狼群随时听令。黑夜的叙拉古，由领袖的裁决来书写。',
    masterySkill: '首领的意志 (专三)',
    moduleLevel: 3
  },
  // 155. 麒麟R夜刀 (Kirin R Yato)
  {
    id: 'kirin_yato',
    name: 'Kirin R Yato',
    cnName: '麒麟R夜刀',
    rarity: 6,
    classType: 'Specialist',
    faction: 'Monster Hunter',
    color: '#06b6d4',
    avatar: createOperatorAvatarSVG('#06b6d4', '#f8fafc', '#0891b2', 'DEVIL_HORNS', 'BLADE', 'MH'),
    quote: '双剑鬼人化！雷光极速乱舞，零死角贯穿战场！',
    masterySkill: '乱舞·绝 (专三)',
    moduleLevel: 3
  },

  // ===== 补全六星全图鉴干员 (Complete Official 6★ Operator Collection) =====
  // 156. 赫拉格 (Hellagur)
  {
    id: 'hellagur',
    name: 'Hellagur',
    cnName: '赫拉格',
    rarity: 6,
    classType: 'Guard',
    faction: 'Ursus',
    color: '#64748b',
    avatar: createOperatorAvatarSVG('#64748b', '#f8fafc', '#94a3b8', 'FEATHER_EARS', 'BLADE', '6★'),
    quote: '昔日切尔诺伯格将领赫拉格。老兵未死，残躯尚可为后辈挥刃断前路。',
    masterySkill: '满月 (专三)',
    moduleLevel: 3
  },
  // 157. 森蚺 (Eunectes)
  {
    id: 'eunectes',
    name: 'Eunectes',
    cnName: '森蚺',
    rarity: 6,
    classType: 'Defender',
    faction: 'Sargon',
    color: '#059669',
    avatar: createOperatorAvatarSVG('#059669', '#34d399', '#065f46', 'SNAKE_WINGS', '', '6★'),
    quote: '机械的巨足轰鸣，“大丑”启动！博士，我和高阶祭司会为你扫平所有阻碍！',
    masterySkill: '钢铁意志 (专三)',
    moduleLevel: 3
  },
  // 158. W (W)
  {
    id: 'w_original',
    name: 'W',
    cnName: 'W',
    rarity: 6,
    classType: 'Sniper',
    faction: 'Babel',
    color: '#dc2626',
    avatar: createOperatorAvatarSVG('#dc2626', '#fca5a5', '#991b1b', 'DEVIL_HORNS', '', '6★'),
    quote: '嘀嗒嘀嗒……倒计时结束！boom！哈哈，博士，你这副认真的表情真是有趣。',
    masterySkill: 'D12 (专三)',
    moduleLevel: 3
  },
  // 159. 老鲤 (Lee)
  {
    id: 'lee',
    name: 'Lee',
    cnName: '老鲤',
    rarity: 6,
    classType: 'Specialist',
    faction: 'Lungmen',
    color: '#0d9488',
    avatar: createOperatorAvatarSVG('#0d9488', '#5eead4', '#134e4a', 'DRAGON_HORNS', '', '6★'),
    quote: '鲤氏侦探事务所老鲤。算卦解签、破煞除厄，凡事讲究一个以和为贵。',
    masterySkill: '贵客盈门 (专三)',
    moduleLevel: 3
  },
  // 160. 百炼嘉维尔 (Gavial the Invincible)
  {
    id: 'gavial_alter',
    name: 'Gavial the Invincible',
    cnName: '百炼嘉维尔',
    rarity: 6,
    classType: 'Guard',
    faction: 'Rhodes Island',
    color: '#16a34a',
    avatar: createOperatorAvatarSVG('#16a34a', '#86efac', '#14532d', 'DRAGON_HORNS', 'BLADE', '6★'),
    quote: '法杖？那种东西哪有拳头和重械顺手！阿达克利斯的猛女在此，统统给我趴下！',
    masterySkill: '丛林之拳 (专三)',
    moduleLevel: 3
  },
  // 161. 林 (Lin)
  {
    id: 'lin',
    name: 'Lin',
    cnName: '林',
    rarity: 6,
    classType: 'Caster',
    faction: 'Lungmen',
    color: '#7c3aed',
    avatar: createOperatorAvatarSVG('#7c3aed', '#c4b5fd', '#5b21b6', 'JERBOA_EARS', '', '6★'),
    quote: '琉璃破碎之时，即是裁决降临之刻。龙门的阴影与秩序，由我维系。',
    masterySkill: '流沙奔涌 (专三)',
    moduleLevel: 3
  },
  // 162. 魔王 (Civilight Eterna)
  {
    id: 'civilight_eterna',
    name: 'Civilight Eterna',
    cnName: '魔王',
    rarity: 6,
    classType: 'Supporter',
    faction: 'Babel',
    color: '#d946ef',
    avatar: createOperatorAvatarSVG('#d946ef', '#f0abfc', '#86198f', 'SARKAZ_CROWN', '', '6★'),
    quote: '萨卡兹千年的宿命与悲愿，尽在王冠的脉动之中。愿前路不再有泪水与战火。',
    masterySkill: '昔日王庭的悲歌 (专三)',
    moduleLevel: 3
  },
  // 163. 维娜·维多利亚 (Vina Victoria)
  {
    id: 'vina_victoria',
    name: 'Vina Victoria',
    cnName: '维娜·维多利亚',
    rarity: 6,
    classType: 'Guard',
    faction: 'Victoria',
    color: '#ca8a04',
    avatar: createOperatorAvatarSVG('#ca8a04', '#fef08a', '#854d0e', 'LION_EARS', 'BLADE', '6★'),
    quote: '执掌狮心王权，拔出石中之剑！伦蒂尼姆由我收复，维多利亚必将黎明再临！',
    masterySkill: '开国王者之怒 (专三)',
    moduleLevel: 3
  },
  // 164. 忍冬 (Honeysuckle)
  {
    id: 'honeysuckle',
    name: 'Honeysuckle',
    cnName: '忍冬',
    rarity: 6,
    classType: 'Vanguard',
    faction: 'Rhodes Island',
    color: '#10b981',
    avatar: createOperatorAvatarSVG('#10b981', '#6ee7b7', '#064e3b', 'CAT_EARS', '', '6★'),
    quote: '潜行回费，瞬影隐匿！尖兵先锋忍冬，前线视野与战术点位均已部署完毕！',
    masterySkill: '花影匿杀 (专三)',
    moduleLevel: 3
  },
  // 165. 玛露希尔 (Marcille)
  {
    id: 'marcille',
    name: 'Marcille',
    cnName: '玛露希尔',
    rarity: 6,
    classType: 'Caster',
    faction: 'Dungeon Meshi',
    color: '#eab308',
    avatar: createOperatorAvatarSVG('#eab308', '#fef9c3', '#a16207', 'ELF_EARS', '', '6★'),
    quote: '等等！莱欧斯你又要煮什么魔物？！……算了，古代高等黑魔法，全弹发射！',
    masterySkill: '古代爆炎巨咒 (专三)',
    moduleLevel: 3
  },
  // 166. 引星棘刺 (Thorns the Lodestar)
  {
    id: 'thorns_alter',
    name: 'Thorns the Lodestar',
    cnName: '引星棘刺',
    rarity: 6,
    classType: 'Specialist',
    faction: 'Iberia',
    color: '#0284c7',
    avatar: createOperatorAvatarSVG('#0284c7', '#7dd3fc', '#0369a1', 'FISH_FIN', 'BLADE', '6★'),
    quote: '以星辰为引，刺穿深渊狂潮！至高之术已随星轨变幻，此击无可匹敌！',
    masterySkill: '星芒织海 (专三)',
    moduleLevel: 3
  },
  // 167. 余 (Yu)
  {
    id: 'yu',
    name: 'Yu',
    cnName: '余',
    rarity: 6,
    classType: 'Defender',
    faction: 'Yan',
    color: '#b45309',
    avatar: createOperatorAvatarSVG('#b45309', '#fde68a', '#78350f', 'DRAGON_HORNS', '', '6★'),
    quote: '天地乾坤，万象归余。岁家兄妹在此，任凭千军万马，休想撼动阵线分毫！',
    masterySkill: '天元归聚 (专三)',
    moduleLevel: 3
  },
  // 168. 娜斯提 (Nasty)
  {
    id: 'nasty',
    name: 'Nasty',
    cnName: '娜斯提',
    rarity: 6,
    classType: 'Supporter',
    faction: 'Rhine Lab',
    color: '#f97316',
    avatar: createOperatorAvatarSVG('#f97316', '#fed7aa', '#c2410c', 'ROBOT_EARS', '', '6★'),
    quote: '工匠大师娜斯提！无论在陆地还是高空，人造高台与结构强化立即就位！',
    masterySkill: '天空构筑矩阵 (专三)',
    moduleLevel: 3
  },
  // 169. 蕾缪安 (Lemuen)
  {
    id: 'lemuen',
    name: 'Lemuen',
    cnName: '蕾缪安',
    rarity: 6,
    classType: 'Sniper',
    faction: 'Laterano',
    color: '#06b6d4',
    avatar: createOperatorAvatarSVG('#06b6d4', '#a5f3fc', '#0e7490', 'FEATHER_EARS', '', '6★'),
    quote: '轮椅上的信使亦是神枪手。拉特兰的圣光庇佑每一发精准出膛的子弹。',
    masterySkill: '天启铳骑鸣奏 (专三)',
    moduleLevel: 3
  },
  // 170. 酒神 (Dionysus)
  {
    id: 'dionysus',
    name: 'Dionysus',
    cnName: '酒神',
    rarity: 6,
    classType: 'Supporter',
    faction: 'Victoria',
    color: '#8b5cf6',
    avatar: createOperatorAvatarSVG('#8b5cf6', '#ddd6fe', '#6d28d9', 'CAT_EARS', '', '6★'),
    quote: '猩红剧团帷幕拉开，沉醉于这无休止的神经狂乱吧！这出好戏，才刚刚开场。',
    masterySkill: '狂欢戏剧幻幕 (专三)',
    moduleLevel: 3
  },
  // 171. 隐德来希 (Entelechia)
  {
    id: 'entelechia',
    name: 'Entelechia',
    cnName: '隐德来希',
    rarity: 6,
    classType: 'Guard',
    faction: 'Rhodes Island',
    color: '#ef4444',
    avatar: createOperatorAvatarSVG('#ef4444', '#fca5a5', '#b91c1c', 'SARKAZ_GHOST', '', '6★'),
    quote: '收割者隐德来希。吸取生命上限，赋予法术创伤，战场即是我独行的圣殿。',
    masterySkill: '灵魂断罪收割 (专三)',
    moduleLevel: 3
  },
  // 172. Mon3tr (Mon3tr)
  {
    id: 'mon3tr_op',
    name: 'Mon3tr',
    cnName: 'Mon3tr',
    rarity: 6,
    classType: 'Medic',
    faction: 'Rhodes Island',
    color: '#10b981',
    avatar: createOperatorAvatarSVG('#10b981', '#a7f3d0', '#047857', 'CRYSTAL_SPINE', '', '6★'),
    quote: '（低沉的晶石共鸣与利爪破空声）脊椎延展出绝对的防护与治愈力场！',
    masterySkill: '生物结晶超频 (专三)',
    moduleLevel: 3
  },
  // 173. 新约能天使 (Exusiai the Revelation)
  {
    id: 'exusiai_alter',
    name: 'Exusiai the Revelation',
    cnName: '新约能天使',
    rarity: 6,
    classType: 'Sniper',
    faction: 'Laterano',
    color: '#f59e0b',
    avatar: createOperatorAvatarSVG('#f59e0b', '#fde68a', '#b45309', 'FEATHER_EARS', '', '6★'),
    quote: '老板！苹果派烤好啦！六管铳骑火力全开，圣光照耀罗德岛的每一步征途！',
    masterySkill: '启示之光弹幕 (专三)',
    moduleLevel: 3
  },
  // 174. 谬因 (Miu Yin)
  {
    id: 'miu_yin',
    name: 'Miu Yin',
    cnName: '谬因',
    rarity: 6,
    classType: 'Caster',
    faction: 'Yan',
    color: '#3b82f6',
    avatar: createOperatorAvatarSVG('#3b82f6', '#93c5fd', '#1d4ed8', 'HORNS', '', '6★'),
    quote: '以气御法，导流装置已延展攻击路径！炎国术法博大精深，请博士拭目以待。',
    masterySkill: '气脉连环流导 (专三)',
    moduleLevel: 3
  },
  // 175. 时隙 (Shi Xi)
  {
    id: 'shi_xi',
    name: 'Shi Xi',
    cnName: '时隙',
    rarity: 6,
    classType: 'Specialist',
    faction: 'Rhodes Island',
    color: '#6366f1',
    avatar: createOperatorAvatarSVG('#6366f1', '#c7d2fe', '#4338ca', 'ROBOT_EARS', '', '6★'),
    quote: '通信信道校准完毕……浮游单元启动！虽然不太擅长言语，但我会守好网络防线。',
    masterySkill: '浮游过载演算 (专三)',
    moduleLevel: 3
  },
  // 176. 斩业星熊 (Hoshiguma the Resolute)
  {
    id: 'hoshiguma_alter',
    name: 'Hoshiguma the Resolute',
    cnName: '斩业星熊',
    rarity: 6,
    classType: 'Defender',
    faction: 'Lungmen',
    color: '#059669',
    avatar: createOperatorAvatarSVG('#059669', '#a7f3d0', '#047857', 'HORNS', 'BLADE', '6★'),
    quote: '般若刀锋，斩业不断！我执不灭，龙门坚不可摧的壁垒再次挺身而出！',
    masterySkill: '般若绝断断业 (专三)',
    moduleLevel: 3
  },

  // ===== 泰拉动物萌宠与传奇领袖专区 (Legendary Animal Operators) =====
  // 177. 大帝 (Emperor)
  {
    id: 'emperor',
    name: 'Emperor',
    cnName: '大帝',
    rarity: 6,
    classType: 'Specialist',
    faction: 'Penguin Logistics',
    color: '#f59e0b',
    avatar: createEmperorAvatarSVG(),
    quote: 'Drop the beat! 企鹅物流是不可战胜的！把音响开到最大，全场跟着本大爷嗨起来！',
    masterySkill: '不可阻挡的说唱狂潮 (专三)',
    moduleLevel: 3
  },
  // 157. 鸭爵 (Duck Lord)
  {
    id: 'duck_lord',
    name: 'Duck Lord',
    cnName: '鸭爵',
    rarity: 5,
    classType: 'Specialist',
    faction: 'Independent',
    color: '#a855f7',
    avatar: createDuckLordAvatarSVG(),
    quote: '嘎哈哈！想要源石锭和珍宝吗？那就凭你的本事在迷宫里追上我吧！',
    masterySkill: '怪盗金蝉脱壳 (专三)',
    moduleLevel: 3
  },
  // 158. 大祭司 (High Priest)
  {
    id: 'high_priest',
    name: 'High Priest',
    cnName: '大祭司',
    rarity: 1,
    classType: 'Supporter',
    faction: 'Sargon',
    color: '#10b981',
    avatar: createHighPriestAvatarSVG(),
    quote: '愚蠢的凡人！竟敢将本神视为普通羽兽？雨林的怒火与金刚鹦鹉的神威，可容不得你置喙！',
    masterySkill: '神鸟的智慧 (满潜)',
    moduleLevel: 1
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
  },
  {
    id: 'p3r_collab',
    title: '女神异闻录3 Reload 联动特勤组 (P3R x Arknights 2x2)',
    description: '结城理召唤弥赛亚、埃癸斯机关重炮、岳羽由加莉疾风箭、虎狼丸叼短刃',
    tag: '2x2 P3R 联动 🔥',
    gridSize: '2x2',
    operators: ['Makoto Yuki', 'Aigis', 'Yukari Takeba', 'Koromaru'],
    prompt: `A 2x2 grid sticker sheet of Persona 3 Reload x Arknights collaboration chibi operators: Makoto Yuki holding Evoker pistol with blue Orpheus Persona summon aura and earphones, Aigis the cute blonde android girl with red ribbon headband firing mini Gatling gun, Yukari Takeba with stylish high school archer outfit drawing pink wind bow, and Koromaru the cute loyal white Shiba Inu dog holding a combat dagger in mouth with S.E.E.S. red armband. Modern Persona 3 stylish cobalt blue and neon accents, clean chibi anime sticker aesthetics, crisp outlines, isolated on pure white background, 4 evenly separated quadrants, perfect for sticker cutout`,
    negativePrompt: `blurry, low resolution, messy grid, overlapping characters, dark background, 3D render`,
    params: `--ar 1:1 --v 6.1 --style raw`
  },
  {
    id: 'four_star_heroes',
    title: '基建与开荒战神组 (4★ Heroes 3x3)',
    description: '桃金娘摇白旗举金苹果、孑哥切生鱼片、龟龟四阻挡、红豆长矛冲锋',
    tag: '3x3 四星战神',
    gridSize: '3x3',
    operators: ['Myrtle', 'Jaye', 'Cuora', 'Gravel', 'Gummy', 'Shirayuki', 'May', 'Perfumer', 'Shaw'],
    prompt: `A 3x3 grid sticker sheet of beloved Arknights 4-star hero operators: Myrtle holding a white surrender flag and glowing golden apple, Jaye the sushi chef holding sashimi knives, Cuora the baseball turtle girl with shell backpack, Gravel with cute rat tail and shield, Gummy holding a frying pan, Shirayuki with giant ninja star, May the detective duck, Perfumer with lavender flowers, and Shaw the fire squirrel holding water hose. Super cute SD proportions, vibrant flat colors, crisp 2D lineart, pure white background, evenly spaced sticker grid layout`,
    negativePrompt: `blurry, photorealistic, complex background, bad anatomy`,
    params: `--ar 1:1 --v 6.1`
  },
  {
    id: 'animal_legends',
    title: '泰拉传奇萌宠与动物名宿 (Terra Animals 2x2)',
    description: '虎狼丸叼短刃白柴、大帝墨镜金链雪茄皇帝企鹅、鸭爵绅士高顶礼帽金单片镜、大祭司神鸟金刚鹦鹉',
    tag: '2x2 动物特勤 🐾',
    gridSize: '2x2',
    operators: ['Koromaru', 'Emperor', 'Duck Lord', 'High Priest'],
    prompt: `A 2x2 grid sticker sheet of beloved non-human animal operators and legends from Arknights and P3R: top-left Koromaru the cute loyal white Shiba Inu dog biting combat dagger in mouth with S.E.E.S. red armband; top-right Emperor the badass emperor penguin boss wearing black sunglasses and heavy gold chain smoking cigar; bottom-left Duck Lord the yellow gentleman duck wearing tall black Victorian silk top hat with gold monocle and red bowtie; bottom-right High Priest the arrogant colorful scarlet macaw god parrot with tribal feather crest. Super cute chibi SD cartoon anime aesthetics, bold outlines, vibrant colors, isolated on pure white background, 4 evenly separated quadrants, perfect for sticker die-cut`,
    negativePrompt: `human face, photorealistic, 3D render, dark messy background, overlapping characters`,
    params: `--ar 1:1 --v 6.1`
  }
];
