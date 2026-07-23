const SYSTEM_EVENT_DEFINITIONS = [
  {
    key: 'sii-f29',
    title: 'Vencimiento F29 - Declaracion mensual IVA y PPM',
    eventType: 'sii_deadline',
    recurrence: 'monthly',
    day: 12,
    color: '#C0392B',
    metadata: { form_code: 'F29', law_ref: 'Art. 64 DL 825', type: 'sii_deadline' },
  },
  {
    key: 'sii-f22',
    title: 'Vencimiento F22 - Declaracion Anual Renta',
    eventType: 'sii_deadline',
    recurrence: 'annual',
    month: 4,
    day: 15,
    color: '#C0392B',
    metadata: { form_code: 'F22', law_ref: 'Art. 69 LIR', type: 'sii_deadline' },
  },
  {
    key: 'sii-dj-1887',
    title: 'Vencimiento DJ 1887 - Remuneraciones trabajadores',
    eventType: 'sii_deadline',
    recurrence: 'annual',
    month: 3,
    day: 27,
    color: '#C0392B',
    metadata: { form_code: 'DJ1887', law_ref: 'Art. 42 N°1 LIR', type: 'sii_deadline' },
  },
  {
    key: 'sii-dj-1879',
    title: 'Vencimiento DJ 1879 - Honorarios trabajadores independientes',
    eventType: 'sii_deadline',
    recurrence: 'annual',
    month: 3,
    day: 27,
    color: '#C0392B',
    metadata: { form_code: 'DJ1879', law_ref: 'Art. 42 N°2 LIR', type: 'sii_deadline' },
  },
  {
    key: 'sii-dj-1907',
    title: 'Vencimiento DJ 1907 - Cotizaciones previsionales AFP',
    eventType: 'sii_deadline',
    recurrence: 'annual',
    month: 6,
    day: 30,
    color: '#C0392B',
    metadata: { form_code: 'DJ1907', law_ref: 'DL 3500', type: 'sii_deadline' },
  },
  {
    key: 'dt-worker-day',
    title: 'Dia del Trabajador - Feriado legal irrenunciable',
    eventType: 'dt_deadline',
    recurrence: 'annual',
    month: 5,
    day: 1,
    isAllDay: true,
    color: '#0050a0',
    metadata: { type: 'dt_deadline' },
  },
  {
    key: 'dt-imm-adjustment',
    title: 'Reajuste IMM - Vigencia nuevo Ingreso Minimo Mensual',
    eventType: 'dt_deadline',
    recurrence: 'annual',
    month: 5,
    day: 1,
    color: '#0050a0',
    metadata: { law_ref: 'Ley 21.830', type: 'dt_deadline' },
  },
];

const FIXED_HOLIDAYS = [
  ['Año Nuevo', 1, 1],
  ['Dia del Trabajador', 5, 1],
  ['Dia de las Glorias Navales', 5, 21],
  ['San Pedro y San Pablo', 6, 29],
  ['Virgen del Carmen', 7, 16],
  ['Asuncion de la Virgen', 8, 15],
  ['Independencia Nacional', 9, 18],
  ['Glorias del Ejercito', 9, 19],
  ['Encuentro de Dos Mundos', 10, 12],
  ['Dia de las Iglesias Evangelicas', 10, 31],
  ['Dia de Todos los Santos', 11, 1],
  ['Inmaculada Concepcion', 12, 8],
  ['Navidad', 12, 25],
];

function dateAtNoon(year, month, day) {
  return new Date(Date.UTC(year, month - 1, day, 12)).toISOString();
}

function easterSunday(year) {
  const century = Math.floor(year / 100);
  const yearOfCentury = year % 100;
  const lunarCycle = year % 19;
  const centuryRemainder = century % 4;
  const lunarCorrection = Math.floor((century + 8) / 25);
  const solarCorrection = Math.floor((century - lunarCorrection + 1) / 3);
  const epact = (19 * lunarCycle + century - Math.floor(century / 4) - solarCorrection + 15) % 30;
  const weekday = (32 + 2 * centuryRemainder + 2 * Math.floor(yearOfCentury / 4) - epact - yearOfCentury % 4) % 7;
  const monthOffset = Math.floor((lunarCycle + 11 * epact + 22 * weekday) / 451);
  const month = Math.floor((epact + weekday - 7 * monthOffset + 114) / 31);
  const day = ((epact + weekday - 7 * monthOffset + 114) % 31) + 1;

  return new Date(Date.UTC(year, month - 1, day, 12));
}

function relativeDate(date, days) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString();
}

function holidayEvent(key, title, startDate) {
  return {
    key,
    title,
    eventType: 'custom',
    source: 'system',
    startDate,
    isAllDay: true,
    recurrence: 'annual',
    color: '#718096',
    metadata: { type: 'feriado' },
  };
}

export function getSystemEvents(year) {
  const events = SYSTEM_EVENT_DEFINITIONS.flatMap((definition) => {
    if (definition.recurrence === 'monthly') {
      return Array.from({ length: 12 }, (_, monthIndex) => ({
        ...definition,
        key: `${definition.key}-${monthIndex + 1}`,
        source: 'system',
        startDate: dateAtNoon(year, monthIndex + 1, definition.day),
      }));
    }

    return [{
      ...definition,
      source: 'system',
      startDate: dateAtNoon(year, definition.month, definition.day),
    }];
  });

  FIXED_HOLIDAYS.forEach(([title, month, day]) => {
    events.push(holidayEvent(`holiday-${year}-${month}-${day}`, title, dateAtNoon(year, month, day)));
  });

  const easter = easterSunday(year);
  events.push(holidayEvent(`holiday-${year}-good-friday`, 'Viernes Santo', relativeDate(easter, -2)));
  events.push(holidayEvent(`holiday-${year}-holy-saturday`, 'Sabado Santo', relativeDate(easter, -1)));

  return events;
}

export { SYSTEM_EVENT_DEFINITIONS };
export default SYSTEM_EVENT_DEFINITIONS;
