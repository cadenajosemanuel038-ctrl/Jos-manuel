import React, { useState, useEffect } from 'react';
import { Employee, ShiftPolicy, AttendanceRecord } from './types';
import {
  checkCloudDbStatus,
  fetchEmployees,
  fetchShifts,
  fetchAttendanceRecords,
  resetDatabaseWithSampleData,
} from './services/api';

import { Header } from './components/Header';
import { TerminalView } from './components/TerminalView';
import { DailyLog } from './components/DailyLog';
import { EmployeeManager } from './components/EmployeeManager';
import { MonthlyReport } from './components/MonthlyReport';
import { ShiftSettingsModal } from './components/ShiftSettingsModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'terminal' | 'daily' | 'employees' | 'reports' | 'shifts'>('terminal');
  const [dbConnected, setDbConnected] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<ShiftPolicy[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  
  // Default to today July 28, 2026
  const [selectedDate, setSelectedDate] = useState('2026-07-28');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAppData();
  }, []);

  useEffect(() => {
    loadDailyRecords();
  }, [selectedDate]);

  const initAppData = async () => {
    setLoading(true);
    try {
      const status = await checkCloudDbStatus();
      setDbConnected(status.connected);

      const [empList, shiftList] = await Promise.all([
        fetchEmployees(),
        fetchShifts(),
      ]);

      setEmployees(empList);
      setShifts(shiftList);

      await loadDailyRecords();
    } catch (err) {
      console.error('App initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDailyRecords = async () => {
    try {
      const dailyRecs = await fetchAttendanceRecords({ date: selectedDate });
      setRecords(dailyRecs);
    } catch (err) {
      console.error('Daily record load error:', err);
    }
  };

  const handleRefreshAll = async () => {
    const [empList, shiftList] = await Promise.all([
      fetchEmployees(),
      fetchShifts(),
    ]);
    setEmployees(empList);
    setShifts(shiftList);
    await loadDailyRecords();
  };

  const handleResetDemoData = async () => {
    if (confirm('¿Desea reiniciar la base de datos en la nube con los datos de muestra originales?')) {
      try {
        await resetDatabaseWithSampleData();
        await handleRefreshAll();
        alert('Base de datos reiniciada correctamente.');
      } catch (err: any) {
        alert(err.message || 'Error al reiniciar');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold tracking-tight">Conectando a Base de Datos en la Nube...</h2>
        <p className="text-xs text-slate-400 mt-1">Cargando módulos de reconocimiento QR y asistencias</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-teal-500 selection:text-slate-950 font-sans">
      
      {/* Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dbConnected={dbConnected}
        onResetData={handleResetDemoData}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'terminal' && (
          <TerminalView
            employees={employees}
            onScanSuccess={loadDailyRecords}
          />
        )}

        {activeTab === 'daily' && (
          <DailyLog
            records={records}
            employees={employees}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onRefresh={handleRefreshAll}
          />
        )}

        {activeTab === 'employees' && (
          <EmployeeManager
            employees={employees}
            shifts={shifts}
            onRefresh={handleRefreshAll}
          />
        )}

        {activeTab === 'reports' && (
          <MonthlyReport currentMonth="2026-07" />
        )}

        {activeTab === 'shifts' && (
          <ShiftSettingsModal
            shifts={shifts}
            onRefresh={handleRefreshAll}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            ControlAsistencia QR © 2026 • Base de Datos Cloud Persistente Sincronizada
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-teal-400"></span> API Activa
            </span>
            <span>•</span>
            <span>Reportes PDF/CSV Automáticos</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
