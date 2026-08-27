// ---------------------------------------------------------------------------
// Haversine distance (meters)
// ---------------------------------------------------------------------------
const EARTH_R = 6371e3;
const toRad = (d: number) => (d * Math.PI) / 180;

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(EARTH_R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// ---------------------------------------------------------------------------
// Tactical camouflage jitter
// ---------------------------------------------------------------------------
export function applyJitter(lat: number, lng: number, radiusMeters: number = 300): { lat: number; lng: number; offsetDist: number } {
  const angle = Math.random() * 2 * Math.PI;
  const distance = (0.5 + Math.random() * 0.5) * radiusMeters;
  const latDelta = (distance * Math.cos(angle)) / 111000;
  const lngDelta = (distance * Math.sin(angle)) / (111000 * Math.cos(toRad(lat)));
  const jitterLat = lat + latDelta;
  const jitterLng = lng + lngDelta;
  return { lat: jitterLat, lng: jitterLng, offsetDist: calculateDistance(lat, lng, jitterLat, jitterLng) };
}

// ---------------------------------------------------------------------------
// WGS-84 → GCJ-02 (火星坐标) 转换
// 浏览器 navigator.geolocation 返回 WGS-84；高德瓦片是 GCJ-02。
// 不转换直接画图会整体偏移 300~600 米。
// ---------------------------------------------------------------------------
const OUT_OF_CHINA = (lat: number, lng: number) =>
  lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;

const transformLat = (x: number, y: number): number => {
  let ret = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += ((20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2) / 3;
  ret += ((20 * Math.sin(y * Math.PI) + 40 * Math.sin((y / 3) * Math.PI)) * 2) / 3;
  ret += ((160 * Math.sin((y / 12) * Math.PI) + 320 * Math.sin((y * Math.PI) / 30)) * 2) / 3;
  return ret;
};

const transformLng = (x: number, y: number): number => {
  let ret = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += ((20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2) / 3;
  ret += ((20 * Math.sin(x * Math.PI) + 40 * Math.sin((x / 3) * Math.PI)) * 2) / 3;
  ret += ((150 * Math.sin((x / 12) * Math.PI) + 300 * Math.sin((x / 30) * Math.PI)) * 2) / 3;
  return ret;
};

export function wgs84ToGcj02(lat: number, lng: number): { lat: number; lng: number } {
  if (OUT_OF_CHINA(lat, lng)) return { lat, lng };
  const dLat = transformLat(lng - 105, lat - 35);
  const dLng = transformLng(lng - 105, lat - 35);
  const radLat = (lat / 180) * Math.PI;
  let magic = Math.sin(radLat);
  magic = 1 - 0.00669342162296594323 * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  return {
    lat: lat + (dLat * 180) / (((6378137 * (1 - 0.00669342162296594323)) / (magic * sqrtMagic)) * Math.PI),
    lng: lng + (dLng * 180) / ((6378137 / sqrtMagic) * Math.cos(radLat) * Math.PI),
  };
}

// ---------------------------------------------------------------------------
// Hotspot locations (for LocationPickerModal)
// ---------------------------------------------------------------------------
export interface HotspotLocation {
  id: string;
  name: string;
  cnName: string;
  description: string;
  lat: number;
  lng: number;
  estimatedDoctors: number;
}

export const TACTICAL_HOTSPOTS: HotspotLocation[] = [
  {
    id: 'shanghai_cp',
    name: 'Shanghai National Exhibition (CP Zone)',
    cnName: '上海国家会展中心 (同人展区)',
    description: '博士高度聚集区，大量精二助战与线索7出没',
    lat: 31.1925,
    lng: 121.3039,
    estimatedDoctors: 24,
  },
  {
    id: 'akihabara',
    name: 'Tokyo Akihabara (Radio Kaikan)',
    cnName: '东京秋叶原 (无线电会馆)',
    description: '二次元核心中枢，日服与国际服博士密集区',
    lat: 35.6983,
    lng: 139.7719,
    estimatedDoctors: 31,
  },
  {
    id: 'beijing_haidian',
    name: 'Beijing Haidian Tech Hub',
    cnName: '北京海淀中关村 / 学院路',
    description: '高校博士聚集地，高难肉鸽全结局满分选手聚集',
    lat: 39.9832,
    lng: 116.3155,
    estimatedDoctors: 19,
  },
  {
    id: 'chengdu_tianfu',
    name: 'Chengdu Tianfu Square',
    cnName: '成都天府广场 / 太古里',
    description: '休闲博士聚集地，常备理智合剂与火锅助战',
    lat: 30.657,
    lng: 104.0658,
    estimatedDoctors: 16,
  },
  {
    id: 'guangzhou_gztc',
    name: 'Guangzhou Higher Education Mega Center',
    cnName: '广州大学城',
    description: '年轻指挥官活跃区，线索传递频繁',
    lat: 23.0505,
    lng: 113.3855,
    estimatedDoctors: 18,
  },
  {
    id: 'rhodes_landship',
    name: 'Rhodes Island Landship (Nomadic Coordinates)',
    cnName: '罗德岛本舰 (泰拉流动坐标)',
    description: 'PRTS 本部战术主机信标节点',
    lat: 31.2304,
    lng: 121.4737,
    estimatedDoctors: 42,
  },
];
