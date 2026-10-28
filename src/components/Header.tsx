import React from 'react';
import { Language, UserProfile } from '../types/plc';
import { translations } from '../utils/translations';
import { PWAInstallButton } from './PWAInstallButton';
import { SchoolInfo } from '../utils/storage';
import {
  Award,
  Clock,
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
  onOpenHRMIS?: () => void;
  onOpenAnnualDossier?: () => void;
  onOpenReminderModal?: () => void;
  pendingVerificationCount?: number;
  isFirebaseConnected?: boolean;
  onRefreshData?: () => void;
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
  onOpenHRMIS,
  onOpenAnnualDossier,
  onOpenReminderModal,
  pendingVerificationCount = 0,
  isFirebaseConnected,
  onRefreshData,
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

          {/* Refresh / Sync Cloud button */}
          {onRefreshData && (
            <button
              onClick={onRefreshData}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-300 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-700 transition cursor-pointer"
              title="Segarkan / Sync laporan terkini dari Cloud"
            >
              <span>🔄 Segarkan</span>
            </button>
          )}

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
        {/* Brand Logo & Title with subtle photo background */}
        <div
          onClick={() => setCurrentTab('reports')}
          className="relative flex items-center gap-3.5 cursor-pointer group px-3.5 py-2 -my-1 rounded-2xl border border-slate-200/90 bg-white/95 hover:border-teal-500/50 hover:bg-slate-50/90 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden"
          title="e-PLC SMK Salaping - Klik untuk kembali ke Senarai Laporan"
        >
          {/* Faint subtle watermark of Pengetua Encik Sanaleh bin Daud & teacher at work */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <img
              src="/assets/aistudio/photo_6266807531040608686_y_485d689a.jpg"
              alt=""
              className="w-full h-full object-cover object-[70%_35%] opacity-15 filter contrast-125 saturate-50 group-hover:opacity-25 transition-opacity duration-300"
            />
            {/* Soft gradient mask ensuring text clarity */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/90 mix-blend-lighten" />
          </div>

          <div className="relative z-10 flex items-center gap-3">
            {schoolInfo.logo_sekolah ? (
              <img
                src={schoolInfo.logo_sekolah}
                alt="Lencana SMK Salaping"
                className="w-11 h-11 object-contain drop-shadow-xs group-hover:scale-105 transition shrink-0 mix-blend-multiply"
                style={{ mixBlendMode: 'multiply' }}
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-700 to-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-teal-800/20 group-hover:scale-105 transition shrink-0">
                PLC
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 group-hover:text-teal-800 transition flex items-center gap-1.5">
                  <span className="text-teal-700">e-PLC</span>
                  <span className="text-slate-900">SMK Salaping</span>
                </h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-teal-100/90 text-teal-900 border border-teal-300/60 shadow-2xs">
                  XEA5105
                </span>
              </div>
              <p className="text-[11px] text-slate-600 hidden sm:flex items-center gap-1.5 font-semibold">
                <span>Pejabat Pengetua</span>
                <span className="text-slate-400">&bull;</span>
                <span className="text-teal-800 font-bold">En. Sanaleh bin Daud</span>
              </p>
            </div>
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

        {/* Right utility buttons: PWA install, HRMIS 40 Jam, Dossier, Reminders, settings */}
        <div className="flex items-center gap-1.5 sm:gap-2 order-2 md:order-3">
          {/* Modul Latihan 40 Jam HRMIS */}
          {onOpenHRMIS && (
            <button
              onClick={onOpenHRMIS}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100 transition cursor-pointer text-xs font-bold"
              title="Modul Latihan 40 Jam HRMIS (Pemantauan KPI LDP)"
            >
              <Clock className="w-3.5 h-3.5 text-teal-700" />
              <span className="hidden sm:inline">HRMIS 40 Jam</span>
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
