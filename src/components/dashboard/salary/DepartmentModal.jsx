import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  getDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  resetDepartments,
} from '../../../services/salaryStorage';
import { useToast } from '../../../contexts/ToastContext';
import { useConfirm } from '../../../contexts/ConfirmContext';

const DepartmentModal = ({
  isOpen,
  onClose,
  onDepartmentsChange,
  employees = [],
}) => {
  const { addToast } = useToast();
  const { confirmDialog } = useConfirm();

  const [departments, setDepartments] = useState([]);
  const [newDeptInput, setNewDeptInput] = useState('');
  const [editingDept, setEditingDept] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const addInputRef = useRef(null);
  const editInputRef = useRef(null);

  // Sync departments when modal opens
  useEffect(() => {
    if (isOpen) {
      const data = getDepartments();
      setDepartments(data);
      setNewDeptInput('');
      setEditingDept(null);
      setEditValue('');
      setSearchTerm('');
      setErrorMsg('');

      // Focus input on open
      setTimeout(() => {
        addInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Focus edit input when editing state changes
  useEffect(() => {
    if (editingDept && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingDept]);

  if (!isOpen) return null;

  // Calculate count of employees per department
  const employeeCountByDept = employees.reduce((acc, curr) => {
    const dept = curr.department || 'LAINNYA';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  // Handle Add Department
  const handleAdd = (e) => {
    if (e) e.preventDefault();
    const trimmed = newDeptInput.trim().toUpperCase();
    if (!trimmed) {
      setErrorMsg('Nama kategori tidak boleh kosong');
      addInputRef.current?.focus();
      return;
    }

    try {
      const updated = addDepartment(trimmed);
      setDepartments(updated);
      setNewDeptInput('');
      setErrorMsg('');
      addToast(`Kategori "${trimmed}" berhasil ditambahkan`, 'success');
      if (onDepartmentsChange) onDepartmentsChange(updated);
      addInputRef.current?.focus();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menambahkan kategori');
      addInputRef.current?.focus();
    }
  };

  // Start inline editing
  const handleStartEdit = (dept) => {
    setEditingDept(dept);
    setEditValue(dept);
    setErrorMsg('');
  };

  // Cancel inline editing
  const handleCancelEdit = () => {
    setEditingDept(null);
    setEditValue('');
    setErrorMsg('');
  };

  // Save inline editing
  const handleSaveEdit = (oldName) => {
    const trimmedNew = editValue.trim().toUpperCase();
    if (!trimmedNew) {
      setErrorMsg('Nama kategori baru tidak boleh kosong');
      return;
    }
    if (trimmedNew === oldName) {
      handleCancelEdit();
      return;
    }

    try {
      const updated = updateDepartment(oldName, trimmedNew);
      setDepartments(updated);
      setEditingDept(null);
      setEditValue('');
      setErrorMsg('');
      addToast(`Kategori "${oldName}" diubah menjadi "${trimmedNew}"`, 'success');
      if (onDepartmentsChange) onDepartmentsChange(updated);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengubah nama kategori');
    }
  };

  // Handle Delete Department
  const handleDelete = async (dept) => {
    const count = employeeCountByDept[dept] || 0;
    const confirmMessage =
      count > 0
        ? `Kategori "${dept}" saat ini digunakan oleh ${count} karyawan. Jika dihapus, karyawan terkait tetap tercatat tetapi kategori ini tidak akan muncul lagi di opsi baru. Apakah Anda yakin ingin menghapus?`
        : `Apakah Anda yakin ingin menghapus kategori "${dept}"?`;

    const confirmed = await confirmDialog(confirmMessage, 'Hapus Kategori', 'danger');
    if (confirmed) {
      try {
        const updated = deleteDepartment(dept);
        setDepartments(updated);
        addToast(`Kategori "${dept}" berhasil dihapus`, 'success');
        if (onDepartmentsChange) onDepartmentsChange(updated);
      } catch (err) {
        console.error(err);
        addToast('Gagal menghapus kategori', 'error');
      }
    }
  };

  // Reset to default
  const handleResetDefault = async () => {
    const confirmed = await confirmDialog(
      'Kembalikan daftar kategori divisi ke standar bawaan Ateka Tehnik?',
      'Reset Kategori Bawaan',
      'warning'
    );
    if (confirmed) {
      try {
        const updated = resetDepartments();
        setDepartments(updated);
        addToast('Daftar kategori berhasil direset ke standar', 'success');
        if (onDepartmentsChange) onDepartmentsChange(updated);
      } catch (err) {
        console.error(err);
        addToast('Gagal mereset kategori', 'error');
      }
    }
  };

  // Filter list
  const filteredDepartments = departments.filter((dept) =>
    dept.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-left">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-purple-50/70 via-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200 shadow-2xs">
              <span className="material-symbols-outlined text-xl">domain</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider font-manrope">
                  Kelola Kategori / Departemen
                </h2>
                <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200">
                  {departments.length}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Tambah, edit nama, atau hapus kategori divisi kerja karyawan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/80 transition-colors cursor-pointer"
            title="Tutup"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-hidden flex flex-col flex-1">
          {/* Add Item Input Bar - UI/UX like Adding a List */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3 shadow-2xs">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-purple-600 text-base">
                playlist_add
              </span>
              Tambah Kategori Baru
            </label>
            <form onSubmit={handleAdd} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  ref={addInputRef}
                  type="text"
                  placeholder="Ketik nama kategori / divisi baru..."
                  value={newDeptInput}
                  onChange={(e) => {
                    setNewDeptInput(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  className="w-full bg-white border border-slate-300 rounded-lg pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all uppercase"
                />
                {newDeptInput && (
                  <button
                    type="button"
                    onClick={() => setNewDeptInput('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                <span className="material-symbols-outlined text-base">add</span>
                <span>Tambah</span>
              </button>
            </form>

            {errorMsg && (
              <div className="mt-2 flex items-center gap-1 text-[11px] text-red-600 font-medium">
                <span className="material-symbols-outlined text-sm">error</span>
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Quick Search & Count Filter */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span>Daftar Kategori</span>
              <span className="text-[11px] font-normal text-slate-400">
                ({filteredDepartments.length} dari {departments.length})
              </span>
            </div>

            {departments.length > 3 && (
              <div className="relative w-44">
                <span className="material-symbols-outlined absolute left-2 top-1.5 text-slate-400 text-sm">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Cari kategori..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md pl-7 pr-6 py-1 text-[11px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-1.5 top-1.5 text-slate-400 hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* List of Categories */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-[180px] max-h-[300px]">
            {filteredDepartments.length === 0 ? (
              <div className="py-10 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <span className="material-symbols-outlined text-3xl mb-1 text-slate-300 block">
                  category
                </span>
                <p className="text-xs font-medium text-slate-500">
                  {searchTerm
                    ? `Tidak ada kategori cocok dengan "${searchTerm}"`
                    : 'Belum ada kategori yang ditambahkan'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Gunakan form di atas untuk menambahkan kategori divisi baru
                </p>
              </div>
            ) : (
              filteredDepartments.map((dept, index) => {
                const count = employeeCountByDept[dept] || 0;
                const isEditing = editingDept === dept;

                return (
                  <div
                    key={dept}
                    className={`rounded-xl border transition-all ${
                      isEditing
                        ? 'bg-purple-50/50 border-purple-300 ring-2 ring-purple-100 p-2.5'
                        : 'bg-white border-slate-200 hover:border-purple-200 hover:shadow-xs p-2.5'
                    } flex items-center justify-between gap-3`}
                  >
                    {isEditing ? (
                      /* Inline Edit Mode */
                      <div className="flex items-center gap-2 w-full">
                        <div className="w-6 h-6 rounded-md bg-purple-200 text-purple-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {index + 1}
                        </div>
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(dept);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          className="flex-1 bg-white border border-purple-400 rounded-lg px-2.5 py-1.5 text-xs font-bold text-purple-950 uppercase focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(dept)}
                          className="p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-2xs transition-colors cursor-pointer"
                          title="Simpan Perubahan (Enter)"
                        >
                          <span className="material-symbols-outlined text-base">check</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="Batal (Esc)"
                        >
                          <span className="material-symbols-outlined text-base">close</span>
                        </button>
                      </div>
                    ) : (
                      /* Normal Row Mode */
                      <>
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 uppercase truncate tracking-wide">
                              {dept}
                            </p>
                          </div>
                          {/* Employee count badge */}
                          <div className="shrink-0">
                            {count > 0 ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
                                <span className="material-symbols-outlined text-[12px]">
                                  person
                                </span>
                                {count} Karyawan
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                                0 Karyawan
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(dept)}
                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Nama Kategori"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(dept)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Kategori"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetDefault}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-purple-700 hover:underline transition-colors cursor-pointer"
            title="Kembalikan kategori ke daftar awal"
          >
            <span className="material-symbols-outlined text-base">restart_alt</span>
            <span>Reset Bawaan</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DepartmentModal;
