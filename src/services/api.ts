import { Employee, ShiftPolicy, AttendanceRecord, MonthlySummaryReport } from '../types';

const API_BASE = '/api';

export async function checkCloudDbStatus() {
  try {
    const res = await fetch(`${API_BASE}/db/status`);
    if (!res.ok) throw new Error('Failed to connect to cloud database');
    return await res.json();
  } catch (err) {
    console.error('Cloud DB status check error:', err);
    return { connected: false, storageType: 'Local Fallback' };
  }
}

export async function fetchEmployees(): Promise<Employee[]> {
  const res = await fetch(`${API_BASE}/employees`);
  if (!res.ok) throw new Error('Error al cargar empleados');
  return await res.json();
}

export async function createEmployee(employeeData: Partial<Employee>): Promise<Employee> {
  const res = await fetch(`${API_BASE}/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(employeeData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al crear empleado');
  }
  return await res.json();
}

export async function updateEmployee(id: string, employeeData: Partial<Employee>): Promise<Employee> {
  const res = await fetch(`${API_BASE}/employees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(employeeData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al actualizar empleado');
  }
  return await res.json();
}

export async function deleteEmployee(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/employees/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al desactivar empleado');
}

export async function fetchShifts(): Promise<ShiftPolicy[]> {
  const res = await fetch(`${API_BASE}/shifts`);
  if (!res.ok) throw new Error('Error al cargar horarios');
  return await res.json();
}

export async function updateShift(shiftData: Partial<ShiftPolicy>): Promise<ShiftPolicy[]> {
  const res = await fetch(`${API_BASE}/shifts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(shiftData),
  });
  if (!res.ok) throw new Error('Error al guardar horario');
  return await res.json();
}

export async function fetchAttendanceRecords(filters?: { date?: string; employeeId?: string; month?: string }): Promise<AttendanceRecord[]> {
  const query = new URLSearchParams();
  if (filters?.date) query.set('date', filters.date);
  if (filters?.employeeId) query.set('employeeId', filters.employeeId);
  if (filters?.month) query.set('month', filters.month);

  const res = await fetch(`${API_BASE}/attendance?${query.toString()}`);
  if (!res.ok) throw new Error('Error al obtener registros de asistencia');
  return await res.json();
}

export async function scanAttendanceQR(qrCode: string, type: 'IN' | 'OUT' | 'LUNCH_IN' | 'LUNCH_OUT' = 'IN', notes?: string) {
  const res = await fetch(`${API_BASE}/attendance/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qrCode, type, notes }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Código QR no reconocido o error de servidor.');
  }
  return data; // { message, record, employee, shift }
}

export async function deleteAttendanceRecord(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/attendance/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al borrar registro');
}

export async function fetchMonthlyReport(month: string): Promise<MonthlySummaryReport> {
  const res = await fetch(`${API_BASE}/reports/monthly?month=${month}`);
  if (!res.ok) throw new Error('Error al generar reporte mensual');
  return await res.json();
}

export async function resetDatabaseWithSampleData() {
  const res = await fetch(`${API_BASE}/db/seed-sample`, { method: 'POST' });
  if (!res.ok) throw new Error('Error al reiniciar base de datos');
  return await res.json();
}
