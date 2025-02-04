/**
 * Ethiopian Calendar Implementation
 * A professional implementation of the Ethiopian calendar system
 * with holiday support, time conversion, and bilingual display
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
  0: [ // መስከረም (Meskerem)
    { day: 1, name: "እንቁጣጣሽ", latinName: "New Year" },
    { day: 6, name: "መውሊድ (ሊቀየር ይችላል)", latinName: "Birthday of the Prophet Mohammed (Tentative)" },
    { day: 17, name: "መስቀል", latinName: "Discovery of The True Cross" }
  ],
  3: [ // ታህሳስ (Tahsas)
    { day: 29, name: "ገና", latinName: "Christmas" }
  ],
  4: [ // ጥር (Tir)
    { day: 11, name: "ጥምቀት", latinName: "Epiphany" }
  ],
  5: [ // የካቲት (Yekatit)
    { day: 23, name: "አድዋ ድል ቀን", latinName: "Adwa Victory Day" }
  ],
  6: [ // መጋቢት (Megabit)
    { day: 22, name: "ኢድ አልፈጥር", latinName: "Eid Al-Fitr" }
  ],
  7: [ // ሚያዝያ (Miyazya)
    { day: 10, name: "ስቅለት", latinName: "Good Friday" },
    { day: 12, name: "ፋሲካ", latinName: "Easter" },
    { day: 23, name: "የላብ አደሮች ቀን", latinName: "Labour Day" },
    { day: 27, name: "የአርበኞች ቀን", latinName: "Patriots' Day" }
  ],
  8: [ // ግንቦት (Ginbot)
    { day: 20, name: "ደርግ የወደቀበት ቀን", latinName: "National Day" },
    { day: 30, name: "አረፋ", latinName: "Eid Al-Adha" }
  ],
  12: [ // ነሐሴ (Nehase)
    { day: 30, name: "መውሊድ (ሊቀየር ይችላል)", latinName: "Birthday of the Prophet Mohammed (Tentative)" }
  ],
  0: [ // መስከረም (Meskerem) of next year (2018 EC)
    { day: 1, name: "እንቁጣጣሽ", latinName: "New Year" },
    { day: 17, name: "መስቀል", latinName: "Discovery of The True Cross" }
  ]
};

/**
 * Utility Functions
 */
class EthiopianCalendarUtils {
  static isLeapYear(year) {
    console.log(`Checking leap year for: ${year}`);
    const result = year % 4 === 3;
    console.log(`Year ${year} is${result ? '' : ' not'} a leap year`);
    return result;
  }

  static getPagumeDays(year) {
    const days = this.isLeapYear(year) ? 6 : 5;
    console.log(`Pagume days for year ${year}: ${days}`);
    return days;
  }

  static getDateWithEthiopianTimezone(date) {
    console.log('Converting to Ethiopian timezone:', date);
    const ethiopiaOffset = CALENDAR_CONFIG.TIMEZONE_OFFSET * 60;
    const userOffset = date.getTimezoneOffset();
    const totalOffset = ethiopiaOffset + userOffset;
    const result = new Date(date.getTime() + totalOffset * 60 * 1000);
    console.log('Ethiopian timezone result:', result);
    return result;
  }

  static toGeezNumeral(number) {
    console.log(`Converting to Geez numeral: ${number}`);
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

    console.log(`Geez numeral result: ${result}`);
    return result;
  }

  static toEthiopianTime(date) {
    console.log('Converting to Ethiopian time:', date);
    const ethiopiaDate = this.getDateWithEthiopianTimezone(date);
    let hours = ethiopiaDate.getHours();
    let minutes = ethiopiaDate.getMinutes();

    let ethiopianHours = (hours - 6 + 12) % 12 || 12;

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

    const result = {
      hours: ethiopianHours,
      minutes: String(minutes).padStart(2, '0'),
      timePeriod,
      formatted: `${ethiopianHours}:${String(minutes).padStart(2, '0')} ${timePeriod.latin}`
    };

    console.log('Ethiopian time result:', result);
    return result;
  }

  static logDateConversion(from, to, type) {
    console.log(`Converting ${type}:`, {
      from: from,
      to: to,
      timestamp: new Date().toISOString()
    });
  }

