import type { AttendanceRecord, AttendanceStatus, MonthlySummary } from '../types';

const OFFICE_START_HOUR = 9;
const GRACE_PERIOD_MINUTES = 15;


const EXPECTED_WORK_MINUTES = 8 * 60;

export function getGraceDeadline(date: Date): Date {
  const d = new Date(date);
  d.setHours(OFFICE_START_HOUR, GRACE_PERIOD_MINUTES, 0, 0);
  return d;
}

export function determineStatus(
  clockIn: Date | null,
  clockOut: Date | null
): AttendanceStatus {
  if (!clockIn) return 'absent';
  if (!clockOut) return 'incomplete';

  const grace = getGraceDeadline(clockIn);
  if (clockIn.getTime() > grace.getTime()) {
    return 'late';
  }

  const workingMinutes = calculateWorkingMinutes(clockIn, clockOut);
  if (workingMinutes < EXPECTED_WORK_MINUTES) {
    // If clocked out before 8 hours even when on time
    return 'incomplete';
  }

  return 'present';
}

export function calculateWorkingMinutes(
  clockIn: Date | null,
  clockOut: Date | null
): number {
  if (!clockIn || !clockOut) return 0;
  return Math.floor((clockOut.getTime() - clockIn.getTime()) / (1000 * 60));
}

export function formatMinutesToDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatTimeFromISO(iso: string): string {
  return formatTime(new Date(iso));
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function isWorkingDay(date: Date): boolean {
  return !isWeekend(date);
}

export function getWorkingDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    if (isWorkingDay(date)) {
      days.push(new Date(date));
    }
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export function getWorkingDaysUpToToday(year: number, month: number): Date[] {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return getWorkingDaysInMonth(year, month).filter((d) => d <= today);
}

export function calculateMonthlySummary(
  records: AttendanceRecord[],
  year: number,
  month: number
): MonthlySummary {
  const workingDays = getWorkingDaysUpToToday(year, month);
  const totalWorkingDays = workingDays.length;

  let present = 0;
  let late = 0;
  let absent = 0;
  let incomplete = 0;

  for (const day of workingDays) {
    const dateStr = formatDateKey(day);
    const record = records.find((r) => r.date === dateStr);

    if (!record) {
      absent++;
    } else {
      switch (record.status) {
        case 'present':
          present++;
          break;
        case 'late':
          late++;
          break;
        case 'absent':
          absent++;
          break;
        case 'incomplete':
          incomplete++;
          break;
      }
    }
  }

  const attendedDays = present + late;
  const attendancePercentage =
    totalWorkingDays > 0
      ? Math.round((attendedDays / totalWorkingDays) * 100)
      : 0;

  return {
    present,
    absent,
    late,
    incomplete,
    totalWorkingDays,
    attendancePercentage,
  };
}

export function getStatusColor(status: AttendanceStatus): string {
  switch (status) {
    case 'present':
      return 'text-emerald-600 bg-emerald-50';
    case 'late':
      return 'text-amber-600 bg-amber-50';
    case 'absent':
      return 'text-rose-600 bg-rose-50';
    case 'incomplete':
      return 'text-blue-600 bg-blue-50';
  }
}

export function getStatusDotColor(status: AttendanceStatus): string {
  switch (status) {
    case 'present':
      return 'bg-emerald-500';
    case 'late':
      return 'bg-amber-500';
    case 'absent':
      return 'bg-rose-500';
    case 'incomplete':
      return 'bg-blue-500';
  }
}
