import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Employee, ShiftPolicy } from '../types';
import { createEmployee, updateEmployee, deleteEmployee } from '../services/api';
import { Plus, Search, QrCode, Printer, Download, UserCheck, Trash2, Edit, Shield, Building2, Mail, Phone, Eye, X, Sparkles } from 'lucide-react';

interface EmployeeManagerProps {
  employees: Employee[];
  shifts: ShiftPolicy[];
  onRefresh: () => void;
}

export const EmployeeManager: React.FC<EmployeeManagerProps> = ({ employees, shifts, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  // QR Badge Modal state
  const [activeBadgeEmp, setActiveBadgeEmp] = useState<Employee | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [batchPrintMode, setBatchPrintMode] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Tecnología',
    position: '',
    phone: '',
    shiftId: shifts[0]?.id || 'shift-1',
    avatarUrl: '',
  });

  const departments = Array.from(new Set(employees.map((e) => e.department)));

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Generate QR Code data URL when employee selected
  useEffect(() => {
    if (activeBadgeEmp) {
      QRCode.toDataURL(activeBadgeEmp.code, {
        width: 300,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error(err));
    }
  }, [activeBadgeEmp]);

  const handleOpenAddModal = (empToEdit?: Employee) => {
    if (empToEdit) {
      setEditingEmp(empToEdit);
      setFormData({
        name: empToEdit.name,
        email: empToEdit.email,
        department: empToEdit.department,
        position: empToEdit.position,
        phone: empToEdit.phone || '',
        shiftId: empToEdit.shiftId,
        avatarUrl: empToEdit.avatarUrl || '',
      });
    } else {
      setEditingEmp(null);
      setFormData({
        name: '',
        email: '',
        department: 'Tecnología',
        position: 'Especialista',
        phone: '+52 55 ',
        shiftId: shifts[0]?.id || 'shift-1',
        avatarUrl: '',
      });
    }
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEmp) {
        await updateEmployee(editingEmp.id, formData);
      } else {
        await createEmployee(formData);
      }
      setIsAddModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error al guardar empleado');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Está seguro de desactivar al empleado "${name}"?`)) {
      try {
        await deleteEmployee(id);
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Error al desactivar');
      }
    }
  };

  const printBadge = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-400" />
            <span>Gestión de Personal y Credenciales QR</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Administre expedientes de empleados y genere gafetes de identificación con código QR reconocible.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setBatchPrintMode(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-teal-400" />
            <span>Imprimir Todos los Gafetes</span>
          </button>

          <button
            onClick={() => handleOpenAddModal()}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-lg shadow-teal-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nuevo Empleado</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por nombre, código o puesto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 w-full md:w-auto"
        >
          <option value="ALL">Todos los Departamentos</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredEmployees.map((emp) => (
          <div
            key={emp.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-md flex flex-col justify-between transition group relative overflow-hidden"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={emp.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}`}
                    alt={emp.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-teal-500/80 shadow-md"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition line-clamp-1">
                      {emp.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium line-clamp-1">{emp.position}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 text-[11px] space-y-1.5 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-1"><Building2 className="w-3 h-3" /> Depto:</span>
                  <span className="font-semibold text-slate-200">{emp.department}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-1"><QrCode className="w-3 h-3" /> Código QR:</span>
                  <span className="font-mono font-bold text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800">{emp.code}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 border-t border-slate-800/80 pt-3 mt-1">
              <button
                onClick={() => setActiveBadgeEmp(emp)}
                className="flex-1 py-1.5 bg-teal-500/10 hover:bg-teal-500 text-teal-300 hover:text-slate-950 font-semibold text-xs rounded-lg transition border border-teal-500/30 flex items-center justify-center gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Ver Credencial</span>
              </button>

              <button
                onClick={() => handleOpenAddModal(emp)}
                title="Editar Empleado"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <Edit className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleDelete(emp.id, emp.name)}
                title="Desactivar Empleado"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: SINGLE EMPLOYEE ID BADGE / CREDENCIAL GAFETE */}
      {activeBadgeEmp && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-white">
            <button
              onClick={() => setActiveBadgeEmp(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              <span className="text-xs font-semibold text-teal-400 bg-teal-950/80 px-2.5 py-1 rounded-full border border-teal-800">
                Gafete de Identificación
              </span>
            </div>

            {/* Print Area - Printable Badge */}
            <div className="bg-slate-950 border-2 border-teal-500 rounded-2xl p-6 shadow-2xl text-center relative overflow-hidden my-4">
              <div className="bg-teal-500 h-2 absolute top-0 left-0 right-0"></div>

              <div className="text-xs font-bold tracking-widest uppercase text-teal-400 mb-1 mt-1">
                CORPORATIVO EN LA NUBE
              </div>
              <div className="text-[10px] text-slate-400 font-mono mb-4">SISTEMA DE CONTROL QR</div>

              <img
                src={activeBadgeEmp.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeBadgeEmp.name)}`}
                alt={activeBadgeEmp.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-teal-400 mx-auto mb-3 shadow-md"
              />

              <h3 className="font-black text-lg text-white leading-tight">{activeBadgeEmp.name}</h3>
              <p className="text-xs text-teal-300 font-medium mt-0.5">{activeBadgeEmp.position}</p>
              <p className="text-[11px] text-slate-400 font-semibold">{activeBadgeEmp.department}</p>

              {/* Scannable QR Image */}
              <div className="my-4 bg-white p-2 rounded-xl inline-block shadow-lg border border-slate-200">
                {qrCodeDataUrl ? (
                  <img src={qrCodeDataUrl} alt="Código QR" className="w-36 h-36" />
                ) : (
                  <div className="w-36 h-36 bg-slate-100 flex items-center justify-center text-xs text-slate-500">
                    Generando QR...
                  </div>
                )}
              </div>

              <div className="text-xs font-mono font-bold text-slate-200 bg-slate-900 py-1.5 rounded-lg border border-slate-800">
                {activeBadgeEmp.code}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={printBadge}
                className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-teal-500/20"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Gafete</span>
              </button>

              {qrCodeDataUrl && (
                <a
                  href={qrCodeDataUrl}
                  download={`QR-${activeBadgeEmp.code}.png`}
                  className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1"
                  title="Descargar QR en PNG"
                >
                  <Download className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BATCH PRINT ALL BADGES */}
      {batchPrintMode && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex flex-col p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6 max-w-5xl mx-auto w-full text-white">
            <div>
              <h2 className="text-xl font-bold">Impresión Lote de Credenciales QR</h2>
              <p className="text-xs text-slate-400">Gafetes de todos los empleados activos listos para impresión</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Imprimir Hoja
              </button>
              <button
                onClick={() => setBatchPrintMode(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cerrar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto w-full bg-white p-6 rounded-2xl text-slate-900">
            {employees.map((emp) => (
              <div key={emp.id} className="border-2 border-slate-900 rounded-xl p-4 text-center bg-white shadow-sm">
                <div className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">CONTROL ASISTENCIA QR</div>
                <div className="text-[11px] font-extrabold text-slate-900 mt-1 line-clamp-1">{emp.name}</div>
                <div className="text-[9px] text-slate-600 font-medium">{emp.position}</div>
                <div className="my-2 flex justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(emp.code)}`}
                    alt={emp.code}
                    className="w-24 h-24 border border-slate-300 p-1 rounded-md"
                  />
                </div>
                <div className="text-[10px] font-mono font-bold bg-slate-100 py-1 rounded border border-slate-300">
                  {emp.code}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT EMPLOYEE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl text-white">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white">
                {editingEmp ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Ana María Torres"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Departamento</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Tecnología">Tecnología</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                    <option value="Operaciones">Operaciones</option>
                    <option value="Finanzas">Finanzas</option>
                    <option value="Ventas">Ventas</option>
                    <option value="Atención al Cliente">Atención al Cliente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Puesto / Cargo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Analista"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="usuario@empresa.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Teléfono</label>
                  <input
                    type="text"
                    placeholder="+52 55..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Turno Asignado</label>
                <select
                  value={formData.shiftId}
                  onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.startTime} - {s.endTime})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">URL de Avatar (Opcional)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md"
                >
                  {editingEmp ? 'Guardar Cambios' : 'Registrar y Generar QR'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
