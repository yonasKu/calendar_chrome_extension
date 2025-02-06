import { EthiopianCalendarUtils } from './utils.js';

export class EthiopianDateConverter {
  static toEthiopian(gregorianDate) {
    const utcDate = EthiopianCalendarUtils.getUtcDate(gregorianDate);
    const gYear = utcDate.getUTCFullYear();

    // Get Ethiopian New Year's date in UTC
    const newYearDate = EthiopianCalendarUtils.getEthiopianNewYearUtc(gYear);

    // Check if before Ethiopian New Year
    const isBeforeNewYear = utcDate < newYearDate;
    const eYear = isBeforeNewYear ? gYear - 8 : gYear - 7;

    // If before new year, use previous year's new year date
    const effectiveNewYear = isBeforeNewYear ?
      EthiopianCalendarUtils.getEthiopianNewYearUtc(gYear - 1) :
      newYearDate;

    const diffDays = Math.floor((utcDate - effectiveNewYear) / (1000 * 60 * 60 * 24));

    return this.calculateEthiopianDate(eYear, diffDays);
  }

  static calculateEthiopianDate(eYear, diffDays) {
    let eMonth = 0;
    let remainingDays = diffDays;

    while (remainingDays >= (eMonth === 12 ?
      EthiopianCalendarUtils.getPagumeDays(eYear) : 30)) {
      remainingDays -= eMonth === 12 ?
        EthiopianCalendarUtils.getPagumeDays(eYear) : 30;
      eMonth++;
    }

    return {
      year: eYear,
      month: eMonth,
      day: remainingDays + 1
    };
  }

  static toGregorian(ethiopianYear, ethiopianMonth, ethiopianDay) {
    const gYear = ethiopianYear + 7;
    const newYearDate = EthiopianCalendarUtils.getEthiopianNewYearUtc(gYear);

    const daysOffset = ethiopianMonth * 30 + ethiopianDay - 1;
    const gregorianDate = new Date(newYearDate.getTime() + daysOffset * 24 * 60 * 60 * 1000);

    return new Date(
      gregorianDate.getUTCFullYear(),
      gregorianDate.getUTCMonth(),
      gregorianDate.getUTCDate()
    );
  }

  // Add these new methods
  static getFirstDayOfMonth(ethiopianYear, ethiopianMonth) {
    // Get the Gregorian date for the first day of the Ethiopian month
    const gregorianDate = this.toGregorian(ethiopianYear, ethiopianMonth, 1);
    // Get the day of week (0-6, where 0 is Sunday)
    return gregorianDate.getDay();
  }

  static getCurrentEthiopianDate() {
    return this.toEthiopian(new Date());
  }

  static getDaysInMonth(ethiopianYear, ethiopianMonth) {
    // Return 30 for regular months, or the correct Pagume days for the 13th month
    return ethiopianMonth === 12 ?
      EthiopianCalendarUtils.getPagumeDays(ethiopianYear) : 30;
  }

  static isValidDate(year, month, day) {
    if (month < 0 || month > 12) return false;
    if (day < 1) return false;

    const daysInMonth = this.getDaysInMonth(year, month);
    return day <= daysInMonth;
  }

  static getEthiopianEaster(ethiopianYear) {
    console.log('📅 Getting Ethiopian Easter for year:', ethiopianYear);

    // Get both possible Gregorian years for this Ethiopian year
    const gregorianYears = this.ethiopianToGregorianYear(ethiopianYear);
    console.log('Gregorian Year Range:', gregorianYears);

    // Calculate Easter for both possible years
    const easterDates = [];
    [gregorianYears.start, gregorianYears.end].forEach(gYear => {
      // Calculate Orthodox Easter in Julian calendar
      let a = gYear % 19;
      let b = Math.floor(gYear / 100);
      let c = gYear % 100;
      let d = Math.floor(b / 4);
      let e = b % 4;
      let f = Math.floor((b + 8) / 25);
      let g = Math.floor((b - f + 1) / 3);
      let h = (19 * a + b - d - g + 15) % 30;
      let i = Math.floor(c / 4);
      let k = c % 4;
      let l = (32 + 2 * e + 2 * i - h - k) % 7;
      let m = Math.floor((a + 11 * h + 22 * l) / 451);
      let month = Math.floor((h + l - 7 * m + 114) / 31);
      let day = ((h + l - 7 * m + 114) % 31) + 1;

      // Convert to Gregorian date
      const gregorianDate = new Date(Date.UTC(gYear, month - 1, day));

      // Convert to Ethiopian
      const ethiopianDate = this.toEthiopian(gregorianDate);

      if (ethiopianDate.year === ethiopianYear) {
        easterDates.push(ethiopianDate);
      }
    });

    // There should only be one valid Easter date for the Ethiopian year
    const ethiopianEaster = easterDates[0];
    console.log('Ethiopian Easter:', ethiopianEaster);
    return ethiopianEaster;
  }

