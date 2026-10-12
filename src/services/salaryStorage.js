/**
 * Salary Storage & Service
 * Handles localStorage persistence, initial mock seeding, calculations,
 * and data manipulation for Employees, Periods, and Salary Attendance Records.
 */

const STORAGE_KEYS = {
  EMPLOYEES: 'ateka_salary_employees',
  PERIODS: 'ateka_salary_periods',
  RECORDS: 'ateka_salary_records',
};

// Initial Employees seed
const DEFAULT_EMPLOYEES = [
  {
    id: 'EMP-001',
    id_absen: '101',
    name: 'ERWIN SASONGKO',
    department: 'PRODUKSI',
    daily_salary: 150000,
    trip_allowance: 250000,
    is_active: true,
  },
  {
    id: 'EMP-002',
    id_absen: '102',
    name: 'BAMBANG SUTRISNO',
    department: 'PENGELASAN',
    daily_salary: 150000,
    trip_allowance: 250000,
    is_active: true,
  },
  {
    id: 'EMP-003',
    id_absen: '103',
    name: 'AGUS SETIAWAN',
    department: 'BUBUT & CNC',
    daily_salary: 160000,
    trip_allowance: 250000,
    is_active: true,
  },
  {
    id: 'EMP-004',
    id_absen: '104',
    name: 'TRI WAHYUDI',
    department: 'PRODUKSI',
    daily_salary: 140000,
    trip_allowance: 200000,
    is_active: true,
  },
  {
    id: 'EMP-005',
    id_absen: '105',
    name: 'DEDI KURNIAWAN',
    department: 'LOGISTIK & TEKNISI',
    daily_salary: 150000,
    trip_allowance: 250000,
    is_active: true,
  },
];

// Initial Period seed
const DEFAULT_PERIODS = [
  {
    id: 'PER-202610-W2',
    period_name: 'OKTOBER 2026 - Minggu ke 2',
    start_date: '2026-10-05',
    end_date: '2026-10-10',
    work_days: 6,
    status: 'Draft',
    notes: 'Periode penggajian reguler minggu ke-2 Oktober 2026',
    created_at: new Date().toISOString(),
  },
];

// Initial Attendance & Salary Records seed (matches reference screenshot!)
const DEFAULT_RECORDS = [
  {
    id: 'REC-PER-202610-W2-EMP-001',
    period_id: 'PER-202610-W2',
    employee_id: 'EMP-001',
    id_absen: '101',
    name: 'ERWIN SASONGKO',
    department: 'PRODUKSI',
    business_trip_days: 0,
    workshop_days: 5.5,
    leave_days: 0.5,
    rate_daily_salary: 150000,
    rate_trip_allowance: 250000,
    base_salary: 825000,
    trip_allowance_total: 0,
    salary_subtotal: 825000,
    extra_income_notes: 'EVI',
    extra_income_amount: 50000,
    net_income: 875000,
  },
  {
    id: 'REC-PER-202610-W2-EMP-002',
    period_id: 'PER-202610-W2',
    employee_id: 'EMP-002',
    id_absen: '102',
    name: 'BAMBANG SUTRISNO',
    department: 'PENGELASAN',
    business_trip_days: 2,
    workshop_days: 4,
    leave_days: 0,
    rate_daily_salary: 150000,
    rate_trip_allowance: 250000,
    base_salary: 600000,
    trip_allowance_total: 500000,
    salary_subtotal: 1100000,
    extra_income_notes: 'Lembur Perakitan',
    extra_income_amount: 75000,
    net_income: 1175000,
  },
  {
    id: 'REC-PER-202610-W2-EMP-003',
    period_id: 'PER-202610-W2',
    employee_id: 'EMP-003',
    id_absen: '103',
    name: 'AGUS SETIAWAN',
    department: 'BUBUT & CNC',
    business_trip_days: 0,
    workshop_days: 6,
    leave_days: 0,
    rate_daily_salary: 160000,
    rate_trip_allowance: 250000,
    base_salary: 960000,
    trip_allowance_total: 0,
    salary_subtotal: 960000,
    extra_income_notes: '',
    extra_income_amount: 0,
    net_income: 960000,
  },
];

