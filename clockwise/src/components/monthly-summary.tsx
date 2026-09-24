import { useAttendance } from '../contexts/attendance-context';
import { useTranslation } from '../contexts/localization-context';
import { calculateMonthlySummary } from '../lib/attendance';
import { UserCheck, UserX, Clock4, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';

interface MonthlySummaryProps {
  year: number;
  month: number;
}

export function MonthlySummary({ year, month }: MonthlySummaryProps) {
  const { getRecordsForMonth } = useAttendance();
  const { t } = useTranslation();
  const records = getRecordsForMonth(year, month);
  const summary = calculateMonthlySummary(records, year, month);

  const cards = [
    {
      label: t('status.present', 'Present'),
      count: summary.present,
      icon: UserCheck,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: t('status.absent', 'Absent'),
      count: summary.absent,
      icon: UserX,
      color: 'text-rose-600 bg-rose-50',
    },
    {
      label: t('status.late', 'Late'),
      count: summary.late,
      icon: Clock4,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      label: t('summary.attendanceRate', 'Attendance Rate'),
      count: `${summary.attendancePercentage}%`,
      icon: TrendingUp,
      color: 'text-primary bg-primary/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-xl border border-slate-200 bg-white p-4"
        >
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg',
                c.color
              )}
            >
              <c.icon className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{c.count}</p>
          <p className="text-xs font-medium text-slate-500">{c.label}</p>
        </div>
      ))}
    </div>
  );
}
