import React, { useState } from 'react';
import { StafSekolah, Language } from '../types/plc';
import { saveStoredStaff } from '../utils/storage';
import { formatIC } from '../utils/translations';
import { Users, UserPlus, Trash2, X, Plus } from 'lucide-react';

interface StaffDirectoryModalProps {
  staffList: StafSekolah[];
  onUpdate: (updated: StafSekolah[]) => void;
  onClose: () => void;
  lang: Language;
}

export const StaffDirectoryModal: React.FC<StaffDirectoryModalProps> = ({
  staffList,
  onUpdate,
  onClose,
  lang,
}) => {
  const [list, setList] = useState<StafSekolah[]>([...staffList]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [nama, setNama] = useState('');
  const [noKp, setNoKp] = useState('');
  const [jawatan, setJawatan] = useState('');
  const [panitia, setPanitia] = useState('');

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    const newStaff: StafSekolah = {
      id: 'staf-' + Date.now(),
      nama: nama.trim(),
      no_kp: formatIC(noKp),
      jawatan: jawatan.trim() || 'Guru Akademik',
      panitia: panitia.trim() || 'Umum',
    };

    const updated = [...list, newStaff];
    setList(updated);
    saveStoredStaff(updated);
    onUpdate(updated);

    // reset
    setNama('');
    setNoKp('');
    setJawatan('');
    setPanitia('');
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    const updated = list.filter((s) => s.id !== id);
    setList(updated);
    saveStoredStaff(updated);
    onUpdate(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2 text-teal-800">
            <Users className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {lang === 'ms' ? 'Direktori Staf / Guru Sekolah' : 'Teachers & Staff Directory'}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'ms'
                  ? 'Urus senarai guru untuk pemilihan pantas 1-klik semasa mengisi borang PLC.'
                  : 'Manage teachers list for 1-click quick selection in PLC wizard.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-slate-700">
            {list.length} {lang === 'ms' ? 'guru didaftarkan' : 'registered teachers'}
          </span>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{lang === 'ms' ? 'Daftar Guru Baru' : 'Add New Teacher'}</span>
          </button>
        </div>

        {/* Add Form Expandable */}
        {showAddForm && (
          <form onSubmit={handleAddStaff} className="p-4 bg-teal-50/60 border-b border-teal-200 space-y-3 shrink-0">
            <h4 className="text-xs font-bold text-teal-900 uppercase">
              {lang === 'ms' ? 'Maklumat Guru Baru' : 'New Teacher Details'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Nama Penuh (cth: Cikgu Halim bin Daud)"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
              <input
                type="text"
                placeholder="No. Kad Pengenalan (######-##-####)"
                value={noKp}
                onChange={(e) => setNoKp(formatIC(e.target.value))}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-mono"
              />
              <input
                type="text"
                placeholder="Jawatan (cth: Guru Kanan / KP)"
                value={jawatan}
                onChange={(e) => setJawatan(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
              <input
                type="text"
                placeholder="Panitia (cth: Sains / Bahasa)"
                value={panitia}
                onChange={(e) => setPanitia(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                {lang === 'ms' ? 'Batal' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 py-1 text-xs font-bold bg-teal-700 text-white rounded-lg hover:bg-teal-800"
              >
                {lang === 'ms' ? 'Simpan' : 'Save'}
              </button>
            </div>
          </form>
        )}

        {/* Staff List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {list.map((staf) => (
            <div
              key={staf.id}
              className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between hover:border-slate-300 transition"
            >
              <div>
                <p className="font-bold text-xs sm:text-sm text-slate-900">{staf.nama}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="font-mono">{staf.no_kp}</span>
                  <span>&bull;</span>
                  <span>{staf.jawatan}</span>
                  {staf.panitia && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                      {staf.panitia}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(staf.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                title="Padam"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-right shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition"
          >
            {lang === 'ms' ? 'Tutup Direktori' : 'Close Directory'}
          </button>
        </div>
      </div>
    </div>
  );
};
