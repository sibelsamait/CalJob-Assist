import { useMemo } from 'react';
import { CHILEAN_HOLIDAYS } from '@/lib/constants/holidays';

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function isHoliday(date) {
  const iso = date.toISOString().slice(0, 10);
  return CHILEAN_HOLIDAYS.some((holiday) => holiday.date === iso);
}

export function useWorkingDays() {
  const helpers = useMemo(() => ({
    addWorkingDays(date, days) {
      const start = parseDate(date);
      if (!start) return null;
      let current = new Date(start);
      let remaining = days;
      while (remaining > 0) {
        current.setDate(current.getDate() + 1);
        if (!isWeekend(current) && !isHoliday(current)) {
          remaining -= 1;
        }
      }
      return current;
    },
    countWorkingDays(from, to) {
      const start = parseDate(from);
      const end = parseDate(to);
      if (!start || !end) return 0;
      const range = [];
      const current = new Date(start);
      while (current <= end) {
        range.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      return range.filter((day) => !isWeekend(day) && !isHoliday(day)).length;
    },
  }), []);

  return helpers;
}

export default useWorkingDays;
