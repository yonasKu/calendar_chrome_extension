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

  console.log("📅 Gregorian Date:", gYear, gMonth + 1, gDay);

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

  console.log(
    "✅ Converted Ethiopian Date:",
    eYear,
    eMonth + 1,
    remainingDays + 1
  );
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

// 6. Render Ethiopian Calendar
const renderCalendar = () => {
  months[12].days = getPagumeDays(currYear);

  const { year, month, day } = {
    year: currYear,
    month: currMonth,
    day: currDay,
  };
  const currentMonth = months[month];

  document.querySelector(
    ".current-date"
  ).innerText = `${currentMonth.name} ${year}`;

  const daysTag = document.querySelector(".days");
  let liTag = "";

  // Fix: Properly handle previous month days
  const prevMonthDays =
    month === 0
      ? getPagumeDays(year - 1) // If it's Meskerem, previous month is Pagumé
      : months[month - 1].days;

  const firstDay = firstDayOfMonth(year, month);

  for (let i = firstDay - 1; i >= 0; i--) {
    liTag += `<li class="inactive">${prevMonthDays - i}</li>`;
  }

  // Get the actual current Ethiopian date
  const todayEthiopian = toEthiopianDate(new Date());
  const isCurrentMonth =
    todayEthiopian.year === currYear && todayEthiopian.month === currMonth;

  for (let i = 1; i <= currentMonth.days; i++) {
    // Only highlight if it's the real today and the month is the same
    const isToday = isCurrentMonth && i === todayEthiopian.day ? "active" : "";
    liTag += `<li class="${isToday}">${i}</li>`;
  }

  daysTag.innerHTML = liTag;
};

// Make sure the calendar opens with today's date highlighted
let {
  year: currYear,
  month: currMonth,
  day: currDay,
} = toEthiopianDate(new Date());

console.log(`🌍 Current Gregorian Date: ${new Date()}`);
console.log(`📆 Ethiopian Date: ${currYear}-${currMonth + 1}-${currDay}`);

renderCalendar();

// 7. Handle Month Navigation
const prevNextIcon = document.querySelectorAll(".icons span");

prevNextIcon.forEach((icon) => {
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

// Ensure correct date is shown on popup load
window.addEventListener("load", () => {
  let { year, month, day } = toEthiopianDate(new Date());
  currYear = year;
  currMonth = month;
  currDay = day;
  renderCalendar();
});
