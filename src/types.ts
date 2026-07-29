export type AttendanceStatus = 'ON_TIME' | 'GRACE_PERIOD' | 'LATE' | 'EARLY_DEPARTURE' | 'NORMAL_EXIT';

export type EntryType = 'IN' | 'OUT' | 'LUNCH_IN' | 'LUNCH_OUT';

export interface Employee {
  id: string;
  code: string; // Unique QR code content (e.g., EMP-1001)
  name: string;
  email: string;
  department: string;
  position: string;
  avatarUrl?: string;
  phone?: string;
  active: boolean;
  shiftId: string;
}

export interface ShiftPolicy {
  id: string;
  name: string;
  startTime: string; // "08:00"
  endTime: string;   // "17:00"
  gracePeriodMinutes: number; // e.g., 10 minutes
  lunchDurationMinutes: number; // e.g., 60 minutes
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  timestamp: string; // ISO String
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm:ss"
  type: EntryType;
  status: AttendanceStatus;
  minutesLate: number;
  notes?: string;
}

export interface MonthlyEmployeeReport {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  position: string;
  totalWorkDays: number;
  daysPresent: number;
  onTimeCount: number;
  graceCount: number;
  lateCount: number;
  earlyExitCount: number;
  totalLateMinutes: number;
  punctualityPercentage: number; // 0 - 100
  starRating: number; // 1 to 5 stars
}

export interface MonthlySummaryReport {
  yearMonth: string; // "2026-07"
  totalEmployees: number;
  overallPunctualityRate: number;
  totalCheckIns: number;
  totalLateCount: number;
  totalLateMinutes: number;
  departmentBreakdown: {
    department: string;
    totalEmployees: number;
    punctualityRate: number;
    lateMinutes: number;
  }[];
  employeeReports: MonthlyEmployeeReport[];
}
