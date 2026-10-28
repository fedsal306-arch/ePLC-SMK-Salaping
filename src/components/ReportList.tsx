import React, { useState, useMemo } from 'react';
import { LaporanPLC, Language, PLCStatus, UserProfile } from '../types/plc';
import { translations, maskICForDisplay } from '../utils/translations';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  Clock3,
  FileText,
  Eye,
  Plus,
  Share2,
  Trash2,
  Download,
  BookOpen,
  MessageCircle,
} from 'lucide-react';
import { getReportVerificationUrl } from '../utils/qrGenerator';

interface ReportListProps {
  reports: LaporanPLC[];
  currentUser: UserProfile;
  lang: Language;
  onSelectReport: (report: LaporanPLC) => void;
  onNewReport: () => void;
  onDeleteReport?: (id: string) => void;
}

export const ReportList: React.FC<ReportListProps> = ({
  reports,
  currentUser,
  lang,
  onSelectReport,
  onNewReport,
  onDeleteReport,
}) => {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<PLCStatus | 'all'>('all');
  const [selectedPanitia, setSelectedPanitia] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Extract unique panitia list for filter
  const panitiaOptions = useMemo(() => {
    const set = new Set<string>();
    reports.forEach((r) => {
      if (r.panitia) set.add(r.panitia);
    });
    return Array.from(set);
  }, [reports]);

  // Filter logic based on role & search criteria
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Role scoping: Teacher sees their own reports or reports where they are a member; Admin sees all
      if (currentUser.peranan === 'guru') {
        const isAuthor =
          r.disediakan_oleh?.nama?.toLowerCase().includes(currentUser.nama.toLowerCase());
        const isMember = r.ahli_kumpulan?.some((a) =>
          a.nama.toLowerCase().includes(currentUser.nama.toLowerCase())
        );
        // Teachers can view all submitted and verified school reports, plus their own drafts
        if (r.status === 'draf' && !isAuthor && !isMember) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus !== 'all' && r.status !== selectedStatus) {
        return false;
      }

      // Panitia filter
      if (selectedPanitia !== 'all' && r.panitia !== selectedPanitia) {
        return false;
      }

      // Date range filter
      if (startDate && r.tarikh < startDate) return false;
      if (endDate && r.tarikh > endDate) return false;

      // Text search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchVenue = r.tempat?.toLowerCase().includes(q);
        const matchTitle = r.tajuk_sesi?.toLowerCase().includes(q);
        const matchFocus = r.fokus_perkongsian?.some((f) => f.toLowerCase().includes(q));
        const matchMember = r.ahli_kumpulan?.some((a) => a.nama.toLowerCase().includes(q));
        const matchAuthor = r.disediakan_oleh?.nama?.toLowerCase().includes(q);
        const matchPanitia = r.panitia?.toLowerCase().includes(q);

        return matchVenue || matchTitle || matchFocus || matchMember || matchAuthor || matchPanitia;
      }

      return true;
    });
  }, [reports, currentUser, selectedStatus, selectedPanitia, startDate, endDate, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Search Controls */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {t.nav_reports}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUser.peranan === 'pentadbir'
                ? lang === 'ms'
                  ? 'Paparan Pentadbir: Memaparkan semua rekod PLC guru di sekolah.'
                  : 'Administrator View: Displaying all teacher PLC records across school.'
                : lang === 'ms'
                ? 'Paparan Guru: Menunjukkan sesi PLC panitia dan kumpulan anda.'
                : 'Teacher View: Showing PLC sessions for your department and group.'}
            </p>
          </div>

          <button
            onClick={onNewReport}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 transition shadow-sm cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{t.nav_new_report}</span>
          </button>
        </div>

        {/* Search Bar & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.search_placeholder}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Status Tabs */}
          <div className="sm:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="all">{t.filter_all}</option>
              <option value="draf">{t.filter_draft}</option>
              <option value="dihantar">{t.filter_submitted}</option>
              <option value="disahkan">{t.filter_verified}</option>
            </select>
          </div>

          {/* Panitia Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedPanitia}
              onChange={(e) => setSelectedPanitia(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="all">{lang === 'ms' ? 'Semua Panitia' : 'All Departments'}</option>
              {panitiaOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Filter Collapsible */}
        <div className="flex flex-wrap items-center gap-3 pt-3 mt-3 border-t border-slate-100 text-xs">
          <span className="font-semibold text-slate-600 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> {lang === 'ms' ? 'Tapis Tarikh:' : 'Date Filter:'}
          </span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-700"
            />
            <span className="text-slate-400">&mdash;</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-700"
            />
          </div>
          {(startDate || endDate || searchTerm || selectedStatus !== 'all' || selectedPanitia !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('all');
                setSelectedPanitia('all');
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs text-teal-700 font-semibold hover:underline cursor-pointer"
            >
              {lang === 'ms' ? 'Set Semula Penapis' : 'Reset Filters'}
            </button>
          )}
        </div>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-xs">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-700">
            {reports.length === 0
              ? (lang === 'ms' ? 'Belum Ada Laporan PLC Direkodkan' : 'No PLC Reports Yet')
              : t.no_reports_found}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {reports.length === 0
              ? (lang === 'ms'
                  ? 'Aplikasi e-PLC sedia sepenuhnya untuk kegunaan SMK Salaping. Klik butang di bawah untuk mula mengisi laporan sesi perkongsian pertama anda.'
                  : 'The e-PLC app is ready for SMK Salaping. Click below to record your first PLC session.')
              : (lang === 'ms'
                  ? 'Tiada sesi perkongsian guru yang sepadan dengan kriteria carian anda.'
                  : 'No teacher sharing sessions matched your search criteria.')}
          </p>
          <button
            onClick={onNewReport}
            className="mt-5 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-teal-600 text-white hover:bg-teal-700 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.create_first_report}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((report) => {
            const isVerified = report.status === 'disahkan';
            const isSubmitted = report.status === 'dihantar';

            return (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-teal-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Top Status & Date Row */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-xs font-bold text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-teal-600" />
                        {report.tarikh} ({report.hari})
                      </span>
                      {report.panitia && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {report.panitia}
                        </span>
                      )}
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                        isVerified
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : isSubmitted
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      {isVerified ? (
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Clock3 className="w-3 h-3" />
                      )}
                      <span>
                        {report.status === 'disahkan'
                          ? t.status_verified
                          : report.status === 'dihantar'
                          ? t.status_submitted
                          : t.status_draft}
                      </span>
                    </span>
                  </div>

                  {/* Venue & Time */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mb-3">
                    <div className="flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate max-w-[180px]">{report.tempat}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {report.masa_mula} - {report.masa_tamat} ({report.tempoh_jam || 1} Jam)
                      </span>
                    </div>
                  </div>

                  {/* Focus Topic Headings */}
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition line-clamp-2">
                      {report.fokus_perkongsian && report.fokus_perkongsian.length > 0
                        ? report.fokus_perkongsian[0]
                        : 'Sesi Perkongsian Guru (PLC)'}
                    </h4>

                    {report.fokus_perkongsian && report.fokus_perkongsian.length > 1 && (
                      <span className="text-[11px] font-semibold text-teal-700 mt-1 inline-block">
                        +{report.fokus_perkongsian.length - 1} {lang === 'ms' ? 'topik perkongsian lain' : 'other topics'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Info & Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Users className="w-3.5 h-3.5" />
                    <span>
                      {report.ahli_kumpulan?.length || 0} {lang === 'ms' ? 'Ahli Guru' : 'Teachers'}
                    </span>
                    <span>&bull;</span>
                    <span className="truncate max-w-[120px] font-medium text-slate-700">
                      {report.disediakan_oleh?.nama?.split(' ')?.[0] || 'Guru'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {report.status === 'dihantar' && (
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
                        className="px-2 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition flex items-center gap-1 cursor-pointer"
                        title="Peringatan WhatsApp ke Pengetua"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Peringatan</span>
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectReport(report);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 transition flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{lang === 'ms' ? 'Lihat' : 'View'}</span>
                    </button>
                    {onDeleteReport && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (
                            window.confirm(
                              lang === 'ms'
                                ? 'Anda pasti ingin memadam laporan PLC ini dari sistem?'
                                : 'Are you sure you want to delete this PLC report?'
                            )
                          ) {
                            onDeleteReport(report.id);
                          }
                        }}
                        className="p-2 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer z-20 relative shadow-xs flex items-center justify-center"
                        title="Padam Laporan"
                      >
                        <Trash2 className="w-4 h-4 text-rose-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
