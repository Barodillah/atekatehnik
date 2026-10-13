/**
 * Salary Storage & Service — Connected to ateka_internal
 * Handles local caching, background synchronization with isolated MySQL backend,
 * calculation engines, and data operations for Departments, Employees, Periods, and Records.
 */

import salaryApi, {
  formatNumberComma,
  formatCurrencyRp,
  calculateSalaryRow,
} from './salaryApi';

export { formatNumberComma, formatCurrencyRp, calculateSalaryRow };

const STORAGE_KEYS = {
  EMPLOYEES: 'ateka_salary_employees_v2',
  PERIODS: 'ateka_salary_periods_v2',
  RECORDS: 'ateka_salary_records_v2',
  DEPARTMENTS: 'ateka_salary_departments_v2',
};

// 8 Departemen Resmi CV Ateka Tehnik
export const DEFAULT_DEPARTMENTS = [
  'KEUANGAN',
  'DIREKTUR',
  'ADMIN',
  'PRODUKSI',
  'HELPER',
  'CHEF',
  'PENJUALAN',
  'PKL',
];

export const DEPARTMENTS = DEFAULT_DEPARTMENTS;

// 24 Master Karyawan Awal (ATK-001 s/d ATK-024)
export const DEFAULT_EMPLOYEES = [
  { id: 1, employee_code: 'ATK-001', id_absen: '1', name: 'BARRONSAVE', department: 'KEUANGAN', daily_salary: 100000, trip_allowance: 0, is_active: true },
  { id: 2, employee_code: 'ATK-002', id_absen: '2', name: 'WARSITO', department: 'DIREKTUR', daily_salary: 0, trip_allowance: 0, is_active: true },
  { id: 3, employee_code: 'ATK-003', id_absen: '3', name: 'INSANI', department: 'ADMIN', daily_salary: 100000, trip_allowance: 0, is_active: true },
  { id: 4, employee_code: 'ATK-004', id_absen: '4', name: 'WARSITO', department: 'PRODUKSI', daily_salary: 165000, trip_allowance: 0, is_active: true },
  { id: 5, employee_code: 'ATK-005', id_absen: '5', name: 'MULYOTO', department: 'PRODUKSI', daily_salary: 175000, trip_allowance: 300000, is_active: true },
  { id: 6, employee_code: 'ATK-006', id_absen: '6', name: 'SAMSUNRUDIN', department: 'PRODUKSI', daily_salary: 155000, trip_allowance: 250000, is_active: true },
  { id: 7, employee_code: 'ATK-007', id_absen: '7', name: 'DIKI PURWOKO', department: 'PRODUKSI', daily_salary: 155000, trip_allowance: 250000, is_active: true },
  { id: 8, employee_code: 'ATK-008', id_absen: '8', name: 'WINARNO', department: 'PRODUKSI', daily_salary: 155000, trip_allowance: 250000, is_active: true },
  { id: 9, employee_code: 'ATK-009', id_absen: '9', name: 'ERWIN SASONGKO', department: 'PRODUKSI', daily_salary: 150000, trip_allowance: 250000, is_active: true },
  { id: 10, employee_code: 'ATK-010', id_absen: '10', name: 'REBO MURYANTO', department: 'HELPER', daily_salary: 100000, trip_allowance: 0, is_active: true },
  { id: 11, employee_code: 'ATK-011', id_absen: '11', name: 'KRISTIANTO', department: 'PRODUKSI', daily_salary: 130000, trip_allowance: 225000, is_active: true },
  { id: 12, employee_code: 'ATK-012', id_absen: '12', name: 'SAMIDI', department: 'PRODUKSI', daily_salary: 110000, trip_allowance: 0, is_active: true },
  { id: 13, employee_code: 'ATK-013', id_absen: '13', name: 'AMIR ROSYID', department: 'PRODUKSI', daily_salary: 110000, trip_allowance: 200000, is_active: true },
  { id: 14, employee_code: 'ATK-014', id_absen: '14', name: 'ANJAS', department: 'PRODUKSI', daily_salary: 100000, trip_allowance: 0, is_active: true },
  { id: 15, employee_code: 'ATK-015', id_absen: '15', name: 'RISKI FAJAR S', department: 'PRODUKSI', daily_salary: 100000, trip_allowance: 200000, is_active: true },
  { id: 16, employee_code: 'ATK-016', id_absen: '16', name: 'SURADI', department: 'PRODUKSI', daily_salary: 130000, trip_allowance: 225000, is_active: true },
  { id: 17, employee_code: 'ATK-017', id_absen: '17', name: 'SOLIKHUL ANAM', department: 'HELPER', daily_salary: 150000, trip_allowance: 300000, is_active: true },
  { id: 18, employee_code: 'ATK-018', id_absen: '18', name: 'SUKISMAN', department: 'PRODUKSI', daily_salary: 130000, trip_allowance: 0, is_active: true },
  { id: 19, employee_code: 'ATK-019', id_absen: '19', name: 'DANI  S', department: 'PRODUKSI', daily_salary: 100000, trip_allowance: 200000, is_active: true },
  { id: 20, employee_code: 'ATK-020', id_absen: '20', name: 'NAFI N H', department: 'PRODUKSI', daily_salary: 150000, trip_allowance: 300000, is_active: true },
  { id: 21, employee_code: 'ATK-021', id_absen: '21', name: 'RISKI KINTIL', department: 'PRODUKSI', daily_salary: 80000, trip_allowance: 150000, is_active: true },
  { id: 22, employee_code: 'ATK-022', id_absen: '22', name: 'LESTARI', department: 'CHEF', daily_salary: 41666, trip_allowance: 0, is_active: true },
  { id: 23, employee_code: 'ATK-023', id_absen: '23', name: 'KUNTUM INDAH', department: 'PENJUALAN', daily_salary: 100000, trip_allowance: 0, is_active: true },
  { id: 24, employee_code: 'ATK-024', id_absen: '24', name: 'SHENDI', department: 'PRODUKSI', daily_salary: 80000, trip_allowance: 0, is_active: true },
];

