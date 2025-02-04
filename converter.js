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
    // Julian Calendar Computus for Orthodox Easter
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

    // Use Julian Easter date directly
    let julianEaster = new Date(year, month - 1, day);
    
    console.log('🐣 Easter Calculation:');
    console.log('Year (input):', year);
    console.log('Julian Easter:', julianEaster.toDateString());
    
    return julianEaster; // Return Julian date instead of Gregorian
  }

  static getEthiopianEaster(year) {
    console.log('📅 Getting Ethiopian Easter for year:', year);
    let julianEaster = this.orthodoxEaster(year + 8); // Convert Ethiopian year to Julian
    let ethiopianEaster = this.toEthiopian(julianEaster);
    
    console.log('Julian Easter:', julianEaster.toDateString());
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

  static getIslamicHolidays(ethiopianYear) {
    console.log('🌙 Starting Islamic Holiday Calculations:');
    console.log('Ethiopian Year Input:', ethiopianYear);
    
    const holidays = [];
    
    // Define Islamic holidays: [year, month, day, amharicName, latinName]
    const holidayDefs = [
      [1446, 9, 1, "ረመዳን", "Ramadan Start"],
      [1446, 10, 1, "ኢድ አልፈጥር", "Eid al-Fitr"],
      [1446, 12, 10, "አረፋ", "Eid al-Adha"],
      [1446, 3, 12, "መውሊድ", "Prophet's Birthday"]
    ];

    // Calculate each holiday
    for (const [hijriYear, hijriMonth, hijriDay, amharicName, latinName] of holidayDefs) {
      console.log(`\n📅 Calculating ${latinName}:`);
      console.log(`Hijri date: ${hijriYear}/${hijriMonth}/${hijriDay}`);
      
      // Step 1: Convert Hijri to Julian Day Number
      const julianDay = this.hijriToJulian(hijriYear, hijriMonth, hijriDay);
      console.log('Julian Day Number:', julianDay);
      
      // Step 2: Convert Julian Day Number to Gregorian (subtract 0.5 to account for Islamic day starting at sunset)
      const gregorianDate = this.julianToGregorian(julianDay - 0.5);
      console.log('Gregorian date:', gregorianDate.toDateString());
      
      // Step 3: Convert Gregorian to Ethiopian using existing function
      const ethiopianDate = this.toEthiopian(gregorianDate);
      console.log('Ethiopian date:', 
        `${ethiopianDate.year}/${ethiopianDate.month + 1}/${ethiopianDate.day}`);
      
      holidays.push({
        year: ethiopianDate.year,
        month: ethiopianDate.month,
        day: ethiopianDate.day,
        name: amharicName,
        latinName: latinName
      });
    }

    console.log('\n✅ Final calculated holidays:', holidays);
    return holidays;
  }

  static hijriToJulian(year, month, day) {
    const julianDay = day + 
      Math.ceil(29.5 * (month - 1)) + 
      (year - 1) * 354 + 
      Math.floor((3 + (11 * year)) / 30) + 
      1948439.5;
      
    return julianDay;
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

    return new Date(year, month - 1, day);
  }
}