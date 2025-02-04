import { ETHIOPIAN_MONTHS, WEEK_DAYS, ETHIOPIAN_HOLIDAYS } from './config.js';
import { EthiopianCalendarUtils } from './utils.js';
import { EthiopianDateConverter } from './converter.js';

/**
 * Calendar Renderer
 * Handles all UI-related functionality and DOM manipulation
 */
class EthiopianCalendarRenderer {
  constructor() {
    this.initializeCalendar();
    this.initializeTime();
    this.setupEventListeners();
    this.render();
  }

  initializeCalendar() {
    const today = new Date();
    this.currDate = EthiopianDateConverter.toEthiopian(today);
    this.currYear = this.currDate.year;
    this.currMonth = this.currDate.month;

    if (this.currMonth === undefined || this.currMonth < 0 || this.currMonth >= ETHIOPIAN_MONTHS.length) {
      console.error('Invalid month:', this.currMonth);
      this.currMonth = 0;
    }
  }

  initializeTime() {
    this.updateTime();
    setInterval(() => this.updateTime(), 60000);
  }

  updateTime() {
    const timeDisplay = document.getElementById('ethiopian-time-display');
    const timeLabel = document.getElementById('time-label');
    if (!timeDisplay || !timeLabel) return;

    const useGeez = document.getElementById('useGeez')?.checked || false;
    const time = EthiopianCalendarUtils.toEthiopianTime(new Date());

    timeLabel.textContent = useGeez ? "የኢትዮጵያ ሰዓት፡" : "Ethiopian Time:";
    timeDisplay.textContent = useGeez
      ? `${EthiopianCalendarUtils.toGeezNumeral(time.hours)}:${EthiopianCalendarUtils.toGeezNumeral(parseInt(time.minutes))} ${time.timePeriod.amharic}`
      : `${time.hours}:${time.minutes} ${time.timePeriod.latin}`;
  }

  setupEventListeners() {
    document.querySelectorAll(".icons span").forEach(icon => {
      icon.addEventListener("click", () => this.handleMonthChange(icon.id));
    });

    const useGeezCheckbox = document.getElementById('useGeez');
    if (useGeezCheckbox) {
      useGeezCheckbox.addEventListener('change', () => {
        this.render();
        this.updateTime();
      });
    }
  }

  handleMonthChange(direction) {
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
    const useGeez = document.getElementById('useGeez')?.checked || false;

    if (ETHIOPIAN_MONTHS[12]) {
      ETHIOPIAN_MONTHS[12].days = EthiopianCalendarUtils.getPagumeDays(this.currYear);
    }

    this.renderHeader(useGeez);
    this.renderCalendarDays(useGeez);
    this.renderHolidays(useGeez);
  }

  renderHeader(useGeez) {
    const currentMonth = ETHIOPIAN_MONTHS[this.currMonth];
    if (!currentMonth) {
      console.error('Month data not found for:', this.currMonth);
      return;
    }

    const monthName = useGeez ? currentMonth.amharic : currentMonth.name;
    const yearDisplay = useGeez
      ? EthiopianCalendarUtils.toGeezNumeral(this.currYear)
      : this.currYear;

    const currentDateElement = document.querySelector(".current-date");
    if (currentDateElement) {
      currentDateElement.innerText = `${monthName} ${yearDisplay}`;
    }

    document.querySelectorAll('.weeks li').forEach((day, index) => {
      day.textContent = useGeez ? WEEK_DAYS.amharic[index] : WEEK_DAYS.latin[index];
    });
  }

  renderCalendarDays(useGeez) {
    const firstDay = EthiopianDateConverter.getFirstDayOfMonth(this.currYear, this.currMonth);
    const prevMonthDays = this.getPrevMonthDays();

    let daysHTML = this.getInactiveDays(prevMonthDays, firstDay, useGeez);
    daysHTML += this.getActiveDays(useGeez);

    const daysElement = document.querySelector(".days");
    if (daysElement) {
      daysElement.innerHTML = daysHTML;
    }
  }

  getPrevMonthDays() {
    if (this.currMonth === 0) {
      return EthiopianCalendarUtils.getPagumeDays(this.currYear - 1);
    }
    const prevMonth = ETHIOPIAN_MONTHS[this.currMonth - 1];
    return prevMonth ? prevMonth.days : 30;
  }

