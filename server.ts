import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Database Seeding
function getInitialData() {
  const defaultShifts = [
    {
      id: "shift-1",
      name: "Jornada Administrativa Regular",
      startTime: "08:00",
      endTime: "17:00",
      gracePeriodMinutes: 10,
      lunchDurationMinutes: 60,
    },
    {
      id: "shift-2",
      name: "Turno Mañana Operativo",
      startTime: "07:00",
      endTime: "15:00",
      gracePeriodMinutes: 5,
      lunchDurationMinutes: 45,
    },
    {
      id: "shift-3",
      name: "Turno Tarde",
      startTime: "13:00",
      endTime: "21:00",
      gracePeriodMinutes: 10,
      lunchDurationMinutes: 60,
    },
  ];

  const defaultEmployees = [
    {
      id: "emp-101",
      code: "EMP-1001",
      name: "Carlos Eduardo Mendoza",
      email: "cmendoza@empresa.com",
      department: "Tecnología",
      position: "Desarrollador Senior",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      phone: "+52 55 1234 5678",
      active: true,
      shiftId: "shift-1",
    },
    {
      id: "emp-102",
      code: "EMP-1002",
      name: "Sofía Elena Ramírez",
      email: "sramirez@empresa.com",
      department: "Recursos Humanos",
      position: "Coordinadora de Talento",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200",
      phone: "+52 55 8765 4321",
      active: true,
      shiftId: "shift-1",
    },
    {
      id: "emp-103",
      code: "EMP-1003",
      name: "Alejandro Ruiz Torres",
      email: "aruiz@empresa.com",
      department: "Operaciones",
      position: "Supervisor de Logística",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      phone: "+52 55 5555 1212",
      active: true,
      shiftId: "shift-2",
    },
    {
      id: "emp-104",
      code: "EMP-1004",
      name: "Mariana Delgado Paz",
      email: "mdelgado@empresa.com",
      department: "Finanzas",
      position: "Analista Contable",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
      phone: "+52 55 4444 3333",
      active: true,
      shiftId: "shift-1",
    },
    {
      id: "emp-105",
      code: "EMP-1005",
      name: "Roberto Fernández",
      email: "rfernandez@empresa.com",
      department: "Ventas",
      position: "Ejecutivo Comercial",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
      phone: "+52 55 9999 8888",
      active: true,
      shiftId: "shift-1",
    },
    {
      id: "emp-106",
      code: "EMP-1006",
      name: "Valeria Castillo",
      email: "vcastillo@empresa.com",
      department: "Tecnología",
      position: "Diseñadora UX/UI",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
      phone: "+52 55 2222 1111",
      active: true,
      shiftId: "shift-1",
    },
    {
      id: "emp-107",
      code: "EMP-1007",
      name: "Javier Morales Soria",
      email: "jmorales@empresa.com",
      department: "Operaciones",
      position: "Operador de Almacén",
      avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200",
      phone: "+52 55 7777 6666",
      active: true,
      shiftId: "shift-2",
    },
    {
      id: "emp-108",
      code: "EMP-1008",
      name: "Lucía Méndez Vega",
      email: "lmendez@empresa.com",
      department: "Atención al Cliente",
      position: "Especialista de Soporte",
      avatarUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=200",
      phone: "+52 55 3333 9999",
      active: true,
      shiftId: "shift-3",
    }
  ];

  // Generate realistic attendance logs for July 2026 up to today (2026-07-28)
  const attendanceRecords: any[] = [];
  const year = 2026;
  const month = 7; // July
  const currentDay = 28;

  let recIdCounter = 1000;

  for (let day = 1; day <= currentDay; day++) {
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

    const dateStr = `${year}-07-${day.toString().padStart(2, '0')}`;

    defaultEmployees.forEach((emp) => {
      recIdCounter++;
      const shift = defaultShifts.find((s) => s.id === emp.shiftId) || defaultShifts[0];
      const [shiftH, shiftM] = shift.startTime.split(':').map(Number);

      // Simulate varying punctuality patterns per employee
      let rand = Math.random();
      let minuteOffset = 0; // 0 = exactly on time
      
      if (emp.code === 'EMP-1001' || emp.code === 'EMP-1002') {
        // Very punctual employees (90% on time, 10% grace)
        minuteOffset = rand > 0.8 ? Math.floor(Math.random() * 5) : -Math.floor(Math.random() * 15);
      } else if (emp.code === 'EMP-1005' || emp.code === 'EMP-1007') {
        // Frequently late employees
        if (rand < 0.4) {
          minuteOffset = 15 + Math.floor(Math.random() * 35); // 15-50 min late
        } else if (rand < 0.7) {
          minuteOffset = 5 + Math.floor(Math.random() * 8); // Grace
        } else {
          minuteOffset = -Math.floor(Math.random() * 10); // On time
        }
      } else {
        // Average employees (70% on time, 20% grace, 10% late)
        if (rand < 0.7) minuteOffset = -Math.floor(Math.random() * 10);
        else if (rand < 0.9) minuteOffset = Math.floor(Math.random() * 8);
        else minuteOffset = 12 + Math.floor(Math.random() * 20);
      }

      const totalMinutes = shiftH * 60 + shiftM + minuteOffset;
      const actualH = Math.floor(totalMinutes / 60);
      const actualM = Math.floor(totalMinutes % 60);
      const actualS = Math.floor(Math.random() * 59);

      const timeStr = `${actualH.toString().padStart(2, '0')}:${actualM.toString().padStart(2, '0')}:${actualS.toString().padStart(2, '0')}`;
      const isoTimestamp = `${dateStr}T${timeStr}.000Z`;

      let status = 'ON_TIME';
      let minutesLate = 0;

      if (minuteOffset > shift.gracePeriodMinutes) {
        status = 'LATE';
        minutesLate = minuteOffset;
      } else if (minuteOffset > 0 && minuteOffset <= shift.gracePeriodMinutes) {
        status = 'GRACE_PERIOD';
        minutesLate = 0;
      } else {
        status = 'ON_TIME';
        minutesLate = 0;
      }

      // Check-in record
      attendanceRecords.push({
        id: `att-${recIdCounter}`,
        employeeId: emp.id,
        employeeCode: emp.code,
        employeeName: emp.name,
        department: emp.department,
        timestamp: isoTimestamp,
        date: dateStr,
        time: timeStr,
        type: 'IN',
        status,
        minutesLate,
        notes: status === 'LATE' ? `Retraso de ${minutesLate} min` : 'Registro automático',
      });

      // Also add Check-out record for past days
      if (day < currentDay || (day === currentDay && new Date().getHours() >= 17)) {
        recIdCounter++;
        const [endH, endM] = shift.endTime.split(':').map(Number);
        const exitMinutes = endH * 60 + endM + Math.floor(Math.random() * 15) - 3;
        const outH = Math.floor(exitMinutes / 60);
        const outM = Math.floor(exitMinutes % 60);
        const outTimeStr = `${outH.toString().padStart(2, '0')}:${outM.toString().padStart(2, '0')}:15`;

        attendanceRecords.push({
          id: `att-${recIdCounter}`,
          employeeId: emp.id,
          employeeCode: emp.code,
          employeeName: emp.name,
          department: emp.department,
          timestamp: `${dateStr}T${outTimeStr}.000Z`,
          date: dateStr,
          time: outTimeStr,
          type: 'OUT',
          status: 'NORMAL_EXIT',
          minutesLate: 0,
          notes: 'Salida de jornada',
        });
      }
    });
  }

  return {
    shifts: defaultShifts,
    employees: defaultEmployees,
    attendance: attendanceRecords,
    lastUpdated: new Date().toISOString(),
  };
}

