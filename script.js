try {
  console.clear();
  console.log("✅ Script is running in the popup!");
} catch (error) {
  console.error("❌ Error:", error);
}

// 1. Define Ethiopian Months and Lengths
const months = [
  { name: "Meskerem", days: 30 },
  { name: "Tikimt", days: 30 },
  { name: "Hidar", days: 30 },
  { name: "Tahsas", days: 30 },
  { name: "Tir", days: 30 },
  { name: "Yekatit", days: 30 },
  { name: "Megabit", days: 30 },
  { name: "Miazia", days: 30 },
  { name: "Ginbot", days: 30 },
  { name: "Sene", days: 30 },
  { name: "Hamle", days: 30 },
  { name: "Nehase", days: 30 },
  { name: "Pagumé", days: 5 }, // Adjusted dynamically for leap years
];

// 2. Ethiopian Leap Year Calculation
const ethiopianLeapYear = (year) => year % 4 === 3;
const getPagumeDays = (year) => (ethiopianLeapYear(year) ? 6 : 5);

// 3. Convert from Gregorian to Ethiopian Date
const toEthiopianDate = (gregorianDate) => {
  const gYear = gregorianDate.getFullYear();
  const gMonth = gregorianDate.getMonth();
  const gDay = gregorianDate.getDate();

  // Ethiopian New Year is on September 11 (or September 12 in a leap year)
  const isLeapYear = ethiopianLeapYear(gYear - 8);
  const newYearDay = isLeapYear ? 12 : 11;

  // Determine if the Gregorian date is before or after the Ethiopian New Year
  const isBeforeNewYear = gMonth < 8 || (gMonth === 8 && gDay < newYearDay);

  // Calculate the Ethiopian year
  const eYear = isBeforeNewYear ? gYear - 8 : gYear - 7;

  // Calculate the number of days since the Ethiopian New Year
  const newYearDate = new Date(gYear, 8, newYearDay);
  if (isBeforeNewYear) {
    newYearDate.setFullYear(gYear - 1);
  }

  const diffDays = Math.floor(
    (gregorianDate - newYearDate) / (1000 * 60 * 60 * 24)
  );

  let eMonth = 0,
    remainingDays = diffDays;

  // Calculate the Ethiopian month and day
  while (remainingDays >= (eMonth === 12 ? getPagumeDays(eYear) : 30)) {
    remainingDays -= eMonth === 12 ? getPagumeDays(eYear) : 30;
    eMonth++;
  }

  return { year: eYear, month: eMonth, day: remainingDays + 1 };
};

// 4. Convert from Ethiopian to Gregorian Date
const toGregorianDate = (ethiopianYear, ethiopianMonth, ethiopianDay) => {
  const gYear = ethiopianYear + 8;
  let newYearDate = new Date(gYear, 8, 11);
  if (ethiopianLeapYear(ethiopianYear)) newYearDate.setDate(12);

  const daysOffset = ethiopianMonth * 30 + ethiopianDay - 1;
  return new Date(newYearDate.getTime() + daysOffset * 24 * 60 * 60 * 1000);
};

// 5. Get First Day of Ethiopian Month in Gregorian Calendar
const firstDayOfMonth = (year, month) => {
  return toGregorianDate(year, month, 1).getDay();
};

// 6. Convert numbers to Ge'ez numerals
const toGeezNumeral = (number) => {
  const geezNumerals = ['፩', '፪', '፫', '፬', '፭', '፮', '፯', '፰', '፱', '፲', '፳', '፴', '፵', '፶', '፷', '፸', '፹', '፺', '፻'];
  const arabicValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  if (number === 0) return '፩';
  if (number > 100) return number.toString(); // Fall back to Arabic numerals for larger numbers

  let result = '';
  let remaining = number;

  for (let i = arabicValues.length - 1; i >= 0; i--) {
    while (remaining >= arabicValues[i]) {
      result += geezNumerals[i];
      remaining -= arabicValues[i];
    }
  }

  return result;
};

// 7. Define Ethiopic month and weekday names
const ethiopicMonthNames = [
  { name: "መስከረም", latin: "Meskerem" },
  { name: "ጥቅምት", latin: "Tikimt" },
  { name: "ኅዳር", latin: "Hidar" },
  { name: "ታኅሳስ", latin: "Tahsas" },
  { name: "ጥር", latin: "Tir" },
  { name: "የካቲት", latin: "Yekatit" },
  { name: "መጋቢት", latin: "Megabit" },
  { name: "ሚያዝያ", latin: "Miazia" },
  { name: "ግንቦት", latin: "Ginbot" },
  { name: "ሰኔ", latin: "Sene" },
  { name: "ሐምሌ", latin: "Hamle" },
  { name: "ነሐሴ", latin: "Nehase" },
  { name: "ጳጉሜን", latin: "Pagumé" },
];

const ethiopicWeekDays = ['እሑድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ'];
const latinWeekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// 8. Render Ethiopian Calendar
const renderCalendar = () => {
  months[12].days = getPagumeDays(currYear);

  const currentMonth = months[currMonth];
  const useGeez = document.getElementById('useGeez').checked;

  // Update month and year display
  const monthName = useGeez ? ethiopicMonthNames[currMonth].name : currentMonth.name;
  const yearDisplay = useGeez ? toGeezNumeral(currYear) : currYear;
  document.querySelector(".current-date").innerText = `${monthName} ${yearDisplay}`;

  // Update weekday names
  const weekDays = document.querySelectorAll('.weeks li');
  weekDays.forEach((day, index) => {
    day.textContent = useGeez ? ethiopicWeekDays[index] : latinWeekDays[index];
  });

  // Calculate days
  const firstDay = firstDayOfMonth(currYear, currMonth);
  const prevMonthDays = currMonth === 0
    ? getPagumeDays(currYear - 1)
    : months[currMonth - 1].days;

  let liTag = "";

  // Previous month's days
  for (let i = firstDay - 1; i >= 0; i--) {
    const dayNum = useGeez ? toGeezNumeral(prevMonthDays - i) : (prevMonthDays - i);
    liTag += `<li class="inactive">${dayNum}</li>`;
  }

  // Current month's days
  const todayEthiopian = toEthiopianDate(new Date());
  const isCurrentMonth = todayEthiopian.year === currYear && todayEthiopian.month === currMonth;

  for (let i = 1; i <= currentMonth.days; i++) {
    const isToday = isCurrentMonth && i === todayEthiopian.day ? "active" : "";
    const dayNum = useGeez ? toGeezNumeral(i) : i;
    liTag += `<li class="${isToday}">${dayNum}</li>`;
  }

  document.querySelector(".days").innerHTML = liTag;
};

// Initialize current date
let { year: currYear, month: currMonth, day: currDay } = toEthiopianDate(new Date());

// Event Listeners
document.querySelectorAll(".icons span").forEach((icon) => {
  icon.addEventListener("click", () => {
    if (icon.id === "prev") {
      currMonth--;
      if (currMonth < 0) {
        currMonth = 12;
        currYear--;
      }
    } else {
      currMonth++;
      if (currMonth > 12) {
        currMonth = 0;
        currYear++;
      }
    }
    renderCalendar();
  });
});

document.getElementById('useGeez').addEventListener('change', renderCalendar);

// Initialize calendar on load
window.addEventListener("load", () => {
  let { year, month, day } = toEthiopianDate(new Date());
  currYear = year;
  currMonth = month;
  currDay = day;
  renderCalendar();
});