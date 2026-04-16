import { FREQUENCY_PINS } from '../constants';

export type PinMode = 'sequential' | 'frequency' | 'date' | 'pattern' | 'random';

const allPins = Array.from({ length: 10000 }, (_, i) => i.toString().padStart(4, '0'));

export const generateDatePins = (): string[] => {
  const pins = new Set<string>();
  
  // 1. Years (1900 - 2026)
  for (let y = 1900; y <= 2026; y++) {
    pins.add(y.toString());
  }
  
  // 2. MMDD (Common birthdays)
  for (let m = 1; m <= 12; m++) {
    for (let d = 1; d <= 31; d++) {
      pins.add(m.toString().padStart(2, '0') + d.toString().padStart(2, '0'));
    }
  }
  
  // 3. DDMM (Alternative birthdays)
  for (let d = 1; d <= 31; d++) {
    for (let m = 1; m <= 12; m++) {
      pins.add(d.toString().padStart(2, '0') + m.toString().padStart(2, '0'));
    }
  }

  // Fill the rest
  allPins.forEach(p => pins.add(p));
  return Array.from(pins);
};

export const generatePatternPins = (): string[] => {
  const pins = new Set<string>();
  
  // 1. Repeats (0000, 1111...)
  for (let i = 0; i <= 9; i++) {
    pins.add(i.toString().repeat(4));
  }
  
  // 2. Ladders (1234, 4321, 0123, 3210...)
  const ladders = [
    "0123", "1234", "2345", "3456", "4567", "5678", "6789",
    "3210", "4321", "5432", "6543", "7654", "8765", "9876"
  ];
  ladders.forEach(p => pins.add(p));
  
  // 3. Double Pairs (1122, 2211, 1212, 2121...)
  for (let i = 0; i <= 9; i++) {
    for (let j = 0; j <= 9; j++) {
      if (i === j) continue;
      const si = i.toString();
      const sj = j.toString();
      pins.add(si + si + sj + sj); // 1122
      pins.add(si + sj + si + sj); // 1212
      pins.add(si + sj + sj + si); // 1221
    }
  }
  
  // 4. Keyboard patterns (2580, 0852, 1470...)
  const kb = ["2580", "0852", "1470", "0741", "3690", "0963", "1236", "9874"];
  kb.forEach(p => pins.add(p));

  // Fill the rest
  allPins.forEach(p => pins.add(p));
  return Array.from(pins);
};

export const generateRandomPins = (): string[] => {
  const shuffled = [...allPins];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const ALGO_MAP: Record<PinMode, string[]> = {
  sequential: allPins,
  frequency: [...FREQUENCY_PINS, ...allPins.filter(p => !FREQUENCY_PINS.includes(p))],
  date: generateDatePins(),
  pattern: generatePatternPins(),
  random: generateRandomPins()
};
