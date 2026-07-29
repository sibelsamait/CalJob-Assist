import { useEffect, useMemo, useState } from 'react';
import { getSystemEvents } from '@/lib/constants/system-events';

function parseDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? new Date(value) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

function getHolidayKeys(year) {
  return new Set(
    getSystemEvents(year)
      .filter((event) => event.metadata?.type === 'feriado')
      .map((event) => event.startDate.slice(0, 10)),
  );
}

function isWorkingDay(date, holidays) {
  const day = date.getUTCDay();
  return day !== 0 && day !== 6 && !holidays.has(dateKey(date));
}

function countWorkingDays(from, to) {
  if (to <= from) return 0;
  let cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  const end = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()));
  let count = 0;
  while (cursor < end) {
    if (isWorkingDay(cursor, getHolidayKeys(cursor.getUTCFullYear()))) count += 1;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return count;
}

function calculateCountdown(value) {
  const target = parseDate(value);
  if (!target) return { workingDaysLeft: 0, hoursLeft: 0, isUrgent: false, isPast: false };

  const now = new Date();
  const millisecondsLeft = target.getTime() - now.getTime();
  const hoursLeft = Math.max(0, millisecondsLeft / (60 * 60 * 1000));
  const isPast = millisecondsLeft < 0;
  return {
    workingDaysLeft: isPast ? 0 : countWorkingDays(now, target),
    hoursLeft,
    isUrgent: !isPast && hoursLeft < 24,
    isPast,
  };
}

export function useDeadlineCountdown(date) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  return useMemo(() => calculateCountdown(date), [date, now]);
}

export default useDeadlineCountdown;