function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf8");
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading database file:", err);
    return getInitialData();
  }
}

function writeDB(data: any) {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing database file:", err);
  }
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/db/status", (req, res) => {
  const db = readDB();
  res.json({
    connected: true,
    storageType: "Cloud-Sync JSON Persistence DB",
    employeeCount: db.employees.length,
    recordCount: db.attendance.length,
    lastUpdated: db.lastUpdated,
  });
});

app.post("/api/db/seed-sample", (req, res) => {
  const initial = getInitialData();
  writeDB(initial);
  res.json({ message: "Base de datos reiniciada con datos de muestra.", data: initial });
});

// Employees
app.get("/api/employees", (req, res) => {
  const db = readDB();
  res.json(db.employees);
});

app.post("/api/employees", (req, res) => {
  const db = readDB();
  const { name, email, department, position, avatarUrl, phone, shiftId } = req.body;

  if (!name || !department) {
    return res.status(400).json({ error: "Nombre y departamento son requeridos." });
  }

  const nextNum = 1000 + db.employees.length + 1;
  const newEmp = {
    id: `emp-${Date.now()}`,
    code: `EMP-${nextNum}`,
    name,
    email: email || `${name.toLowerCase().replace(/\s+/g, '')}@empresa.com`,
    department,
    position: position || "Empleado",
    avatarUrl: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D9488&color=fff`,
    phone: phone || "+52 55 0000 0000",
    active: true,
    shiftId: shiftId || db.shifts[0].id,
  };

  db.employees.push(newEmp);
  writeDB(db);
  res.status(201).json(newEmp);
});

app.put("/api/employees/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const index = db.employees.findIndex((e: any) => e.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Empleado no encontrado." });
  }

  db.employees[index] = { ...db.employees[index], ...req.body };
  writeDB(db);
  res.json(db.employees[index]);
});

app.delete("/api/employees/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const index = db.employees.findIndex((e: any) => e.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Empleado no encontrado." });
  }

  // Soft delete
  db.employees[index].active = false;
  writeDB(db);
  res.json({ message: "Empleado desactivado correctamente." });
});

// Shifts
app.get("/api/shifts", (req, res) => {
  const db = readDB();
  res.json(db.shifts);
});

app.post("/api/shifts", (req, res) => {
  const db = readDB();
  const { id, name, startTime, endTime, gracePeriodMinutes, lunchDurationMinutes } = req.body;

  if (id) {
    const idx = db.shifts.findIndex((s: any) => s.id === id);
    if (idx !== -1) {
      db.shifts[idx] = { id, name, startTime, endTime, gracePeriodMinutes, lunchDurationMinutes };
    }
  } else {
    const newShift = {
      id: `shift-${Date.now()}`,
      name,
      startTime,
      endTime,
      gracePeriodMinutes: gracePeriodMinutes || 10,
      lunchDurationMinutes: lunchDurationMinutes || 60,
    };
    db.shifts.push(newShift);
  }

  writeDB(db);
  res.json(db.shifts);
});

// Attendance Records
app.get("/api/attendance", (req, res) => {
  const db = readDB();
  let records = db.attendance;

  const { date, employeeId, month } = req.query;

  if (date) {
    records = records.filter((r: any) => r.date === date);
  }
  if (employeeId) {
    records = records.filter((r: any) => r.employeeId === employeeId);
  }
  if (month) {
    // month in format YYYY-MM
    records = records.filter((r: any) => r.date.startsWith(month as string));
  }

  // Sort descending by timestamp
  records.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.json(records);
});

// Scan / Register Attendance via QR
app.post("/api/attendance/scan", (req, res) => {
  const db = readDB();
  const { qrCode, type = 'IN', notes } = req.body;

  if (!qrCode) {
    return res.status(400).json({ error: "Código QR o identificador es requerido." });
  }

  // Clean code string
  const cleanCode = qrCode.trim().toUpperCase();

  // Find employee by code or ID
  const employee = db.employees.find((e: any) => e.code.toUpperCase() === cleanCode || e.id === cleanCode || e.code.toUpperCase() === `EMP-${cleanCode}`);

  if (!employee) {
    return res.status(404).json({ error: `Código QR no reconocido: "${cleanCode}". Verifique el gafete del empleado.` });
  }

  if (!employee.active) {
    return res.status(400).json({ error: `El empleado ${employee.name} está inactivo en el sistema.` });
  }

  const shift = db.shifts.find((s: any) => s.id === employee.shiftId) || db.shifts[0];

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0]; // HH:mm:ss

  // Calculate punctuality for Entry
  let status = 'ON_TIME';
  let minutesLate = 0;

  if (type === 'IN') {
    const [shiftH, shiftM] = shift.startTime.split(':').map(Number);
    const shiftMinutes = shiftH * 60 + shiftM;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const diff = currentMinutes - shiftMinutes;

    if (diff > shift.gracePeriodMinutes) {
      status = 'LATE';
      minutesLate = diff;
    } else if (diff > 0 && diff <= shift.gracePeriodMinutes) {
      status = 'GRACE_PERIOD';
      minutesLate = 0;
    } else {
      status = 'ON_TIME';
      minutesLate = 0;
    }
  } else if (type === 'OUT') {
    const [endH, endM] = shift.endTime.split(':').map(Number);
    const endMinutes = endH * 60 + endM;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    if (currentMinutes < endMinutes - 10) {
      status = 'EARLY_DEPARTURE';
    } else {
      status = 'NORMAL_EXIT';
    }
  }

  const newRecord = {
    id: `att-${Date.now()}`,
    employeeId: employee.id,
    employeeCode: employee.code,
    employeeName: employee.name,
    department: employee.department,
    timestamp: now.toISOString(),
    date: dateStr,
    time: timeStr,
    type: type || 'IN',
    status,
    minutesLate,
    notes: notes || (status === 'LATE' ? `Retraso de ${minutesLate} min` : 'Registro vía Código QR'),
  };

  db.attendance.push(newRecord);
  writeDB(db);

  res.status(201).json({
    message: "Asistencia registrada exitosamente",
    record: newRecord,
    employee,
    shift,
  });
});

app.delete("/api/attendance/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  db.attendance = db.attendance.filter((r: any) => r.id !== id);
  writeDB(db);
  res.json({ message: "Registro eliminado." });
});

// Monthly Punctuality Report API
app.get("/api/reports/monthly", (req, res) => {
  const db = readDB();
  const yearMonth = (req.query.month as string) || "2026-07";

  const activeEmployees = db.employees.filter((e: any) => e.active);
  const monthlyRecords = db.attendance.filter((r: any) => r.date.startsWith(yearMonth));

  // Compute work days in month (excluding weekends) up to today if current month
  const [yStr, mStr] = yearMonth.split('-');
  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10);
  
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && (today.getMonth() + 1) === month;
  const maxDay = isCurrentMonth ? Math.min(today.getDate(), daysInMonth) : daysInMonth;

  let totalWorkDays = 0;
  for (let d = 1; d <= maxDay; d++) {
    const dayOfWeek = new Date(year, month - 1, d).getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) totalWorkDays++;
  }

  const employeeReports = activeEmployees.map((emp: any) => {
    const empRecords = monthlyRecords.filter((r: any) => r.employeeId === emp.id && r.type === 'IN');
    const daysPresent = new Set(empRecords.map((r: any) => r.date)).size;

    let onTimeCount = 0;
    let graceCount = 0;
    let lateCount = 0;
    let totalLateMinutes = 0;

    empRecords.forEach((r: any) => {
      if (r.status === 'ON_TIME') onTimeCount++;
      else if (r.status === 'GRACE_PERIOD') graceCount++;
      else if (r.status === 'LATE') {
        lateCount++;
        totalLateMinutes += r.minutesLate || 0;
      }
    });

    // Punctuality rate calculation: (On Time + Grace) / Present Days * 100
    const totalPunctual = onTimeCount + graceCount;
    const punctualityPercentage = daysPresent > 0 
      ? Math.round((totalPunctual / daysPresent) * 100) 
      : 100;

    // Star rating (1 - 5 stars)
    let starRating = 5;
    if (punctualityPercentage < 70) starRating = 1;
    else if (punctualityPercentage < 80) starRating = 2;
    else if (punctualityPercentage < 90) starRating = 3;
    else if (punctualityPercentage < 96) starRating = 4;

    return {
      employeeId: emp.id,
      employeeCode: emp.code,
      employeeName: emp.name,
      department: emp.department,
      position: emp.position,
      avatarUrl: emp.avatarUrl,
      totalWorkDays,
      daysPresent,
      onTimeCount,
      graceCount,
      lateCount,
      totalLateMinutes,
      punctualityPercentage,
      starRating,
    };
  });

  // Sort by punctuality desc, then late minutes asc
  employeeReports.sort((a: any, b: any) => {
    if (b.punctualityPercentage !== a.punctualityPercentage) {
      return b.punctualityPercentage - a.punctualityPercentage;
    }
    return a.totalLateMinutes - b.totalLateMinutes;
  });

  // Department Aggregation
  const deptMap: Record<string, { totalEmployees: number; punctualitySum: number; lateMinutes: number }> = {};

  employeeReports.forEach((rep: any) => {
    if (!deptMap[rep.department]) {
      deptMap[rep.department] = { totalEmployees: 0, punctualitySum: 0, lateMinutes: 0 };
    }
    deptMap[rep.department].totalEmployees++;
    deptMap[rep.department].punctualitySum += rep.punctualityPercentage;
    deptMap[rep.department].lateMinutes += rep.totalLateMinutes;
  });

  const departmentBreakdown = Object.keys(deptMap).map((dept) => ({
    department: dept,
    totalEmployees: deptMap[dept].totalEmployees,
    punctualityRate: Math.round(deptMap[dept].punctualitySum / deptMap[dept].totalEmployees),
    lateMinutes: deptMap[dept].lateMinutes,
  }));

  const overallPunctuality = employeeReports.length > 0
    ? Math.round(employeeReports.reduce((sum: number, e: any) => sum + e.punctualityPercentage, 0) / employeeReports.length)
    : 100;

  const totalCheckIns = monthlyRecords.filter((r: any) => r.type === 'IN').length;
  const totalLateCount = employeeReports.reduce((sum: number, e: any) => sum + e.lateCount, 0);
  const totalLateMinutes = employeeReports.reduce((sum: number, e: any) => sum + e.totalLateMinutes, 0);

  res.json({
    yearMonth,
    totalEmployees: activeEmployees.length,
    overallPunctualityRate: overallPunctuality,
    totalCheckIns,
    totalLateCount,
    totalLateMinutes,
    departmentBreakdown,
    employeeReports,
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Express Backend] Express API & Vite server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
