import type { Employee, AttendanceRecord } from '../types';
import { determineStatus, calculateWorkingMinutes } from './attendance';

export const mockEmployee: Employee = {
  id: 'emp-001',
  name: 'Hasan Rahman',
  email: 'employee@example.com',
  employeeId: 'EMP-001',
  department: 'Design',
  position: 'UX Engineer',
};

function createRecord(
  date: string,
  clockInTime: string | null,
  clockOutTime: string | null
): AttendanceRecord {
  const clockIn = clockInTime ? new Date(`${date}T${clockInTime}`) : null;
  const clockOut = clockOutTime ? new Date(`${date}T${clockOutTime}`) : null;
  const status = determineStatus(clockIn, clockOut);
  const workingMinutes = calculateWorkingMinutes(clockIn, clockOut);

  return {
    id: `att-${date}`,
    employeeId: 'emp-001',
    date,
    clockIn: clockIn?.toISOString() ?? null,
    clockOut: clockOut?.toISOString() ?? null,
    workingMinutes,
    status,
  };
}

export const mockAttendanceRecords: AttendanceRecord[] = [
  createRecord('2026-09-01', '08:58:00', '17:55:00'),
  createRecord('2026-09-02', '09:03:00', '18:01:00'),
  createRecord('2026-09-03', '09:22:00', '18:10:00'),
  createRecord('2026-09-04', '09:00:00', '17:48:00'),
  createRecord('2026-09-07', '09:10:00', '18:05:00'),
  createRecord('2026-09-08', '08:55:00', '17:50:00'),
  createRecord('2026-09-09', '09:05:00', '18:00:00'),
  createRecord('2026-09-11', '09:01:00', '17:58:00'),
  createRecord('2026-09-14', '09:08:00', '18:02:00'),
  createRecord('2026-09-15', '09:35:00', '18:15:00'),
  createRecord('2026-09-16', '09:02:00', '17:56:00'),
  createRecord('2026-09-17', '09:00:00', '17:52:00'),
  createRecord('2026-09-18', '09:01:00', '17:55:00'),
];
