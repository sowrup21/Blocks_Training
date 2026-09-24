import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { useTranslation } from '../contexts/localization-context';
import { LanguageSwitcher } from '../components/language-switcher';
import { isLoginConfigured } from '../lib/blocks/config';
import { blocksClient } from '../lib/blocks/client';
import { Clock, Loader2, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();
  const [redirecting, setRedirecting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSignIn = async () => {
    try {
      setRedirecting(true);
      await login('/dashboard');
    } catch (err: unknown) {
      setRedirecting(false);
      console.error(err);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotLoading(true);

    try {
      await blocksClient.auth.recover({ email: forgotEmail });
      setForgotSuccess(true);
    } catch (err: unknown) {
      setForgotError(err instanceof Error ? err.message : 'Failed to send recovery email');
    } finally {
      setForgotLoading(false);
    }
  };

  const configured = isLoginConfigured();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4">
      {/* Top right language switcher */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <LanguageSwitcher variant="pill" />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Clock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{t('app.name', 'Clockwise')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('auth.signInTitle', 'Sign in to your account')}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {!configured ? (
            <div className="rounded-lg bg-amber-50 p-4 border border-amber-200 text-amber-800 text-xs">
              <p className="font-semibold mb-1">Blocks Login Not Configured</p>
              <p>Missing VITE_BLOCKS_OIDC_CLIENT_ID or VITE_BLOCKS_OIDC_URL in .env.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  {t(
                    'auth.infoBlocks',
                    'Clockwise is connected to SELISE Blocks IAM. Sign in with your registered credentials.'
                  )}
                </span>
              </div>

              <button
                type="button"
                onClick={handleSignIn}
                disabled={redirecting || isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm cursor-pointer"
              >
                {redirecting || isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>{t('auth.signInWithBlocks', 'Sign In with Blocks')}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="pt-2 flex flex-col items-center gap-2 text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true);
                    setForgotSuccess(false);
                    setForgotError(null);
                  }}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  {t('auth.forgotPassword', 'Forgot your password?')}
                </button>
                <Link to="/activate" className="text-slate-400 hover:text-slate-600 transition-colors">
                  {t('auth.activatePrompt', 'Have an invitation link? Activate account')}
                </Link>
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          {t('auth.poweredBy', 'Powered by SELISE Blocks IAM')}
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">
              {t('auth.resetPassword', 'Reset Password')}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Enter your email address and we'll send you a password reset link.
            </p>

            {forgotSuccess ? (
              <div className="mt-4">
                <div className="flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span>
                    {t(
                      'auth.resetLinkSent',
                      'If an account exists with this email, a reset link has been sent. Check your inbox!'
                    )}
                  </span>
                </div>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="mt-4 w-full rounded-lg bg-slate-900 py-2 text-xs font-medium text-white hover:bg-slate-800 cursor-pointer"
                >
                  {t('common.close', 'Close')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {t('profile.email', 'Email Address')}
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    placeholder="user@example.com"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {forgotError && (
                  <div className="flex items-start gap-2 rounded-lg bg-rose-50 p-2 text-xs text-rose-700 border border-rose-200">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-600 mt-0.5" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    {t('common.cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
                  >
                    {forgotLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                    {t('auth.sendResetLink', 'Send Reset Link')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