  getInactiveDays(prevMonthDays, firstDay, useGeez) {
    let html = "";
    for (let i = firstDay - 1; i >= 0; i--) {
      const dayNum = useGeez
        ? EthiopianCalendarUtils.toGeezNumeral(prevMonthDays - i)
        : (prevMonthDays - i);
      html += `<li class="inactive">${dayNum}</li>`;
    }
    return html;
  }

  getActiveDays(useGeez) {
    const currentMonth = ETHIOPIAN_MONTHS[this.currMonth];
    if (!currentMonth) return '';

    const todayEthiopian = EthiopianDateConverter.toEthiopian(new Date());
    const isCurrentMonth = todayEthiopian.year === this.currYear &&
      todayEthiopian.month === this.currMonth;

    // Get base holidays for this month
    const monthHolidays = ETHIOPIAN_HOLIDAYS[this.currMonth] || [];

    // Get Easter-related holidays
    const easterHolidays = EthiopianDateConverter.getEasterRelatedHolidays(this.currYear);

    // Get Islamic holidays
    const islamicHolidays = EthiopianDateConverter.getIslamicHolidays(this.currYear)
      .filter(holiday => holiday.month === this.currMonth);

    // Combine all holidays for this month
    const allHolidays = [
      ...monthHolidays,
      ...islamicHolidays,
      ...(easterHolidays.goodFriday.month === this.currMonth ? [easterHolidays.goodFriday] : []),
      ...(easterHolidays.easter.month === this.currMonth ? [easterHolidays.easter] : [])
    ];

    let html = "";
    for (let i = 1; i <= currentMonth.days; i++) {
      const isToday = isCurrentMonth && i === todayEthiopian.day ? "active" : "";
      const holiday = allHolidays.find(h => h.day === i);
      const holidayClass = holiday ? "holiday" : "";
      const holidayAttr = holiday
        ? `data-holiday="${useGeez ? holiday.name : holiday.latinName}"`
        : "";
      const dayNum = useGeez ? EthiopianCalendarUtils.toGeezNumeral(i) : i;

      html += `<li class="${isToday} ${holidayClass}" ${holidayAttr}>${dayNum}</li>`;
    }
    return html;
  }


  renderHolidays(useGeez) {
    // Get base holidays for this month
    let monthHolidays = ETHIOPIAN_HOLIDAYS[this.currMonth] || [];

    // Get Easter-related holidays
    const easterHolidays = EthiopianDateConverter.getEasterRelatedHolidays(this.currYear);
    
    // Get Islamic holidays for current Ethiopian year
    const islamicHolidays = EthiopianDateConverter.getIslamicHolidays(this.currYear)
      .filter(holiday => holiday.month === this.currMonth);

    // Combine all holidays
    monthHolidays = [
      ...monthHolidays,
      ...islamicHolidays,
      ...(easterHolidays.goodFriday.month === this.currMonth ? [easterHolidays.goodFriday] : []),
      ...(easterHolidays.easter.month === this.currMonth ? [easterHolidays.easter] : [])
    ];

    const holidaysListEl = document.querySelector('.holidays-list');
    if (!holidaysListEl) return;

    if (monthHolidays.length === 0) {
      holidaysListEl.innerHTML = '<li class="no-holidays">No holidays this month</li>';
      return;
    }

    // Sort holidays by day
    monthHolidays.sort((a, b) => a.day - b.day);

    holidaysListEl.innerHTML = monthHolidays.map(holiday => `
      <li class="holiday-item">
        <span class="holiday-date">
          ${useGeez ? EthiopianCalendarUtils.toGeezNumeral(holiday.day) : holiday.day}
        </span>
        <span class="holiday-name">
          ${useGeez ? holiday.name : holiday.latinName}
        </span>
      </li>
    `).join('');
  }
}

// Initialize the calendar when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    const calendar = new EthiopianCalendarRenderer();
    console.log("✅ Ethiopian Calendar initialized successfully!");
  } catch (error) {
    console.error("❌ Initialization Error:", error);
  }
});