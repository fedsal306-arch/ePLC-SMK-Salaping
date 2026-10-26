import React from 'react';
import { LaporanPLC, Language } from '../../types/plc';
import { translations, getDayName, calculateDuration } from '../../utils/translations';
import { PRESET_VENUES } from '../../utils/storage';
import { MapPin, Calendar, Clock, School, Layers } from 'lucide-react';

interface Step1BasicInfoProps {
  formData: Partial<LaporanPLC>;
  updateFormData: (updates: Partial<LaporanPLC>) => void;
  lang: Language;
}

export const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({
  formData,
  updateFormData,
  lang,
}) => {
  const t = translations[lang];

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const day = getDayName(val, lang);
    updateFormData({ tarikh: val, hari: day });
  };

  const handleTimeChange = (field: 'masa_mula' | 'masa_tamat', value: string) => {
    const nextStart = field === 'masa_mula' ? value : formData.masa_mula || '14:00';
    const nextEnd = field === 'masa_tamat' ? value : formData.masa_tamat || '15:30';
    const duration = calculateDuration(nextStart, nextEnd);

    updateFormData({
      [field]: value,
      tempoh_jam: duration,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex items-center gap-2 mb-4 text-teal-800">
          <School className="w-5 h-5 text-teal-600" />
          <h4 className="font-bold text-base text-slate-900">{t.school_name}</h4>
        </div>

        <input
          type="text"
          value={formData.nama_sekolah || ''}
          onChange={(e) => updateFormData({ nama_sekolah: e.target.value })}
          placeholder="Nama Sekolah Rasmi"
          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 font-semibold text-slate-800 text-sm"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.panitia_label}
            </label>
            <div className="relative">
              <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={formData.panitia || ''}
                onChange={(e) => updateFormData({ panitia: e.target.value })}
                placeholder="Cth: Panitia Matematik / Kurikulum"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tajuk / Kod Sesi (Pilihan)
            </label>
            <input
              type="text"
              value={formData.tajuk_sesi || ''}
              onChange={(e) => updateFormData({ tajuk_sesi: e.target.value })}
              placeholder="Cth: Sesi PLC Siri 3/2026"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Venue Section */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex items-center gap-2 mb-2 text-teal-800">
          <MapPin className="w-5 h-5 text-teal-600" />
          <h4 className="font-bold text-base text-slate-900">
            {t.venue} <span className="text-red-500">*</span>
          </h4>
        </div>
        <input
          type="text"
          value={formData.tempat || ''}
          onChange={(e) => updateFormData({ tempat: e.target.value })}
          placeholder={t.venue_placeholder}
          required
          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium"
        />

        {/* Quick Venue Pills */}
        <div className="mt-3">
          <span className="text-xs text-slate-500 font-medium">Cadangan pantas:</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {PRESET_VENUES.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => updateFormData({ tempat: v })}
                className={`text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  formData.tempat === v
                    ? 'bg-teal-600 text-white border-teal-600 font-semibold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-teal-50 hover:border-teal-300'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Date & Time Section */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex items-center gap-2 mb-4 text-teal-800">
          <Calendar className="w-5 h-5 text-teal-600" />
          <h4 className="font-bold text-base text-slate-900">
            {lang === 'ms' ? 'Tarikh & Masa Sesi' : 'Date & Time'} <span className="text-red-500">*</span>
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.date}
            </label>
            <input
              type="date"
              value={formData.tarikh || ''}
              onChange={handleDateChange}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.day} ({lang === 'ms' ? 'Auto-Kira' : 'Auto-Calculated'})
            </label>
            <input
              type="text"
              readOnly
              value={formData.hari || ''}
              placeholder="Pilih tarikh untuk kira hari"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 text-sm font-semibold cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.start_time}
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="time"
                value={formData.masa_mula || '14:00'}
                onChange={(e) => handleTimeChange('masa_mula', e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.end_time}
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="time"
                value={formData.masa_tamat || '15:30'}
                onChange={(e) => handleTimeChange('masa_tamat', e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium"
              />
            </div>
          </div>
        </div>

        {/* Calculated Duration Display */}
        <div className="mt-4 p-3 rounded-xl bg-teal-50/70 border border-teal-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-teal-900">
              {t.duration} ({lang === 'ms' ? 'Dikira Automatik' : 'Auto-Calculated'}):
            </span>
          </div>
          <span className="text-sm font-extrabold text-teal-800">
            {formData.tempoh_jam || 1.5} {t.duration_unit}
          </span>
        </div>
      </div>
    </div>
  );
};
