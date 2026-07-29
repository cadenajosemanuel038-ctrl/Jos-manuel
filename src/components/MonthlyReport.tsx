import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, PieChart, Pie } from 'recharts';
import { MonthlySummaryReport, MonthlyEmployeeReport } from '../types';
import { fetchMonthlyReport } from '../services/api';
import { BarChart3, Award, FileSpreadsheet, Download, Printer, Star, TrendingUp, AlertTriangle, CheckCircle2, Building2, Users, Calendar } from 'lucide-react';

interface MonthlyReportProps {
  currentMonth: string;
}

export const MonthlyReport: React.FC<MonthlyReportProps> = ({ currentMonth }) => {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth || '2026-07');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [reportData, setReportData] = useState<MonthlySummaryReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReport();
  }, [selectedMonth]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await fetchMonthlyReport(selectedMonth);
      setReportData(data);
    } catch (err) {
      console.error('Report loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !reportData) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-semibold text-white">Generando reporte automático de puntualidad...</p>
      </div>
    );
  }

  const filteredEmployees = reportData.employeeReports.filter(
    (emp) => selectedDept === 'ALL' || emp.department === selectedDept
  );

  const starEmployee = reportData.employeeReports[0];

  // Colors for Recharts
  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

  // PDF Export
  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 297, 'F');

    doc.setTextColor(20, 184, 166); // teal-500
    doc.setFontSize(18);
    doc.text('REPORTE MENSUAL DE PUNTUALIDAD', 14, 20);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(`Período Evalución: ${selectedMonth} | Generado Automáticamente`, 14, 27);

    // Summary Metrics
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(14, 32, 182, 30, 3, 3, 'F');

    doc.setTextColor(203, 213, 225);
    doc.setFontSize(9);
    doc.text(`Total Colaboradores: ${reportData.totalEmployees}`, 20, 42);
    doc.text(`Puntualidad Global: ${reportData.overallPunctualityRate}%`, 20, 50);
    doc.text(`Marcajes de Entrada: ${reportData.totalCheckIns}`, 100, 42);
    doc.text(`Minutos Totales Retraso: ${reportData.totalLateMinutes} min`, 100, 50);

    // Table Header
    let y = 70;
    doc.setFillColor(20, 184, 166);
    doc.rect(14, y, 182, 8, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.text('Empleado', 18, y + 6);
    doc.text('Departamento', 75, y + 6);
    doc.text('Presente', 125, y + 6);
    doc.text('Tardanzas', 150, y + 6);
    doc.text('% Puntualidad', 175, y + 6);

    y += 12;

    filteredEmployees.forEach((emp, i) => {
      if (y > 270) {
        doc.addPage();
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 210, 297, 'F');
        y = 20;
      }

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text(`#${i + 1} ${emp.employeeName.substring(0, 25)}`, 18, y);
      doc.text(emp.department, 75, y);
      doc.text(`${emp.daysPresent}/${emp.totalWorkDays} d`, 125, y);
      doc.text(`${emp.lateCount} (${emp.totalLateMinutes}m)`, 150, y);
      doc.text(`${emp.punctualityPercentage}%`, 175, y);

      y += 7;
    });

    doc.save(`Reporte_Puntualidad_${selectedMonth}.pdf`);
  };

  // CSV Export
  const exportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Ranking,Empleado,Codigo,Departamento,Puesto,DiasPresente,DiasLaborables,EntradasATiempo,EnTolerancia,Tardanzas,MinutosRetraso,PorcentajePuntualidad\n';

    filteredEmployees.forEach((emp, i) => {
      csvContent += `${i + 1},"${emp.employeeName}",${emp.employeeCode},"${emp.department}","${emp.position}",${emp.daysPresent},${emp.totalWorkDays},${emp.onTimeCount},${emp.graceCount},${emp.lateCount},${emp.totalLateMinutes},${emp.punctualityPercentage}%\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Puntualidad_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>ANALÍTICA Y EVALUACIÓN MENSUAL</span>
          </div>
          <h2 className="text-xl font-bold text-white">Reportes Automáticos de Puntualidad</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-white font-mono font-bold focus:outline-none cursor-pointer"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="ALL">Todos los Departamentos</option>
            {reportData.departmentBreakdown.map((d) => (
              <option key={d.department} value={d.department}>
                {d.department}
              </option>
            ))}
          </select>

          <button
            onClick={exportPDF}
            className="px-3 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-md flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Exportar PDF
          </button>

          <button
            onClick={exportCSV}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> CSV / Excel
          </button>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="text-xs text-slate-400 font-medium mb-1">Índice de Puntualidad Global</div>
          <div className="text-3xl font-black text-teal-400 font-mono">
            {reportData.overallPunctualityRate}%
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Promedio de la compañía para {selectedMonth}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-slate-400 font-medium mb-1">Total Entradas Registradas</div>
          <div className="text-3xl font-black text-white font-mono">
            {reportData.totalCheckIns}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {reportData.totalEmployees} empleados activos evaluados
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-slate-400 font-medium mb-1">Total de Tardanzas</div>
          <div className="text-3xl font-black text-rose-400 font-mono">
            {reportData.totalLateCount} <span className="text-xs font-normal text-slate-400">({reportData.totalLateMinutes} min)</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Minutos acumulados de retraso
          </div>
        </div>

        {/* Star Employee Highlight Card */}
        {starEmployee && (
          <div className="bg-gradient-to-br from-slate-900 to-teal-950/60 border border-teal-500/40 rounded-2xl p-5 shadow-lg relative">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-2">
              <Award className="w-4 h-4" />
              <span>COLABORADOR ESTRELLA DEL MES</span>
            </div>
            <div className="flex items-center gap-3">
              <img
                src={starEmployee.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(starEmployee.employeeName)}`}
                alt={starEmployee.employeeName}
                className="w-11 h-11 rounded-full object-cover border-2 border-amber-400 shadow-md"
              />
              <div>
                <div className="font-bold text-white text-sm line-clamp-1">{starEmployee.employeeName}</div>
                <div className="text-[11px] text-teal-300 font-medium">{starEmployee.punctualityPercentage}% Puntualidad ⭐ 5.0</div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Department Comparison Bar Chart */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-400" />
            <span>Puntualidad por Departamento (%)</span>
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.departmentBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="department" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#2dd4bf' }}
                />
                <Bar dataKey="punctualityRate" radius={[6, 6, 0, 0]}>
                  {reportData.departmentBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Distribution */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-400" />
            <span>Resumen de Puntualidad</span>
          </h3>

          <div className="space-y-3 my-auto">
            {reportData.departmentBreakdown.map((d) => (
              <div key={d.department} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{d.department}</span>
                  <span className="font-mono font-bold text-teal-400">{d.punctualityRate}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${d.punctualityRate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 mt-4">
            * Se calcula tomando las entradas en rango de horario permitido + tiempo de gracia configurado.
          </div>
        </div>

      </div>

      {/* Employee Punctuality Ranking Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-400" />
            <span>Ranking Completo de Puntualidad de Personal</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {filteredEmployees.length} Empleados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Posición</th>
                <th className="px-4 py-3.5">Empleado</th>
                <th className="px-4 py-3.5">Departamento / Puesto</th>
                <th className="px-4 py-3.5">Días Laborados</th>
                <th className="px-4 py-3.5">Puntual / Tolerancia</th>
                <th className="px-4 py-3.5">Tardanzas</th>
                <th className="px-4 py-3.5">Min. Retraso</th>
                <th className="px-4 py-3.5">% Puntualidad</th>
                <th className="px-4 py-3.5 text-center">Calificación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEmployees.map((emp, index) => (
                <tr key={emp.employeeId} className="hover:bg-slate-800/50 transition">
                  <td className="px-4 py-3.5 font-bold">
                    {index === 0 && <span className="px-2 py-0.5 bg-amber-500 text-slate-950 rounded-full font-black text-[10px]">#1 ⭐</span>}
                    {index === 1 && <span className="px-2 py-0.5 bg-slate-300 text-slate-950 rounded-full font-bold text-[10px]">#2</span>}
                    {index === 2 && <span className="px-2 py-0.5 bg-amber-700 text-slate-100 rounded-full font-bold text-[10px]">#3</span>}
                    {index > 2 && <span className="text-slate-500 font-mono">#{index + 1}</span>}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={emp.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.employeeName)}`}
                        alt={emp.employeeName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <div className="font-bold text-white">{emp.employeeName}</div>
                        <div className="text-[10px] text-teal-400 font-mono">{emp.employeeCode}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="font-medium text-slate-200">{emp.department}</div>
                    <div className="text-[10px] text-slate-400">{emp.position}</div>
                  </td>

                  <td className="px-4 py-3.5 font-mono font-bold text-slate-300">
                    {emp.daysPresent} / {emp.totalWorkDays} d
                  </td>

                  <td className="px-4 py-3.5 font-mono text-emerald-400 font-semibold">
                    {emp.onTimeCount} A tiempo ({emp.graceCount} tol.)
                  </td>

                  <td className="px-4 py-3.5 font-mono text-rose-400 font-semibold">
                    {emp.lateCount} tardanza(s)
                  </td>

                  <td className="px-4 py-3.5 font-mono text-amber-400 font-bold">
                    {emp.totalLateMinutes} min
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-teal-300 w-9">{emp.punctualityPercentage}%</span>
                      <div className="w-16 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full ${
                            emp.punctualityPercentage >= 90
                              ? 'bg-emerald-400'
                              : emp.punctualityPercentage >= 75
                              ? 'bg-amber-400'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${emp.punctualityPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-center">
                    <div className="inline-flex text-amber-400">
                      {'★'.repeat(emp.starRating)}
                      {'☆'.repeat(5 - emp.starRating)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