  static logTimeConversion(date, ethiopianTime) {
    console.log('Time Conversion:', {
      gregorian: date.toISOString(),
      ethiopianTime: ethiopianTime,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Date Conversion Functions
 */
class EthiopianDateConverter {
  static toEthiopian(gregorianDate) {
    console.log('Converting to Ethiopian date:', gregorianDate);
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

    const result = { year: eYear, month: eMonth, day: remainingDays + 1 };
    console.log('Ethiopian date result:', result);
    return result;
  }

  static toGregorian(ethiopianYear, ethiopianMonth, ethiopianDay) {
    console.log('Converting to Gregorian:', { year: ethiopianYear, month: ethiopianMonth, day: ethiopianDay });
    const gYear = ethiopianYear + 7;
    let newYearDate = new Date(gYear, 8, 11);
    if (EthiopianCalendarUtils.isLeapYear(ethiopianYear)) {
      newYearDate.setDate(12);
    }

    const daysOffset = ethiopianMonth * 30 + ethiopianDay - 1;
    const gregorianDate = new Date(newYearDate.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    const result = EthiopianCalendarUtils.getDateWithEthiopianTimezone(gregorianDate);
    console.log('Gregorian date result:', result);
    return result;
  }

  static getFirstDayOfMonth(year, month) {
    console.log('Getting first day of month:', { year, month });
    const gregorianDate = this.toGregorian(year, month, 1);
    const result = gregorianDate.getDay();
    console.log('First day result:', result);
    return result;
  }
}

/**
 * Calendar Renderer
 */
class EthiopianCalendarRenderer {
  constructor() {
    console.log('Initializing Ethiopian Calendar Renderer');
    this.currDate = EthiopianDateConverter.toEthiopian(new Date());
    this.currYear = this.currDate.year;
    this.currMonth = this.currDate.month;

    this.setupEventListeners();
    this.initializeTime();
    console.log('Calendar initialization complete');
  }

  initializeTime() {
    console.log('Initializing time display');
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
    console.log('Updating time display');
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
    console.log('Setting up event listeners');
    document.querySelectorAll(".icons span").forEach(icon => {
      icon.addEventListener("click", () => this.handleMonthChange(icon.id));
    });

    document.getElementById('useGeez').addEventListener('change', () => this.render());

    window.addEventListener("load", () => this.render());
  }

  handleMonthChange(direction) {
    console.log('Handling month change:', direction);
    if (direction === "prev") {
      this.currMonth--;
      if (this.currMonth < 0) {
        this.currMonth = 12;
        this.currYear--;
      }
    } else {
      this.currMonth++;
      if (this.currMonth > 12) {
        this.currMonth = 0;
        this.currYear++;
      }
    }
    this.render();
  }

  render() {
    console.log('Rendering calendar:', {
      year: this.currYear,
      month: this.currMonth,
      useGeez: document.getElementById('useGeez').checked
    });

    const useGeez = document.getElementById('useGeez').checked;
    ETHIOPIAN_MONTHS[12].days = EthiopianCalendarUtils.getPagumeDays(this.currYear);

    this.renderHeader(useGeez);
    this.renderCalendarDays(useGeez);
    this.renderHolidays(useGeez);
    this.updateTime();
  }

  renderHeader(useGeez) {
    console.log('Rendering header');
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
    console.log('Rendering calendar days');
    const firstDay = EthiopianDateConverter.getFirstDayOfMonth(this.currYear, this.currMonth);
    const prevMonthDays = this.currMonth === 0 ?
      EthiopianCalendarUtils.getPagumeDays(this.currYear - 1) :
      ETHIOPIAN_MONTHS[this.currMonth - 1].days;

    let daysHTML = this.getInactiveDays(prevMonthDays, firstDay, useGeez);
    daysHTML += this.getActiveDays(useGeez);

    document.querySelector(".days").innerHTML = daysHTML;
  }

  getInactiveDays(prevMonthDays, firstDay, useGeez) {
    console.log('Generating inactive days');
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
    console.log('Generating active days');
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
    console.log('Rendering holidays');
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
console.log('Starting Ethiopian Calendar Application');
const calendar = new EthiopianCalendarRenderer();
console.log('Calendar initialization complete');