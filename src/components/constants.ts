import { CalendarLocale } from "./types";

export const BUILT_IN_LOCALES: Record<string, CalendarLocale> = {
  am: {
    name: "Amharic",
    months: [
      "መስከረም",
      "ጥቅምት",
      "ህዳር",
      "ታህሳስ",
      "ጥር",
      "የካቲት",
      "መጋቢት",
      "ሚያዝያ",
      "ግንቦት",
      "ሰኔ",
      "ሐምሌ",
      "ነሐሴ",
      "ጳጉሜ",
    ],
    weekdays: ["እሁ", "ሰኞ", "ማክ", "ረቡ", "ሐሙ", "ዓር", "ቅዳ"],
    placeholder: "ቀን/ወር/ዓመት",
    today: "ዛሬ",
    clear: "አጽዳ",
    apply: "እሺ",
    am: "ጥዋት",
    pm: "ከሰዓት",
    time: "ሰዓት",
    timePlaceholders: {
      hours: "ሰዓ",
      minutes: "ደቂ",
      seconds: "ሰከ",
    },
  },
  or: {
    name: "Afaan Oromoo",
    months: [
      "Fulbaana",
      "Onkololeessa",
      "Sadaasa",
      "Muddee",
      "Amajjii",
      "Guraandhala",
      "Bitooteessa",
      "Ebla",
      "Caamsaa",
      "Waxabajjii",
      "Adooleessa",
      "Hagayya",
      "Qaammee",
    ],
    weekdays: ["Dil", "Wix", "Qib", "Roob", "Kam", "Jim", "San"],
    placeholder: "gg/bb/wrr",
    today: "Har'a",
    clear: "Haqi",
    apply: "Tole",
    am: "WD",
    pm: "WB",
    time: "Sa'aatii",
    timePlaceholders: {
      hours: "sa",
      minutes: "da",
      seconds: "sek",
    },
  },
  en: {
    name: "English",
    months: [
      "Meskerem",
      "Tikimt",
      "Hidar",
      "Tahsas",
      "Tir",
      "Yakatit",
      "Megabit",
      "Miazia",
      "Ginbot",
      "Sene",
      "Hamle",
      "Nehase",
      "Pagume",
    ],
    weekdays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    placeholder: "dd/mm/yyyy",
    today: "Today",
    clear: "Clear",
    apply: "Apply",
    am: "AM",
    pm: "PM",
    time: "Time",
    timePlaceholders: {
      hours: "hh",
      minutes: "mm",
      seconds: "ss",
    },
  },
};

// Global registry for custom languages
const customLocaleRegistry: Record<string, CalendarLocale> = {};

/**
 * Register a new language or override an existing one globally.
 * @example
 * registerCalendarLocale('ti', {
 *   name: 'Tigrinya',
 *   months: ['መስከረም', 'ጥቅምቲ', 'ሕዳር', 'ታሕሳስ', 'ጥሪ', 'የካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰነ', 'ሓምለ', 'ነሓሰ', 'ጳጉሜ'],
 *   weekdays: ['ሰን', 'ሰኑ', 'ሰሉ', 'ረቡ', 'ሓሙ', 'ዓር', 'ቀዳ'],
 *   today: 'ሎሚ',
 *   clear: 'ኣጽርይ',
 * });
 */
export function registerCalendarLocale(code: string, localeData: CalendarLocale) {
  customLocaleRegistry[code.toLowerCase()] = localeData;
}

/**
 * Resolve calendar locale data by code, falling back to Amharic if not found,
 * and merging any inline customLocale overrides.
 */
export function getCalendarLocale(
  localeCode: string = "am",
  customOverride?: Partial<CalendarLocale>
): CalendarLocale {
  const code = localeCode.toLowerCase();
  const base =
    customLocaleRegistry[code] ||
    BUILT_IN_LOCALES[code] ||
    BUILT_IN_LOCALES["am"];

  if (!customOverride) return base;

  return {
    ...base,
    ...customOverride,
    months: customOverride.months || base.months,
    weekdays: customOverride.weekdays || base.weekdays,
    today: customOverride.today || base.today,
    clear: customOverride.clear || base.clear,
    timePlaceholders: {
      ...base.timePlaceholders,
      ...customOverride.timePlaceholders,
    },
  };
}

// Backward-compatible exports
export const MONTHS = BUILT_IN_LOCALES.en.months;
export const ETHIOPIAN_WEEKDAYS = BUILT_IN_LOCALES.en.weekdays;