export const DEFAULT_PERIODS = [];
export const DEFAULT_RECORDS = [];

// Inisialisasi sinkronisasi otomatis dari database `ateka_internal`
try {
  salaryApi.getDepartments().then((depts) => {
    if (depts && depts.length > 0) {
      const names = depts.map((d) => d.name);
      localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(names));
    }
  }).catch(() => {});

  salaryApi.getEmployees().then((emps) => {
    if (emps && emps.length > 0) {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(emps));
    }
  }).catch(() => {});
} catch (e) {
  // Silent catch
}

/* ---------------- DEPARTEMEN CRUD ---------------- */

export const getDepartments = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(DEFAULT_DEPARTMENTS));
      return DEFAULT_DEPARTMENTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0 || parsed.includes('PENGELASAN')) {
      localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(DEFAULT_DEPARTMENTS));
      return DEFAULT_DEPARTMENTS;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to get departments', e);
    return DEFAULT_DEPARTMENTS;
  }
};

export const saveDepartments = (depts) => {
  localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(depts));
  return depts;
};

export const addDepartment = (name) => {
  const trimmed = (name || '').trim().toUpperCase();
  if (!trimmed) throw new Error('Nama kategori / departemen tidak boleh kosong');
  const current = getDepartments();
  if (current.some((d) => d.toUpperCase() === trimmed)) {
    throw new Error(`Departemen "${trimmed}" sudah terdaftar`);
  }
  const updated = [...current, trimmed];
  saveDepartments(updated);

  // Sync ke MySQL backend
  salaryApi.addDepartment(trimmed).catch((err) => {
    console.error('Error syncing addDepartment to backend:', err);
  });

  return updated;
};

