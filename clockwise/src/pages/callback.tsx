import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeLogin } from '../lib/blocks/auth';
import { useAuth } from '../contexts/auth-context';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

export function CallbackPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    async function handleCallback() {
      try {
        const result = await completeLogin(window.location.href);
        if (result.ok) {
          await refresh();
          navigate(result.returnTo || '/dashboard', { replace: true });
        } else {
          setError(result.message || 'Authentication failed. Please try again.');
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred during login.');
      }
    }

    handleCallback();
  }, [navigate, refresh]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-xl border border-rose-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-rose-600">
            <AlertCircle className="h-6 w-6 shrink-0" />
            <h2 className="text-lg font-semibold">Sign In Failed</h2>
          </div>
          <p className="mt-3 text-sm text-slate-600">{error}</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-sm font-medium text-slate-600">Completing sign in...</p>
    </div>
  );
}