// Standard departments in Ateka Tehnik
export const DEPARTMENTS = [
  'PRODUKSI',
  'PENGELASAN',
  'BUBUT & CNC',
  'LOGISTIK & TEKNISI',
  'ADMINISTRASI',
  'FINANCE',
  'QUALITY CONTROL',
];

// Helper: Format Rupiah number with commas (e.g. 825000 -> "825,000")
export const formatNumberComma = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return Number(val).toLocaleString('en-US');
};

// Helper: Format Rupiah with prefix (e.g. 875000 -> "Rp875,000")
export const formatCurrencyRp = (val) => {
  return `Rp${formatNumberComma(val)}`;
};

// Calculation engine for a salary record
export const calculateSalaryRow = (row, totalPeriodDays = null) => {
  const workshopDays = parseFloat(row.workshop_days) || 0;
  const businessTripDays = parseFloat(row.business_trip_days) || 0;

  // Total hari standar (default 6, diambil dari setting periode) - (hari perjalanan + hadir bengkel)
  let standardWorkDays = 6;
  if (totalPeriodDays !== null && totalPeriodDays !== undefined) {
    standardWorkDays = parseFloat(totalPeriodDays) || 6;
  } else if (row.standard_work_days !== undefined && row.standard_work_days !== null) {
    standardWorkDays = parseFloat(row.standard_work_days) || 6;
  } else if (row.period_work_days !== undefined && row.period_work_days !== null) {
    standardWorkDays = parseFloat(row.period_work_days) || 6;
  }

  // Cuti otomatis: Total hari - (Perjalanan bisnis + Hadir bengkel)
  const autoLeaveDays = Math.max(0, Math.round((standardWorkDays - (businessTripDays + workshopDays)) * 100) / 100);

  const rateDaily = parseFloat(row.rate_daily_salary) || 0;
  const rateTrip = parseFloat(row.rate_trip_allowance) || 0;
  const extraIncome = parseFloat(row.extra_income_amount) || 0;

  const baseSalary = Math.round(workshopDays * rateDaily);
  const tripAllowanceTotal = Math.round(businessTripDays * rateTrip);
  const salarySubtotal = baseSalary + tripAllowanceTotal;
  const netIncome = salarySubtotal + extraIncome;

  return {
    ...row,
    standard_work_days: standardWorkDays,
    workshop_days: row.workshop_days !== undefined ? row.workshop_days : workshopDays,
    business_trip_days: row.business_trip_days !== undefined ? row.business_trip_days : businessTripDays,
    leave_days: autoLeaveDays,
    rate_daily_salary: rateDaily,
    rate_trip_allowance: rateTrip,
    base_salary: baseSalary,
    trip_allowance_total: tripAllowanceTotal,
    salary_subtotal: salarySubtotal,
    extra_income_amount: row.extra_income_amount !== undefined ? row.extra_income_amount : extraIncome,
    net_income: netIncome,
  };
};

/* ---------------- EMPLOYEE CRUD ---------------- */

export const getEmployees = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(DEFAULT_EMPLOYEES));
      return DEFAULT_EMPLOYEES;
    }
    return JSON.parse(raw);
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
    const newEmp = {
      ...employee,
      id: `EMP-${Date.now().toString().slice(-4)}`,
      is_active: employee.is_active !== undefined ? employee.is_active : true,
    };
    updated = [...employees, newEmp];
  }
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(updated));
  return updated;
};

export const deleteEmployee = (id) => {
  const employees = getEmployees();
  const filtered = employees.filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(filtered));
  return filtered;
};

/* ---------------- PERIOD CRUD ---------------- */

export const getPeriods = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PERIODS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PERIODS, JSON.stringify(DEFAULT_PERIODS));
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
  return periods.find((p) => p.id === id) || null;
};

