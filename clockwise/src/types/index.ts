export interface Employee {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  position: string;
  avatar?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  workingMinutes: number;
  status: AttendanceStatus;
}

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'incomplete';

export interface MonthlySummary {
  present: number;
  absent: number;
  late: number;
  incomplete: number;
  totalWorkingDays: number;
  attendancePercentage: number;
}
