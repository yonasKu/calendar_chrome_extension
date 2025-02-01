/**
 * Ethiopian Calendar Implementation
 * A professional implementation of the Ethiopian calendar system
 * with holiday support, Easter calculation, time conversion, and bilingual display
 * Including Hijri calendar calculations for Islamic holidays
 */

// Initialize console
try {
  console.clear();
  console.log("✅ Ethiopian Calendar initialized successfully!");
} catch (error) {
  console.error("❌ Initialization Error:", error);
}

/**
 * Constants and Configuration
 */
const CALENDAR_CONFIG = {
  TIMEZONE_OFFSET: 3, // Ethiopia is UTC+3
  NEW_YEAR_MONTH: 8, // September in Gregorian (0-based)
  NEW_YEAR_DAY: 11,  // September 11th
  MONTHS_IN_YEAR: 13,
  DAYS_IN_MONTH: 30
};

/**
 * Calendar Data Structures
 */
const ETHIOPIAN_MONTHS = [
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

const WEEK_DAYS = {
  amharic: ['እሑድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ'],
  latin: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
};

const ETHIOPIAN_HOLIDAYS = {
  0: [ // Meskerem
    { day: 1, name: "እንቁጣጣሽ", latinName: "New Year" },
    { day: 17, name: "መስቀል", latinName: "Finding of the True Cross" }
  ],
  3: [ // Tahsas
    { day: 29, name: "ገና", latinName: "Christmas" }
  ],
  4: [ // Tir
    { day: 11, name: "ጥምቀት", latinName: "Epiphany" }
  ],
  5: [ // Yekatit
    { day: 23, name: "አድዋ ድል ቀን", latinName: "Victory of Adwa" }
  ],
  7: [ // Miazia
    { day: 23, name: "የላብ አደሮች ቀን", latinName: "Labour Day" },
    { day: 27, name: "የአርበኞች ቀን", latinName: "Patriots' Day" }
  ],
  8: [ // Ginbot
    { day: 20, name: "ደርግ የወደቀበት ቀን", latinName: "National Day" }
  ]
};

/**
 * Utility Functions
 */
class EthiopianCalendarUtils {
  static isLeapYear(year) {
    return year % 4 === 3;
  }

  static getPagumeDays(year) {
    return this.isLeapYear(year) ? 6 : 5;
  }

  static getDateWithEthiopianTimezone(date) {
    const ethiopiaOffset = CALENDAR_CONFIG.TIMEZONE_OFFSET * 60;
    const userOffset = date.getTimezoneOffset();
    const totalOffset = ethiopiaOffset + userOffset;
    return new Date(date.getTime() + totalOffset * 60 * 1000);
  }

  static toGeezNumeral(number) {
    const geezNumerals = ['፩', '፪', '፫', '፬', '፭', '፮', '፯', '፰', '፱', '፲', '፳', '፴', '፵', '፶', '፷', '፸', '፹', '፺', '፻'];
    const arabicValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

    if (number === 0) return '፩';
    if (number > 100) return number.toString();

    let result = '';
    let remaining = number;

    for (let i = arabicValues.length - 1; i >= 0; i--) {
      while (remaining >= arabicValues[i]) {
        result += geezNumerals[i];
        remaining -= arabicValues[i];
      }
    }

    return result;
  }

  static toEthiopianTime(date) {
    const ethiopiaDate = this.getDateWithEthiopianTimezone(date);
    let hours = ethiopiaDate.getHours();
    let minutes = ethiopiaDate.getMinutes();

    // Convert to Ethiopian time (6 hours difference)
    let ethiopianHours = (hours - 6 + 12) % 12 || 12; // Ensure range is 1-12

    // Determine Ethiopian time period with both Amharic and English versions
    let timePeriod = {
      amharic: '',
      latin: ''
    };

    if (hours >= 0 && hours < 6) {
      timePeriod.amharic = "ለሊት";
      timePeriod.latin = "Night";
    } else if (hours >= 6 && hours < 12) {
      timePeriod.amharic = "ጠዋት";
      timePeriod.latin = "Morning";
    } else if (hours >= 12 && hours < 18) {
      timePeriod.amharic = "ከሰዓት";
      timePeriod.latin = "Afternoon";
    } else {
      timePeriod.amharic = "ማታ";
      timePeriod.latin = "Evening";
    }

    return {
      hours: ethiopianHours,
      minutes: String(minutes).padStart(2, '0'),
      timePeriod,
      formatted: `${ethiopianHours}:${String(minutes).padStart(2, '0')} ${timePeriod.latin}`
    };
  }

  static hijriToGregorian(hijriYear, hijriMonth, hijriDay) {
    const JDN = Math.floor((11 * hijriYear + 3) / 30) +
      354 * hijriYear +
      30 * hijriMonth -
      Math.floor((hijriMonth - 1) / 2) +
      hijriDay + 1948440 - 385;

    let L = JDN + 68569;
    const N = Math.floor((4 * L) / 146097);
    L = L - Math.floor((146097 * N + 3) / 4);
    const I = Math.floor((4000 * (L + 1)) / 1461001);
    L = L - Math.floor((1461 * I) / 4) + 31;
    const J = Math.floor((80 * L) / 2447);
    const day = L - Math.floor((2447 * J) / 80);
    L = Math.floor(J / 11);
    const month = J + 2 - 12 * L;
    const year = 100 * (N - 49) + I + L;

    return new Date(year, month - 1, day);
  }

  static getIslamicHolidays(year) {
    const hijriYear = year + 622 - 8; // Approximate Hijri Year

    // Convert Hijri Dates to Gregorian
    const eidFitr = this.hijriToGregorian(hijriYear, 10, 1);  // 1st Shawwal
    const eidAdha = this.hijriToGregorian(hijriYear, 12, 10); // 10th Dhu al-Hijjah
    const mawlid = this.hijriToGregorian(hijriYear, 3, 12);   // 12th Rabi' al-Awwal

    // Convert Gregorian to Ethiopian Calendar
    const ethiopianEidFitr = EthiopianDateConverter.toEthiopian(eidFitr);
    const ethiopianEidAdha = EthiopianDateConverter.toEthiopian(eidAdha);
    const ethiopianMawlid = EthiopianDateConverter.toEthiopian(mawlid);

    return [
      {
        month: ethiopianEidFitr.month,
        day: ethiopianEidFitr.day,
        name: "ኢድ አልፈጥር",
        latinName: "Eid al-Fitr"
      },
      {
        month: ethiopianEidAdha.month,
        day: ethiopianEidAdha.day,
        name: "አረፋ",
        latinName: "Eid al-Adha"
      },
      {
        month: ethiopianMawlid.month,
        day: ethiopianMawlid.day,
        name: "መውሊድ",
        latinName: "Mawlid"
      }
    ];
  }

  static updateIslamicHolidays(year) {
    const islamicHolidays = this.getIslamicHolidays(year);

    // Clear old Islamic holidays
    Object.keys(ETHIOPIAN_HOLIDAYS).forEach(month => {
      ETHIOPIAN_HOLIDAYS[month] = ETHIOPIAN_HOLIDAYS[month].filter(h =>
        !["Eid al-Fitr", "Eid al-Adha", "Mawlid"].includes(h.latinName));
    });

    // Add new calculated holidays
    islamicHolidays.forEach(holiday => {
      if (!ETHIOPIAN_HOLIDAYS[holiday.month]) {
        ETHIOPIAN_HOLIDAYS[holiday.month] = [];
      }
      ETHIOPIAN_HOLIDAYS[holiday.month].push(holiday);
    });
  }

  static getEthiopianEaster(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;

    return EthiopianDateConverter.toEthiopian(new Date(year, month - 1, day));
  }
}

/**
 * Date Conversion Functions
 */
class EthiopianDateConverter {
  static toEthiopian(gregorianDate) {
    const ethiopiaDate = EthiopianCalendarUtils.getDateWithEthiopianTimezone(gregorianDate);
    const gYear = ethiopiaDate.getFullYear();
    const gMonth = ethiopiaDate.getMonth();
    const gDay = ethiopiaDate.getDate();

    const isLeapYear = EthiopianCalendarUtils.isLeapYear(gYear - 8);
    const newYearDay = isLeapYear ? 12 : 11;
    const isBeforeNewYear = gMonth < 8 || (gMonth === 8 && gDay < newYearDay);
    const eYear = isBeforeNewYear ? gYear - 8 : gYear - 7;

    const newYearDate = new Date(gYear, 8, newYearDay);
    if (isBeforeNewYear) {
      newYearDate.setFullYear(gYear - 1);
    }

    const diffDays = Math.floor((ethiopiaDate - newYearDate) / (1000 * 60 * 60 * 24));
    let eMonth = 0, remainingDays = diffDays;

    while (remainingDays >= (eMonth === 12 ? EthiopianCalendarUtils.getPagumeDays(eYear) : 30)) {
      remainingDays -= eMonth === 12 ? EthiopianCalendarUtils.getPagumeDays(eYear) : 30;
      eMonth++;
    }

    return { year: eYear, month: eMonth, day: remainingDays + 1 };
  }

  static toGregorian(ethiopianYear, ethiopianMonth, ethiopianDay) {
    const gYear = ethiopianYear + 7;
    let newYearDate = new Date(gYear, 8, 11);
    if (EthiopianCalendarUtils.isLeapYear(ethiopianYear)) {
      newYearDate.setDate(12);
    }

    const daysOffset = ethiopianMonth * 30 + ethiopianDay - 1;
    const gregorianDate = new Date(newYearDate.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    return EthiopianCalendarUtils.getDateWithEthiopianTimezone(gregorianDate);
  }

  static getFirstDayOfMonth(year, month) {
    const gregorianDate = this.toGregorian(year, month, 1);
    return gregorianDate.getDay();
  }
}

/**
 * Calendar Renderer
 */
class EthiopianCalendarRenderer {
  constructor() {
    this.currDate = EthiopianDateConverter.toEthiopian(new Date());
    this.currYear = this.currDate.year;
    this.currMonth = this.currDate.month;

    // Update Islamic holidays when calendar initializes
    EthiopianCalendarUtils.updateIslamicHolidays(this.currYear);

    this.setupEventListeners();
    this.initializeTime();
  }

  initializeTime() {
    if (!document.querySelector('.ethiopian-time')) {
      const timeDisplay = document.createElement('div');
      timeDisplay.className = 'ethiopian-time';
      timeDisplay.innerHTML = `
        <label id="time-label"></label>
        <span id="ethiopian-time-display"></span>
      `;
      document.querySelector('.wrapper').appendChild(timeDisplay);
    }

    this.updateTime();
    setInterval(() => this.updateTime(), 60000);
  }

  updateTime() {
    const timeDisplay = document.getElementById('ethiopian-time-display');
    const timeLabel = document.getElementById('time-label');

    if (timeDisplay && timeLabel) {
      const useGeez = document.getElementById('useGeez').checked;
      const time = EthiopianCalendarUtils.toEthiopianTime(new Date());

      timeLabel.textContent = useGeez ? "የኢትዮጵያ ሰዓት፡" : "Ethiopian Time:";

      timeDisplay.textContent = useGeez ?
        `${EthiopianCalendarUtils.toGeezNumeral(time.hours)}:${EthiopianCalendarUtils.toGeezNumeral(parseInt(time.minutes))} ${time.timePeriod.amharic}` :
        `${time.hours}:${time.minutes} ${time.timePeriod.latin}`;
    }
  }

  setupEventListeners() {
    document.querySelectorAll(".icons span").forEach(icon => {
      icon.addEventListener("click", () => this.handleMonthChange(icon.id));
    });

    document.getElementById('useGeez').addEventListener('change', () => this.render());

    window.addEventListener("load", () => this.render());
  }

  handleMonthChange(direction) {
    if (direction === "prev") {
      this.currMonth--;
      if (this.currMonth < 0) {
        this.currMonth = 12;
        this.currYear--;
        EthiopianCalendarUtils.updateIslamicHolidays(this.currYear);
      }
    } else {
      this.currMonth++;
      if (this.currMonth > 12) {
        this.currMonth = 0;
        this.currYear++;
        EthiopianCalendarUtils.updateIslamicHolidays(this.currYear);
      }
    }
    this.render();
  }

  render() {
    const useGeez = document.getElementById('useGeez').checked;
    ETHIOPIAN_MONTHS[12].days = EthiopianCalendarUtils.getPagumeDays(this.currYear);

    // Calculate Easter and update holidays
    const easter = EthiopianCalendarUtils.getEthiopianEaster(this.currYear);
    if (easter) {
      ETHIOPIAN_HOLIDAYS[easter.month] = ETHIOPIAN_HOLIDAYS[easter.month] || [];

      if (!ETHIOPIAN_HOLIDAYS[easter.month].some(h => h.name === "ፋሲካ")) {
        ETHIOPIAN_HOLIDAYS[easter.month].push({
          day: easter.day,
          name: "ፋሲካ",
          latinName: "Easter"
        });
      }

      const goodFridayDay = easter.day - 2;
      if (!ETHIOPIAN_HOLIDAYS[easter.month].some(h => h.name === "ስቅለት")) {
        ETHIOPIAN_HOLIDAYS[easter.month].push({
          day: goodFridayDay,
          name: "ስቅለት",
          latinName: "Good Friday"
        });
      }
    }

    this.renderHeader(useGeez);
    this.renderCalendarDays(useGeez);
    this.renderHolidays(useGeez);
    this.updateTime();
  }

  renderHeader(useGeez) {
    const monthName = useGeez ?
      ETHIOPIAN_MONTHS[this.currMonth].amharic :
      ETHIOPIAN_MONTHS[this.currMonth].name;
    const yearDisplay = useGeez ?
      EthiopianCalendarUtils.toGeezNumeral(this.currYear) :
      this.currYear;

    document.querySelector(".current-date").innerText = `${monthName} ${yearDisplay}`;

    document.querySelectorAll('.weeks li').forEach((day, index) => {
      day.textContent = useGeez ? WEEK_DAYS.amharic[index] : WEEK_DAYS.latin[index];
    });
  }

  renderCalendarDays(useGeez) {
    const firstDay = EthiopianDateConverter.getFirstDayOfMonth(this.currYear, this.currMonth);
    const prevMonthDays = this.currMonth === 0 ?
      EthiopianCalendarUtils.getPagumeDays(this.currYear - 1) :
      ETHIOPIAN_MONTHS[this.currMonth - 1].days;

    let daysHTML = this.getInactiveDays(prevMonthDays, firstDay, useGeez);
    daysHTML += this.getActiveDays(useGeez);

    document.querySelector(".days").innerHTML = daysHTML;
  }

  getInactiveDays(prevMonthDays, firstDay, useGeez) {
    let html = "";
    for (let i = firstDay - 1; i >= 0; i--) {
      const dayNum = useGeez ?
        EthiopianCalendarUtils.toGeezNumeral(prevMonthDays - i) :
        (prevMonthDays - i);
      html += `<li class="inactive">${dayNum}</li>`;
    }
    return html;
  }

  getActiveDays(useGeez) {
    const currentMonth = ETHIOPIAN_MONTHS[this.currMonth];
    const todayEthiopian = EthiopianDateConverter.toEthiopian(new Date());
    const isCurrentMonth =
      todayEthiopian.year === this.currYear &&
      todayEthiopian.month === this.currMonth;
    const monthHolidays = ETHIOPIAN_HOLIDAYS[this.currMonth] || [];

    let html = "";
    for (let i = 1; i <= currentMonth.days; i++) {
      const isToday = isCurrentMonth && i === todayEthiopian.day ? "active" : "";
      const holiday = monthHolidays.find(h => h.day === i);
      const holidayClass = holiday ? "holiday" : "";
      const holidayAttr = holiday ?
        `data-holiday="${useGeez ? holiday.name : holiday.latinName}"` : "";
      const dayNum = useGeez ? EthiopianCalendarUtils.toGeezNumeral(i) : i;

      html += `<li class="${isToday} ${holidayClass}" ${holidayAttr}>${dayNum}</li>`;
    }
    return html;
  }

  renderHolidays(useGeez) {
    const monthHolidays = ETHIOPIAN_HOLIDAYS[this.currMonth] || [];
    const holidaysListEl = document.querySelector('.holidays-list');

    if (monthHolidays.length === 0) {
      holidaysListEl.innerHTML = '<li class="no-holidays">No holidays this month</li>';
      return;
    }

    holidaysListEl.innerHTML = monthHolidays.map(holiday => `
      <li class="holiday-item">
        <span class="holiday-date">
          ${useGeez ?
        EthiopianCalendarUtils.toGeezNumeral(holiday.day) :
        holiday.day}
        </span>
        <span class="holiday-name">
          ${useGeez ? holiday.name : holiday.latinName}
        </span>
      </li>
    `).join('');
  }
}

// Initialize the calendar
const calendar = new EthiopianCalendarRenderer();