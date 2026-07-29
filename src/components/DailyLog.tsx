import React, { useState } from 'react';
import { AttendanceRecord, Employee } from '../types';
import { deleteAttendanceRecord, scanAttendanceQR } from '../services/api';
import { CalendarCheck, Search, Filter, Clock, AlertTriangle, CheckCircle2, Trash2, Plus, ArrowUpRight, ArrowDownLeft, ShieldCheck, UserX } from 'lucide-react';

interface DailyLogProps {
  records: AttendanceRecord[];
  employees: Employee[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  onRefresh: () => void;
}

export const DailyLog: React.FC<DailyLogProps> = ({
  records,
  employees,
  selectedDate,
  setSelectedDate,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Manual Form State
  const [selectedEmpCode, setSelectedEmpCode] = useState('');
  const [manualType, setManualType] = useState<'IN' | 'OUT'>('IN');
  const [manualNotes, setManualNotes] = useState('Marcaje manual autorizado');

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PUNTUAL' && (rec.status === 'ON_TIME' || rec.status === 'GRACE_PERIOD')) ||
      (statusFilter === 'LATE' && rec.status === 'LATE') ||
      (statusFilter === 'EXIT' && (rec.type === 'OUT' || rec.status === 'NORMAL_EXIT'));

    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalCount = records.length;
  const onTimeCount = records.filter((r) => r.status === 'ON_TIME' || r.status === 'GRACE_PERIOD').length;
  const lateCount = records.filter((r) => r.status === 'LATE').length;
  const exitCount = records.filter((r) => r.type === 'OUT').length;
  const totalLateMinutes = records.reduce((sum, r) => sum + (r.minutesLate || 0), 0);

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este registro de asistencia?')) {
      try {
        await deleteAttendanceRecord(id);
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Error al eliminar');
      }
    }
  };

  const handleManualRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpCode) return;
    try {
      await scanAttendanceQR(selectedEmpCode, manualType, manualNotes);
      setIsManualModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error al registrar marcaje manual');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top bar with Date Picker & KPIs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold mb-1">
            <CalendarCheck className="w-4 h-4" />
            <span>BITÁCORA EN TIEMPO REAL</span>
          </div>
          <h2 className="text-xl font-bold text-white">Registro Diario de Asistencia</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400 font-medium">Fecha:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white font-mono font-bold focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => setIsManualModalOpen(true)}
            className="px-3.5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Registro Manual</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-sm">
          <div className="text-xs text-slate-400 font-medium mb-1">Total Marcajes Hoy</div>
          <div className="text-2xl font-black text-white font-mono">{totalCount}</div>
        </div>

        <div className="bg-slate-900 border border-emerald-900/50 bg-emerald-950/10 rounded-2xl p-4 text-white shadow-sm">
          <div className="text-xs text-emerald-400 font-medium mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> A Tiempo / Tolerancia
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{onTimeCount}</div>
        </div>

        <div className="bg-slate-900 border border-rose-900/50 bg-rose-950/10 rounded-2xl p-4 text-white shadow-sm">
          <div className="text-xs text-rose-400 font-medium mb-1 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Tardanzas ({totalLateMinutes} min)
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">{lateCount}</div>
        </div>

        <div className="bg-slate-900 border border-sky-900/50 bg-sky-950/10 rounded-2xl p-4 text-white shadow-sm">
          <div className="text-xs text-sky-400 font-medium mb-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Salidas Registradas
          </div>
          <div className="text-2xl font-black text-sky-400 font-mono">{exitCount}</div>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Filtrar por empleado, código o departamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              statusFilter === 'ALL' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({records.length})
          </button>
          <button
            onClick={() => setStatusFilter('PUNTUAL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              statusFilter === 'PUNTUAL' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Puntuales
          </button>
          <button
            onClick={() => setStatusFilter('LATE')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              statusFilter === 'LATE' ? 'bg-rose-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tardanzas
          </button>
          <button
            onClick={() => setStatusFilter('EXIT')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              statusFilter === 'EXIT' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Salidas
          </button>
        </div>
      </div>

      {/* Table of Records */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Hora Marcaje</th>
                <th className="px-4 py-3.5">Empleado / Código</th>
                <th className="px-4 py-3.5">Departamento</th>
                <th className="px-4 py-3.5">Tipo Evento</th>
                <th className="px-4 py-3.5">Estado Puntualidad</th>
                <th className="px-4 py-3.5">Notas / Vía</th>
                <th className="px-4 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-teal-300 whitespace-nowrap">
                      {rec.time}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-bold text-white">{rec.employeeName}</div>
                      <div className="text-[10px] text-teal-400 font-mono">{rec.employeeCode}</div>
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-300 whitespace-nowrap">
                      {rec.department}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {rec.type === 'IN' && (
                        <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 font-semibold text-[10px]">
                          <ArrowDownLeft className="w-3 h-3" /> Entrada
                        </span>
                      )}
                      {rec.type === 'OUT' && (
                        <span className="inline-flex items-center gap-1 text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800 font-semibold text-[10px]">
                          <ArrowUpRight className="w-3 h-3" /> Salida
                        </span>
                      )}
                      {rec.type === 'LUNCH_IN' && (
                        <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800 font-semibold text-[10px]">
                          🍔 Almuerzo Regreso
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {rec.status === 'ON_TIME' && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[10px] font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> A Tiempo
                        </span>
                      )}
                      {rec.status === 'GRACE_PERIOD' && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800 text-[10px] font-bold inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" /> Tolerancia
                        </span>
                      )}
                      {rec.status === 'LATE' && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800 text-[10px] font-bold inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-400" /> Retraso (+{rec.minutesLate} min)
                        </span>
                      )}
                      {rec.status === 'NORMAL_EXIT' && (
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-semibold">
                          Salida Normal
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-slate-400 text-[11px]">
                      {rec.notes || 'Reconocimiento QR'}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(rec.id)}
                        title="Eliminar Registro"
                        className="p-1 text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500 text-xs">
                    No se encontraron marcajes de asistencia para el filtro seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: MANUAL ATTENDANCE ENTRY */}
      {isManualModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl text-white">
            <h3 className="font-bold text-lg text-white mb-2">Registrar Marcaje Manual</h3>
            <p className="text-xs text-slate-400 mb-4">
              Autorizado para empleados que no traen credencial o por caso fortuito.
            </p>

            <form onSubmit={handleManualRegister} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Seleccionar Empleado</label>
                <select
                  required
                  value={selectedEmpCode}
                  onChange={(e) => setSelectedEmpCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">-- Seleccionar un empleado --</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.code}>
                      {e.name} ({e.code}) - {e.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tipo de Evento</label>
                <select
                  value={manualType}
                  onChange={(e) => setManualType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="IN">Entrada Principal</option>
                  <option value="OUT">Salida Jornada</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Justificación / Nota</label>
                <input
                  type="text"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={!selectedEmpCode}
                  className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md disabled:opacity-50"
                >
                  Registrar Marcaje Ahora
                </button>
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
