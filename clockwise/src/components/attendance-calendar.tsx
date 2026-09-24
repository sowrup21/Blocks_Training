import { useState } from 'react';
import type { AttendanceRecord } from '../types';
import { useTranslation } from '../contexts/localization-context';
import {
  isWeekend,
  getStatusColor,
  getStatusDotColor,
  formatTimeFromISO,
  formatMinutesToDuration,
  formatDateKey,
} from '../lib/attendance';
import { cn } from '../lib/utils';
import { X } from 'lucide-react';

interface AttendanceCalendarProps {
  records: AttendanceRecord[];
  year: number;
  month: number;
}

export function AttendanceCalendar({
  records,
  year,
  month,
}: AttendanceCalendarProps) {
  const { t, currentLanguage } = useTranslation();
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(
    null
  );

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow = firstDay.getDay();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const recordMap = new Map(records.map((r) => [r.date, r]));

  const cells: { date: Date | null; record?: AttendanceRecord }[] = [];
  for (let i = 0; i < startDow; i++) cells.push({ date: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateStr = formatDateKey(date);
    cells.push({ date, record: recordMap.get(dateStr) });
  }

  // Weekdays dynamically formatted according to current language
  const weekdays = [0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
    // 2026-09-20 was Sunday (day 0)
    const sampleDate = new Date(2026, 8, 20 + dayIndex);
    return sampleDate.toLocaleDateString(currentLanguage, { weekday: 'short' });
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="grid grid-cols-7 gap-px">
        {weekdays.map((w, idx) => (
          <div
            key={idx}
            className="pb-2 text-center text-xs font-medium text-slate-400"
          >
            {w}
          </div>
        ))}

        {cells.map((cell, i) => {
          if (!cell.date) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const weekend = isWeekend(cell.date);
          const isFuture = cell.date > today;
          const hasRecord = !!cell.record;

          return (
            <button
              key={cell.date.toISOString()}
              disabled={weekend || isFuture}
              onClick={() => cell.record && setSelectedRecord(cell.record)}
              className={cn(
                'relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition-colors',
                weekend && 'bg-slate-50 text-slate-300 cursor-default',
                isFuture && !weekend && 'text-slate-300 cursor-default',
                !weekend && !isFuture && !hasRecord && 'text-slate-600 hover:bg-slate-50',
                !weekend && !isFuture && hasRecord && 'cursor-pointer hover:bg-slate-50',
                cell.date.toDateString() === new Date().toDateString() &&
                  'ring-2 ring-primary/30 ring-inset'
              )}
            >
              <span className="text-sm">{cell.date.getDate()}</span>
              {hasRecord && (
                <span
                  className={cn(
                    'mt-0.5 h-1.5 w-1.5 rounded-full',
                    getStatusDotColor(cell.record!.status)
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {selectedRecord && (
        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900">
              {new Date(selectedRecord.date + 'T00:00:00').toLocaleDateString(
                currentLanguage,
                { weekday: 'long', month: 'long', day: 'numeric' }
              )}
            </h4>
            <button
              onClick={() => setSelectedRecord(null)}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <p className="text-xs text-slate-400">{t('attendance.clockIn', 'Clock In')}</p>
              <p className="text-sm font-medium text-slate-900">
                {selectedRecord.clockIn
                  ? formatTimeFromISO(selectedRecord.clockIn)
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">{t('attendance.clockOut', 'Clock Out')}</p>
              <p className="text-sm font-medium text-slate-900">
                {selectedRecord.clockOut
                  ? formatTimeFromISO(selectedRecord.clockOut)
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">{t('attendance.workingHours', 'Working Hours')}</p>
              <p className="text-sm font-medium text-slate-900">
                {selectedRecord.workingMinutes > 0
                  ? formatMinutesToDuration(selectedRecord.workingMinutes)
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">{t('attendance.status', 'Status')}</p>
              <span
                className={cn(
                  'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
                  getStatusColor(selectedRecord.status)
                )}
              >
                {t(`status.${selectedRecord.status}`, selectedRecord.status)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
        {[
          { key: 'present', label: t('status.present', 'Present'), color: 'bg-emerald-500' },
          { key: 'late', label: t('status.late', 'Late'), color: 'bg-amber-500' },
          { key: 'absent', label: t('status.absent', 'Absent'), color: 'bg-rose-500' },
          { key: 'incomplete', label: t('status.incomplete', 'Incomplete'), color: 'bg-blue-500' },
        ].map((item) => (
          <div key={item.key} className="flex items-center gap-1.5">
            <span className={cn('h-2 w-2 rounded-full', item.color)} />
            <span className="text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
