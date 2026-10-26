import React, { useState, useMemo } from 'react';
import { LaporanPLC, Language } from '../types/plc';
import { maskICForDisplay } from '../utils/translations';
import {
  X,
  Award,
  Copy,
  Check,
  Download,
  Search,
  Filter,
  FileSpreadsheet,
  MessageCircle,
  Clock,
  Users,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

interface SPLKPMModalProps {
  reports: LaporanPLC[];
  onClose: () => void;
  lang: Language;
}

interface TeacherCredit {
  nama: string;
  no_kp: string;
  jawatan: string;
  panitia?: string;
  totalSessions: number;
  totalHours: number;
  creditPoints: number;
  sessions: {
    reportId: string;
    tajuk: string;
    tarikh: string;
    jam: number;
    panitia?: string;
    status: string;
  }[];
}

export const SPLKPMModal: React.FC<SPLKPMModalProps> = ({ reports, onClose, lang }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPanitia, setSelectedPanitia] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [globalCopied, setGlobalCopied] = useState(false);

  // Compute teacher credits from all verified & submitted reports
  const { teacherCredits, schoolStats, panitiaList } = useMemo(() => {
    const teacherMap = new Map<string, TeacherCredit>();
    const panitias = new Set<string>();

    reports.forEach((report) => {
      const jam = report.tempoh_jam || 1;
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
          creditPoints: 0,
          sessions: [],
        };

        existing.totalSessions += 1;
        existing.totalHours += jam;
        // KPM SPLKPM: 1 jam PLC = 1 mata kredit latihan (maksimum mengikut dasar sekolah)
        existing.creditPoints += Math.max(1, Math.round(jam));
        existing.sessions.push({
          reportId: report.id,
          tajuk: report.fokus_perkongsian?.[0] || 'Sesi Perkongsian Guru',
          tarikh: report.tarikh,
          jam,
          panitia: report.panitia,
          status: report.status,
        });

        // Retain IC if previously missing
        if (!existing.no_kp && ahli.no_kp) {
          existing.no_kp = ahli.no_kp;
        }

        teacherMap.set(key, existing);
      });
    });

    const teacherArray = Array.from(teacherMap.values()).sort(
      (a, b) => b.totalHours - a.totalHours
    );

    const totalSchoolHours = teacherArray.reduce((acc, t) => acc + t.totalHours, 0);
    const avgHours = teacherArray.length > 0 ? (totalSchoolHours / teacherArray.length).toFixed(1) : '0';

    return {
      teacherCredits: teacherArray,
      schoolStats: {
        totalTeachers: teacherArray.length,
        totalSchoolHours: Number(totalSchoolHours.toFixed(1)),
        avgHours,
        totalSessionsLogged: reports.length,
      },
      panitiaList: Array.from(panitias),
    };
  }, [reports]);

  // Filtered teachers
  const filteredTeachers = useMemo(() => {
    return teacherCredits.filter((t) => {
      if (selectedPanitia !== 'all' && t.panitia !== selectedPanitia) return false;
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
  }, [teacherCredits, selectedPanitia, searchTerm]);

  // Copy full table formatted for e-SPLKPM
  const handleCopySPLKPMFormat = () => {
    let output = `SENARAI MATA KREDIT LATIHAN e-SPLKPM & PLC - SMK SALAPING (XEA5104)\n`;
    output += `Dijana pada: ${new Date().toLocaleDateString('ms-MY')}\n\n`;
    output += `Bil\tNo. Kad Pengenalan\tNama Guru\tPanitia\tJumlah Sesi\tJumlah Jam PLC\tMata Kredit SPLKPM\n`;

    filteredTeachers.forEach((t, idx) => {
      output += `${idx + 1}\t${t.no_kp || '-'}\t${t.nama}\t${t.panitia || 'Umum'}\t${t.totalSessions}\t${t.totalHours} Jam\t${t.creditPoints}\n`;
    });

    navigator.clipboard.writeText(output);
    setGlobalCopied(true);
    setTimeout(() => setGlobalCopied(false), 3000);
  };

  // Export CSV specifically formatted for e-SPLKPM upload & audit
  const handleDownloadSPLKPMCSV = () => {
    const headers = [
      'Bil',
      'No. Kad Pengenalan',
      'Nama Guru',
      'Jawatan',
      'Panitia',
      'Aktiviti Latihan',
      'Tajuk PLC',
      'Tarikh Sesi',
      'Tempoh (Jam)',
      'Mata Kredit Latihan',
      'Penganjur',
      'Status Pengesahan',
    ];

    const rows: string[] = [];
    let counter = 1;

    reports.forEach((rep) => {
      const tajuk = (rep.fokus_perkongsian?.[0] || 'Sesi PLC').replace(/"/g, '""');
      rep.ahli_kumpulan?.forEach((ahli) => {
        rows.push(
          [
            counter++,
            `"${ahli.no_kp || ''}"`,
            `"${ahli.nama}"`,
            `"${ahli.jawatan || ''}"`,
            `"${rep.panitia || 'Umum'}"`,
            '"Komuniti Pembelajaran Profesional (PLC)"',
            `"${tajuk}"`,
            `"${rep.tarikh}"`,
            rep.tempoh_jam || 1,
            Math.max(1, Math.round(rep.tempoh_jam || 1)),
            '"SMK Salaping, Kota Marudu"',
            `"${rep.status.toUpperCase()}"`,
          ].join(',')
        );
      });
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `e-SPLKPM_Mata_Kredit_PLC_SMK_Salaping_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Share individual teacher record to WhatsApp
  const handleShareTeacherWA = (t: TeacherCredit) => {
    const msg = `*REKOD MATA KREDIT e-SPLKPM (PLC) - SMK SALAPING*
Nama: ${t.nama}
No. KP: ${t.no_kp || '-'}
Jawatan: ${t.jawatan}
Panitia: ${t.panitia || 'Umum'}

*Ringkasan Latihan:*
&bull; Jumlah Sesi PLC: ${t.totalSessions} sesi
&bull; Jumlah Jam Terkumpul: ${t.totalHours} jam
&bull; Anggaran Mata Kredit SPLKPM: ${t.creditPoints} mata kredit

*Perincian Sesi:*
${t.sessions.map((s, i) => `${i + 1}. ${s.tarikh} - ${s.tajuk} (${s.jam} Jam) [${s.status.toUpperCase()}]`).join('\n')}

_Disahkan oleh Pengetua Encik Sanaleh bin Daud melalui Sistem e-PLC SMK Salaping_`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs p-3 sm:p-4 flex items-center justify-center">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-300 max-h-[94vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-gradient-to-r from-teal-800 to-emerald-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
              <Award className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg">
                  Hab e-SPLKPM & Kalkulator Mata Kredit Guru
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/30 text-teal-200 text-[10px] font-bold uppercase tracking-wider border border-teal-400/30">
                  SMK Salaping
                </span>
              </div>
              <p className="text-xs text-teal-100 font-medium mt-0.5">
                Pengiraan Jam Latihan Guru (CPD) untuk Integrasi Sistem Pengurusan Latihan KPM
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* School CPD KPI Overview Cards */}
        <div className="px-5 sm:px-6 py-4 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Guru Terlibat</span>
              <div className="text-xl font-black text-slate-900 mt-0.5">
                {schoolStats.totalTeachers} <span className="text-xs font-normal text-slate-500">orang</span>
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Jumlah Jam Terkumpul</span>
              <div className="text-xl font-black text-teal-700 mt-0.5">
                {schoolStats.totalSchoolHours} <span className="text-xs font-normal text-slate-500">Jam</span>
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Purata Jam / Guru</span>
              <div className="text-xl font-black text-emerald-700 mt-0.5">
                {schoolStats.avgHours} <span className="text-xs font-normal text-slate-500">Jam</span>
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Sasaran Tahunan (42 Jam)</span>
              <div className="text-xl font-black text-amber-600 mt-0.5">
                {Math.min(100, Math.round((Number(schoolStats.avgHours) / 42) * 100))}%
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-200">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari guru / No. KP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>

              <select
                value={selectedPanitia}
                onChange={(e) => setSelectedPanitia(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
              >
                <option value="all">Semua Panitia</option>
                {panitiaList.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySPLKPMFormat}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer active:scale-95"
              >
                {globalCopied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{globalCopied ? 'Tersalin Ke Papan Keratan!' : 'Salin Format e-SPLKPM'}</span>
              </button>

              <button
                onClick={handleDownloadSPLKPMCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Muat Turun CSV SPLKPM</span>
              </button>
            </div>
          </div>
        </div>

        {/* Teacher Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100">
          {filteredTeachers.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center border border-slate-200">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Tiada rekod guru ditemui.</p>
              <p className="text-xs text-slate-500 mt-1">
                Laporan PLC yang disimpan akan mengisi data jam latihan guru secara automatik di sini.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3 text-center w-10">Bil</th>
                    <th className="py-3 px-3">Nama Guru</th>
                    <th className="py-3 px-3">No. Kad Pengenalan</th>
                    <th className="py-3 px-3">Panitia / Bidang</th>
                    <th className="py-3 px-3 text-center">Sesi</th>
                    <th className="py-3 px-3 text-center">Jumlah Jam</th>
                    <th className="py-3 px-3 text-center">Mata Kredit</th>
                    <th className="py-3 px-3 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTeachers.map((teacher, idx) => (
                    <tr key={teacher.nama} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 text-center font-semibold text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{teacher.nama}</span>
                        <span className="text-[10px] text-slate-500">{teacher.jawatan}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">
                        {teacher.no_kp || '-'}
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
                        <span className="font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                          {teacher.totalHours} Jam
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-extrabold text-emerald-700">
                        {teacher.creditPoints}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleShareTeacherWA(teacher)}
                            className="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition cursor-pointer"
                            title="Hantar ringkasan ke WhatsApp guru"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>
            Penyelarasan SPLKPM &bull; SMK Salaping, Kota Marudu &bull; Pengetua: Sanaleh bin Daud
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
