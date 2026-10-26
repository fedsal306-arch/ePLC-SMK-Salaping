import React, { useState, useEffect } from 'react';
import { LaporanPLC, Language, UserProfile, StafSekolah } from './types/plc';
import {
  getStoredReports,
  saveStoredReports,
  getStoredSchool,
  saveStoredSchool,
  getStoredStaff,
  saveStoredStaff,
  getCurrentUser,
  saveCurrentUser,
  SchoolInfo,
  clearAllLocalData,
  NAMA_PENGETUA,
  JAWATAN_PENGETUA,
} from './utils/storage';
import {
  testFirestoreConnection,
  fetchReportsFromFirestore,
  saveReportToFirestore,
  deleteReportFromFirestore,
  fetchSchoolFromFirestore,
  saveSchoolToFirestore,
  fetchStaffFromFirestore,
  saveStaffToFirestore,
} from './utils/firebase';
import { Header } from './components/Header';
import { ReportList } from './components/ReportList';
import { AdminDashboard } from './components/AdminDashboard';
import { WizardController } from './components/WizardForm/WizardController';
import { ReportDetailModal } from './components/ReportDetailModal';
import { SchoolSettingsModal } from './components/SchoolSettingsModal';
import { StaffDirectoryModal } from './components/StaffDirectoryModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { HRMISLatihanModal } from './components/HRMISLatihanModal';
import { AnnualDossierModal } from './components/AnnualDossierModal';
import { VerificationReminderModal } from './components/VerificationReminderModal';

