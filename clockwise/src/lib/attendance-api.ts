import { blocksClient } from './blocks/client';
import type { AttendanceRecord, AttendanceStatus } from '../types';

export interface RawAttendanceItem {
  ItemId?: string;
  id?: string;
  employeeId?: string;
  date?: string;
  clockIn?: string | null;
  clockOut?: string | null;
  workingMinutes?: string | number | null;
  status?: AttendanceStatus;
}

const attendanceCollection = blocksClient.data.collection<RawAttendanceItem>('Attendance', {
  fields: ['employeeId', 'date', 'clockIn', 'clockOut', 'workingMinutes', 'status'],
});

function normalizeRecord(raw: RawAttendanceItem): AttendanceRecord {
  const id = raw.ItemId || raw.id || '';
  const workingMinutes =
    typeof raw.workingMinutes === 'number'
      ? raw.workingMinutes
      : parseInt(String(raw.workingMinutes || '0'), 10) || 0;

  return {
    id,
    employeeId: raw.employeeId || '',
    date: raw.date || '',
    clockIn: raw.clockIn || null,
    clockOut: raw.clockOut || null,
    workingMinutes,
    status: (raw.status as AttendanceStatus) || 'incomplete',
  };
}

export async function fetchAttendanceRecords(employeeId?: string): Promise<AttendanceRecord[]> {
  try {
    const response = (await attendanceCollection.list({
      pageNo: 1,
      pageSize: 200,
    })) as {
      data?: {
        getAttendances?: { items?: RawAttendanceItem[]; totalCount?: number };
        items?: RawAttendanceItem[];
      };
      items?: RawAttendanceItem[];
    };

    const items =
      response.data?.getAttendances?.items ??
      response.data?.items ??
      response.items ??
      [];

    const normalized = items.map(normalizeRecord);

    if (employeeId) {
      return normalized.filter((r) => r.employeeId === employeeId);
    }
    return normalized;
  } catch (err) {
    console.error('Failed to fetch attendance records from Blocks:', err);
    return [];
  }
}

export async function createAttendanceRecord(
  record: Omit<AttendanceRecord, 'id'>
): Promise<AttendanceRecord | null> {
  try {
    const payload = {
      employeeId: record.employeeId,
      date: record.date,
      clockIn: record.clockIn,
      clockOut: record.clockOut,
      workingMinutes: String(record.workingMinutes || 0),
      status: record.status,
    };

    const res = (await attendanceCollection.create(payload)) as {
      data?: {
        insertAttendance?: RawAttendanceItem;
      };
      ItemId?: string;
      itemId?: string;
    };

    const createdItem = res.data?.insertAttendance;
    const itemId = createdItem?.ItemId || createdItem?.id || res.ItemId || res.itemId;

    return {
      ...record,
      id: itemId || `att-${record.date}`,
    };
  } catch (err) {
    console.error('Failed to create attendance in Blocks:', err);
    throw err;
  }
}

export async function updateAttendanceRecord(
  itemId: string,
  record: Partial<AttendanceRecord>
): Promise<boolean> {
  try {
    const payload: Record<string, unknown> = {};
    if (record.clockOut !== undefined) payload.clockOut = record.clockOut;
    if (record.workingMinutes !== undefined) payload.workingMinutes = String(record.workingMinutes);
    if (record.status !== undefined) payload.status = record.status;
    if (record.clockIn !== undefined) payload.clockIn = record.clockIn;

    await attendanceCollection.update(itemId, payload);
    return true;
  } catch (err) {
    console.error('Failed to update attendance in Blocks:', err);
    throw err;
  }
}
