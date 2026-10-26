import React from 'react';
import { Language } from '../../types/plc';
import { translations } from '../../utils/translations';
import { MessageSquare, Lightbulb, Wand2, Info } from 'lucide-react';

interface Step4ReflectionsProps {
  interpretasi: string;
  updateInterpretasi: (val: string) => void;
  hasilRefleksi: string;
  updateHasilRefleksi: (val: string) => void;
  lang: Language;
}

export const Step4Reflections: React.FC<Step4ReflectionsProps> = ({
  interpretasi,
  updateInterpretasi,
  hasilRefleksi,
  updateHasilRefleksi,
  lang,
}) => {
  const t = translations[lang];

  // Helper sample snippets for teachers to populate quickly
  const sampleInterpretations = [
    'Perbincangan berfokus kepada analisis kelemahan murid dalam menjawab soalan Bahagian B. Murid didapati sukar mengaitkan hujah dengan bukti. Penggunaan teknik visual peta minda dan formula berstruktur membantu meningkatkan kejelasan idea murid sebanyak 40%.',
    'Amalan pedagogi terbeza membolehkan murid aras sederhana dan tinggi dibimbing secara serentak mengikut tahap kesediaan mereka tanpa rasa tercicir.',
    'Pengintegrasian platform kuiz digital interaktif di bilik darjah meningkatkan penglibatan aktif murid secara menyeluruh dari 45% ke 85%.',
  ];

  const sampleReflections = [
    'Guru-guru memperoleh kemahiran baharu dalam membina instrumen penilaian berasaskan rubrik formatif. Tindakan susulan adalah menghasilkan modul latihan berfokus mengikut panitia.',
    'Refleksi sesi mendapati teknik penyoalan berstruktur aras KBAT perlu dibimbing secara bertahap bagi membina keyakinan murid memberi pandangan.',
    'Kolaborasi antara guru lebih erat dan standard kualiti pengajaran meningkat selaras dengan SKPM Kualiti Standard 4.',
  ];

  return (
    <div className="space-y-6">
      {/* Interpretasi */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-teal-600" />
              <h4 className="font-bold text-base text-slate-900">
                {t.interpretation_heading} <span className="text-red-500">*</span>
              </h4>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              {t.interpretation_sub}
            </p>
          </div>
        </div>

        {/* Guidance Prompt Box */}
        <div className="p-3 my-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {t.interpretation_guidance}
          </p>
        </div>

        <textarea
          rows={5}
          value={interpretasi}
          onChange={(e) => updateInterpretasi(e.target.value)}
          placeholder={lang === 'ms' ? 'Catatkan aspek penting yang dibincangkan dan bagaimana ia memberi impak positif kepada murid...' : 'Record important aspects discussed and how it directly impacts pupils...'}
          className="w-full p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm leading-relaxed"
        />

        {/* Quick Suggestion buttons */}
        <div className="mt-2.5">
          <span className="text-xs text-slate-500 font-medium">Cadangan templat pantas:</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {sampleInterpretations.map((sample, i) => (
              <button
                key={i}
                type="button"
                onClick={() => updateInterpretasi(sample)}
                className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-slate-700 text-left transition"
              >
                Guna Contoh {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hasil Refleksi */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-teal-600" />
              <h4 className="font-bold text-base text-slate-900">
                {t.reflection_heading} <span className="text-red-500">*</span>
              </h4>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              {t.reflection_sub}
            </p>
          </div>
        </div>

        {/* Guidance Prompt Box */}
        <div className="p-3 my-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {t.reflection_guidance}
          </p>
        </div>

        <textarea
          rows={5}
          value={hasilRefleksi}
          onChange={(e) => updateHasilRefleksi(e.target.value)}
          placeholder={lang === 'ms' ? 'Catatkan apa yang dipelajari dan komitmen penambahbaikan profesionalisme keguruan...' : 'Record insights gained and professional teaching improvements...'}
          className="w-full p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm leading-relaxed"
        />

        {/* Quick Suggestion buttons */}
        <div className="mt-2.5">
          <span className="text-xs text-slate-500 font-medium">Cadangan templat pantas:</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {sampleReflections.map((sample, i) => (
              <button
                key={i}
                type="button"
                onClick={() => updateHasilRefleksi(sample)}
                className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-slate-700 text-left transition"
              >
                Guna Contoh {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
