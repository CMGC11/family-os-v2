import { requireSupabaseClient } from '../../../lib/supabase/client';
import { getCurrentHouseholdId } from '../../../lib/supabase/household';
import { fetchHouseholdPeople } from '../../../lib/supabase/person';
import type { CalendarEvent } from '../types';

type BirthdayCandidateRow = {
  id: string;
  birthday?: string | null;
  birth_date?: string | null;
  birthdate?: string | null;
  date_of_birth?: string | null;
  dob?: string | null;
};

type HolidayDefinition = {
  key: string;
  title: string;
  date: string;
};

const BIRTHDAY_COLUMN_CANDIDATES: Array<keyof BirthdayCandidateRow> = [
  'birthday',
  'birth_date',
  'birthdate',
  'date_of_birth',
  'dob',
];

function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function createLocalDate(year: number, monthIndex: number, day: number) {
  return new Date(year, monthIndex, day, 12, 0, 0, 0);
}

function getEasterSunday(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return createLocalDate(year, month - 1, day);
}

function getKingsDayDate(year: number) {
  const kingsDay = createLocalDate(year, 3, 27);

  if (kingsDay.getDay() === 0) {
    return createLocalDate(year, 3, 26);
  }

  return kingsDay;
}

function getDutchPublicHolidays(year: number): HolidayDefinition[] {
  const easterSunday = getEasterSunday(year);

  return [
    { key: 'new-years-day', title: "New Year's Day", date: toDateString(createLocalDate(year, 0, 1)) },
    { key: 'good-friday', title: 'Good Friday', date: toDateString(addDays(easterSunday, -2)) },
    { key: 'easter-sunday', title: 'Easter Sunday', date: toDateString(easterSunday) },
    { key: 'easter-monday', title: 'Easter Monday', date: toDateString(addDays(easterSunday, 1)) },
    { key: 'kings-day', title: "King's Day", date: toDateString(getKingsDayDate(year)) },
    { key: 'liberation-day', title: 'Liberation Day', date: toDateString(createLocalDate(year, 4, 5)) },
    { key: 'ascension-day', title: 'Ascension Day', date: toDateString(addDays(easterSunday, 39)) },
    { key: 'whit-sunday', title: 'Whit Sunday', date: toDateString(addDays(easterSunday, 49)) },
    { key: 'whit-monday', title: 'Whit Monday', date: toDateString(addDays(easterSunday, 50)) },
    { key: 'christmas-day', title: 'Christmas Day', date: toDateString(createLocalDate(year, 11, 25)) },
    { key: 'boxing-day', title: 'Boxing Day', date: toDateString(createLocalDate(year, 11, 26)) },
  ];
}

function createVirtualEvent(input: {
  id: string;
  title: string;
  date: string;
  source: 'birthday' | 'holiday';
  category: string;
}): CalendarEvent {
  return {
    id: input.id,
    household_id: 'virtual',
    title: input.title,
    date: input.date,
    time: 'All day',
    created_at: `${input.date}T00:00:00.000Z`,
    end_date: input.date,
    is_multi_day: false,
    start_time: null,
    end_time: null,
    all_day: true,
    category: input.category,
    visibility: 'shared',
    responsible_id: null,
    location: null,
    notes: null,
    reminder: null,
    is_busy: false,
    updated_at: null,
    recurrence: null,
    recurrence_end: null,
    recurrence_parent_id: null,
    source: input.source,
    is_virtual: true,
  };
}

function getYearsAroundToday() {
  const currentYear = new Date().getFullYear();

  return [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
}

const specialEventsCache = new Map<string, CalendarEvent[]>();

function normalizeYears(years: number[]) {
  return [...new Set(years)].sort((a, b) => a - b);
}

function getYearsCacheKey(years: number[]) {
  return normalizeYears(years).join('|');
}

function getBirthdayValue(row: BirthdayCandidateRow) {
  for (const column of BIRTHDAY_COLUMN_CANDIDATES) {
    const value = row[column];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function buildBirthdayDateForYear(rawBirthday: string, year: number) {
  const datePart = rawBirthday.slice(0, 10);
  const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) return null;

  const month = Number(match[2]);
  const day = Number(match[3]);

  if (!Number.isFinite(month) || !Number.isFinite(day)) return null;

  const birthdayDate = createLocalDate(year, month - 1, day);

  if (birthdayDate.getMonth() !== month - 1) {
    return month === 2 && day === 29 ? `${year}-02-28` : null;
  }

  return toDateString(birthdayDate);
}

async function fetchBirthdayRows(): Promise<BirthdayCandidateRow[]> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();
  let firstSupportedRows: BirthdayCandidateRow[] = [];

  for (const birthdayColumn of BIRTHDAY_COLUMN_CANDIDATES) {
    const { data, error } = await supabase
      .from('people')
      .select(`id, ${birthdayColumn}`)
      .eq('household_id', householdId);

    if (error) continue;

    const rows = (data ?? []) as unknown as BirthdayCandidateRow[];

    if (firstSupportedRows.length === 0) {
      firstSupportedRows = rows;
    }

    if (rows.some((row) => getBirthdayValue(row))) {
      return rows;
    }
  }

  return firstSupportedRows;
}

export async function fetchCalendarSpecialEvents(years = getYearsAroundToday()): Promise<CalendarEvent[]> {
  const normalizedYears = normalizeYears(years);
  const cacheKey = getYearsCacheKey(normalizedYears);
  const cachedEvents = specialEventsCache.get(cacheKey);

  if (cachedEvents) {
    return cachedEvents;
  }

  const specialEvents: CalendarEvent[] = [];

  normalizedYears.forEach((year) => {
    getDutchPublicHolidays(year).forEach((holiday) => {
      specialEvents.push(
        createVirtualEvent({
          id: `holiday-nl-${year}-${holiday.key}`,
          title: holiday.title,
          date: holiday.date,
          source: 'holiday',
          category: 'holiday',
        }),
      );
    });
  });

  try {
    const [people, birthdayRows] = await Promise.all([fetchHouseholdPeople(), fetchBirthdayRows()]);
    const peopleById = new Map(people.map((person) => [person.id, person]));

    birthdayRows.forEach((row) => {
      const rawBirthday = getBirthdayValue(row);
      const person = peopleById.get(row.id);

      if (!rawBirthday || !person) return;

      normalizedYears.forEach((year) => {
        const birthdayDate = buildBirthdayDateForYear(rawBirthday, year);

        if (!birthdayDate) return;

        specialEvents.push(
          createVirtualEvent({
            id: `birthday-${row.id}-${year}`,
            title: `${person.label}'s birthday`,
            date: birthdayDate,
            source: 'birthday',
            category: 'birthday',
          }),
        );
      });
    });
  } catch (error) {
    console.error('Failed to load birthday calendar events:', error);
  }

  const sortedEvents = specialEvents.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));

  specialEventsCache.set(cacheKey, sortedEvents);

  return sortedEvents;
}

export function clearCalendarSpecialEventsCache() {
  specialEventsCache.clear();
}

