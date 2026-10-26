import React, { useState } from 'react';
import { SchoolInfo, saveStoredSchool } from '../utils/storage';
import { Language } from '../types/plc';
import { translations } from '../utils/translations';
import { School, X, Upload, Save, Check } from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';

interface SchoolSettingsModalProps {
  school: SchoolInfo;
  onSave: (updated: SchoolInfo) => void;
  onClose: () => void;
  lang: Language;
}

export const SchoolSettingsModal: React.FC<SchoolSettingsModalProps> = ({
  school,
  onSave,
  onClose,
  lang,
}) => {
  const t = translations[lang];
  const [formData, setFormData] = useState<SchoolInfo>({ ...school });
  const [isSaved, setIsSaved] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { dataUrl } = await compressImage(file, 400, 0.9);
      setFormData((prev) => ({ ...prev, logo_sekolah: dataUrl }));
    } catch (err) {
      console.error('Error uploading logo:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredSchool(formData);
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2 text-teal-800">
            <School className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-base text-slate-900">
              {lang === 'ms' ? 'Maklumat Sekolah & Kepala Surat' : 'School Details & Letterhead'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Logo Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'ms' ? 'Logo Rasmi Sekolah' : 'Official School Logo'}
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl border border-slate-200 bg-white p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                {formData.logo_sekolah ? (
                  <img
                    src={formData.logo_sekolah}
                    alt="Lencana SMK Salaping"
                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                ) : (
                  <School className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 cursor-pointer transition">
                <Upload className="w-3.5 h-3.5" />
                <span>{lang === 'ms' ? 'Muat Naik Logo' : 'Upload Logo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {lang === 'ms'
                ? 'Logo akan dipaparkan secara automatik pada kepala surat borang dan PDF PLC.'
                : 'Logo will automatically appear on report headers and generated PDFs.'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.school_name} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.nama_sekolah}
              onChange={(e) => setFormData({ ...formData, nama_sekolah: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kod Sekolah
              </label>
              <input
                type="text"
                value={formData.kod_sekolah || ''}
                onChange={(e) => setFormData({ ...formData, kod_sekolah: e.target.value })}
                placeholder="Cth: WEA0201"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-mel Rasmi
              </label>
              <input
                type="email"
                value={formData.email_sekolah || ''}
                onChange={(e) => setFormData({ ...formData, email_sekolah: e.target.value })}
                placeholder="wea0201@moe.edu.my"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Sekolah
            </label>
            <textarea
              rows={2}
              value={formData.alamat_sekolah}
              onChange={(e) => setFormData({ ...formData, alamat_sekolah: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                No. Telefon
              </label>
              <input
                type="text"
                value={formData.no_telefon}
                onChange={(e) => setFormData({ ...formData, no_telefon: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                No. Faks
              </label>
              <input
                type="text"
                value={formData.no_faks}
                onChange={(e) => setFormData({ ...formData, no_faks: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                if (confirm(lang === 'ms' ? 'Padam cache tempatan dan muat semula data bersih?' : 'Clear local cache and reload clean data?')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="text-xs text-slate-500 hover:text-red-600 underline cursor-pointer"
            >
              {lang === 'ms' ? 'Set Semula Storan' : 'Reset Storage'}
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                {lang === 'ms' ? 'Batal' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-sm"
              >
                {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{isSaved ? (lang === 'ms' ? 'Disimpan!' : 'Saved!') : (lang === 'ms' ? 'Simpan Maklumat' : 'Save Details')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
