import { useMemo } from 'react';
import { getSystemEvents } from '@/lib/constants/system-events';

const ANNUAL_DEADLINES = [
  { formCode: 'DJ1887', label: 'DJ 1887 - Remuneraciones', month: 3, day: 27 },
  { formCode: 'DJ1879', label: 'DJ 1879 - Honorarios', month: 3, day: 27 },
  { formCode: 'F22', label: 'F22 - Declaracion Anual de Renta', month: 4, day: 15 },
];

function toUtcDate(year, month, day) {
  return new Date(Date.UTC(year, month - 1, day, 12));
}

function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

function holidayKeys(year) {
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

function nextWorkingDay(date) {
  const result = new Date(date);
  const holidays = holidayKeys(result.getUTCFullYear());
  while (!isWorkingDay(result, holidays)) {
    result.setUTCDate(result.getUTCDate() + 1);
  }
  return result;
}

function workingDaysLeft(date, now) {
  if (date.getTime() <= now.getTime()) return 0;
  let cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  let total = 0;
  while (cursor < end) {
    const holidays = holidayKeys(cursor.getUTCFullYear());
    if (isWorkingDay(cursor, holidays)) total += 1;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return total;
}

function makeDeadline(formCode, label, date, recurrence, now) {
  const dueDate = nextWorkingDay(date);
  return {
    formCode,
    label,
    dueDate,
    dueDateIso: dueDate.toISOString(),
    recurrence,
    workingDaysLeft: workingDaysLeft(dueDate, now),
    isPast: dueDate.getTime() < now.getTime(),
  };
}

export function getSIIDeadlines(year, now = new Date()) {
  const deadlines = [];

  for (let month = 1; month <= 12; month += 1) {
    deadlines.push(makeDeadline(
      'F29',
      'F29 - Declaracion mensual IVA y PPM',
      toUtcDate(month === 12 ? year + 1 : year, month === 12 ? 1 : month + 1, 12),
      'monthly',
      now,
    ));
    deadlines.push(makeDeadline(
      'LRE',
      'LRE - Libro de Remuneraciones Electronico',
      toUtcDate(month === 12 ? year + 1 : year, month === 12 ? 1 : month + 1, 15),
      'monthly',
      now,
    ));
  }

  ANNUAL_DEADLINES.forEach((deadline) => {
    deadlines.push(makeDeadline(
      deadline.formCode,
      deadline.label,
      toUtcDate(year, deadline.month, deadline.day),
      'annual',
      now,
    ));
  });

  return deadlines.sort((first, second) => first.dueDate - second.dueDate);
}

export function useSIIDeadlines(year = new Date().getFullYear()) {
  return useMemo(() => getSIIDeadlines(year), [year]);
}

export default useSIIDeadlines;
