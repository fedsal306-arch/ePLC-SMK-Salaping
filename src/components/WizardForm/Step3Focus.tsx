import React, { useState } from 'react';
import { Language } from '../../types/plc';
import { translations } from '../../utils/translations';
import { PRESET_TOPICS } from '../../utils/storage';
import { BookOpen, Plus, Trash2, Sparkles, Check } from 'lucide-react';

interface Step3FocusProps {
  focusList: string[];
  updateFocusList: (list: string[]) => void;
  lang: Language;
}

export const Step3Focus: React.FC<Step3FocusProps> = ({
  focusList,
  updateFocusList,
  lang,
}) => {
  const t = translations[lang];
  const [newFocusInput, setNewFocusInput] = useState('');

  const handleAddCustom = () => {
    if (!newFocusInput.trim()) return;
    updateFocusList([...focusList, newFocusInput.trim()]);
    setNewFocusInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustom();
    }
  };

  const handleRemove = (index: number) => {
    updateFocusList(focusList.filter((_, i) => i !== index));
  };

  const handleTogglePreset = (preset: string) => {
    if (focusList.includes(preset)) {
      updateFocusList(focusList.filter((item) => item !== preset));
    } else {
      updateFocusList([...focusList, preset]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-teal-600" />
          <h4 className="font-bold text-base text-slate-900">
            {t.focus_heading} <span className="text-red-500">*</span>
          </h4>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          {lang === 'ms'
            ? 'Senaraikan aspek, topik, atau isu pengajaran dan pembelajaran yang dibincangkan bersama.'
            : 'List the teaching and learning topics, challenges, or pedagogies discussed.'}
        </p>

        {/* Custom Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newFocusInput}
            onChange={(e) => setNewFocusInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.focus_placeholder}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          />
          <button
            type="button"
            onClick={handleAddCustom}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ms' ? 'Tambah' : 'Add'}</span>
          </button>
        </div>

        {/* Current Added List */}
        <div className="mt-5 space-y-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {lang === 'ms' ? 'Fokus Yang Dipilih' : 'Selected Focus Items'} ({focusList.length}):
          </span>

          {focusList.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500 italic">
              {lang === 'ms'
                ? 'Belum ada fokus ditambah. Taip di atas atau pilih daripada cadangan topik di bawah.'
                : 'No focus items selected yet. Type above or choose from presets below.'}
            </div>
          ) : (
            <div className="space-y-2">
              {focusList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-3 p-3 rounded-xl bg-teal-50/60 border border-teal-200 text-slate-800 text-xs sm:text-sm font-medium"
                >
                  <div className="flex items-start gap-2.5 pt-0.5">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{item}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition shrink-0"
                    title={lang === 'ms' ? 'Padam' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Presets */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-800">
              {t.focus_quick_select}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESET_TOPICS.map((preset) => {
              const isSelected = focusList.includes(preset);
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleTogglePreset(preset)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition text-left flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-teal-700 text-white border-teal-700 font-semibold shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-teal-50 hover:border-teal-300'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  <span>{preset}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
