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
    if (number > 100) return number.toString();

    let result = '';
    let remaining = number;

    for (let i = GEEZ_NUMERALS.values.length - 1; i >= 0; i--) {
      while (remaining >= GEEZ_NUMERALS.values[i]) {
        result += GEEZ_NUMERALS.numbers[i];
        remaining -= GEEZ_NUMERALS.values[i];
      }
    }

    return result;
  }

  // Time conversion utilities
  static toEthiopianTime(date) {
    const ethiopiaDate = this.getDateWithEthiopianTimezone(date);
    let hours = ethiopiaDate.getHours();
    let minutes = ethiopiaDate.getMinutes();

    let ethiopianHours = ((hours + 6) % 12) || 12;

    const timePeriod = this.getTimePeriod(hours);

    return {
      hours: ethiopianHours,
      minutes: String(minutes).padStart(2, '0'),
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