  static getEasterRelatedHolidays(ethiopianYear) {
    console.log('🎄 Calculating Easter holidays for Ethiopian year:', ethiopianYear);
    const easter = this.getEthiopianEaster(ethiopianYear);

    // Calculate Good Friday (2 days before Easter)
    let goodFridayDay = easter.day - 2;
    let goodFridayMonth = easter.month;

    // Handle month boundary crossing
    if (goodFridayDay <= 0) {
      goodFridayMonth--;
      if (goodFridayMonth < 0) {
        goodFridayMonth = 12;
      }
      goodFridayDay += this.getDaysInMonth(ethiopianYear, goodFridayMonth);
    }

    const holidays = {
      goodFriday: {
        month: goodFridayMonth,
        day: goodFridayDay,
        name: "ስቅለት",
        latinName: "Good Friday"
      },
      easter: {
        month: easter.month,
        day: easter.day,
        name: "ፋሲካ",
        latinName: "Easter"
      }
    };

    console.log('Calculated holidays:', holidays);
    return holidays;
  }

  static ethiopianToGregorianYear(ethiopianYear, ethiopianMonth = null) {
    // If month is provided, use it to determine which Gregorian year
    if (ethiopianMonth !== null) {
      // Months 0-3 fall in the later Gregorian year
      return ethiopianMonth <= 3 ? ethiopianYear + 8 : ethiopianYear + 7;
    }

    // If no month provided, return both possible Gregorian years
    return {
      start: ethiopianYear + 7,  // September to December
      end: ethiopianYear + 8     // January to August
    };
  }

  static gregorianToHijriYear(gregorianYear) {
    return Math.floor((gregorianYear - 622) * 33 / 32);
  }

  static hijriToJulian(year, month, day) {
    // Using the standard Islamic calendar calculation
    // Add 0.75 (18 hours) to account for Islamic day starting at sunset
    return Math.floor((year - 1) * 354.367) +
      Math.floor((month - 1) * 29.5) +
      day + 1948439.5 - 0.75; // Subtract 18 hours to account for Islamic calendar day starting at sunset
  }

  static getIslamicHolidays(ethiopianYear) {
    console.log('\n🌙 Starting Islamic Holiday Calculations:');
    console.log('----------------------------------------');
    console.log('1️⃣ Ethiopian Year Input:', ethiopianYear);

    // Get both possible Gregorian years
    const gregorianYears = this.ethiopianToGregorianYear(ethiopianYear);
    console.log('2️⃣ Gregorian Year Range:', gregorianYears);

    // Calculate Hijri years with a wider range to ensure we catch all holidays
    const hijriYearStart = this.gregorianToHijriYear(gregorianYears.start);
    const hijriYearEnd = this.gregorianToHijriYear(gregorianYears.end);

    // Add buffer years to ensure we don't miss any holidays
    const hijriYears = [hijriYearStart - 1, hijriYearStart, hijriYearEnd, hijriYearEnd + 1];
    console.log('3️⃣ Hijri Years to check:', hijriYears);

    const holidays = [];

    // Define Islamic holidays with accurate information about their status
    const holidayDefs = [
      // Major public holidays (no work days)
      [10, 1, "ኢድ አልፈጥር", "Eid al-Fitr", "Subject to lunar sighting", true],
      [12, 10, "አረፋ", "Eid al-Adha", "Subject to lunar sighting", true],

      // Religious observances (not public holidays)
      [3, 12, "መውሊድ", "Prophet's Birthday", "Religious observance", false]
    ];

    // Calculate each holiday
    for (const hijriYear of hijriYears) {
      for (const [hijriMonth, hijriDay, amharicName, latinName, note, isPublicHoliday] of holidayDefs) {
        const julianDay = this.hijriToJulian(hijriYear, hijriMonth, hijriDay);
        const gregorianDate = this.julianToGregorian(julianDay);
        const ethiopianDate = this.toEthiopian(gregorianDate);

        if (ethiopianDate.year === ethiopianYear) {
          holidays.push({
            year: ethiopianDate.year,
            month: ethiopianDate.month,
            day: ethiopianDate.day,
            name: amharicName,
            latinName: latinName,
            isLunar: true,
            note: note,
            approximate: true,
            isPublicHoliday: isPublicHoliday
          });
        }
      }
    }

    // Remove duplicates
    const uniqueHolidays = holidays.filter((holiday, index, self) =>
      index === self.findIndex((h) =>
        h.month === holiday.month &&
        h.day === holiday.day &&
        h.name === holiday.name
      )
    );

    console.log('\n✅ Final calculated holidays:', JSON.stringify(uniqueHolidays, null, 2));
    return uniqueHolidays;
  }

  static julianToGregorian(julianDay) {
    // Subtract the 6-hour offset before conversion
    const z = Math.floor(julianDay - 0.25 + 0.5);
    const a = Math.floor((z - 1867216.25) / 36524.25);
    const b = z + 1 + a - Math.floor(a / 4);
    const c = b + 1524;
    const d = Math.floor((c - 122.1) / 365.25);
    const e = Math.floor(365.25 * d);
    const f = Math.floor((c - e) / 30.6001);

    const day = Math.floor(c - e - Math.floor(30.6001 * f));
    const month = f - 1 - 12 * Math.floor(f / 14);
    const year = d - 4715 - Math.floor((7 + month) / 10);

    // Return a UTC Date object
    return new Date(Date.UTC(year, month - 1, day));
  }

  static gregorianToJulian(date) {
    // Convert Gregorian date to Julian day number
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return Math.floor(367 * year - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4)
      - Math.floor(3 * (Math.floor((year + (month - 9) / 7) / 100) + 1) / 4)
      + Math.floor(275 * month / 9) + day + 1721028.5);
  }

}
// EthiopianDateConverter.getIslamicHolidays(2018); // Ethiopian year 2016