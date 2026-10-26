import React, { useState } from 'react';
import { AhliKumpulan, Language, StafSekolah } from '../../types/plc';
import { translations, formatIC } from '../../utils/translations';
import { getStoredStaff } from '../../utils/storage';
import { Users, UserPlus, Trash2, BookUser, Check, X, ShieldAlert } from 'lucide-react';

interface Step2MembersProps {
  members: AhliKumpulan[];
  updateMembers: (members: AhliKumpulan[]) => void;
  lang: Language;
}

export const Step2Members: React.FC<Step2MembersProps> = ({
  members,
  updateMembers,
  lang,
}) => {
  const t = translations[lang];
  const [showStaffPicker, setShowStaffPicker] = useState(false);
  const staffList = getStoredStaff();

  const handleAddMember = () => {
    const newMember: AhliKumpulan = {
      id: 'm-' + Date.now(),
      nama: '',
      no_kp: '',
      jawatan: '',
    };
    updateMembers([...members, newMember]);
  };

  const handleRemoveMember = (id: string) => {
    updateMembers(members.filter((m) => m.id !== id));
  };

  const handleMemberChange = (id: string, field: keyof AhliKumpulan, val: string) => {
    let finalVal = val;
    if (field === 'no_kp') {
      finalVal = formatIC(val);
    }
    updateMembers(
      members.map((m) => (m.id === id ? { ...m, [field]: finalVal } : m))
    );
  };

  const handlePickStaff = (staf: StafSekolah) => {
    // Check if already in list
    const exists = members.some((m) => m.nama.toLowerCase() === staf.nama.toLowerCase());
    if (exists) {
      alert(`${staf.nama} sudah berada dalam senarai ahli.`);
      return;
    }

    const newMember: AhliKumpulan = {
      id: 'm-' + Date.now(),
      nama: staf.nama,
      no_kp: staf.no_kp,
      jawatan: staf.jawatan,
    };
    updateMembers([...members, newMember]);
    setShowStaffPicker(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            <div>
              <h4 className="font-bold text-base text-slate-900">
                {t.members_list} <span className="text-red-500">*</span>
              </h4>
              <p className="text-xs text-slate-500">
                {lang === 'ms'
                  ? 'Masukkan senarai guru yang terlibat dalam sesi perkongsian.'
                  : 'Add teachers participating in this PLC session.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowStaffPicker(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition cursor-pointer"
            >
              <BookUser className="w-4 h-4 text-teal-700" />
              <span>{t.pick_from_directory}</span>
            </button>
            <button
              type="button"
              onClick={handleAddMember}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t.add_member}</span>
            </button>
          </div>
        </div>

        {/* Members Cards */}
        {members.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 mt-4">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">
              {lang === 'ms' ? 'Belum ada ahli ditambah.' : 'No members added yet.'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'ms'
                ? 'Klik "+ Tambah Ahli" atau pilih dari direktori staf sekolah.'
                : 'Click "+ Add Member" or select from the staff directory.'}
            </p>
            <button
              type="button"
              onClick={handleAddMember}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700"
            >
              {t.add_member}
            </button>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {members.map((member, idx) => (
              <div
                key={member.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-teal-300 transition shadow-xs relative"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-700 uppercase">
                      {lang === 'ms' ? 'Ahli' : 'Member'} #{idx + 1}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                    title={t.remove_member}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-5">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.member_name} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={member.nama}
                      onChange={(e) => handleMemberChange(member.id, 'nama', e.target.value)}
                      placeholder="Cth: Cikgu Nurul Huda binti Othman"
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-semibold text-slate-900 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.member_ic}
                    </label>
                    <input
                      type="text"
                      maxLength={14}
                      value={member.no_kp}
                      onChange={(e) => handleMemberChange(member.id, 'no_kp', e.target.value)}
                      placeholder="850312-14-5541"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-mono text-slate-800 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.member_role}
                    </label>
                    <input
                      type="text"
                      value={member.jawatan}
                      onChange={(e) => handleMemberChange(member.id, 'jawatan', e.target.value)}
                      placeholder={t.member_role_placeholder}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-slate-800 bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Staff Directory Quick Picker Modal */}
      {showStaffPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookUser className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-base text-slate-900">
                  {lang === 'ms' ? 'Pilih Dari Direktori Staf Sekolah' : 'Select from School Directory'}
                </h3>
              </div>
              <button
                onClick={() => setShowStaffPicker(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 my-2">
              {lang === 'ms'
                ? 'Klik mana-mana nama guru untuk terus dimasukkan ke dalam sesi PLC ini:'
                : 'Click any teacher name to immediately add them to this PLC session:'}
            </p>

            <div className="overflow-y-auto flex-1 space-y-2 pr-1 my-2">
              {staffList.map((staf) => {
                const isAlreadySelected = members.some(
                  (m) => m.nama.toLowerCase() === staf.nama.toLowerCase()
                );
                return (
                  <div
                    key={staf.id}
                    onClick={() => !isAlreadySelected && handlePickStaff(staf)}
                    className={`p-3 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                      isAlreadySelected
                        ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                        : 'bg-white border-slate-200 hover:border-teal-500 hover:bg-teal-50/50'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-sm text-slate-900">{staf.nama}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                        <span className="font-mono">{staf.no_kp}</span>
                        <span>&bull;</span>
                        <span>{staf.jawatan}</span>
                        {staf.panitia && (
                          <span className="px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 text-[10px] font-semibold">
                            {staf.panitia}
                          </span>
                        )}
                      </div>
                    </div>
                    {isAlreadySelected ? (
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Ditambah
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-teal-700 bg-teal-100/60 px-2.5 py-1 rounded-lg">
                        + Pilih
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowStaffPicker(false)}
              className="mt-3 w-full py-2.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              {lang === 'ms' ? 'Selesai' : 'Done'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
