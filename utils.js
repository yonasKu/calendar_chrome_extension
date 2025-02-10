import { CALENDAR_CONFIG, GEEZ_NUMERALS } from './config.js';

export class EthiopianCalendarUtils {
  // Calendar calculation utilities
  static isLeapYear(year) {
    return year % 4 === 3;
  }

  static getPagumeDays(year) {
    return this.isLeapYear(year) ? 6 : 5;
  }

  // UTC and timezone utilities
  static getUtcDate(gregorianDate) {
    return new Date(
      Date.UTC(
        gregorianDate.getFullYear(),
        gregorianDate.getMonth(),
        gregorianDate.getDate()
      )
    );
  }

  static getEthiopianNewYearUtc(gregorianYear) {
    const ethiopianNewYear = this.isLeapYear(gregorianYear - 8) ? 12 : 11;
    return new Date(Date.UTC(gregorianYear, 8, ethiopianNewYear));
  }

  static getDateWithEthiopianTimezone(date) {
    const ethiopiaOffset = CALENDAR_CONFIG.TIMEZONE_OFFSET * 60;
    const userOffset = date.getTimezoneOffset();
    const totalOffset = ethiopiaOffset + userOffset;
    return new Date(date.getTime() + totalOffset * 60 * 1000);
  }

  // Numeral conversion utilities
  static toGeezNumeral(number) {
    if (number === 0) return '፩';
    
    // Special handling for years (numbers >= 100)
    if (number >= 100) {
        const hundreds = Math.floor(number / 100);
        const remainder = number % 100;
        
        let result = '';
        
        // Add hundreds
        if (hundreds > 1) {
            result += this.toGeezNumeral(hundreds);
        }
        result += '፻'; // Add the hundred symbol
        
        // Add remainder if any
        if (remainder > 0) {
            result += this.toGeezNumeral(remainder);
        }
        
        return result;
    }

    // Handle numbers less than 100
    let result = '';
    let remaining = number;

    // Handle tens
    if (remaining >= 10) {
        const tensIndex = Math.floor(remaining / 10) + 8; // Index for tens symbols (፲,፳,፴,etc)
        result += GEEZ_NUMERALS.numbers[tensIndex];
        remaining %= 10;
    }

    // Handle ones
    if (remaining > 0) {
        result += GEEZ_NUMERALS.numbers[remaining - 1];
    }

    return result;
  }

  // Time conversion utilities
  static toEthiopianTime(date) {
    const ethiopiaDate = this.getDateWithEthiopianTimezone(date);
    let hours = ethiopiaDate.getHours();
    let minutes = ethiopiaDate.getMinutes();
    let seconds = ethiopiaDate.getSeconds();

    let ethiopianHours = ((hours + 6) % 12) || 12;

    const timePeriod = this.getTimePeriod(hours);

    return {
      hours: ethiopianHours,
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
      timePeriod: timePeriod
    };
  }

  static getTimePeriod(hours) {
    if (hours >= 0 && hours < 6) {
      return { amharic: "ለሊት", latin: "Night" };
    } else if (hours >= 6 && hours < 12) {
      return { amharic: "ጠዋት", latin: "Morning" };
    } else if (hours >= 12 && hours < 18) {
      return { amharic: "ከሰዓት", latin: "Afternoon" };
    } else {
      return { amharic: "ማታ", latin: "Evening" };
    }
  }
}