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

  static orthodoxEaster(year) {
    // Calculate Julian Easter date first
    let a = year % 19;
    let b = Math.floor(year / 100);
    let c = year % 100;
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

    // Convert to Julian Day Number
    const julianDay = this.gregorianToJulian(year, month, day);
    
    // Convert Julian Day to Gregorian date
    return this.julianToGregorian(julianDay);
  }

  static gregorianToJulian(year, month, day) {
    if (month < 3) {
      year -= 1;
      month += 12;
    }
    const a = Math.floor(year / 100);
    const b = 2 - a + Math.floor(a / 4);
    return Math.floor(365.25 * (year + 4716)) + 
           Math.floor(30.6001 * (month + 1)) + 
           day + b - 1524.5;
  }

  static getEthiopianEaster(year) {
    console.log('\n🕊️ Starting Easter Calculations:');
    console.log('----------------------------------------');
    console.log('1️⃣ Ethiopian Year Input:', year);

    // Get both possible Gregorian years
    const gregorianYears = this.ethiopianToGregorianYear(year);
    console.log('2️⃣ Gregorian Year Range:', gregorianYears);

    // Calculate Easter for both possible years
    const easterDates = [];
    [gregorianYears.start, gregorianYears.end].forEach(gYear => {
      // Calculate Orthodox Easter using Julian calendar algorithm
      const a = gYear % 4;
      const b = gYear % 7;
      const c = gYear % 19;
      const d = (19 * c + 15) % 30;
      const e = (2 * a + 4 * b - d + 34) % 7;
      const month = Math.floor((d + e + 114) / 31);
      const day = ((d + e + 114) % 31) + 1;

      // Create Julian calendar date and add 13 days to convert to Gregorian
      const gregorianDate = new Date(Date.UTC(gYear, month - 1, day));
      gregorianDate.setUTCDate(gregorianDate.getUTCDate() + 13);

      const ethiopianDate = this.toEthiopian(gregorianDate);
      
      if (ethiopianDate.year === year) {
        easterDates.push(ethiopianDate);
        console.log('3️⃣ Found Easter date:', {
          gregorianYear: gYear,
          gregorianDate: gregorianDate.toDateString(),
          ethiopianDate: ethiopianDate
        });
      }
    });

    // There should only be one valid Easter date per Ethiopian year
    if (easterDates.length === 0) {
      throw new Error('No Easter date found for Ethiopian year ' + year);
    }

    return easterDates[0];
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
    const z = Math.floor(julianDay + 0.5);
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

}
// EthiopianDateConverter.getIslamicHolidays(2018); // Ethiopian year 2016

console.log(EthiopianDateConverter.getEthiopianEaster(2018));
console.log(EthiopianDateConverter.getEthiopianEaster(2019));