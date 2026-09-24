import { useState, useEffect } from 'react';
import { useAttendance } from '../contexts/attendance-context';
import { useTranslation } from '../contexts/localization-context';
import {
  formatTimeFromISO,
  formatMinutesToDuration,
} from '../lib/attendance';
import { LogIn, LogOut, CheckCircle2 } from 'lucide-react';

export function ClockCard() {
  const { todayRecord, clockIn, clockOut } = useAttendance();
  const { t, currentLanguage } = useTranslation();
  const [elapsed, setElapsed] = useState(0);

  const isWorking = todayRecord?.clockIn && !todayRecord?.clockOut;
  const isCompleted = todayRecord?.clockIn && todayRecord?.clockOut;

  useEffect(() => {
    if (!isWorking || !todayRecord?.clockIn) return;
    const calc = () => {
      const diff = Date.now() - new Date(todayRecord.clockIn!).getTime();
      setElapsed(Math.floor(diff / 60000));
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [isWorking, todayRecord?.clockIn]);

  if (isCompleted) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          </div>
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {t('clock.shiftCompleted', 'Workday Completed')}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            {t('clock.shiftCompleted', 'Workday Completed')}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {t('clock.completedPrompt', 'You have completed your shift for today. Great job!')}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-4 rounded-xl bg-slate-50 p-4">
            <div>
              <p className="text-xs font-medium text-slate-400">{t('clock.clockedInAt', 'Clocked In At')}</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900">
                {formatTimeFromISO(todayRecord.clockIn!)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">{t('clock.clockedOutAt', 'Clocked Out At')}</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900">
                {formatTimeFromISO(todayRecord.clockOut!)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">{t('clock.timeWorked', 'Time Worked')}</p>
              <p className="mt-0.5 text-sm font-semibold text-emerald-600">
                {formatMinutesToDuration(todayRecord.workingMinutes)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isWorking) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="text-center">
          <div className="mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t('clock.currentlyWorking', "You're currently clocked in")}
            </span>
          </div>

          <p className="text-sm text-slate-500">
            {t('clock.clockedInAt', 'Clocked in at')}{' '}
            <span className="font-medium text-slate-700">
              {formatTimeFromISO(todayRecord.clockIn!)}
            </span>
          </p>

          <p className="mt-3 font-mono text-4xl font-bold text-slate-900 sm:text-5xl">
            {formatMinutesToDuration(elapsed)}
          </p>
          <p className="mt-1 text-xs text-slate-400">{t('clock.timeWorked', 'working duration')}</p>

          <button
            onClick={clockOut}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 active:scale-[0.98] transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            {t('clock.clockOut', 'Clock Out')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <div className="text-center">
        <div className="mb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
            {t('clock.ready', 'Ready to start your workday?')}
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          {t('clock.clockInPrompt', 'Clock in to start tracking your working hours for today.')}
        </p>
        <p className="mt-2 font-mono text-2xl font-semibold text-slate-700">
          {new Date().toLocaleTimeString(currentLanguage, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })}
        </p>

        <button
          onClick={clockIn}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer"
        >
          <LogIn className="h-4 w-4" />
          {t('clock.clockIn', 'Clock In')}
        </button>
      </div>
    </div>
  );
}
