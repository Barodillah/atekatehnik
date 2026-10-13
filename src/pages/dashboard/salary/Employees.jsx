import React, { useState, useEffect } from 'react';
import { useToast } from '../../../contexts/ToastContext';
import { useConfirm } from '../../../contexts/ConfirmContext';
import {
  getEmployees,
  saveEmployee,
  deleteEmployee,
  getDepartments,
  formatNumberComma,
} from '../../../services/salaryStorage';
import EmployeeModal from '../../../components/dashboard/salary/EmployeeModal';
import DepartmentModal from '../../../components/dashboard/salary/DepartmentModal';
import salaryApi from '../../../services/salaryApi';

const Employees = () => {
  const { addToast } = useToast();
  const { confirmDialog } = useConfirm();

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Load employees & departments with live MySQL sync
  const loadEmployees = async () => {
    // Render cache immediately
    setEmployees(getEmployees());
    setDepartments(getDepartments());

    // Fetch fresh data from ateka_internal MySQL
    try {
      const [freshEmps, freshDepts] = await Promise.all([
        salaryApi.getEmployees(),
        salaryApi.getDepartments(),
      ]);
      if (freshEmps && freshEmps.length > 0) {
        setEmployees(freshEmps);
      }
      if (freshDepts && freshDepts.length > 0) {
        setDepartments(freshDepts.map((d) => d.name));
      }
    } catch (e) {
      console.warn('Backend sync failed, using cached employees:', e);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmployee(emp);
    setIsModalOpen(true);
  };

  const handleSave = async (empData) => {
    try {
      await salaryApi.saveEmployee(empData);
      addToast(
        empData.id ? 'Data karyawan berhasil diperbarui di database' : 'Karyawan baru berhasil disimpan ke database',
        'success'
      );
      setIsModalOpen(false);
      loadEmployees();
    } catch (e) {
      console.error(e);
      saveEmployee(empData);
      setIsModalOpen(false);
      loadEmployees();
      addToast('Data karyawan disimpan secara lokal: ' + e.message, 'warning');
    }
  };

  const handleDelete = async (emp) => {
    const confirmed = await confirmDialog(
      `Apakah Anda yakin ingin menghapus data karyawan "${emp.name}" (ID Absen: ${emp.id_absen})?`,
      'Hapus Karyawan',
      'danger'
    );
    if (confirmed) {
      try {
        await salaryApi.deleteEmployee(emp.id);
        addToast(`Karyawan ${emp.name} berhasil dihapus dari database`, 'success');
        loadEmployees();
      } catch (e) {
        console.error(e);
        deleteEmployee(emp.id);
        loadEmployees();
        addToast('Karyawan dihapus: ' + e.message, 'warning');
      }
    }
  };

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      (emp.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.id_absen || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.department || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Department options for filter dropdown
  const filterDeptOptions = Array.from(
    new Set([...departments, ...employees.map((e) => e.department).filter(Boolean)])
  );

  // Summary statistics
  const activeCount = employees.filter((e) => e.is_active !== false).length;
  const avgDailySalary =
    employees.length > 0
      ? Math.round(
          employees.reduce((acc, curr) => acc + (Number(curr.daily_salary) || 0), 0) /
            employees.length
        )
      : 0;

  return (
    <div className="p-4 sm:p-6 space-y-6 w-full max-w-full min-w-0 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-600 text-2xl">badge</span>
            <h1 className="text-xl sm:text-2xl font-bold text-blue-950 uppercase tracking-tight font-manrope">
              Manajemen Karyawan
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola master data karyawan, ID Absensi, tarif gaji harian, dan tunjangan luar kota
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-600/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">person_add</span>
          <span>Tambah Karyawan</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">group</span>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Karyawan</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{employees.length} Orang</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">check_circle</span>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Karyawan Aktif</p>
            <p className="text-xl font-bold text-emerald-600 mt-0.5">{activeCount} Orang</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">payments</span>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Rata-rata Gaji Harian</p>
            <p className="text-xl font-bold text-amber-600 mt-0.5">
              Rp {formatNumberComma(avgDailySalary)}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">domain</span>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Departemen</p>
              <p className="text-xl font-bold text-purple-600 mt-0.5">
                {departments.length} Divisi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsDeptModalOpen(true)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-purple-600 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 group"
            title="Kelola Kategori / Departemen"
          >
            <span className="material-symbols-outlined text-xl transition-transform group-hover:rotate-45">
              settings
            </span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-slate-400 text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Cari berdasarkan nama, ID absen, atau divisi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
            >
              <option value="ALL">Semua Departemen</option>
              {filterDeptOptions.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-2.5 text-slate-400 pointer-events-none text-base">
              filter_alt
            </span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="w-full max-w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">ID Absen</th>
                <th className="py-3 px-4">Nama Karyawan</th>
                <th className="py-3 px-4">Departemen</th>
                <th className="py-3 px-4 text-right">Gaji Pokok Harian</th>
                <th className="py-3 px-4 text-right">Tunjangan Perjalanan</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 font-sans">
                    <span className="material-symbols-outlined text-4xl mb-2 text-slate-300 block">
                      person_off
                    </span>
                    Tidak ada data karyawan yang cocok
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, idx) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-center text-slate-500 font-sans">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-orange-700">
                      <span className="bg-orange-50 border border-orange-200 px-2 py-0.5 rounded text-[11px]">
                        {emp.id_absen || '-'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans font-bold text-slate-900 tracking-wide">
                      {emp.name}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">
                        {emp.department}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-emerald-700 font-semibold">
                      Rp {formatNumberComma(emp.daily_salary)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-amber-700 font-semibold">
                      Rp {formatNumberComma(emp.trip_allowance)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-sans">
                      {emp.is_active !== false ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          Non-Aktif
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-sans">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Karyawan"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(emp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Hapus Karyawan"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        employee={editingEmployee}
        departments={departments}
      />

      {/* Department & Category Modal */}
      <DepartmentModal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        onDepartmentsChange={(newDepts) => {
          setDepartments(newDepts);
          loadEmployees();
        }}
        employees={employees}
      />
    </div>
  );
};

export default Employees;
