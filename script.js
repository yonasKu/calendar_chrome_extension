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
    this.initializeYearSelector();
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

  initializeYearSelector() {
    const yearSelect = document.getElementById('yearSelect');
    if (!yearSelect) return;

    // Generate options for 10 years before and after current Ethiopian year
    const currentYear = this.currYear;
    const startYear = currentYear - 10;
    const endYear = currentYear + 10;

    for (let year = startYear; year <= endYear; year++) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      if (year === currentYear) {
        option.selected = true;
      }
      yearSelect.appendChild(option);
    }
  }

  initializeTime() {
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
  }

  updateTime() {
    const timeDisplay = document.getElementById('ethiopian-time-display');
    const timeLabel = document.getElementById('time-label');
    const currentDateEl = document.getElementById('current-ethiopian-date');
    if (!timeDisplay || !timeLabel || !currentDateEl) return;

    const useGeez = document.getElementById('useGeez')?.checked || false;
    const now = new Date();
    const time = EthiopianCalendarUtils.toEthiopianTime(now);
    const todayEthiopian = EthiopianDateConverter.toEthiopian(now);

    // Update time display
    timeLabel.textContent = useGeez ? "የኢትዮጵያ ሰዓት፡" : "Ethiopian Time:";
    timeDisplay.textContent = useGeez
        ? `${EthiopianCalendarUtils.toGeezNumeral(time.hours)}:${EthiopianCalendarUtils.toGeezNumeral(parseInt(time.minutes))}:${EthiopianCalendarUtils.toGeezNumeral(parseInt(time.seconds))} ${time.timePeriod.amharic}`
        : `${time.hours}:${time.minutes}:${time.seconds} ${time.timePeriod.latin}`;

    // Update date display with both Ethiopian and Gregorian dates
    const currentMonth = ETHIOPIAN_MONTHS[todayEthiopian.month];
    const monthName = useGeez ? currentMonth.amharic : currentMonth.name;
    const yearDisplay = useGeez
        ? EthiopianCalendarUtils.toGeezNumeral(todayEthiopian.year)
        : todayEthiopian.year;
    const dayDisplay = useGeez
        ? EthiopianCalendarUtils.toGeezNumeral(todayEthiopian.day)
        : todayEthiopian.day;

    // Format Gregorian date
    const gregorianDate = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Combine Ethiopian and Gregorian dates
    currentDateEl.innerHTML = `
        <div>${monthName} ${dayDisplay}, ${yearDisplay}</div>
        <div style="font-size: 0.55em; color: var(--inactive-color);">${gregorianDate}</div>
    `;
  }

  setupEventListeners() {
    document.querySelector("#prev").addEventListener("click", () => {
        if (!document.querySelector("#prev").classList.contains('disabled')) {
            this.handleMonthChange("prev");
        }
    });
    
    document.querySelector("#next").addEventListener("click", () => {
        if (!document.querySelector("#next").classList.contains('disabled')) {
            this.handleMonthChange("next");
        }
    });

    const useGeezCheckbox = document.getElementById('useGeez');
    if (useGeezCheckbox) {
        useGeezCheckbox.addEventListener('change', () => {
            this.render();
            this.updateTime();
        });
    }

    const yearSelect = document.getElementById('yearSelect');
    if (yearSelect) {
      yearSelect.addEventListener('change', () => {
        this.currYear = parseInt(yearSelect.value);
        // Reset to first month of selected year
        this.currMonth = 0;
        this.render();
      });
    }
  }

  handleMonthChange(direction) {
    if (direction === "prev") {
      this.currMonth--;
      if (this.currMonth < 0) {
        this.currMonth = 12;
        this.currYear--;
        document.getElementById('yearSelect').value = this.currYear;
      }
    } else {
      this.currMonth++;
      if (this.currMonth > 12) {
        this.currMonth = 0;
        this.currYear++;
        document.getElementById('yearSelect').value = this.currYear;
      }
    }
    this.render();
  }

  render() {
    const useGeez = document.getElementById('useGeez')?.checked || false;

    if (ETHIOPIAN_MONTHS[12]) {
      ETHIOPIAN_MONTHS[12].days = EthiopianCalendarUtils.getPagumeDays(this.currYear);
    }

    // Disable navigation buttons at year boundaries
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    if (prevButton) {
      prevButton.classList.toggle('disabled', this.currMonth === 0);
    }
    if (nextButton) {
      nextButton.classList.toggle('disabled', this.currMonth === 12);
    }

    this.renderHeader(useGeez);
    this.renderCalendarDays(useGeez);
    this.renderHolidays(useGeez);
  }

  renderHeader(useGeez) {
    // For the calendar header (navigation)
    const currentMonth = ETHIOPIAN_MONTHS[this.currMonth];
    if (!currentMonth) return;

    const monthName = useGeez ? currentMonth.amharic : currentMonth.name;
    const yearDisplay = useGeez
      ? EthiopianCalendarUtils.toGeezNumeral(this.currYear)
      : this.currYear;

    // Calculate Gregorian dates for navigation
    const firstDayGreg = EthiopianDateConverter.toGregorian(this.currYear, this.currMonth, 1);
    const lastDayGreg = EthiopianDateConverter.toGregorian(this.currYear, this.currMonth, currentMonth.days);

    // Set navigation month labels
    document.querySelector('.prev-month .gregorian-label').textContent =
      firstDayGreg.toLocaleDateString('en-US', { month: 'short' });

    document.querySelector('.next-month .gregorian-label').textContent =
      lastDayGreg.toLocaleDateString('en-US', { month: 'short' });

    // Set current viewed month
    document.querySelector('.ethiopian-month').textContent = `${monthName} ${yearDisplay}`;
    document.querySelector('.gregorian-month').textContent =
      firstDayGreg.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
  }

  updateCurrentDate(useGeez) {
    const today = new Date();
    const todayEthiopian = EthiopianDateConverter.toEthiopian(today);

    const currentMonth = ETHIOPIAN_MONTHS[todayEthiopian.month];
    const monthName = useGeez ? currentMonth.amharic : currentMonth.name;
    const yearDisplay = useGeez
      ? EthiopianCalendarUtils.toGeezNumeral(todayEthiopian.year)
      : todayEthiopian.year;
    const dayDisplay = useGeez
      ? EthiopianCalendarUtils.toGeezNumeral(todayEthiopian.day)
      : todayEthiopian.day;

    // Update current date display next to time
    document.getElementById('current-ethiopian-date').textContent =
      `${monthName} ${dayDisplay} ${yearDisplay}`;
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
      ...(easterHolidays.goodFriday?.month === this.currMonth ? [easterHolidays.goodFriday] : []),
      ...(easterHolidays.easter?.month === this.currMonth ? [easterHolidays.easter] : [])
    ];

    let html = "";
    for (let i = 1; i <= currentMonth.days; i++) {
      const isToday = isCurrentMonth && i === todayEthiopian.day;
      const holiday = allHolidays.find(h => h.day === i);

      // Get corresponding Gregorian date
      const gregDate = EthiopianDateConverter.toGregorian(this.currYear, this.currMonth, i);
      const gregDay = gregDate.getDate();

      const ethiopianDay = useGeez ? EthiopianCalendarUtils.toGeezNumeral(i) : i;

      html += `
        <li class="${isToday ? 'active' : ''} ${holiday ? 'holiday' : ''}" 
            ${holiday ? `data-holiday="${useGeez ? holiday.name : holiday.latinName}"` : ''}>
          <span class="gregorian-date">${gregDay}</span>
          <span class="ethiopian-date">${ethiopianDay}</span>
        </li>
      `;
    }
    return html;
  }

  getAllHolidays() {
    // Implement the logic to fetch all holidays for the current Ethiopian year
    // This is a placeholder and should be replaced with the actual implementation
    return [];
  }

  renderHolidays(useGeez) {
    // Get base holidays for this month
    let monthHolidays = ETHIOPIAN_HOLIDAYS[this.currMonth] || [];

    try {
      // Get Easter-related holidays for the current selected year
      const easterHolidays = EthiopianDateConverter.getEasterRelatedHolidays(this.currYear);

      // Get Islamic holidays for current selected year
      const islamicHolidays = EthiopianDateConverter.getIslamicHolidays(this.currYear)
        .filter(holiday => holiday.month === this.currMonth);

      // Combine all holidays
      monthHolidays = [
        ...monthHolidays,
        ...islamicHolidays,
        ...(easterHolidays.goodFriday?.month === this.currMonth ? [easterHolidays.goodFriday] : []),
        ...(easterHolidays.easter?.month === this.currMonth ? [easterHolidays.easter] : [])
      ];
    } catch (error) {
      console.error('Error calculating holidays:', error);
    }

    const holidaysListEl = document.querySelector('.holidays-list');
    if (!holidaysListEl) return;

    if (monthHolidays.length === 0) {
      holidaysListEl.innerHTML = '<li class="no-holidays">No holidays this month</li>';
      return;
    }

    // Sort holidays by day
    monthHolidays.sort((a, b) => a.day - b.day);

    holidaysListEl.innerHTML = monthHolidays.map(holiday => {
      const gregorianDate = EthiopianDateConverter.toGregorian(
        this.currYear,
        this.currMonth,
        holiday.day
      );

      return `
        <li class="holiday-item">
          <span class="holiday-date">
            ${useGeez ? EthiopianCalendarUtils.toGeezNumeral(holiday.day) : holiday.day}
          </span>
          <div class="holiday-info">
            <span class="holiday-name">
              ${useGeez ? holiday.name : holiday.latinName}
            </span>
            <span class="holiday-gregorian">
              ${gregorianDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        </li>
      `;
    }).join('');
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