export default function App() {
  const [lang, setLang] = useState<Language>('ms');
  const [currentTab, setCurrentTab] = useState<'reports' | 'dashboard' | 'new-report'>('reports');
  const [reports, setReports] = useState<LaporanPLC[]>([]);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(getStoredSchool);
  const [currentUser, setCurrentUser] = useState<UserProfile>(getCurrentUser);
  const [staffList, setStaffList] = useState<StafSekolah[]>(getStoredStaff);
  const [isFirebaseSynced, setIsFirebaseSynced] = useState(false);

  // Active Modals
  const [selectedReport, setSelectedReport] = useState<LaporanPLC | null>(null);
  const [editingReport, setEditingReport] = useState<LaporanPLC | null>(null);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showHRMISModal, setShowHRMISModal] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);

  // Load data on startup from Firestore with LocalStorage fallback & handle WhatsApp verify link
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const verifyReportId = urlParams.get('verify') || urlParams.get('reportId');

    if (verifyReportId) {
      // Automatically switch session to Pengetua (Sanaleh bin Daud) for 1-click endorsement
      const pengetuaProfile: UserProfile = {
        nama: NAMA_PENGETUA,
        email: 'sanaleh.daud@moe-dl.edu.my',
        jawatan: JAWATAN_PENGETUA,
        peranan: 'pentadbir',
        sekolah: 'SMK Salaping, Kota Marudu',
      };
      setCurrentUser(pengetuaProfile);
      saveCurrentUser(pengetuaProfile);
    }

    // 1. Initial local load
    const localReports = getStoredReports();
    setReports(localReports);

    if (verifyReportId && localReports.length > 0) {
      const match = localReports.find((r) => r.id === verifyReportId);
      if (match) setSelectedReport(match);
    }

    // 2. Connect to Firebase Firestore
    async function initFirebaseSync() {
      try {
        await testFirestoreConnection();
        setIsFirebaseSynced(true);

        // Fetch reports from Firestore
        const cloudReports = await fetchReportsFromFirestore();
        if (cloudReports && cloudReports.length > 0) {
          setReports(cloudReports);
          saveStoredReports(cloudReports);

          if (verifyReportId) {
            const matchCloud = cloudReports.find((r) => r.id === verifyReportId);
            if (matchCloud) {
              setSelectedReport(matchCloud);
            }
          }
        }

        // Fetch school info from Firestore
        const cloudSchool = await fetchSchoolFromFirestore();
        if (cloudSchool) {
          setSchoolInfo(cloudSchool);
          saveStoredSchool(cloudSchool);
        }

        // Fetch staff directory from Firestore
        const cloudStaff = await fetchStaffFromFirestore();
        if (cloudStaff && cloudStaff.length > 0) {
          setStaffList(cloudStaff);
          saveStoredStaff(cloudStaff);
        }
      } catch (err) {
        console.warn('Firestore initial sync note:', err);
      }
    }

    initFirebaseSync();
  }, []);

  // Save current user on change
  const handleUserChange = (user: UserProfile) => {
    setCurrentUser(user);
    saveCurrentUser(user);
  };

  // Save new or updated report (sync to Firestore + local storage)
  const handleSaveReport = async (newReport: LaporanPLC) => {
    let updatedReports: LaporanPLC[];
    const exists = reports.some((r) => r.id === newReport.id);

    if (exists) {
      updatedReports = reports.map((r) => (r.id === newReport.id ? newReport : r));
    } else {
      updatedReports = [newReport, ...reports];
    }

    setReports(updatedReports);
    saveStoredReports(updatedReports);

    // Sync to Firebase Cloud Storage / Firestore
    try {
      await saveReportToFirestore(newReport);
      setIsFirebaseSynced(true);
    } catch (e) {
      console.warn('Saved locally, will sync to Firebase when online:', e);
    }

    // Switch to preview of newly saved report
    setEditingReport(null);
    setCurrentTab('reports');
    setSelectedReport(newReport);
  };

  // Admin verification action (sync to Firestore + local storage)
  const handleVerifyReport = async (
    reportId: string,
    catatan: string,
    tandatanganDigital?: string
  ) => {
    const today = new Date().toISOString().slice(0, 10);
    let verifiedReport: LaporanPLC | null = null;

    const defaultSvg =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80"><path d="M10 50 Q 50 15 100 45 T 180 25" stroke="%230f766e" stroke-width="3" fill="none"/></svg>';

    const updated = reports.map((r) => {
      if (r.id === reportId) {
        const item: LaporanPLC = {
          ...r,
          status: 'disahkan' as const,
          disahkan_oleh: {
            nama: NAMA_PENGETUA,
            jawatan: JAWATAN_PENGETUA,
            tandatangan_digital: tandatanganDigital || defaultSvg,
            tarikh_pengesahan: today,
            catatan:
              catatan ||
              'Disahkan oleh Pengetua. Sesi perkongsian PLC ini memenuhi objektif kualiti kurikulum SMK Salaping.',
          },
          updated_at: new Date().toISOString(),
          synced_online: true,
        };
        verifiedReport = item;
        return item;
      }
      return r;
    });

    setReports(updated);
    saveStoredReports(updated);

    if (verifiedReport) {
      try {
        await saveReportToFirestore(verifiedReport);
      } catch (err) {
        console.warn('Firestore update error on verify:', err);
      }
    }

    // Also update selectedReport if currently viewed
    if (selectedReport && selectedReport.id === reportId) {
      setSelectedReport(updated.find((r) => r.id === reportId) || null);
    }
  };

  // Delete draft report
  const handleDeleteReport = async (reportId: string) => {
    const updated = reports.filter((r) => r.id !== reportId);
    setReports(updated);
    saveStoredReports(updated);

    try {
      await deleteReportFromFirestore(reportId);
    } catch (err) {
      console.warn('Firestore delete error:', err);
    }

    if (selectedReport?.id === reportId) {
      setSelectedReport(null);
    }
  };

  const handleEditReport = (report: LaporanPLC) => {
    setSelectedReport(null);
    setEditingReport(report);
    setCurrentTab('new-report');
  };

  const pendingCount = reports.filter((r) => r.status === 'dihantar').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* App Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'new-report') {
            setEditingReport(null);
          }
          setCurrentTab(tab);
        }}
        lang={lang}
        setLang={setLang}
        currentUser={currentUser}
        setCurrentUser={handleUserChange}
        schoolInfo={schoolInfo}
        onOpenSchoolSettings={() => setShowSchoolModal(true)}
        onOpenStaffDirectory={() => setShowStaffModal(true)}
        onOpenHRMIS={() => setShowHRMISModal(true)}
        onOpenAnnualDossier={() => setShowDossierModal(true)}
        onOpenReminderModal={() => setShowReminderModal(true)}
        pendingVerificationCount={pendingCount}
        isFirebaseConnected={isFirebaseSynced}
      />

      {/* Main App Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <AdminDashboard
            reports={reports}
            lang={lang}
            onSelectReport={(r) => setSelectedReport(r)}
            onNewReport={() => {
              setEditingReport(null);
              setCurrentTab('new-report');
            }}
            onOpenHRMIS={() => setShowHRMISModal(true)}
            onOpenAnnualDossier={() => setShowDossierModal(true)}
            onOpenReminderModal={() => setShowReminderModal(true)}
          />
        )}

        {currentTab === 'reports' && (
          <ReportList
            reports={reports}
            currentUser={currentUser}
            lang={lang}
            onSelectReport={(r) => setSelectedReport(r)}
            onNewReport={() => {
              setEditingReport(null);
              setCurrentTab('new-report');
            }}
            onDeleteReport={handleDeleteReport}
          />
        )}

        {currentTab === 'new-report' && (
          <WizardController
            schoolInfo={schoolInfo}
            currentUser={currentUser}
            lang={lang}
            onSaveReport={handleSaveReport}
            onCancel={() => {
              setEditingReport(null);
              setCurrentTab('reports');
            }}
            editingReport={editingReport}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            e-PLC &bull; SMK Salaping, Kota Marudu &bull; Storan Awan Firebase Firestore Aktif
          </span>
          <span className="text-[11px] text-slate-400">
            Responsif pada Android, iOS, Windows & macOS &bull; Sokongan Luar Talian PWA
          </span>
        </div>
      </footer>

      {/* Offline Connectivity Notification */}
      <OfflineIndicator lang={lang} />

      {/* Detail & Print Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          currentUser={currentUser}
          lang={lang}
          onVerifyReport={handleVerifyReport}
          onEditReport={handleEditReport}
        />
      )}

      {/* School Settings Modal */}
      {showSchoolModal && (
        <SchoolSettingsModal
          school={schoolInfo}
          onSave={async (updated) => {
            setSchoolInfo(updated);
            saveStoredSchool(updated);
            try {
              await saveSchoolToFirestore(updated);
            } catch (err) {
              console.warn('Error saving school to Firestore:', err);
            }
          }}
          onClose={() => setShowSchoolModal(false)}
          lang={lang}
        />
      )}

      {/* Staff Directory Modal */}
      {showStaffModal && (
        <StaffDirectoryModal
          staffList={staffList}
          onUpdate={async (updated) => {
            setStaffList(updated);
            saveStoredStaff(updated);
            try {
              await saveStaffToFirestore(updated);
            } catch (err) {
              console.warn('Error saving staff to Firestore:', err);
            }
          }}
          onClose={() => setShowStaffModal(false)}
          lang={lang}
        />
      )}

      {/* Modul Latihan 40 Jam HRMIS */}
      {showHRMISModal && (
        <HRMISLatihanModal
          reports={reports}
          onClose={() => setShowHRMISModal(false)}
          lang={lang}
        />
      )}

      {/* Buku Laporan Tahunan PLC Dossier Modal */}
      {showDossierModal && (
        <AnnualDossierModal
          reports={reports}
          schoolInfo={schoolInfo}
          onClose={() => setShowDossierModal(false)}
          lang={lang}
        />
      )}

      {/* Jejak Peringatan Pengesahan Pengetua Modal */}
      {showReminderModal && (
        <VerificationReminderModal
          reports={reports}
          onClose={() => setShowReminderModal(false)}
          onSelectReport={(r) => {
            setShowReminderModal(false);
            setSelectedReport(r);
          }}
          lang={lang}
        />
      )}
    </div>
  );
}
