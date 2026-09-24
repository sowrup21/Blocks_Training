import { useState } from 'react';
import { useAttendance } from '../contexts/attendance-context';
import { useTranslation } from '../contexts/localization-context';
import { MonthlySummary } from '../components/monthly-summary';
import { AttendanceTable } from '../components/attendance-table';
import { AttendanceCalendar } from '../components/attendance-calendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function AttendancePage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const { getRecordsForMonth } = useAttendance();
  const { t, currentLanguage } = useTranslation();

  const records = getRecordsForMonth(year, month);

  const goPrev = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goNext = () => {
    const isCurrentMonth =
      year === now.getFullYear() && month === now.getMonth();
    if (isCurrentMonth) return;
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const isCurrentMonth =
    year === now.getFullYear() && month === now.getMonth();

  const monthLabel = new Date(year, month).toLocaleDateString(currentLanguage, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t('attendance.title', 'Attendance Records')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('attendance.subtitle', 'Track and review your monthly attendance history')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[140px] text-center text-sm font-semibold text-slate-900">
            {monthLabel}
          </span>
          <button
            onClick={goNext}
            disabled={isCurrentMonth}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-6">
        <MonthlySummary year={year} month={month} />
      </div>

      <div className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-500 uppercase tracking-wider">
          {t('attendance.calendar', 'Calendar')}
        </h2>
        <AttendanceCalendar records={records} year={year} month={month} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-500 uppercase tracking-wider">
          {t('attendance.table', 'Table')}
        </h2>
        <AttendanceTable records={records} />
      </div>
    </div>
  );
}
