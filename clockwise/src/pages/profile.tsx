import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { useTranslation } from '../contexts/localization-context';
import {
  User,
  Mail,
  BadgeCheck,
  Building2,
  Briefcase,
  LogOut,
} from 'lucide-react';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const fields = [
    { icon: User, label: t('profile.name', 'Full Name'), value: user?.name },
    { icon: Mail, label: t('profile.email', 'Email Address'), value: user?.email },
    { icon: BadgeCheck, label: t('profile.employeeId', 'Employee ID'), value: user?.employeeId },
    { icon: Building2, label: t('profile.department', 'Department'), value: user?.department },
    { icon: Briefcase, label: t('profile.position', 'Position'), value: user?.position },
  ];

  return (
    <div className="mx-auto max-w-lg px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">
        {t('profile.title', 'Employee Profile')}
      </h1>

      <div className="rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="flex items-center gap-4 border-b border-slate-100 p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {user?.name}
            </h2>
            <p className="text-sm text-slate-500">{user?.position}</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {fields.map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-4 px-6 py-4"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50">
                <f.icon className="h-4 w-4 text-slate-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">{f.label}</p>
                <p className="text-sm font-medium text-slate-900">{f.value || '—'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
      >
        <LogOut className="h-4 w-4" />
        {t('profile.logout', 'Log Out')}
      </button>
    </div>
  );
}
