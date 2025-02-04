/**
 * Ethiopian Calendar Configuration
 */

// Calendar system constants
export const CALENDAR_CONFIG = {
  TIMEZONE_OFFSET: 3, // Ethiopia is UTC+3
  NEW_YEAR_MONTH: 8, // September in Gregorian (0-based)
  NEW_YEAR_DAY: 11,  // September 11th
  MONTHS_IN_YEAR: 13,
  DAYS_IN_MONTH: 30,
  UTC_OFFSET: '+03:00'
};

// Calendar localization data
export const ETHIOPIAN_MONTHS = [
  { name: "Meskerem", amharic: "መስከረም", days: 30 },
  { name: "Tikimt", amharic: "ጥቅምት", days: 30 },
  { name: "Hidar", amharic: "ኅዳር", days: 30 },
  { name: "Tahsas", amharic: "ታኅሳስ", days: 30 },
  { name: "Tir", amharic: "ጥር", days: 30 },
  { name: "Yekatit", amharic: "የካቲት", days: 30 },
  { name: "Megabit", amharic: "መጋቢት", days: 30 },
  { name: "Miazia", amharic: "ሚያዝያ", days: 30 },
  { name: "Ginbot", amharic: "ግንቦት", days: 30 },
  { name: "Sene", amharic: "ሰኔ", days: 30 },
  { name: "Hamle", amharic: "ሐምሌ", days: 30 },
  { name: "Nehase", amharic: "ነሐሴ", days: 30 },
  { name: "Pagumé", amharic: "ጳጉሜን", days: 5 }
];

export const WEEK_DAYS = {
  amharic: ['እሑድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ'],
  latin: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
};

export const ETHIOPIAN_HOLIDAYS = {
  0: [ // መስከረም (Meskerem)
    { day: 1, name: "እንቁጣጣሽ", latinName: "New Year" },
    { day: 17, name: "መስቀል", latinName: "Discovery of The True Cross" }
  ],
  3: [ // ታኅሳስ (Tahsas)
    { day: 29, name: "ገና", latinName: "Christmas" }
  ],
  4: [ // ጥር (Tir)
    { day: 11, name: "ጥምቀት", latinName: "Epiphany" }
  ],
  5: [ // የካቲት (Yekatit)
    { day: 23, name: "አድዋ ድል ቀን", latinName: "Adwa Victory Day" }
  ],
  6: [ // መጋቢት (Megabit)

  ],
  7: [ // ሚያዝያ (Miazia)
    { day: 23, name: "የላብ አደሮች ቀን", latinName: "Labour Day" },
    { day: 27, name: "የአርበኞች ቀን", latinName: "Patriots' Day" }
  ],
  8: [ // ግንቦት (Ginbot)
    { day: 20, name: "ደርግ የወደቀበት ቀን", latinName: "National Day" },

  ],
  11: [ // ነሐሴ (Nehase)

  ]
};

// Geez numeral mapping
export const GEEZ_NUMERALS = {
  numbers: ['፩', '፪', '፫', '፬', '፭', '፮', '፯', '፰', '፱', '፲', '፳', '፴', '፵', '፶', '፷', '፸', '፹', '፺', '፻'],
  values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
};