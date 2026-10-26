import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { Language } from '../types/plc';

interface OfflineIndicatorProps {
  lang: Language;
  hasUnsyncedDraft?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ lang, hasUnsyncedDraft }) => {
  const isOnline = useOnlineStatus();

  if (isOnline && !hasUnsyncedDraft) {
    return null;
  }

  if (!isOnline) {
    return (
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-40 flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-600 text-white shadow-xl shadow-amber-900/20 border border-amber-500 animate-fade-in">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-700">
            <WifiOff className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-bold leading-tight">
              {lang === 'ms' ? 'Mod Luar Talian (Offline)' : 'Offline Mode'}
            </p>
            <p className="text-[11px] text-amber-100 leading-tight">
              {lang === 'ms'
                ? 'Borang disimpan secara tempatan & auto-segerak bila internet kembali.'
                : 'Data saved locally & auto-syncs when internet resumes.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-40 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-700 text-white shadow-lg shadow-emerald-900/20 border border-emerald-600">
      <Wifi className="w-4 h-4 text-emerald-300" />
      <span className="text-xs font-medium">
        {lang === 'ms' ? 'Talian kembali pulih. Draf anda selamat!' : 'Online restored. Your draft is safe!'}
      </span>
    </div>
  );
};
