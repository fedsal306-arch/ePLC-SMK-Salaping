import React from 'react';
import { Language, UserProfile } from '../types/plc';
import { translations } from '../utils/translations';
import { PWAInstallButton } from './PWAInstallButton';
import { SchoolInfo } from '../utils/storage';
import {
  Award,
  BookOpen,
  LayoutDashboard,
  FileText,
  PlusCircle,
  Settings,
  Users,
  Globe,
  Shield,
  User,
  Wifi,
  WifiOff,
  Database,
  Bell,
} from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface HeaderProps {
  currentTab: 'dashboard' | 'reports' | 'new-report';
  setCurrentTab: (tab: 'dashboard' | 'reports' | 'new-report') => void;
  lang: Language;
  setLang: (lang: Language) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  schoolInfo: SchoolInfo;
  onOpenSchoolSettings: () => void;
  onOpenStaffDirectory: () => void;
  onOpenSPLKPM?: () => void;
  onOpenAnnualDossier?: () => void;
  onOpenReminderModal?: () => void;
  pendingVerificationCount?: number;
  isFirebaseConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  lang,
  setLang,
  currentUser,
  setCurrentUser,
  schoolInfo,
  onOpenSchoolSettings,
  onOpenStaffDirectory,
  onOpenSPLKPM,
  onOpenAnnualDossier,
  onOpenReminderModal,
  pendingVerificationCount = 0,
  isFirebaseConnected,
}) => {
  const t = translations[lang];
  const isOnline = useOnlineStatus();

  const toggleRole = () => {
    const nextRole = currentUser.peranan === 'guru' ? 'pentadbir' : 'guru';
    const nextName =
      nextRole === 'pentadbir'
        ? 'Sanaleh bin Daud'
        : 'Cikgu Ahmad Farhan bin Ismail';
    const nextJawatan =
      nextRole === 'pentadbir'
        ? 'Pengetua, SMK Salaping'
        : 'Guru Kanan Sains & Matematik';

    setCurrentUser({
      ...currentUser,
      peranan: nextRole,
      nama: nextName,
      jawatan: nextJawatan,
    });
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top micro bar for Connectivity & User switch */}
      <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          {/* Online/Offline status pill */}
          <div className="flex items-center gap-1.5 font-medium">
            {isOnline ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <Wifi className="w-3 h-3" />
                <span className="text-[11px]">{t.online}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <WifiOff className="w-3 h-3 animate-pulse" />
                <span className="text-[11px]">{t.offline}</span>
              </span>
            )}
          </div>

          {/* Firebase Storage Indicator */}
          <span className="hidden sm:flex items-center gap-1 text-[10px] font-semibold text-amber-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            <Database className="w-2.5 h-2.5 text-amber-400" />
            <span>Firebase Storage</span>
          </span>

          <span className="text-slate-600 hidden sm:inline">&bull;</span>

          {/* School Name */}
          <span className="hidden sm:inline text-[11px] text-slate-300 font-semibold truncate max-w-xs">
            {schoolInfo.nama_sekolah}
          </span>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Role switcher toggle */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 hidden sm:inline">Peranan:</span>
            <button
              onClick={toggleRole}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition cursor-pointer border ${
                currentUser.peranan === 'pentadbir'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-teal-500/20 text-teal-300 border-teal-500/50'
              }`}
              title={t.role_switch_hint}
            >
              {currentUser.peranan === 'pentadbir' ? (
                <>
                  <Shield className="w-3 h-3 text-amber-400" />
                  <span>{t.role_admin}</span>
                </>
              ) : (
                <>
                  <User className="w-3 h-3 text-teal-400" />
                  <span>{t.role_teacher}</span>
                </>
              )}
              <span className="text-[9px] text-slate-400 underline ml-0.5">(Tukar)</span>
            </button>
          </div>

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'ms' ? 'en' : 'ms')}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
            title="Togol Bahasa / Toggle Language"
          >
            <Globe className="w-3 h-3 text-teal-400" />
            <span>{lang.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* Main App Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div
          onClick={() => setCurrentTab('reports')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          {schoolInfo.logo_sekolah ? (
            <img
              src={schoolInfo.logo_sekolah}
              alt="Lencana SMK Salaping"
              className="w-12 h-12 object-contain drop-shadow-xs group-hover:scale-105 transition shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-700 to-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-teal-800/20 group-hover:scale-105 transition">
              PLC
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-teal-700 transition">
                {t.app_title}
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                SMK Salaping
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block font-medium">
              {schoolInfo.nama_sekolah} &bull; {t.app_subtitle}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 order-3 md:order-2 w-full md:w-auto justify-center md:justify-start pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          <button
            onClick={() => setCurrentTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              currentTab === 'reports'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-teal-600" />
            <span>{t.nav_reports}</span>
          </button>

          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-teal-600" />
            <span>{t.nav_dashboard}</span>
          </button>

          <button
            onClick={() => setCurrentTab('new-report')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shadow-xs ${
              currentTab === 'new-report'
                ? 'bg-teal-700 text-white shadow-teal-800/20'
                : 'bg-teal-600 text-white hover:bg-teal-700'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.nav_new_report}</span>
          </button>
        </nav>

        {/* Right utility buttons: PWA install, SPLKPM, Dossier, Reminders, settings */}
        <div className="flex items-center gap-1.5 sm:gap-2 order-2 md:order-3">
          {/* Hab e-SPLKPM */}
          {onOpenSPLKPM && (
            <button
              onClick={onOpenSPLKPM}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100 transition cursor-pointer text-xs font-bold"
              title="Hab e-SPLKPM (Kira Mata Kredit & Jam Latihan Guru)"
            >
              <Award className="w-3.5 h-3.5 text-teal-700" />
              <span className="hidden sm:inline">e-SPLKPM</span>
            </button>
          )}

          {/* Buku Tahunan PLC Dossier */}
          {onOpenAnnualDossier && (
            <button
              onClick={onOpenAnnualDossier}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer text-xs font-bold"
              title="Buku Laporan Tahunan PLC (SKPM Kualiti)"
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden lg:inline">Buku Tahunan</span>
            </button>
          )}

          {/* Jejak Peringatan Pengesahan */}
          {onOpenReminderModal && (
            <button
              onClick={onOpenReminderModal}
              className="relative p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              title="Jejak Peringatan Pengesahan Pengetua"
            >
              <Bell className="w-4 h-4 text-slate-600" />
              {pendingVerificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white font-extrabold text-[9px] flex items-center justify-center animate-pulse">
                  {pendingVerificationCount}
                </span>
              )}
            </button>
          )}

          <PWAInstallButton lang={lang} />

          <button
            onClick={onOpenStaffDirectory}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            title={t.nav_staff}
          >
            <Users className="w-4 h-4 text-slate-600" />
          </button>

          <button
            onClick={onOpenSchoolSettings}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            title={t.nav_school_settings}
          >
            <Settings className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    </header>
  );
};
