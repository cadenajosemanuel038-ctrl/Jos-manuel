import React, { useState } from 'react';
import { ShiftPolicy } from '../types';
import { updateShift } from '../services/api';
import { Clock, Plus, Edit, Check, ShieldAlert, Sparkles } from 'lucide-react';

interface ShiftSettingsProps {
  shifts: ShiftPolicy[];
  onRefresh: () => void;
}

export const ShiftSettingsModal: React.FC<ShiftSettingsProps> = ({ shifts, onRefresh }) => {
  const [editingShift, setEditingShift] = useState<ShiftPolicy | null>(null);
  const [formData, setFormData] = useState<Partial<ShiftPolicy>>({
    name: '',
    startTime: '08:00',
    endTime: '17:00',
    gracePeriodMinutes: 10,
    lunchDurationMinutes: 60,
  });

  const handleEdit = (shift: ShiftPolicy) => {
    setEditingShift(shift);
    setFormData(shift);
  };

  const handleCreateNew = () => {
    setEditingShift(null);
    setFormData({
      name: 'Nuevo Turno',
      startTime: '08:00',
      endTime: '17:00',
      gracePeriodMinutes: 10,
      lunchDurationMinutes: 60,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateShift(formData);
      setEditingShift(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error al guardar horario');
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold mb-1">
            <Clock className="w-4 h-4" />
            <span>REGLAS Y POLITICAS DE PUNTUALIDAD</span>
          </div>
          <h2 className="text-xl font-bold text-white">Horarios de Trabajo y Tolerancias</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure los turnos laborales, horas de entrada/salida y minutos de gracia permitidos antes de marcar tardanza.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Nuevo Horario
        </button>
      </div>

      {/* Shifts Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {shifts.map((s) => (
          <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-white text-base">{s.name}</h3>
                <span className="px-2.5 py-0.5 bg-teal-950 text-teal-300 border border-teal-800 rounded-full text-[10px] font-mono font-bold">
                  {s.startTime} - {s.endTime}
                </span>
              </div>

              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-xs space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Minutos de Tolerancia:</span>
                  <span className="font-bold text-amber-400">{s.gracePeriodMinutes} minutos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Duración de Almuerzo:</span>
                  <span className="font-bold text-slate-200">{s.lunchDurationMinutes} minutos</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleEdit(s)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition border border-slate-700 flex items-center justify-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5 text-teal-400" />
              <span>Editar Configuración</span>
            </button>
          </div>
        ))}
      </div>

      {/* Edit Form Modal */}
      {formData.name !== undefined && (editingShift || formData.name === 'Nuevo Turno') && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl text-white">
            <h3 className="font-bold text-lg text-white mb-4">
              {editingShift ? 'Editar Horario y Tolerancia' : 'Crear Nuevo Turno'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nombre del Turno</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Hora Entrada (HH:mm)</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime || '08:00'}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Hora Salida (HH:mm)</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime || '17:00'}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Tolerancia (Minutos)</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    required
                    value={formData.gracePeriodMinutes || 10}
                    onChange={(e) => setFormData({ ...formData, gracePeriodMinutes: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Almuerzo (Minutos)</label>
                  <input
                    type="number"
                    min="15"
                    max="120"
                    required
                    value={formData.lunchDurationMinutes || 60}
                    onChange={(e) => setFormData({ ...formData, lunchDurationMinutes: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md"
                >
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingShift(null);
                    setFormData({});
                  }}
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
