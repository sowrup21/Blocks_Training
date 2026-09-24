import type { AttendanceRecord } from '../types';
import { useTranslation } from '../contexts/localization-context';
import {
  formatTimeFromISO,
  formatMinutesToDuration,
  getStatusColor,
} from '../lib/attendance';
import { cn } from '../lib/utils';

interface AttendanceTableProps {
  records: AttendanceRecord[];
}

export function AttendanceTable({ records }: AttendanceTableProps) {
  const { t, currentLanguage } = useTranslation();

  const sorted = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm text-slate-500">
          {t('attendance.noRecords', 'No attendance records found for this period.')}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-4 py-3 text-left font-medium text-slate-500">
                {t('attendance.date', 'Date')}
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">
                {t('attendance.clockIn', 'Clock In')}
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">
                {t('attendance.clockOut', 'Clock Out')}
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">
                {t('attendance.workingHours', 'Working Hours')}
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">
                {t('attendance.status', 'Status')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {new Date(r.date + 'T00:00:00').toLocaleDateString(currentLanguage, {
                    month: 'short',
                    day: 'numeric',
                    weekday: 'short',
                  })}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {r.clockIn ? formatTimeFromISO(r.clockIn) : '—'}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {r.clockOut ? formatTimeFromISO(r.clockOut) : '—'}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {r.workingMinutes > 0 ? formatMinutesToDuration(r.workingMinutes) : '—'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      getStatusColor(r.status)
                    )}
                  >
                    {t(`status.${r.status}`, r.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
