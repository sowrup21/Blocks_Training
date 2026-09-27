import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { AttendanceRecord } from '../types';
import { useAuth } from './auth-context';
import {
  determineStatus,
  calculateWorkingMinutes,
  formatDateKey,
} from '../lib/attendance';
import {
  fetchAttendanceRecords,
  createAttendanceRecord,
  updateAttendanceRecord,
} from '../lib/attendance-api';

interface AttendanceContextType {
  records: AttendanceRecord[];
  todayRecord: AttendanceRecord | null;
  isLoading: boolean;
  clockIn: () => Promise<void>;
  clockOut: () => Promise<void>;
  getRecordsForMonth: (year: number, month: number) => AttendanceRecord[];
  refreshRecords: () => Promise<void>;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(
  undefined
);

const STORAGE_KEY = 'clockwise_attendance_cache';

function todayStr() {
  return formatDateKey(new Date());
}

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(false);

  const employeeId = user?.id || user?.email || 'default-user';

  // Fetch real attendance records from Blocks Data Gateway
  const refreshRecords = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const liveRecords = await fetchAttendanceRecords(employeeId);
      setRecords(liveRecords);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(liveRecords));
    } catch (err) {
      console.error('Failed to sync records from Blocks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, employeeId]);

  useEffect(() => {
    if (user) {
      refreshRecords();
    }
  }, [user, refreshRecords]);

  const todayRecord = records.find((r) => r.date === todayStr()) ?? null;

  const clockIn = useCallback(async () => {
    const now = new Date();
    const date = todayStr();

    if (records.some((r) => r.date === date)) return;

    // Optimistic record
    const tempId = `temp-${Date.now()}`;
    const optimisticRecord: AttendanceRecord = {
      id: tempId,
      employeeId,
      date,
      clockIn: now.toISOString(),
      clockOut: null,
      workingMinutes: 0,
      status: 'incomplete',
    };

    setRecords((prev) => [...prev, optimisticRecord]);

    try {
      const created = await createAttendanceRecord({
        employeeId,
        date,
        clockIn: now.toISOString(),
        clockOut: null,
        workingMinutes: 0,
        status: 'incomplete',
      });

      if (created) {
        setRecords((prev) =>
          prev.map((r) => (r.id === tempId ? created : r))
        );
      }
    } catch (err) {
      console.error('Failed to save clock-in to Blocks:', err);
      // Keep optimistic record locally so user is not blocked
    }
  }, [employeeId, records]);

  const clockOut = useCallback(async () => {
    const date = todayStr();
    const current = records.find((r) => r.date === date && !r.clockOut);
    if (!current) return;

    const now = new Date();
    const clockInDate = current.clockIn ? new Date(current.clockIn) : null;
    const workingMinutes = calculateWorkingMinutes(clockInDate, now);
    const status = determineStatus(clockInDate, now);

    // Optimistic update
    setRecords((prev) =>
      prev.map((r) => {
        if (r.date !== date || r.clockOut) return r;
        return {
          ...r,
          clockOut: now.toISOString(),
          workingMinutes,
          status,
        };
      })
    );

    try {
      if (current.id && !current.id.startsWith('temp-')) {
        await updateAttendanceRecord(current.id, {
          clockOut: now.toISOString(),
          workingMinutes,
          status,
        });
      }
    } catch (err) {
      console.error('Failed to save clock-out to Blocks:', err);
    }
  }, [records]);

  const getRecordsForMonth = useCallback(
    (year: number, month: number) => {
      return records.filter((r) => {
        const d = new Date(r.date + 'T00:00:00');
        return d.getFullYear() === year && d.getMonth() === month;
      });
    },
    [records]
  );

  return (
    <AttendanceContext.Provider
      value={{
        records,
        todayRecord,
        isLoading,
        clockIn,
        clockOut,
        getRecordsForMonth,
        refreshRecords,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const ctx = useContext(AttendanceContext);
  if (!ctx)
    throw new Error('useAttendance must be used within AttendanceProvider');
  return ctx;
}
