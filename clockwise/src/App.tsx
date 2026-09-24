import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LocalizationProvider } from './contexts/localization-context';
import { AuthProvider } from './contexts/auth-context';
import { AttendanceProvider } from './contexts/attendance-context';
import { ProtectedRoute } from './components/protected-route';
import { AppLayout } from './components/layout/app-layout';
import { LoginPage } from './pages/login';
import { CallbackPage } from './pages/callback';
import { ActivatePage } from './pages/activate';
import { ResetPasswordPage } from './pages/reset-password';
import { DashboardPage } from './pages/dashboard';
import { AttendancePage } from './pages/attendance';
import { ProfilePage } from './pages/profile';

export default function App() {
  return (
    <BrowserRouter>
      <LocalizationProvider>
        <AuthProvider>
          <AttendanceProvider>
          <Routes>
            {/* Public Unprotected Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login/callback" element={<CallbackPage />} />
            <Route path="/activate" element={<ActivatePage />} />
            <Route path="/oidc/activate" element={<ActivatePage />} />
            <Route path="/resetpassword" element={<ResetPasswordPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AttendanceProvider>
      </AuthProvider>
    </LocalizationProvider>
  </BrowserRouter>
  );
}
