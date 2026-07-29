import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Employee, EntryType } from '../types';
import { scanAttendanceQR } from '../services/api';
import { Camera, QrCode, CheckCircle2, AlertTriangle, Clock, User, Zap, Sparkles, Volume2, ShieldCheck } from 'lucide-react';

interface TerminalViewProps {
  employees: Employee[];
  onScanSuccess?: () => void;
}

export const TerminalView: React.FC<TerminalViewProps> = ({ employees, onScanSuccess }) => {
  const [entryType, setEntryType] = useState<EntryType>('IN');
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<{
    message: string;
    record: any;
    employee: Employee;
    shift: any;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Audio synthesizer for scan chime feedback
  const playChime = (isSuccess: boolean, isLate: boolean = false) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isSuccess && !isLate) {
        // Double tone high success chime
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } else if (isLate) {
        // Warning alert chime
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
        osc.frequency.setValueAtTime(349.23, ctx.currentTime + 0.15); // F4
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      console.error('Audio play error', e);
    }
  };

  const processCode = async (code: string) => {
    if (loading || !code) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const data = await scanAttendanceQR(code, entryType);
      setScanResult(data);
      setManualCode('');
      
      const isLate = data.record?.status === 'LATE';
      playChime(true, isLate);

      if (onScanSuccess) onScanSuccess();

      // Auto dismiss result modal after 5 seconds
      setTimeout(() => {
        setScanResult(null);
      }, 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar el código QR');
      playChime(false, true);
    } finally {
      setLoading(false);
    }
  };

  // Initialize Html5QrcodeScanner
  useEffect(() => {
    if (!cameraActive) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
      return;
    }

    const timer = setTimeout(() => {
      const scannerElement = document.getElementById('qr-reader');
      if (scannerElement) {
        try {
          const scanner = new Html5QrcodeScanner(
            'qr-reader',
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
              rememberLastUsedCamera: true,
            },
            /* verbose= */ false
          );

          scanner.render(
            (decodedText) => {
              processCode(decodedText);
            },
            (errorMessage) => {
              // silent error during frame scanning
            }
          );

          scannerRef.current = scanner;
        } catch (e) {
          console.warn('Camera scanner initialization issue:', e);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [cameraActive, entryType]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      processCode(manualCode.trim());
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Mode Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-400 text-sm font-semibold mb-1">
              <Zap className="w-4 h-4" />
              <span>TERMINAL DE MARCAJE Y ESCANEO DIRECTO</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Escanear Código QR de Asistencia</h2>
            <p className="text-slate-400 text-sm mt-0.5">
              Posicione la credencial o código QR frente a la cámara o seleccione un empleado para simular lectura.
            </p>
          </div>

          {/* Action Type Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setEntryType('IN')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                entryType === 'IN'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              🟢 Entrada Principal
            </button>
            <button
              onClick={() => setEntryType('LUNCH_IN')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                entryType === 'LUNCH_IN'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              🍔 Entrada Almuerzo
            </button>
            <button
              onClick={() => setEntryType('OUT')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                entryType === 'OUT'
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              🔴 Salida Jornada
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Live Camera Scanner */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-teal-400" />
                <h3 className="font-semibold text-white">Cámara y Escáner QR en Vivo</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition ${
                    soundEnabled
                      ? 'bg-teal-950/60 border-teal-800 text-teal-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                  title="Activar/Desactivar Sonido"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{soundEnabled ? 'Sonido ON' : 'Silencio'}</span>
                </button>

                <button
                  onClick={() => setCameraActive(!cameraActive)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    cameraActive
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      : 'bg-teal-500 text-slate-950 font-semibold'
                  }`}
                >
                  {cameraActive ? 'Apagar Cámara' : 'Encender Cámara'}
                </button>
              </div>
            </div>

            {/* Scanner Container */}
            {cameraActive ? (
              <div className="bg-slate-950 rounded-xl overflow-hidden min-h-[320px] flex items-center justify-center border border-slate-800">
                <div id="qr-reader" className="w-full max-w-md"></div>
              </div>
            ) : (
              <div className="bg-slate-950 rounded-xl p-8 text-center text-slate-400 min-h-[280px] flex flex-col items-center justify-center border border-slate-800">
                <QrCode className="w-16 h-16 text-slate-700 mb-3" />
                <p className="text-sm font-medium text-slate-300">La cámara en vivo está apagada.</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Puede encender la cámara para escanear físicamente un QR o usar el panel de prueba rápida a la derecha.
                </p>
                <button
                  onClick={() => setCameraActive(true)}
                  className="mt-4 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs rounded-xl transition shadow-lg shadow-teal-500/20"
                >
                  Activar Cámara
                </button>
              </div>
            )}

            {/* Manual Code Input Bar */}
            <form onSubmit={handleManualSubmit} className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="O escriba/escanee ID (ej: EMP-1001)..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="submit"
                disabled={loading || !manualCode.trim()}
                className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-semibold text-sm rounded-xl transition shadow-md"
              >
                {loading ? 'Procesando...' : 'Registrar'}
              </button>
            </form>

            {errorMsg && (
              <div className="mt-3 p-3 bg-rose-950/80 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Fast One-Click Demo Simulation Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-white">Lector Directo de Demostración</h3>
              </div>
              <span className="text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                Prueba 1-Clic
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Haga clic en cualquiera de las credenciales activas para simular un escaneo instantáneo con el horario actual:
            </p>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {employees.slice(0, 8).map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => processCode(emp.code)}
                  className="group flex items-center justify-between p-2.5 bg-slate-950/70 hover:bg-slate-800 border border-slate-800/80 hover:border-teal-500/50 rounded-xl cursor-pointer transition shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}`}
                      alt={emp.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-teal-300 transition">
                        {emp.name}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span className="font-mono text-teal-400 font-semibold">{emp.code}</span>
                        <span>•</span>
                        <span>{emp.department}</span>
                      </div>
                    </div>
                  </div>

                  <button className="px-3 py-1.5 bg-slate-800 group-hover:bg-teal-500 group-hover:text-slate-950 text-slate-300 font-semibold text-xs rounded-lg transition border border-slate-700 group-hover:border-teal-400 flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Escanear</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* POPUP RESULT MODAL UPON SCAN */}
      {scanResult && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative overflow-hidden text-center text-white">
            
            {/* Top Status Gradient Bar */}
            <div className={`absolute top-0 left-0 right-0 h-3 ${
              scanResult.record.status === 'LATE' ? 'bg-amber-500' : 'bg-teal-400'
            }`}></div>

            <div className="mt-2 mb-4 flex justify-center">
              <img
                src={scanResult.employee.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(scanResult.employee.name)}`}
                alt={scanResult.employee.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-teal-500 shadow-xl"
              />
            </div>

            <h3 className="text-2xl font-black text-white tracking-tight">{scanResult.employee.name}</h3>
            <p className="text-sm text-teal-400 font-medium">{scanResult.employee.position} • {scanResult.employee.department}</p>
            <p className="text-xs font-mono text-slate-400 mt-1">Código: {scanResult.employee.code}</p>

            {/* Status Pill */}
            <div className="mt-5 mb-4 inline-flex flex-col items-center">
              {scanResult.record.status === 'ON_TIME' && (
                <div className="px-4 py-2 rounded-2xl bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 font-bold text-sm flex items-center gap-2 shadow-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>ENTRADA A TIEMPO (PUNTUAL)</span>
                </div>
              )}

              {scanResult.record.status === 'GRACE_PERIOD' && (
                <div className="px-4 py-2 rounded-2xl bg-amber-950/80 border border-amber-500/80 text-amber-300 font-bold text-sm flex items-center gap-2 shadow-lg">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <span>EN TIEMPO DE TOLERANCIA</span>
                </div>
              )}

              {scanResult.record.status === 'LATE' && (
                <div className="px-4 py-2 rounded-2xl bg-rose-950/80 border border-rose-500/80 text-rose-300 font-bold text-sm flex items-center gap-2 shadow-lg">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <span>TARDANZA ({scanResult.record.minutesLate} MIN DE RETRASO)</span>
                </div>
              )}

              {scanResult.record.status === 'NORMAL_EXIT' && (
                <div className="px-4 py-2 rounded-2xl bg-sky-950/80 border border-sky-500/80 text-sky-300 font-bold text-sm flex items-center gap-2 shadow-lg">
                  <CheckCircle2 className="w-5 h-5 text-sky-400" />
                  <span>SALIDA DE JORNADA REGISTRADA</span>
                </div>
              )}
            </div>

            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 text-xs text-slate-300 space-y-1.5 text-left mb-6">
              <div className="flex justify-between">
                <span className="text-slate-400">Hora de Registro:</span>
                <span className="font-mono font-bold text-teal-300">{scanResult.record.time} ({scanResult.record.date})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Horario de Entrada:</span>
                <span className="font-mono font-semibold">{scanResult.shift?.startTime || '08:00'} HRS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tolerancia Permitida:</span>
                <span className="font-mono font-semibold">{scanResult.shift?.gracePeriodMinutes || 10} minutos</span>
              </div>
            </div>

            <button
              onClick={() => setScanResult(null)}
              className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-teal-500/20"
            >
              Confirmar y Continuar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
