import React, { useState, useEffect } from 'react';
import { QrCode, Users, CalendarCheck, BarChart3, Clock, Database, RefreshCw, Sparkles, MonitorSmartphone } from 'lucide-react';

interface HeaderProps {
  activeTab: 'terminal' | 'daily' | 'employees' | 'reports' | 'shifts';
  setActiveTab: (tab: 'terminal' | 'daily' | 'employees' | 'reports' | 'shifts') => void;
  dbConnected: boolean;
  onResetData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  dbConnected,
  onResetData,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
      setCurrentDate(
        now.toLocaleDateString('es-ES', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-3 gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-teal-500 text-slate-950 p-2.5 rounded-xl shadow-lg shadow-teal-500/20 flex items-center justify-center">
              <QrCode className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  ControlAsistencia<span className="text-teal-400">QR</span>
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-950/80 text-teal-300 border border-teal-800/60">
                  <span className={`w-2 h-2 rounded-full ${dbConnected ? 'bg-teal-400 animate-pulse' : 'bg-amber-400'}`}></span>
                  {dbConnected ? 'Nube Sincronizada' : 'Conectando Nube'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sistema de reconocimiento QR y reportes de puntualidad
              </p>
            </div>
          </div>

          {/* Clock & Status info */}
          <div className="flex items-center gap-4 text-xs">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/60 text-slate-300">
              <Clock className="w-4 h-4 text-teal-400" />
              <div className="font-mono">
                <span className="font-semibold text-slate-100 text-sm">{currentTime}</span>
                <span className="text-slate-400 ml-2 capitalize">{currentDate}</span>
              </div>
            </div>

            {onResetData && (
              <button
                onClick={onResetData}
                title="Reiniciar datos de demostración"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition border border-slate-700/60 text-xs font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden md:inline">Reiniciar Demo</span>
              </button>
            )}
          </div>

        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto pt-1 pb-2 scrollbar-none text-sm border-t border-slate-800/60">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'terminal'
                ? 'bg-teal-500 text-slate-950 shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MonitorSmartphone className="w-4 h-4" />
            <span>Escáner QR / Terminal</span>
          </button>

          <button
            onClick={() => setActiveTab('daily')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'daily'
                ? 'bg-teal-500 text-slate-950 shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Registro Diario</span>
          </button>

          <button
            onClick={() => setActiveTab('employees')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'employees'
                ? 'bg-teal-500 text-slate-950 shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Empleados y Credenciales</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'reports'
                ? 'bg-teal-500 text-slate-950 shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Reportes de Puntualidad</span>
          </button>

          <button
            onClick={() => setActiveTab('shifts')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'shifts'
                ? 'bg-teal-500 text-slate-950 shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Horarios y Políticas</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
