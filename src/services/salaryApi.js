/**
 * Ateka Tehnik Internal Payroll API Service
 * 
 * Menghubungkan antarmuka frontend ke backend terisolasi `ateka_internal`
 * melalui endpoint `/api/salary/*.php`.
 */

const API_BASE = '/api/salary';

/**
 * Wrapper request fetch dengan parsing JSON dan error handling
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}/${endpoint}`;
  const headers = {
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, { ...options, headers });
  let data;
  try {
    data = await res.json();
  } catch (err) {
    throw new Error(`Server returned non-JSON response (${res.status} ${res.statusText})`);
  }

  if (!res.ok || data.success === false) {
    throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
  }

  return data;
}

/* ---------------- FORMATTERS & CALCULATION ENGINE ---------------- */

export const formatNumberComma = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return Number(val).toLocaleString('en-US');
};

export const formatCurrencyRp = (val) => {
  return `Rp${formatNumberComma(val)}`;
};

export const calculateSalaryRow = (row, totalPeriodDays = null) => {
  const workshopDays = parseFloat(row.workshop_days) || 0;
  const businessTripDays = parseFloat(row.business_trip_days) || 0;

  let standardWorkDays = 6;
  if (totalPeriodDays !== null && totalPeriodDays !== undefined) {
    standardWorkDays = parseFloat(totalPeriodDays) || 6;
  } else if (row.standard_work_days !== undefined && row.standard_work_days !== null) {
    standardWorkDays = parseFloat(row.standard_work_days) || 6;
  } else if (row.period_work_days !== undefined && row.period_work_days !== null) {
    standardWorkDays = parseFloat(row.period_work_days) || 6;
  }

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

/* ---------------- 1. STATUS & TEST KONEKSI ---------------- */

export const pingSalaryDB = async () => {
  return apiRequest('ping.php');
};

/* ---------------- 2. DEPARTEMEN API ---------------- */

export const getDepartments = async () => {
  const data = await apiRequest('departments.php');
  return data.departments || [];
};

export const getDepartmentNames = async () => {
  const depts = await getDepartments();
  return depts.map((d) => d.name);
};

export const addDepartment = async (name, description = '', sortOrder = 0) => {
  const data = await apiRequest('departments.php', {
    method: 'POST',
    body: { name, description, sort_order: sortOrder },
  });
  return data.department;
};

export const updateDepartment = async (id, name, description = '', sortOrder = null) => {
  const body = { id, name, description };
  if (sortOrder !== null) body.sort_order = sortOrder;
  const data = await apiRequest('departments.php', {
    method: 'PUT',
    body,
  });
  return data;
};

export const deleteDepartment = async (id) => {
  return apiRequest(`departments.php?id=${id}`, {
    method: 'DELETE',
  });
};

/* ---------------- 3. MASTER KARYAWAN API ---------------- */

export const getEmployees = async (params = {}) => {
  const qs = new URLSearchParams();
  if (params.department && params.department !== 'ALL') {
    qs.append('department', params.department);
  }
  if (params.search) {
    qs.append('search', params.search);
  }
  if (params.activeOnly) {
    qs.append('active_only', '1');
  }
  const query = qs.toString() ? `?${qs.toString()}` : '';
  const data = await apiRequest(`employees.php${query}`);
  return data.employees || [];
};

export const saveEmployee = async (empData) => {
  if (empData.id && typeof empData.id === 'number') {
    return apiRequest('employees.php', {
      method: 'PUT',
      body: empData,
    });
  } else {
    return apiRequest('employees.php', {
      method: 'POST',
      body: empData,
    });
  }
};

export const deleteEmployee = async (id, force = false) => {
  return apiRequest(`employees.php?id=${id}&force=${force ? '1' : '0'}`, {
    method: 'DELETE',
  });
};

/* ---------------- 4. PERIODE PENGGAJIAN API ---------------- */

export const getPeriods = async () => {
  const data = await apiRequest('periods.php');
  return data.periods || [];
};

export const getPeriodById = async (id) => {
  const data = await apiRequest(`periods.php?id=${id}`);
  return data.period || null;
};

export const savePeriod = async (periodData) => {
  if (periodData.id && (typeof periodData.id === 'number' || !isNaN(Number(periodData.id)))) {
    const data = await apiRequest('periods.php', {
      method: 'PUT',
      body: periodData,
    });
    return data.period;
  } else {
    const data = await apiRequest('periods.php', {
      method: 'POST',
      body: periodData,
    });
    return data.period;
  }
};

export const deletePeriod = async (id) => {
  return apiRequest(`periods.php?id=${id}`, {
    method: 'DELETE',
  });
};

/* ---------------- 5. MATRIX GAJI & ABSENSI PERIODE ---------------- */

export const getPeriodRecords = async (periodId) => {
  const data = await apiRequest(`records.php?period_id=${periodId}`);
  return data.records || [];
};

export const saveRecord = async (record) => {
  const calculated = calculateSalaryRow(record);
  const data = await apiRequest('records.php', {
    method: 'PUT',
    body: calculated,
  });
  return data.record;
};

export const batchSaveRecords = async (periodId, rows) => {
  return apiRequest('records.php?action=batch_save', {
    method: 'POST',
    body: {
      period_id: periodId,
      rows,
    },
  });
};

export const applyAttendanceToPeriod = async (periodId, attendanceRows = [], fileName = 'Import_Absensi.xlsx') => {
  return apiRequest('records.php?action=import_attendance', {
    method: 'POST',
    body: {
      period_id: periodId,
      file_name: fileName,
      attendance_rows: attendanceRows,
    },
  });
};

export const syncNewEmployees = async (periodId) => {
  return apiRequest('records.php?action=sync_new_employees', {
    method: 'POST',
    body: { period_id: periodId },
  });
};

export const addEmployeeToPeriod = async (periodId, employeeId) => {
  return apiRequest('records.php?action=add_employee', {
    method: 'POST',
    body: {
      period_id: periodId,
      employee_id: employeeId,
    },
  });
};

export const deleteRecord = async (recordId) => {
  return apiRequest(`records.php?id=${recordId}`, {
    method: 'DELETE',
  });
};

/* ---------------- 6. SETTINGS API ---------------- */

export const getSettings = async () => {
  const data = await apiRequest('settings.php');
  return data.settings || {};
};

export const saveSettings = async (settingsObj) => {
  return apiRequest('settings.php', {
    method: 'PUT',
    body: { settings: settingsObj },
  });
};

export default {
  pingSalaryDB,
  getDepartments,
  getDepartmentNames,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  getEmployees,
  saveEmployee,
  deleteEmployee,
  getPeriods,
  getPeriodById,
  savePeriod,
  deletePeriod,
  getPeriodRecords,
  saveRecord,
  batchSaveRecords,
  applyAttendanceToPeriod,
  syncNewEmployees,
  addEmployeeToPeriod,
  deleteRecord,
  getSettings,
  saveSettings,
  formatNumberComma,
  formatCurrencyRp,
  calculateSalaryRow,
};