export const updateDepartment = (oldName, newName) => {
  const trimmedOld = (oldName || '').trim();
  const trimmedNew = (newName || '').trim().toUpperCase();
  if (!trimmedNew) throw new Error('Nama kategori baru tidak boleh kosong');

  const current = getDepartments();
  if (
    trimmedOld.toUpperCase() !== trimmedNew &&
    current.some((d) => d.toUpperCase() === trimmedNew)
  ) {
    throw new Error(`Kategori "${trimmedNew}" sudah terdaftar`);
  }

  const updated = current.map((d) => (d === trimmedOld ? trimmedNew : d));
  saveDepartments(updated);

  // Sync ke MySQL backend
  salaryApi.getDepartments().then((list) => {
    const target = list.find((d) => d.name === trimmedOld);
    if (target) {
      salaryApi.updateDepartment(target.id, trimmedNew);
    }
  }).catch((err) => {
    console.error('Error syncing updateDepartment to backend:', err);
  });

  return updated;
};

export const deleteDepartment = (name) => {
  const trimmed = (name || '').trim();
  const current = getDepartments();
  const updated = current.filter((d) => d !== trimmed);
  saveDepartments(updated);

  // Sync ke MySQL backend
  salaryApi.getDepartments().then((list) => {
    const target = list.find((d) => d.name === trimmed);
    if (target) {
      salaryApi.deleteDepartment(target.id);
    }
  }).catch((err) => {
    console.error('Error syncing deleteDepartment to backend:', err);
  });

  return updated;
};

export const resetDepartments = () => {
  saveDepartments(DEFAULT_DEPARTMENTS);
  return DEFAULT_DEPARTMENTS;
};

/* ---------------- EMPLOYEE CRUD ---------------- */

export const getEmployees = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(DEFAULT_EMPLOYEES));
      return DEFAULT_EMPLOYEES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length < 10 || parsed.some((e) => String(e.employee_code || e.id).startsWith('EMP-'))) {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(DEFAULT_EMPLOYEES));
      return DEFAULT_EMPLOYEES;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to get employees', e);
    return DEFAULT_EMPLOYEES;
  }
};

export const saveEmployee = (employee) => {
  const employees = getEmployees();
  let updated;
  if (employee.id) {
    updated = employees.map((e) => (e.id === employee.id ? { ...e, ...employee } : e));
  } else {
    const nextCode = `ATK-${String(employees.length + 1).padStart(3, '0')}`;
    const newEmp = {
      ...employee,
      id: Date.now(),
      employee_code: employee.employee_code || nextCode,
      is_active: employee.is_active !== undefined ? employee.is_active : true,
    };
    updated = [...employees, newEmp];
  }
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(updated));

  // Sync ke MySQL backend
  salaryApi.saveEmployee(employee).then(() => {
    salaryApi.getEmployees().then((fresh) => {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(fresh));
    });
  }).catch((err) => {
    console.error('Error syncing saveEmployee to backend:', err);
  });

  return updated;
};

export const deleteEmployee = (id) => {
  const employees = getEmployees();
  const filtered = employees.filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(filtered));

  // Sync ke MySQL backend
  salaryApi.deleteEmployee(id).catch((err) => {
    console.error('Error syncing deleteEmployee to backend:', err);
  });

  return filtered;
};

/* ---------------- PERIOD CRUD ---------------- */

export const getPeriods = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PERIODS);
    if (!raw) {
      return DEFAULT_PERIODS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to get periods', e);
    return DEFAULT_PERIODS;
  }
};

export const getPeriodById = (id) => {
  const periods = getPeriods();
  return periods.find((p) => String(p.id) === String(id)) || null;
};

export const savePeriod = (period) => {
  const periods = getPeriods();
  let updated;
  let savedPeriod;
  if (period.id) {
    updated = periods.map((p) => (String(p.id) === String(period.id) ? { ...p, ...period } : p));
    savedPeriod = updated.find((p) => String(p.id) === String(period.id));
  } else {
    savedPeriod = {
      ...period,
      id: period.id || Date.now(),
      period_code: period.period_code || `PER-${new Date().toISOString().slice(0, 7).replace('-', '')}-01`,
      status: period.status || 'Draft',
      created_at: new Date().toISOString(),
    };
    updated = [savedPeriod, ...periods];
  }
  localStorage.setItem(STORAGE_KEYS.PERIODS, JSON.stringify(updated));

  // Sync ke MySQL backend
  salaryApi.savePeriod(period).then((resp) => {
    salaryApi.getPeriods().then((fresh) => {
      localStorage.setItem(STORAGE_KEYS.PERIODS, JSON.stringify(fresh));
    });
  }).catch((err) => {
    console.error('Error syncing savePeriod to backend:', err);
  });

  return savedPeriod;
};

