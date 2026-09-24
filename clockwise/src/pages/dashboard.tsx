import { useAuth } from '../contexts/auth-context';
import { useTranslation } from '../contexts/localization-context';
import { LiveClock } from '../components/live-clock';
import { ClockCard } from '../components/clock-card';
import { MonthlySummary } from '../components/monthly-summary';
import { CalendarDays } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const { t, currentLanguage } = useTranslation();
  const now = new Date();
  const hours = now.getHours();

  const greeting =
    hours < 12
      ? t('dashboard.greetingMorning', 'Good morning')
      : hours < 17
      ? t('dashboard.greetingAfternoon', 'Good afternoon')
      : t('dashboard.greetingEvening', 'Good evening');

  const dateStr = now.toLocaleDateString(currentLanguage, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          {greeting}, {user?.name.split(' ')[0]} 👋
        </h1>
        <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
          <CalendarDays className="h-4 w-4" />
          {dateStr}
        </div>
      </div>

      <div className="mb-6 flex justify-center">
        <LiveClock />
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-slate-500 uppercase tracking-wider">
          {t('dashboard.todaysAttendance', "Today's Attendance")}
        </h2>
        <ClockCard />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-500 uppercase tracking-wider">
          {t('dashboard.overview', 'Monthly Overview')}
        </h2>
        <MonthlySummary year={now.getFullYear()} month={now.getMonth()} />
      </div>
    </div>
  );
}