export const savePeriod = (period) => {
  const periods = getPeriods();
  let updated;
  let savedPeriod;
  if (period.id) {
    updated = periods.map((p) => (p.id === period.id ? { ...p, ...period } : p));
    savedPeriod = updated.find((p) => p.id === period.id);
  } else {
    savedPeriod = {
      ...period,
      id: `PER-${Date.now().toString().slice(-6)}`,
      status: period.status || 'Draft',
      created_at: new Date().toISOString(),
    };
    updated = [savedPeriod, ...periods];

    // Automatically initialize records for all active employees
    initPeriodRecordsFromEmployees(savedPeriod.id, savedPeriod.work_days || 6);
  }
  localStorage.setItem(STORAGE_KEYS.PERIODS, JSON.stringify(updated));
  return savedPeriod;
};

export const deletePeriod = (id) => {
  const periods = getPeriods();
  const filteredPeriods = periods.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PERIODS, JSON.stringify(filteredPeriods));

  // Also remove records belonging to this period
  const records = getAllRecords();
  const filteredRecords = records.filter((r) => r.period_id !== id);
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(filteredRecords));

  return filteredPeriods;
};

/* ---------------- PERIOD ATTENDANCE & SALARY RECORDS ---------------- */

export const getAllRecords = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(DEFAULT_RECORDS));
      return DEFAULT_RECORDS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to get records', e);
    return DEFAULT_RECORDS;
  }
};

export const getPeriodRecords = (periodId) => {
  const records = getAllRecords();
  return records.filter((r) => r.period_id === periodId);
};

export const saveRecord = (record) => {
  const records = getAllRecords();
  const calculated = calculateSalaryRow(record);
  let updated;
  if (calculated.id) {
    updated = records.map((r) => (r.id === calculated.id ? calculated : r));
  } else {
    const newRecord = {
      ...calculated,
      id: `REC-${calculated.period_id}-${calculated.employee_id || Date.now().toString().slice(-4)}`,
    };
    updated = [...records, newRecord];
  }
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updated));
  return updated.filter((r) => r.period_id === record.period_id);
};

export const deleteRecord = (id) => {
  const records = getAllRecords();
  const target = records.find((r) => r.id === id);
  const filtered = records.filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(filtered));
  return target ? filtered.filter((r) => r.period_id === target.period_id) : filtered;
};

export const batchSaveRecords = (periodId, rows) => {
  const allRecords = getAllRecords();
  const otherRecords = allRecords.filter((r) => r.period_id !== periodId);
  const calculatedRows = rows.map((r) => calculateSalaryRow(r));
  const combined = [...otherRecords, ...calculatedRows];
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(combined));
  return calculatedRows;
};

export const initPeriodRecordsFromEmployees = (periodId, defaultWorkDays = 6) => {
  const employees = getEmployees().filter((e) => e.is_active !== false);
  const existingRecords = getPeriodRecords(periodId);
  const existingEmpIds = new Set(existingRecords.map((r) => r.employee_id));

  const newRows = [];
  employees.forEach((emp) => {
    if (!existingEmpIds.has(emp.id)) {
      const row = calculateSalaryRow({
        id: `REC-${periodId}-${emp.id}`,
        period_id: periodId,
        employee_id: emp.id,
        id_absen: emp.id_absen || '',
        name: emp.name,
        department: emp.department,
        business_trip_days: 0,
        workshop_days: defaultWorkDays,
        leave_days: 0,
        rate_daily_salary: emp.daily_salary || 150000,
        rate_trip_allowance: emp.trip_allowance || 250000,
        extra_income_notes: '',
        extra_income_amount: 0,
      });
      newRows.push(row);
    }
  });

  if (newRows.length > 0) {
    const allRecords = getAllRecords();
    const updated = [...allRecords, ...newRows];
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updated));
    return [...existingRecords, ...newRows];
  }
  return existingRecords;
};