export const deletePeriod = (id) => {
  const periods = getPeriods();
  const filteredPeriods = periods.filter((p) => String(p.id) !== String(id));
  localStorage.setItem(STORAGE_KEYS.PERIODS, JSON.stringify(filteredPeriods));

  // Sync ke MySQL backend
  salaryApi.deletePeriod(id).catch((err) => {
    console.error('Error syncing deletePeriod to backend:', err);
  });

  return filteredPeriods;
};

/* ---------------- PERIOD RECORDS ---------------- */

export const getAllRecords = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!raw) return DEFAULT_RECORDS;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to get records', e);
    return DEFAULT_RECORDS;
  }
};

export const getPeriodRecords = (periodId) => {
  const records = getAllRecords();
  return records.filter((r) => String(r.period_id) === String(periodId));
};

export const saveRecord = (record) => {
  const records = getAllRecords();
  const calculated = calculateSalaryRow(record);
  let updated;
  if (calculated.id) {
    updated = records.map((r) => (String(r.id) === String(calculated.id) ? calculated : r));
  } else {
    updated = [...records, calculated];
  }
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updated));

  // Sync ke MySQL backend
  salaryApi.saveRecord(calculated).catch((err) => {
    console.error('Error syncing saveRecord to backend:', err);
  });

  return updated.filter((r) => String(r.period_id) === String(record.period_id));
};

export const deleteRecord = (id) => {
  const records = getAllRecords();
  const target = records.find((r) => String(r.id) === String(id));
  const filtered = records.filter((r) => String(r.id) !== String(id));
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(filtered));
  return target ? filtered.filter((r) => String(r.period_id) === String(target.period_id)) : filtered;
};

export const batchSaveRecords = (periodId, rows) => {
  const allRecords = getAllRecords();
  const otherRecords = allRecords.filter((r) => String(r.period_id) !== String(periodId));
  const calculatedRows = rows.map((r) => calculateSalaryRow(r));
  const combined = [...otherRecords, ...calculatedRows];
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(combined));

  // Sync ke MySQL backend
  salaryApi.batchSaveRecords(periodId, calculatedRows).catch((err) => {
    console.error('Error syncing batchSaveRecords to backend:', err);
  });

  return calculatedRows;
};

export const initPeriodRecordsFromEmployees = (periodId, defaultWorkDays = 6) => {
  // Sync via backend
  salaryApi.syncNewEmployees(periodId).catch(() => {});
  return getPeriodRecords(periodId);
};

export const applyAttendanceToPeriod = (periodId, attendanceRows = [], fileName = 'Import_Absensi.xlsx') => {
  if (!periodId || !attendanceRows || attendanceRows.length === 0) return [];
  
  // Kirim ke backend database
  salaryApi.applyAttendanceToPeriod(periodId, attendanceRows, fileName).catch((err) => {
    console.error('Error applying attendance to backend:', err);
  });

  const records = getPeriodRecords(periodId);
  return records;
};

export default {
  getDepartments,
  saveDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  resetDepartments,
  getEmployees,
  saveEmployee,
  deleteEmployee,
  getPeriods,
  getPeriodById,
  savePeriod,
  deletePeriod,
  getPeriodRecords,
  saveRecord,
  deleteRecord,
  batchSaveRecords,
  initPeriodRecordsFromEmployees,
  applyAttendanceToPeriod,
  formatNumberComma,
  formatCurrencyRp,
  calculateSalaryRow,
};
