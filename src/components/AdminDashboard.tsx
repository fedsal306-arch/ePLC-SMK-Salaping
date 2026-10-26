import React, { useMemo } from 'react';
import { LaporanPLC, Language } from '../types/plc';
import { translations } from '../utils/translations';
import { exportReportsToExcel } from '../utils/pdfGenerator';
import {
  BarChart3,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Calendar,
  Sparkles,
  Award,
  ChevronRight,
  TrendingUp,
  BookOpen,
  Bell,
  MessageCircle,
} from 'lucide-react';
import { getReportVerificationUrl } from '../utils/qrGenerator';

interface AdminDashboardProps {
  reports: LaporanPLC[];
  lang: Language;
  onSelectReport: (report: LaporanPLC) => void;
  onNewReport: () => void;
  onOpenHRMIS?: () => void;
  onOpenAnnualDossier?: () => void;
  onOpenReminderModal?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  reports,
  lang,
  onSelectReport,
  onNewReport,
  onOpenHRMIS,
  onOpenAnnualDossier,
  onOpenReminderModal,
}) => {
  const t = translations[lang];

  // Metrics
  const stats = useMemo(() => {
    const totalSessions = reports.length;
    const totalHours = reports.reduce((acc, curr) => acc + (curr.tempoh_jam || 1), 0);
    const verifiedCount = reports.filter((r) => r.status === 'disahkan').length;
    const pendingCount = reports.filter((r) => r.status === 'dihantar').length;
    const draftCount = reports.filter((r) => r.status === 'draf').length;

    // Teacher participation frequency
    const teacherMap = new Map<string, number>();
    reports.forEach((r) => {
      r.ahli_kumpulan?.forEach((a) => {
        const count = teacherMap.get(a.nama) || 0;
        teacherMap.set(a.nama, count + 1);
      });
    });

    const teacherLeaderboard = Array.from(teacherMap.entries())
      .map(([nama, count]) => ({ nama, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Panitia breakdown
    const panitiaMap = new Map<string, number>();
    reports.forEach((r) => {
      const p = r.panitia || 'Umum';
      panitiaMap.set(p, (panitiaMap.get(p) || 0) + 1);
    });

    const panitiaStats = Array.from(panitiaMap.entries())
      .map(([panitia, count]) => ({ panitia, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalSessions,
      totalHours: Number(totalHours.toFixed(1)),
      verifiedCount,
      pendingCount,
      draftCount,
      teacherLeaderboard,
      panitiaStats,
    };
  }, [reports]);

  const pendingReports = useMemo(() => {
    return reports.filter((r) => r.status === 'dihantar');
  }, [reports]);

  return (
    <div className="space-y-6">
      {/* Executive Dashboard Header Banner with faint watermark background */}
      <div className="relative rounded-3xl p-6 sm:p-8 text-white shadow-xl overflow-hidden border border-teal-700/50 bg-gradient-to-r from-slate-950 via-teal-950 to-emerald-950">
        {/* Subtle photo watermark of Pengetua Encik Sanaleh bin Daud & teacher */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <img
            src="/assets/aistudio/photo_6266807531040608686_y_485d689a.jpg"
            alt="Pengetua SMK Salaping"
            className="w-full h-full object-cover object-[70%_35%] opacity-15 mix-blend-luminosity filter contrast-125 saturate-0"
          />
          {/* Subtle vignette and gradient overlay for faintness & high contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-teal-950/85 to-emerald-950/75" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-black/40" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            {/* Accreditation & School Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-bold uppercase tracking-wider border border-teal-400/30 flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>SKPM Kualiti Standard 3.1.2.2</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-300 text-[11px] font-semibold border border-slate-700">
                Kod: XEA5105
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-400/30">
                PPD Kota Marudu
              </span>
            </div>

            {/* Application Title with Watermarked Identity */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white drop-shadow-xs flex flex-wrap items-center gap-2">
              <span>e-PLC SMK Salaping</span>
              <span className="text-xs sm:text-sm font-semibold text-teal-300 px-2.5 py-1 rounded-lg bg-teal-900/60 border border-teal-500/30">
                Papan Pemuka Eksekutif
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-teal-100/90 mt-2 leading-relaxed font-medium">
              {lang === 'ms'
                ? 'Sistem Pengurusan, Audit & Pengesahan Digital Komuniti Pembelajaran Profesional Guru di bawah seliaan Pengetua Encik Sanaleh bin Daud.'
                : 'Executive Dashboard for Professional Learning Community audits, teacher CPD credits, and Principal endorsements.'}
            </p>

            {/* Quick Status Bar */}
            <div className="mt-4 pt-3 border-t border-teal-800/60 flex flex-wrap items-center gap-4 text-xs text-teal-200/90">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-white">Pengetua Pengesah:</span>
                <span className="text-amber-200 font-bold">Sanaleh bin Daud</span>
              </div>
              <span className="text-teal-700 hidden sm:inline">&bull;</span>
              <div>
                <span>Sesi Selesai Disahkan:</span>{' '}
                <strong className="text-white font-extrabold">{stats.verifiedCount}</strong> / {stats.totalSessions}
              </div>
              {stats.pendingCount > 0 && (
                <>
                  <span className="text-teal-700 hidden sm:inline">&bull;</span>
                  <div className="text-amber-300 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>{stats.pendingCount} sesi menunggu pengesahan</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onOpenHRMIS && (
              <button
                onClick={onOpenHRMIS}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-teal-800/80 hover:bg-teal-700 text-white font-bold text-xs shadow-md border border-teal-600/40 transition cursor-pointer active:scale-95 hover:shadow-teal-900/40"
              >
                <Clock className="w-4 h-4 text-cyan-300" />
                <span>Latihan 40 Jam HRMIS</span>
              </button>
            )}

            {onOpenAnnualDossier && (
              <button
                onClick={onOpenAnnualDossier}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-teal-800/80 hover:bg-teal-700 text-white font-bold text-xs shadow-md border border-teal-600/40 transition cursor-pointer active:scale-95 hover:shadow-teal-900/40"
              >
                <BookOpen className="w-4 h-4 text-teal-200" />
                <span>Buku Tahunan PLC</span>
              </button>
            )}

            {onOpenReminderModal && stats.pendingCount > 0 && (
              <button
                onClick={onOpenReminderModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-extrabold text-xs shadow-lg transition cursor-pointer active:scale-95 animate-pulse"
                title="Hantar Peringatan WhatsApp Segera ke Pengetua"
              >
                <Bell className="w-4 h-4" />
                <span>Jejak Peringatan ({stats.pendingCount})</span>
              </button>
            )}

            <button
              onClick={() => exportReportsToExcel(reports)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition cursor-pointer active:scale-95 border border-emerald-400/40"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span>{t.btn_export_excel}</span>
            </button>
          </div>
        </div>

        {/* Decorative subtle ambient lights */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 -top-12 w-48 h-48 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />
      </div>

      {/* 4 Key Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Sessions */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">
              {lang === 'ms' ? 'Jumlah Sesi PLC' : 'Total Sessions'}
            </span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {stats.totalSessions}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {lang === 'ms' ? 'Semua sesi direkodkan' : 'All recorded sessions'}
          </p>
        </div>

        {/* Total Hours */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">
              {lang === 'ms' ? 'Jumlah Jam PLC' : 'Total PLC Hours'}
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {stats.totalHours} <span className="text-sm font-semibold text-slate-500">Jam</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {lang === 'ms' ? 'Jam pembelajaran profesional' : 'Professional learning hours'}
          </p>
        </div>

        {/* Verified Reports */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">
              {lang === 'ms' ? 'Telah Disahkan' : 'Endorsed Reports'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">
            {stats.verifiedCount}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            {stats.totalSessions > 0
              ? `${Math.round((stats.verifiedCount / stats.totalSessions) * 100)}% selesai disahkan`
              : '0%'}
          </p>
        </div>

        {/* Pending Endorsement */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">
              {lang === 'ms' ? 'Menunggu Pengesahan' : 'Pending Endorsement'}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            {stats.pendingCount}
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">
            {lang === 'ms' ? 'Memerlukan tindakan PK / Pengetua' : 'Requires admin action'}
          </p>
        </div>
      </div>

      {/* Pending Approval Section */}
      {pendingReports.length > 0 && (
        <div className="bg-amber-50/70 rounded-2xl p-5 border border-amber-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-700" />
              <h3 className="font-bold text-sm sm:text-base text-amber-950">
                {lang === 'ms'
                  ? 'Laporan Menunggu Pengesahan Pentadbir'
                  : 'Reports Awaiting Administrator Endorsement'} ({pendingReports.length})
              </h3>
            </div>
            <span className="text-xs font-semibold text-amber-800">
              {lang === 'ms' ? 'Klik untuk semak & sahkan' : 'Click to review & endorse'}
            </span>
          </div>

          <div className="space-y-2">
            {pendingReports.map((report) => (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="bg-white p-3.5 rounded-xl border border-amber-200 hover:border-amber-400 transition cursor-pointer flex items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {report.fokus_perkongsian?.[0] || 'Sesi Perkongsian Guru'}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <span>{report.tarikh} ({report.hari})</span>
                    <span>&bull;</span>
                    <span>{report.tempat}</span>
                    <span>&bull;</span>
                    <span className="font-semibold text-teal-800">
                      Oleh: {report.disediakan_oleh?.nama}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      let phone = report.no_telefon_pengetua;
                      if (!phone) {
                        const input = prompt(
                          'Masukkan nombor WhatsApp Pengetua (Sanaleh bin Daud):',
                          '013-8889999'
                        );
                        if (!input) return;
                        phone = input;
                      }
                      let cleanPhone = phone.replace(/\D/g, '');
                      if (cleanPhone.startsWith('0')) cleanPhone = '6' + cleanPhone;
                      const verifyUrl = getReportVerificationUrl(report.id);
                      const msg = `Salam hormat Tuan Pengetua Encik Sanaleh bin Daud, peringatan mesra untuk semakan laporan PLC: *${report.fokus_perkongsian?.[0] || 'Sesi Perkongsian Guru'}* (${report.tarikh}) oleh ${report.disediakan_oleh?.nama}. Pautan pengesahan digital Tuan: ${verifyUrl}`;
                      const waUrl = cleanPhone
                        ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`
                        : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
                      window.open(waUrl, '_blank');
                    }}
                    className="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition cursor-pointer"
                    title="Hantar peringatan mesra ke WhatsApp Pengetua Sanaleh bin Daud"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    {lang === 'ms' ? 'Semak Laporan' : 'Review'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Grid: Leaderboard & Panitia Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Teacher Participation Leaderboard */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-4 text-teal-800">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              {lang === 'ms' ? 'Guru Paling Aktif Ber-PLC' : 'Most Active PLC Teachers'}
            </h3>
          </div>

          {stats.teacherLeaderboard.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4 text-center">
              Belum ada rekod guru.
            </p>
          ) : (
            <div className="space-y-3">
              {stats.teacherLeaderboard.map((teacher, index) => (
                <div
                  key={teacher.nama}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                        index === 0
                          ? 'bg-amber-400 text-amber-950 shadow-xs'
                          : index === 1
                          ? 'bg-slate-300 text-slate-800'
                          : index === 2
                          ? 'bg-amber-600/60 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-900">
                      {teacher.nama}
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800">
                    {teacher.count} {lang === 'ms' ? 'sesi' : 'sessions'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Department / Panitia Breakdown */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-4 text-teal-800">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              {lang === 'ms' ? 'Pecahan Mengikut Panitia' : 'Panitia / Department Breakdown'}
            </h3>
          </div>

          {stats.panitiaStats.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4 text-center">
              Belum ada rekod panitia.
            </p>
          ) : (
            <div className="space-y-3">
              {stats.panitiaStats.map((item) => {
                const percent = Math.round((item.count / stats.totalSessions) * 100) || 0;
                return (
                  <div key={item.panitia} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800">{item.panitia}</span>
                      <span className="text-slate-500">
                        {item.count} {lang === 'ms' ? 'sesi' : 'sessions'} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-teal-600"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
