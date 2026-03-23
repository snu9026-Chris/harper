import type { GirlWithSchedule, Store } from './types';

const PHOTO_BASES = [
  'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=400&h=500&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=500&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=500&fit=crop&crop=face',
];

const NAMES_DOPAMINE = ['수아', '지원', '하은', '예린', '나연'];
const NAMES_ELITE = ['서연', '민지', '채원', '유나', '아름'];
const NAMES_PERFECT = ['지유', '소율', '다인', '혜원', '보미'];

function makeGirl(
  id: string,
  name: string,
  age: number,
  store: Store,
  photoIndex: number,
  available: boolean,
): GirlWithSchedule {
  return {
    id,
    name,
    age,
    store,
    photo_url: PHOTO_BASES[photoIndex % PHOTO_BASES.length],
    intro: `안녕하세요 ${name}입니다. 편안하고 즐거운 시간을 드리겠습니다 ✨`,
    stats: {
      height: 160 + Math.floor(Math.random() * 10),
      weight: 47 + Math.floor(Math.random() * 8),
      bust: ['B', 'C', 'D'][Math.floor(Math.random() * 3)],
      specialty: ['수면', '아로마', '타이', '스웨디시'][Math.floor(Math.random() * 4)],
    },
    created_at: new Date().toISOString(),
    is_available: available,
  };
}

export const MOCK_GIRLS: GirlWithSchedule[] = [
  // 도파민
  ...NAMES_DOPAMINE.map((name, i) =>
    makeGirl(`d${i}`, name, 22 + i, '도파민', i, i !== 2)
  ),
  // 엘리트
  ...NAMES_ELITE.map((name, i) =>
    makeGirl(`e${i}`, name, 23 + i, '엘리트', i + 3, i !== 1)
  ),
  // 퍼펙트
  ...NAMES_PERFECT.map((name, i) =>
    makeGirl(`p${i}`, name, 21 + i, '퍼펙트', i + 6, i !== 4)
  ),
];

export function getMockGirlsByStore(store?: Store): GirlWithSchedule[] {
  if (!store) return MOCK_GIRLS;
  return MOCK_GIRLS.filter(g => g.store === store);
}

export function getMockAvailableGirls(date: string, store?: Store): GirlWithSchedule[] {
  // Simulate slight variation by date (seed by day of week)
  const day = new Date(date).getDay();
  return MOCK_GIRLS
    .filter(g => !store || g.store === store)
    .map((g, i) => ({ ...g, is_available: (i + day) % 4 !== 0 }));
}
