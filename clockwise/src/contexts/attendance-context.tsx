import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { AttendanceRecord } from '../types';
import { mockAttendanceRecords } from '../lib/mock-data';
import {
  determineStatus,
  calculateWorkingMinutes,
  formatDateKey,
} from '../lib/attendance';

interface AttendanceContextType {
  records: AttendanceRecord[];
  todayRecord: AttendanceRecord | null;
  clockIn: () => void;
  clockOut: () => void;
  getRecordsForMonth: (year: number, month: number) => AttendanceRecord[];
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(
  undefined
);

const STORAGE_KEY = 'clockwise_attendance';

function todayStr() {
  return formatDateKey(new Date());
}

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: AttendanceRecord[] = JSON.parse(stored);
        const mockDates = new Set(mockAttendanceRecords.map((r) => r.date));
        const storedOnly = parsed.filter((r) => !mockDates.has(r.date));
        return [...mockAttendanceRecords, ...storedOnly];
      } catch {
        return [...mockAttendanceRecords];
      }
    }
    return [...mockAttendanceRecords];
  });

  useEffect(() => {
    const nonMock = records.filter(
      (r) => !mockAttendanceRecords.some((m) => m.id === r.id)
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nonMock));
  }, [records]);

  const todayRecord = records.find((r) => r.date === todayStr()) ?? null;

  const clockIn = useCallback(() => {
    const now = new Date();
    const date = todayStr();

    if (records.some((r) => r.date === date)) return;

    const newRecord: AttendanceRecord = {
      id: `att-${date}`,
      employeeId: 'emp-001',
      date,
      clockIn: now.toISOString(),
      clockOut: null,
      workingMinutes: 0,
      status: 'incomplete',
    };
    setRecords((prev) => [...prev, newRecord]);
  }, [records]);

  const clockOut = useCallback(() => {
    const date = todayStr();
    setRecords((prev) =>
      prev.map((r) => {
        if (r.date !== date || r.clockOut) return r;
        const now = new Date();
        const clockInDate = r.clockIn ? new Date(r.clockIn) : null;
        const workingMinutes = calculateWorkingMinutes(clockInDate, now);
        const status = determineStatus(clockInDate, now);
        return {
          ...r,
          clockOut: now.toISOString(),
          workingMinutes,
          status,
        };
      })
    );
  }, []);

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
      value={{ records, todayRecord, clockIn, clockOut, getRecordsForMonth }}
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
