import React, { useState, useEffect } from 'react';
import { LaporanPLC, Language, UserProfile } from '../../types/plc';
import { translations, getDayName } from '../../utils/translations';
import { SchoolInfo, getSavedDraft, saveDraft, clearSavedDraft, NAMA_PENGETUA } from '../../utils/storage';
import { WizardProgress } from './WizardProgress';
import { Step1BasicInfo } from './Step1BasicInfo';
import { Step2Members } from './Step2Members';
import { Step3Focus } from './Step3Focus';
import { Step4Reflections } from './Step4Reflections';
import { Step5Photos } from './Step5Photos';
import { Step6Signature } from './Step6Signature';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { sendVerificationLinkToPengetuaWhatsApp } from '../../utils/pdfGenerator';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  AlertCircle,
  RotateCcw,
  MessageCircle,
  CheckCircle2,
  Phone,
  X,
  ExternalLink,
} from 'lucide-react';

interface WizardControllerProps {
  schoolInfo: SchoolInfo;
  currentUser: UserProfile;
  lang: Language;
  onSaveReport: (report: LaporanPLC) => void;
  onCancel: () => void;
  editingReport?: LaporanPLC | null;
}

export const WizardController: React.FC<WizardControllerProps> = ({
  schoolInfo,
  currentUser,
  lang,
  onSaveReport,
  onCancel,
  editingReport,
}) => {
  const t = translations[lang];
  const isOnline = useOnlineStatus();
  const [currentStep, setCurrentStep] = useState(1);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

  // Post-submission WhatsApp prompt modal state
  const [submittedReport, setSubmittedReport] = useState<LaporanPLC | null>(null);

  // Initial State setup
  const [formData, setFormData] = useState<Partial<LaporanPLC>>(() => {
    if (editingReport) {
      return { ...editingReport };
    }

    const saved = getSavedDraft();
    if (saved && !editingReport) {
      return saved;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    return {
      id: 'plc-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
      nama_sekolah: schoolInfo.nama_sekolah,
      logo_sekolah: schoolInfo.logo_sekolah,
      alamat_sekolah: schoolInfo.alamat_sekolah,
      no_telefon: schoolInfo.no_telefon,
      no_faks: schoolInfo.no_faks,
      email_sekolah: schoolInfo.email_sekolah,
      kod_sekolah: schoolInfo.kod_sekolah,

      tempat: 'Bilik Gerakan PLC',
      tarikh: todayStr,
      hari: getDayName(todayStr, lang),
      masa_mula: '14:00',
      masa_tamat: '15:30',
      tempoh_jam: 1.5,
      panitia: '',

      ahli_kumpulan: [
        {
          id: 'm-leader',
          nama: currentUser.nama,
          no_kp: currentUser.no_kp || '',
          jawatan: currentUser.jawatan,
        },
      ],
      fokus_perkongsian: ['Analisis Item & Skor Pentaksiran Bilik Darjah (PBD)'],
      interpretasi: '',
      hasil_refleksi: '',
      gambar_aktiviti: [],
      disediakan_oleh: {
        nama: currentUser.nama,
        jawatan: currentUser.jawatan,
        tandatangan_digital: null,
        tarikh_tandatangan: todayStr,
      },
      nama_pengetua: NAMA_PENGETUA,
      no_telefon_pengetua: '',
      status: 'draf',
    };
  });

  // Auto-save timer every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (formData) {
        saveDraft(formData);
        const now = new Date();
        setLastSavedTime(
          now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
      }
    }, 10000);

    return () => clearInterval(timer);
  }, [formData]);

  const updateFormData = (updates: Partial<LaporanPLC>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setValidationError('');
  };

  const handleStepClick = (stepNum: number) => {
    if (stepNum < currentStep) {
      setCurrentStep(stepNum);
    } else {
      if (validateCurrentStep()) {
        setCurrentStep(stepNum);
      }
    }
  };

  const validateCurrentStep = (): boolean => {
    setValidationError('');

    if (currentStep === 1) {
      if (!formData.tempat?.trim()) {
        setValidationError(lang === 'ms' ? 'Sila masukkan tempat sesi PLC.' : 'Please enter the session venue.');
        return false;
      }
      if (!formData.tarikh) {
        setValidationError(lang === 'ms' ? 'Sila pilih tarikh sesi.' : 'Please select the session date.');
        return false;
      }
    }

    if (currentStep === 2) {
      if (!formData.ahli_kumpulan || formData.ahli_kumpulan.length === 0) {
        setValidationError(t.alert_min_member);
        return false;
      }
      const hasEmptyName = formData.ahli_kumpulan.some((m) => !m.nama.trim());
      if (hasEmptyName) {
        setValidationError(lang === 'ms' ? 'Sila lengkapkan nama semua ahli kumpulan.' : 'Please fill all member names.');
        return false;
      }
    }

    if (currentStep === 3) {
      if (!formData.fokus_perkongsian || formData.fokus_perkongsian.length === 0) {
        setValidationError(lang === 'ms' ? 'Sila masukkan sekurang-kurangnya 1 fokus perkongsian.' : 'Please add at least 1 focus item.');
        return false;
      }
    }

    if (currentStep === 4) {
      if (!formData.interpretasi?.trim()) {
        setValidationError(lang === 'ms' ? 'Sila lengkapkan bahagian interpretasi.' : 'Please fill in the interpretation section.');
        return false;
      }
      if (!formData.hasil_refleksi?.trim()) {
        setValidationError(lang === 'ms' ? 'Sila lengkapkan bahagian hasil refleksi.' : 'Please fill in the reflection section.');
        return false;
      }
    }

    if (currentStep === 5) {
      if (!formData.gambar_aktiviti || formData.gambar_aktiviti.length === 0) {
        setValidationError(t.alert_min_photo);
        return false;
      }
    }

    if (currentStep === 6) {
      if (!formData.disediakan_oleh?.tandatangan_digital) {
        setValidationError(t.alert_min_signature);
        return false;
      }
      if (!formData.no_telefon_pengetua?.trim()) {
        setValidationError('Sila masukkan nombor WhatsApp Pengetua (Sanaleh bin Daud) untuk pautan pengesahan.');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleManualSaveDraft = () => {
    saveDraft(formData);
    const now = new Date();
    setLastSavedTime(
      now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
    alert(lang === 'ms' ? 'Draf berjaya disimpan secara tempatan!' : 'Draft saved locally!');
  };

  const handleResetForm = () => {
    if (confirm(lang === 'ms' ? 'Kosongkan borang dan mulakan semula?' : 'Clear form and start over?')) {
      clearSavedDraft();
      window.location.reload();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.gambar_aktiviti || formData.gambar_aktiviti.length === 0) {
      setCurrentStep(5);
      setValidationError(t.alert_min_photo);
      return;
    }

    let sigData = formData.disediakan_oleh?.tandatangan_digital;
    if (!sigData) {
      const canvasEl = document.querySelector('canvas');
      if (canvasEl) {
        sigData = (canvasEl as HTMLCanvasElement).toDataURL('image/png');
      }
    }

    if (!sigData) {
      setCurrentStep(6);
      setValidationError(t.alert_min_signature);
      return;
    }

    const updatedPelapor = {
      ...(formData.disediakan_oleh || {
        nama: currentUser.nama,
        jawatan: currentUser.jawatan,
        tarikh_tandatangan: new Date().toISOString().slice(0, 10),
      }),
      tandatangan_digital: sigData,
    };

    const completedReport: LaporanPLC = {
      ...(formData as LaporanPLC),
      disediakan_oleh: updatedPelapor,
      status: 'dihantar',
      nama_pengetua: NAMA_PENGETUA,
      no_telefon_pengetua: (formData.no_telefon_pengetua || '').trim(),
      created_at: formData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      synced_online: isOnline,
    };

    clearSavedDraft();

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    onSaveReport(completedReport);
    setSubmittedReport(completedReport);
  };

  const handleSendToPengetuaWhatsApp = () => {
    if (!submittedReport || !submittedReport.no_telefon_pengetua) return;
    const verifyUrl = `${window.location.origin}/?verify=${submittedReport.id}`;
    sendVerificationLinkToPengetuaWhatsApp(
      submittedReport,
      submittedReport.no_telefon_pengetua,
      verifyUrl
    );
    setSubmittedReport(null);
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Stepper Progress */}
      <WizardProgress
        currentStep={currentStep}
        totalSteps={6}
        onStepClick={handleStepClick}
        lang={lang}
        lastSavedTime={lastSavedTime}
      />

      {/* Validation Alert */}
      {validationError && (
        <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-shake">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Step Components */}
      <form onSubmit={handleSubmit}>
        {currentStep === 1 && (
          <Step1BasicInfo
            formData={formData}
            updateFormData={updateFormData}
            lang={lang}
          />
        )}

        {currentStep === 2 && (
          <Step2Members
            members={formData.ahli_kumpulan || []}
            updateMembers={(m) => updateFormData({ ahli_kumpulan: m })}
            lang={lang}
          />
        )}

        {currentStep === 3 && (
          <Step3Focus
            focusList={formData.fokus_perkongsian || []}
            updateFocusList={(f) => updateFormData({ fokus_perkongsian: f })}
            lang={lang}
          />
        )}

        {currentStep === 4 && (
          <Step4Reflections
            interpretasi={formData.interpretasi || ''}
            updateInterpretasi={(v) => updateFormData({ interpretasi: v })}
            hasilRefleksi={formData.hasil_refleksi || ''}
            updateHasilRefleksi={(v) => updateFormData({ hasil_refleksi: v })}
            lang={lang}
          />
        )}

        {currentStep === 5 && (
          <Step5Photos
            photos={formData.gambar_aktiviti || []}
            updatePhotos={(p) => updateFormData({ gambar_aktiviti: p })}
            lang={lang}
          />
        )}

        {currentStep === 6 && (
          <Step6Signature
            disediakanOleh={
              formData.disediakan_oleh || {
                nama: currentUser.nama,
                jawatan: currentUser.jawatan,
                tandatangan_digital: null,
                tarikh_tandatangan: new Date().toISOString().slice(0, 10),
              }
            }
            updateDisediakanOleh={(d) => updateFormData({ disediakan_oleh: d })}
            noTelefonPengetua={formData.no_telefon_pengetua || ''}
            updateNoTelefonPengetua={(val) => updateFormData({ no_telefon_pengetua: val })}
            lang={lang}
          />
        )}

        {/* Wizard Navigation Action Bar */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              {lang === 'ms' ? 'Batal' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleManualSaveDraft}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold hover:bg-slate-200 transition cursor-pointer"
              title="Simpan draf sekarang"
            >
              <Save className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">{t.btn_save_draft}</span>
            </button>

            <button
              type="button"
              onClick={handleResetForm}
              className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
              title="Mula semula"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.btn_back}</span>
              </button>
            )}

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs sm:text-sm font-bold hover:bg-teal-700 transition shadow-sm cursor-pointer"
              >
                <span>{t.btn_next}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 text-white text-xs sm:text-sm font-extrabold hover:from-teal-800 hover:to-emerald-800 transition shadow-md shadow-teal-900/20 cursor-pointer active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>{t.btn_submit_report}</span>
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Immediate WhatsApp Verification Prompt Modal */}
      {submittedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-emerald-300 text-center relative animate-fade-in">
            <button
              onClick={() => setSubmittedReport(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <MessageCircle className="w-9 h-9" />
            </div>

            <h3 className="text-xl font-black text-slate-900">
              Laporan Berjaya Dihantar!
            </h3>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Laporan ini sedia untuk disahkan oleh Pengetua, <strong>Encik Sanaleh bin Daud</strong>. Pautan semakan digital telah dijana khusus untuk Tuan Pengetua.
            </p>

            <div className="my-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Pengetua: {submittedReport.no_telefon_pengetua}</span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">
                Pautan pengesahan digital akan disertakan secara automatik di WhatsApp.
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleSendToPengetuaWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-800/20 transition cursor-pointer active:scale-98"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Hantar ke WhatsApp Pengetua Sekarang</span>
              </button>

              <button
                type="button"
                onClick={() => setSubmittedReport(null)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                Tutup & Lihat Laporan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
