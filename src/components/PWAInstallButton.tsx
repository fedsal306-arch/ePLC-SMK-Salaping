import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle, Share2, PlusSquare } from 'lucide-react';
import { Language } from '../types/plc';

interface PWAInstallButtonProps {
  lang: Language;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ lang }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, hide prompt button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition active:scale-95 cursor-pointer"
        title="Pasang aplikasi ke skrin utama"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{lang === 'ms' ? 'Pasang App' : 'Install App'}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition active:scale-95 cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{lang === 'ms' ? 'Pasang di iOS' : 'Install on iOS'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                    PLC
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {lang === 'ms' ? 'Pasang di iPhone / iPad' : 'Install on iPhone / iPad'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">1. {lang === 'ms' ? 'Tekan butang Kongsi' : 'Tap Share'}</span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {lang === 'ms' ? 'Di bar alat bawah pelayar Safari anda.' : 'In the bottom toolbar of Safari.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">2. {lang === 'ms' ? 'Pilih "Tambah ke Skrin Utama"' : 'Select "Add to Home Screen"'}</span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {lang === 'ms' ? 'Tatal ke bawah senarai tindakan.' : 'Scroll down the list of options.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-emerald-800 text-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>{lang === 'ms' ? 'Aplikasi e-PLC akan muncul seperti aplikasi asal dengan sokongan luar talian!' : 'The e-PLC app will appear like a native app with offline capability!'}</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
              >
                {lang === 'ms' ? 'Faham & Tutup' : 'Got it & Close'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback desktop quick install instruction hint if not yet triggered
  return (
    <button
      onClick={() => {
        alert(lang === 'ms' ? 'Untuk memasang e-PLC pada komputer anda, klik ikon komputer/pasang di hujung bar alamat pelayar Chrome/Edge.' : 'To install e-PLC on your computer, click the install icon at the right end of the browser address bar.');
      }}
      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-teal-800 bg-teal-50 hover:bg-teal-100 transition"
      title="Pasang aplikasi"
    >
      <Download className="w-3.5 h-3.5 text-teal-600" />
      <span className="hidden sm:inline">{lang === 'ms' ? 'Pasang App' : 'Install'}</span>
    </button>
  );
};
