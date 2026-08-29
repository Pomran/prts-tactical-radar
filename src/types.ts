export type ServerRegion = 'CN_OFFICIAL' | 'CN_BILIBILI' | 'GLOBAL' | 'JP' | 'KR' | 'TW';

export type OperatorClass = 
  | 'Vanguard' 
  | 'Guard' 
  | 'Sniper' 
  | 'Caster' 
  | 'Defender' 
  | 'Medic' 
  | 'Supporter' 
  | 'Specialist';

export type Faction = 
  | 'Rhodes Island' 
  | 'Lungmen' 
  | 'Kjerag' 
  | 'Penguin Logistics' 
  | 'Abyssal Hunters' 
  | 'Kazimierz' 
  | 'Victoria' 
  | 'Ursus' 
  | 'Sarkaz'
  | 'Rhine Lab'
  | 'Sui'
  | 'Iberia'
  | 'Siracusa'
  | 'Laterano'
  | 'Sami'
  | 'Higashi'
  | 'Minos'
  | 'Yan'
  | 'Leithanien';

export interface Operator {
  id: string;
  name: string;
  cnName: string;
  rarity: 6 | 5 | 4 | 3;
  classType: OperatorClass;
  faction: Faction;
  avatar: string; // SVG or data URL
  color: string;
  quote: string;
  masterySkill?: string;
  moduleLevel?: number;
}

export interface DoctorProfile {
  id: string;
  name: string;
  title: string;
  level: number;
  uid: string;
  server: ServerRegion;
  assistant: Operator;
  sanity: {
    current: number;
    max: number;
  };
  motto: string;
  supportOperators: {
    operator: Operator;
    level: number;
    elite: number;
    skillLevel: string;
  }[];
  wantedClues: number[];
  extraClues: number[];
  lat: number;
  lng: number;
  jitterLat?: number;
  jitterLng?: number;
  accuracy?: number; // GPS 定位精度半径（米），用于绘制精度圈
  isCamouflaged: boolean;
  offsetRadiusMeters?: number; // Tactical location offset radius in meters (10m ~ 3000m)
  beaconBroadcastRadiusKm?: number; // Tactical beacon broadcast range / visibility radius in KM (e.g. 0.5km ~ 50km)
  broadcastVisibility?: 'all' | 'radius'; // all = 所有人可见(默认); radius = 仅限广播半径内可见
  lastActive: string;
  receivedSanityCount: number;
  isOnline: boolean;
  distance?: number; // In meters, computed at runtime
}

export interface RadarFilter {
  radiusKm: number;
  /** 探测半径全域开关（默认开启）。true = 全域扫描，不受公里数限制；false = 按 radiusKm 范围扫描 */
  scanGlobal: boolean;
  server: ServerRegion | 'ALL';
  minLevel: number;
  onlyOnline: boolean;
  hasSupport: boolean;
  lookingForClues: boolean;
}

export interface TacticalInteraction {
  id: string;
  type: 'SANITY' | 'INVITE' | 'CLUE' | 'PING';
  fromDoctorId: string;
  fromDoctorName: string;
  fromAssistantName: string;
  toDoctorId: string;
  timestamp: number;
  message: string;
  details?: any;
}

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  tag: string;
  gridSize: '2x2' | '3x3' | '4x4';
  operators: string[];
  prompt: string;
  negativePrompt?: string;
  params: string;
}
