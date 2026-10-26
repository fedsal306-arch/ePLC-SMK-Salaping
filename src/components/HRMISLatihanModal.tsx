import React, { useState, useMemo } from 'react';
import { LaporanPLC, Language } from '../types/plc';
import {
  X,
  Award,
  Copy,
  Check,
  Download,
  Search,
  MessageCircle,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface HRMISLatihanModalProps {
  reports: LaporanPLC[];
  onClose: () => void;
  lang: Language;
}

interface TeacherHRMIS {
  nama: string;
  no_kp: string;
  jawatan: string;
  panitia?: string;
  totalSessions: number;
  totalHours: number;
  progressPercent: number;
  statusHRMIS: 'achieved' | 'progressing' | 'needs_action';
  sessions: {
    reportId: string;
    tajuk: string;
    tarikh: string;
    jam: number;
    panitia?: string;
    status: string;
  }[];
}

const TARGET_HOURS = 40; // Sasaran Wajib Latihan 40 Jam HRMIS / JPA setahun

export const HRMISLatihanModal: React.FC<HRMISLatihanModalProps> = ({ reports, onClose, lang }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPanitia, setSelectedPanitia] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'achieved' | 'progressing' | 'needs_action'>('all');
  const [globalCopied, setGlobalCopied] = useState(false);
  const [copiedTeacherId, setCopiedTeacherId] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  // Compute teacher hours and compliance toward HRMIS 40 Hours target
  const { teacherList, schoolStats, panitiaList } = useMemo(() => {
    const teacherMap = new Map<string, TeacherHRMIS>();
    const panitias = new Set<string>();

    reports.forEach((report) => {
      const jam = Number(report.tempoh_jam) || 1;
      const panitia = report.panitia || 'Umum';
      panitias.add(panitia);

      report.ahli_kumpulan?.forEach((ahli) => {
        const key = ahli.nama.trim().toUpperCase();
        const existing = teacherMap.get(key) || {
          nama: ahli.nama,
          no_kp: ahli.no_kp || '',
          jawatan: ahli.jawatan || 'Guru',
          panitia: panitia,
          totalSessions: 0,
          totalHours: 0,
          progressPercent: 0,
          statusHRMIS: 'needs_action' as const,
          sessions: [],
        };

        existing.totalSessions += 1;
        existing.totalHours += jam;
        existing.sessions.push({
          reportId: report.id,
          tajuk: report.fokus_perkongsian?.[0] || 'Sesi Perkongsian PLC',
          tarikh: report.tarikh,
          jam,
          panitia: report.panitia,
          status: report.status,
        });

        if (!existing.no_kp && ahli.no_kp) {
          existing.no_kp = ahli.no_kp;
        }

        teacherMap.set(key, existing);
      });
    });

    // Calculate status and percentage for each teacher
    const teacherArray = Array.from(teacherMap.values()).map((t) => {
      const hours = Number(t.totalHours.toFixed(1));
      const pct = Math.min(100, Math.round((hours / TARGET_HOURS) * 100));
      let status: 'achieved' | 'progressing' | 'needs_action' = 'needs_action';
      if (hours >= TARGET_HOURS) {
        status = 'achieved';
      } else if (hours >= 20) {
        status = 'progressing';
      } else {
        status = 'needs_action';
      }
      return {
        ...t,
        totalHours: hours,
        progressPercent: pct,
        statusHRMIS: status,
      };
    });

    // Sort by total hours descending
    teacherArray.sort((a, b) => b.totalHours - a.totalHours);

    const totalSchoolHours = teacherArray.reduce((acc, t) => acc + t.totalHours, 0);
    const avgHours = teacherArray.length > 0 ? (totalSchoolHours / teacherArray.length).toFixed(1) : '0';
    const achievedCount = teacherArray.filter((t) => t.statusHRMIS === 'achieved').length;

    return {
      teacherList: teacherArray,
      schoolStats: {
        totalTeachers: teacherArray.length,
        totalSchoolHours: Number(totalSchoolHours.toFixed(1)),
        avgHours,
        achievedCount,
        achievedRate: teacherArray.length > 0 ? Math.round((achievedCount / teacherArray.length) * 100) : 0,
        totalSessionsLogged: reports.length,
      },
      panitiaList: Array.from(panitias),
    };
  }, [reports]);

  // Filtered teachers
  const filteredTeachers = useMemo(() => {
    return teacherList.filter((t) => {
      if (selectedPanitia !== 'all' && t.panitia !== selectedPanitia) return false;
      if (selectedStatus !== 'all' && t.statusHRMIS !== selectedStatus) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          t.nama.toLowerCase().includes(q) ||
          t.no_kp.toLowerCase().includes(q) ||
          t.jawatan.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [teacherList, selectedPanitia, selectedStatus, searchTerm]);

  // Copy full table formatted for HRMIS coordinator / Penyelaras Latihan LDP
  const handleCopyHRMISFormat = () => {
    let output = `SENARAI KEMAJUAN LATIHAN 40 JAM HRMIS & PLC - SMK SALAPING (XEA5104)\n`;
    output += `Sasaran Pekeliling Perkhidmatan JPA / KPM: Minimum ${TARGET_HOURS} Jam Setahun\n`;
    output += `Dijana pada: ${new Date().toLocaleDateString('ms-MY')} | Pengetua: Encik Sanaleh bin Daud\n\n`;
    output += `Bil\tNo. Kad Pengenalan\tNama Guru\tPanitia\tJumlah Jam PLC\t% Sasaran (40 Jam)\tStatus HRMIS\n`;

    filteredTeachers.forEach((t, idx) => {
      const statusLabel =
        t.statusHRMIS === 'achieved'
          ? 'CAPAI SASARAN'
          : t.statusHRMIS === 'progressing'
          ? 'SEDANG MAJU'
          : 'BELUM CAPAI';
      output += `${idx + 1}\t${t.no_kp || '-'}\t${t.nama}\t${t.panitia || 'Umum'}\t${t.totalHours} Jam\t${t.progressPercent}%\t${statusLabel}\n`;
    });

    navigator.clipboard.writeText(output);
    setGlobalCopied(true);
    setTimeout(() => setGlobalCopied(false), 3000);
  };

  // Export CSV specifically formatted for HRMIS / Audit Sekolah
  const handleDownloadHRMISCSV = () => {
    const headers = [
      'Bil',
      'No. Kad Pengenalan',
      'Nama Guru',
      'Jawatan',
      'Panitia',
      'Aktiviti Latihan',
      'Tajuk PLC',
      'Tarikh Sesi',
      'Tempoh (Jam Latihan)',
      'Pengesahan Pengetua',
      'Nama Pengetua',
      'Penganjur / Sekolah',
      'Kod Sekolah',
    ];

    const rows: string[] = [];
    let counter = 1;

    reports.forEach((rep) => {
      const tajuk = (rep.fokus_perkongsian?.[0] || 'Sesi PLC Guru').replace(/"/g, '""');
      rep.ahli_kumpulan?.forEach((ahli) => {
        rows.push(
          [
            counter++,
            `"${ahli.no_kp || ''}"`,
            `"${ahli.nama}"`,
            `"${ahli.jawatan || ''}"`,
            `"${rep.panitia || 'Umum'}"`,
            '"Latihan Dalam Perkhidmatan (PLC / Komuniti Pembelajaran Profesional)"',
            `"${tajuk}"`,
            `"${rep.tarikh}"`,
            rep.tempoh_jam || 1,
            `"${rep.status === 'disahkan' ? 'DISAHKAN' : 'MENUNGGU PENGESAHAN'}"`,
            '"Sanaleh bin Daud"',
            '"SMK Salaping, Kota Marudu"',
            '"XEA5104"',
          ].join(',')
        );
      });
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HRMIS_Latihan_40_Jam_PLC_SMK_Salaping_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Share individual teacher record to WhatsApp
  const handleShareTeacherWA = (t: TeacherHRMIS) => {
    const statusLabel =
      t.statusHRMIS === 'achieved'
        ? '✅ TELAH CAPAI SASARAN 40 JAM'
        : t.statusHRMIS === 'progressing'
        ? '🟡 DALAM PROSES (20 - 39 Jam)'
        : '⚠️ BELUM CAPAI SASARAN (< 20 Jam)';

    const bakiJam = Math.max(0, TARGET_HOURS - t.totalHours);

    const msg = `*REKOD LATIHAN 40 JAM HRMIS (SUMBER PLC) - SMK SALAPING*
----------------------------------------
Nama Guru: *${t.nama}*
No. KP: *${t.no_kp || '-'}*
Jawatan: ${t.jawatan}
Panitia: ${t.panitia || 'Umum'}

*Pencapaian Semasa Latihan 40 Jam:*
⏱️ Jumlah Jam PLC: *${t.totalHours} Jam* daripada *40 Jam*
📊 Kemajuan Sasaran: *${t.progressPercent}%*
📌 Status HRMIS: ${statusLabel}
${bakiJam > 0 ? `🎯 Baki Diperlukan: *${bakiJam} Jam* lagi` : '🎉 Tahniah, anda telah melepasi sasaran minimum 40 jam!'}

*Perincian Sesi Disertai:*
${t.sessions.map((s, i) => `${i + 1}. ${s.tarikh} - ${s.tajuk} (${s.jam} Jam) [${s.status.toUpperCase()}]`).join('\n')}

----------------------------------------
_Rekod disahkan oleh Pengetua Encik Sanaleh bin Daud._
_Sila semak & kemas kini maklumat latihan ke Portal HRMIS sub-modul Pengurusan Latihan._`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Copy single teacher summary for HRMIS self-entry
  const handleCopyTeacherEntry = (t: TeacherHRMIS) => {
    const text = `NAMA: ${t.nama} | NO.KP: ${t.no_kp || '-'} | JUMLAH JAM PLC: ${t.totalHours} JAM | SASARAN: 40 JAM (${t.progressPercent}%) | SMK SALAPING (XEA5104)`;
    navigator.clipboard.writeText(text);
    setCopiedTeacherId(t.nama);
    setTimeout(() => setCopiedTeacherId(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs p-3 sm:p-4 flex items-center justify-center">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-300 max-h-[94vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-gradient-to-r from-teal-900 via-teal-800 to-cyan-900 text-white shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 shadow-inner">
              <Clock className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                  Modul Latihan 40 Jam HRMIS
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 text-[10px] font-bold uppercase tracking-wider border border-cyan-400/30">
                  SMK Salaping (XEA5104)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-[10px] font-bold border border-emerald-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" />
                  Pengetua: Sanaleh bin Daud
                </span>
              </div>
              <p className="text-xs text-teal-100 font-medium mt-0.5">
                Pemantauan Sasaran Wajib 40 Jam Latihan Setahun Guru (LDP/PLC) Pengganti Portal Lama
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                showGuide
                  ? 'bg-white text-teal-900 shadow-sm'
                  : 'text-teal-200 hover:text-white hover:bg-white/10'
              }`}
              title="Panduan Kemasukan HRMIS"
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">Panduan HRMIS</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-teal-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* HRMIS Entry Guide Banner (Collapsible) */}
        {showGuide && (
          <div className="px-5 sm:px-6 py-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 text-xs text-amber-950 flex flex-col gap-2 shrink-0 animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-900">
                  Makluman Rasmi Pengurusan Latihan Khas Penjawat Awam (HRMIS 40 Jam):
                </p>
                <p className="text-amber-800 leading-relaxed">
                  Sistem e-SPLKPM telah <strong>dimansuhkan sepenuhnya</strong>. Semua penjawat awam / guru kini diwajibkan memenuhi <strong>sasaran minimum 40 jam latihan setahun</strong> yang direkodkan ke dalam <strong>Portal HRMIS</strong> (Sub-modul: <em>Pembangunan Latihan &rarr; Latihan Khas / PLC</em>).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div className="bg-white/80 p-2 rounded-lg border border-amber-200">
                    <span className="font-bold text-teal-900">1. Salin / Muat Turun Data</span>
                    <p className="text-slate-600 mt-0.5">Gunakan butang "Salin Format HRMIS" atau CSV untuk senarai audit latihan PLC.</p>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg border border-amber-200">
                    <span className="font-bold text-teal-900">2. Log Masuk Portal HRMIS</span>
                    <p className="text-slate-600 mt-0.5">Buka hrmis2.eghrmis.gov.my &rarr; Pengurusan Latihan &rarr; Maklumat Latihan.</p>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg border border-amber-200">
                    <span className="font-bold text-teal-900">3. Pengesahan Pentadbir</span>
                    <p className="text-slate-600 mt-0.5">Semua jam PLC SMK Salaping telah disahkan secara digital oleh Pengetua Encik Sanaleh bin Daud.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HRMIS KPI Overview Cards */}
        <div className="px-5 sm:px-6 py-4 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Card 1 */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sasaran Wajib</span>
                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-extrabold rounded-md">JPA/KPM</span>
              </div>
              <div className="mt-1">
                <div className="text-2xl font-black text-slate-900">
                  40 <span className="text-xs font-semibold text-slate-500">Jam / Thn</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Minimum 5-7 hari latihan</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Capai 40 Jam</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-1">
                <div className="text-2xl font-black text-emerald-700">
                  {schoolStats.achievedCount}{' '}
                  <span className="text-xs font-semibold text-slate-500">/ {schoolStats.totalTeachers} Guru</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${schoolStats.achievedRate}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700">{schoolStats.achievedRate}%</span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Purata Jam / Guru</span>
                <Clock className="w-4 h-4 text-teal-600" />
              </div>
              <div className="mt-1">
                <div className="text-2xl font-black text-teal-800">
                  {schoolStats.avgHours} <span className="text-xs font-semibold text-slate-500">Jam</span>
                </div>
                <p className="text-[10px] text-teal-700 font-semibold mt-0.5">
                  {Math.min(100, Math.round((Number(schoolStats.avgHours) / TARGET_HOURS) * 100))}% dari sasaran sekolah
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Jumlah Jam Sekolah</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-1">
                <div className="text-2xl font-black text-cyan-800">
                  {schoolStats.totalSchoolHours} <span className="text-xs font-semibold text-slate-500">Jam</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                  Daripada {schoolStats.totalSessionsLogged} sesi PLC berdaftar
                </p>
              </div>
            </div>
          </div>

          {/* Action Row & Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3.5 border-t border-slate-200">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari guru / No. KP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-2xs"
                />
              </div>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-700"
              >
                <option value="all">Semua Status HRMIS</option>
                <option value="achieved">🟢 Capai Sasaran (40+ Jam)</option>
                <option value="progressing">🟡 Sedang Maju (20-39 Jam)</option>
                <option value="needs_action">🔴 Belum Capai (&lt; 20 Jam)</option>
              </select>

              {/* Panitia Filter */}
              <select
                value={selectedPanitia}
                onChange={(e) => setSelectedPanitia(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-700"
              >
                <option value="all">Semua Panitia</option>
                {panitiaList.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Export Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyHRMISFormat}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 shadow-2xs cursor-pointer active:scale-95 transition"
                title="Salin ringkasan data untuk semakan dan kemasukan HRMIS"
              >
                {globalCopied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{globalCopied ? 'Tersalin Ke Papan Keratan!' : 'Salin Format HRMIS'}</span>
              </button>

              <button
                onClick={handleDownloadHRMISCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 shadow-xs cursor-pointer active:scale-95 transition"
                title="Muat turun fail CSV rasmi sedia rujukan audit Latihan 40 Jam"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Muat Turun CSV HRMIS (40 Jam)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Teacher Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100">
          {filteredTeachers.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center border border-slate-200 shadow-xs">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Tiada rekod guru ditemui.</p>
              <p className="text-xs text-slate-500 mt-1">
                Data jam latihan akan dikemaskini secara automatik daripada setiap laporan PLC yang direkodkan di SMK Salaping.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3 text-center w-10">Bil</th>
                    <th className="py-3 px-3">Nama Guru & Jawatan</th>
                    <th className="py-3 px-3">No. KP (HRMIS)</th>
                    <th className="py-3 px-3">Panitia</th>
                    <th className="py-3 px-3 text-center">Sesi PLC</th>
                    <th className="py-3 px-3 text-center">Jam Terkumpul</th>
                    <th className="py-3 px-3 w-40">Kemajuan (Sasaran 40 Jam)</th>
                    <th className="py-3 px-3 text-center">Status HRMIS</th>
                    <th className="py-3 px-3 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTeachers.map((teacher, idx) => {
                    const isAchieved = teacher.statusHRMIS === 'achieved';
                    const isProgressing = teacher.statusHRMIS === 'progressing';

                    return (
                      <tr key={teacher.nama} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3 text-center font-semibold text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-900 block">{teacher.nama}</span>
                          <span className="text-[10px] text-slate-500">{teacher.jawatan}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700 font-medium">
                          {teacher.no_kp || <span className="text-slate-400 italic">Belum diisi</span>}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {teacher.panitia || 'Umum'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-800">
                          {teacher.totalSessions}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-extrabold text-teal-900 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/60 inline-block">
                            {teacher.totalHours} Jam
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className={isAchieved ? 'text-emerald-700' : 'text-slate-600'}>
                                {teacher.totalHours} / {TARGET_HOURS} Jam
                              </span>
                              <span className={isAchieved ? 'text-emerald-700' : 'text-slate-500'}>
                                {teacher.progressPercent}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isAchieved
                                    ? 'bg-emerald-600'
                                    : isProgressing
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${teacher.progressPercent}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {isAchieved ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              CAPAI 40 JAM
                            </span>
                          ) : isProgressing ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              SEDANG MAJU
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertTriangle className="w-3 h-3 text-rose-500" />
                              BELUM CAPAI
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleCopyTeacherEntry(teacher)}
                              className="p-1.5 rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                              title="Salin ringkasan data guru untuk kemasukan HRMIS"
                            >
                              {copiedTeacherId === teacher.nama ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleShareTeacherWA(teacher)}
                              className="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition cursor-pointer"
                              title="Hantar status Latihan 40 Jam ke WhatsApp guru"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">
              Modul Latihan 40 Jam HRMIS &bull; SMK Salaping, Kota Marudu (XEA5104)
            </span>
            <span className="text-slate-400">&bull;</span>
            <span className="text-slate-500">Pengetua: Sanaleh bin Daud</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer active:scale-95"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
