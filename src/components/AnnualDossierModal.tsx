import React, { useState } from 'react';
import { LaporanPLC, Language } from '../types/plc';
import { SchoolInfo, NAMA_PENGETUA, JAWATAN_PENGETUA } from '../utils/storage';
import { downloadReportPDF } from '../utils/pdfGenerator';
import {
  X,
  BookOpen,
  Printer,
  Download,
  Award,
  CheckCircle2,
  Calendar,
  Users,
  Building,
  TrendingUp,
  FileCheck,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

interface AnnualDossierModalProps {
  reports: LaporanPLC[];
  schoolInfo: SchoolInfo;
  onClose: () => void;
  lang: Language;
}

export const AnnualDossierModal: React.FC<AnnualDossierModalProps> = ({
  reports,
  schoolInfo,
  onClose,
  lang,
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const currentYear = new Date().getFullYear();

  // Filter only verified reports, fallback to all if none verified yet for preview
  const verifiedReports = reports.filter((r) => r.status === 'disahkan');
  const displayReports = verifiedReports.length > 0 ? verifiedReports : reports;

  // Aggregate stats
  const totalSessions = displayReports.length;
  const totalHours = displayReports.reduce((acc, r) => acc + (r.tempoh_jam || 1), 0);

  // Panitia breakdown
  const panitiaMap = new Map<string, number>();
  displayReports.forEach((r) => {
    const p = r.panitia || 'Umum';
    panitiaMap.set(p, (panitiaMap.get(p) || 0) + 1);
  });

  // Unique teachers involved
  const teachersSet = new Set<string>();
  displayReports.forEach((r) => {
    r.ahli_kumpulan?.forEach((a) => teachersSet.add(a.nama.trim()));
  });

  // Handle PDF Export of the whole dossier
  const handleDownloadDossier = async () => {
    setIsGeneratingPDF(true);
    await downloadReportPDF('printable-annual-plc-dossier', `Buku_Laporan_Tahunan_PLC_${currentYear}_SMK_Salaping`);
    setIsGeneratingPDF(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs p-2 sm:p-4 flex items-center justify-center">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-300 max-h-[94vh] flex flex-col overflow-hidden">
        {/* Top Control Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300">
              <BookOpen className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">
                Buku Laporan Tahunan PLC & Dossier SKPM Kualiti ({currentYear})
              </h3>
              <p className="text-[11px] text-slate-400">
                Kompilasi Rasmi Dokumentasi Komuniti Pembelajaran Profesional SMK Salaping
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadDossier}
              disabled={isGeneratingPDF}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 transition cursor-pointer shadow-xs active:scale-95"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Muat Turun Buku PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Dossier Document */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200">
          <div
            id="printable-annual-plc-dossier"
            className="bg-white max-w-4xl mx-auto p-8 sm:p-12 shadow-md border border-slate-300 font-sans space-y-12"
          >
            {/* ================= SECTION 1: COVER PAGE ================= */}
            <div className="min-h-[750px] flex flex-col justify-between items-center text-center border-4 border-double border-teal-900 p-8 rounded-lg bg-gradient-to-b from-white via-slate-50 to-teal-50/30">
              <div className="w-full">
                {/* School Crest */}
                <div className="mx-auto w-32 h-32 flex items-center justify-center p-1 bg-white rounded-2xl shadow-xs border border-slate-200 mb-6">
                  {schoolInfo.logo_sekolah ? (
                    <img
                      src={schoolInfo.logo_sekolah}
                      alt="Lencana SMK Salaping"
                      className="max-h-28 max-w-28 object-contain"
                    />
                  ) : (
                    <Award className="w-16 h-16 text-teal-800" />
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold tracking-widest text-teal-900 uppercase">
                    KEMENTERIAN PENDIDIKAN MALAYSIA
                  </h3>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    JABATAN PENDIDIKAN NEGERI SABAH &bull; PPD KOTA MARUDU
                  </h4>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase text-slate-950 font-serif pt-2">
                    {schoolInfo.nama_sekolah || 'SMK SALAPING, KOTA MARUDU'}
                  </h2>
                  <p className="text-xs font-semibold text-slate-600">
                    KOD SEKOLAH: <span className="font-mono text-teal-900">{schoolInfo.kod_sekolah || 'XEA5104'}</span>
                  </p>
                </div>
              </div>

              {/* Title Plate */}
              <div className="my-8 py-6 px-8 bg-teal-900 text-white rounded-xl shadow-lg border-2 border-amber-400/60 max-w-2xl w-full">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-widest block mb-1">
                  DOKUMEN EVIDENS AUDIT SKPM KUALITI@SEKOLAH
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-wide leading-tight uppercase font-serif">
                  BUKU LAPORAN TAHUNAN KOMUNITI PEMBELAJARAN PROFESIONAL (e-PLC)
                </h1>
                <div className="h-0.5 w-24 bg-amber-400 mx-auto my-3" />
                <p className="text-sm font-bold text-teal-100 uppercase tracking-widest">
                  SESI PERSEKOLAHAN TAHUN {currentYear}
                </p>
              </div>

              {/* Cover Bottom Endorsement */}
              <div className="w-full pt-6 border-t border-slate-300 text-xs text-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left">
                  <p className="font-semibold text-slate-500 uppercase text-[10px]">Penyelaras PLC Sekolah:</p>
                  <p className="font-bold text-slate-900">Jawatankuasa e-PLC Sekolah</p>
                  <p className="text-[11px] text-slate-600">SMK Salaping, Kota Marudu</p>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-slate-500 uppercase text-[10px]">Perakuan & Pengesahan:</p>
                  <p className="font-black text-slate-950 text-sm">{NAMA_PENGETUA}</p>
                  <p className="text-[11px] font-bold text-teal-800">{JAWATAN_PENGETUA}</p>
                </div>
              </div>
            </div>

            {/* ================= SECTION 2: KATA ALU-ALUAN & PERAKUAN PENGETUA ================= */}
            <div className="border border-slate-300 p-8 rounded-lg bg-white space-y-6">
              <div className="border-b-2 border-teal-900 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black uppercase text-slate-900">
                    Perakuan & Kata Pengantar Pengetua
                  </h3>
                  <p className="text-xs text-slate-600">
                    Sistem Pelaporan PLC Digital SMK Salaping &bull; Standard Kualiti Pendidikan Malaysia
                  </p>
                </div>
                <ShieldCheck className="w-8 h-8 text-teal-700" />
              </div>

              <div className="text-xs leading-relaxed text-slate-800 space-y-3 text-justify">
                <p className="italic font-serif text-sm text-teal-950">
                  &ldquo;Salam Sejahtera dan Salam SMK Salaping Hebat,&rdquo;
                </p>
                <p>
                  Syukur ke hadrat Tuhan kerana dengan izin-Nya, Buku Laporan Tahunan Komuniti Pembelajaran Profesional (e-PLC) SMK Salaping bagi tahun {currentYear} berjaya didokumentasikan dengan lengkap melalui Sistem Pelaporan Digital Sekolah.
                </p>
                <p>
                  Amalan PLC merupakan tunjang utama peningkatan kualiti penyampaian guru selaras dengan Standard SKPM Kualiti@Sekolah dan Pelan Pembangunan Pendidikan Malaysia (PPPM). Menerusi sesi perkongsian amalan terbaik, kajian pengajaran (Lesson Study), dan bimbingan rakan sekerja (Peer Coaching), para pendidik di SMK Salaping terus memperkukuh pedagogi bermakna demi kemenjadian murid di Kota Marudu.
                </p>
                <p>
                  Saya merakamkan setinggi-tinggi tahniah dan perakuan kepada semua guru SMK Salaping atas iltizam serta komitmen berterusan dalam merekodkan, melaksanakan, dan mengesahkan setiap sesi perkongsian secara telus dan berintegriti.
                </p>
              </div>

              {/* Principal Signature & Stamp Block */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">DIPERAKUKAN OLEH:</p>
                  <div className="h-20 flex items-center">
                    <img
                      src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='70'><path d='M10 50 Q 50 10 110 40 T 210 20' stroke='%230f766e' stroke-width='3.5' fill='none'/><path d='M30 60 Q 80 30 140 55' stroke='%230f766e' stroke-width='2' fill='none'/></svg>"
                      alt="Tandatangan Pengetua"
                      className="max-h-16 object-contain"
                    />
                  </div>
                  <p className="font-black text-sm text-slate-950">{NAMA_PENGETUA}</p>
                  <p className="text-xs text-slate-700 font-bold">{JAWATAN_PENGETUA}</p>
                  <p className="text-[11px] text-slate-500">SMK Salaping, Kota Marudu, Sabah</p>
                </div>

                <div className="w-36 h-36 rounded-full border-2 border-dashed border-teal-800/40 p-2 flex flex-col items-center justify-center text-center text-teal-900 bg-teal-50/50">
                  <Award className="w-6 h-6 text-teal-700 mb-1" />
                  <span className="text-[9px] font-extrabold uppercase tracking-tight">COP RASMI PENGETUA</span>
                  <span className="text-[8px] font-semibold">SMK SALAPING</span>
                  <span className="text-[7px] text-slate-500">XEA5104 &bull; KOTA MARUDU</span>
                </div>
              </div>
            </div>

            {/* ================= SECTION 3: RUMUSAN STATISTIK & ANALISIS PANITIA ================= */}
            <div className="border border-slate-300 p-8 rounded-lg bg-white space-y-6">
              <div className="border-b-2 border-teal-900 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black uppercase text-slate-900">
                    Ringkasan Eksekutif & Statistik PLC Sekolah
                  </h3>
                  <p className="text-xs text-slate-600">
                    Analisis data penyertaan guru dan jam pembelajaran profesional
                  </p>
                </div>
                <TrendingUp className="w-7 h-7 text-teal-700" />
              </div>

              {/* 4 Stat Boxes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Jumlah Sesi PLC</span>
                  <p className="text-2xl font-black text-teal-800 mt-1">{totalSessions}</p>
                  <span className="text-[10px] text-slate-500">Sesi Selesai</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Jumlah Jam Latihan</span>
                  <p className="text-2xl font-black text-teal-800 mt-1">{totalHours}</p>
                  <span className="text-[10px] text-slate-500">Jam Terkumpul</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Guru Terlibat</span>
                  <p className="text-2xl font-black text-teal-800 mt-1">{teachersSet.size}</p>
                  <span className="text-[10px] text-slate-500">Orang Pendidik</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Kadar Pengesahan</span>
                  <p className="text-2xl font-black text-emerald-700 mt-1">
                    {totalSessions > 0 ? Math.round((verifiedReports.length / totalSessions) * 100) : 100}%
                  </p>
                  <span className="text-[10px] text-emerald-700 font-bold">Disahkan Pengetua</span>
                </div>
              </div>

              {/* Panitia Table Breakdown */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Taburan Sesi Mengikut Panitia / Unit:
                </h4>
                <table className="w-full text-xs border border-collapse border-slate-300">
                  <thead className="bg-slate-100 text-slate-800 font-bold">
                    <tr>
                      <th className="p-2 border border-slate-300 text-center w-12">Bil</th>
                      <th className="p-2 border border-slate-300 text-left">Nama Panitia / Bidang</th>
                      <th className="p-2 border border-slate-300 text-center w-32">Bilangan Sesi</th>
                      <th className="p-2 border border-slate-300 text-center w-28">Peratusan (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(panitiaMap.entries()).map(([panitia, count], idx) => {
                      const pct = totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0;
                      return (
                        <tr key={panitia} className="hover:bg-slate-50">
                          <td className="p-2 border border-slate-300 text-center font-semibold text-slate-600">
                            {idx + 1}
                          </td>
                          <td className="p-2 border border-slate-300 font-bold text-slate-900">
                            {panitia}
                          </td>
                          <td className="p-2 border border-slate-300 text-center font-extrabold text-teal-800">
                            {count} Sesi
                          </td>
                          <td className="p-2 border border-slate-300 text-center text-slate-700 font-medium">
                            {pct}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ================= SECTION 4: HIMPUNAN REKOD SESI PLC ================= */}
            <div className="border border-slate-300 p-8 rounded-lg bg-white space-y-6">
              <div className="border-b-2 border-teal-900 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black uppercase text-slate-900">
                    Senarai Rekod Sesi PLC ({currentYear})
                  </h3>
                  <p className="text-xs text-slate-600">
                    Dokumentasi ringkas aktiviti, ahli dan refleksi profesional
                  </p>
                </div>
                <FileCheck className="w-7 h-7 text-teal-700" />
              </div>

              {displayReports.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-6">
                  Tiada sesi PLC direkodkan lagi untuk tahun ini.
                </p>
              ) : (
                <div className="space-y-4">
                  {displayReports.map((report, idx) => (
                    <div
                      key={report.id}
                      className="border border-slate-300 rounded-lg p-4 bg-slate-50/50 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                        <span className="font-extrabold text-teal-900">
                          {idx + 1}. {report.fokus_perkongsian?.[0] || 'Sesi PLC'}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">{report.id}</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-700">
                        <div>
                          <span className="font-bold text-slate-500 block">Tarikh:</span>
                          <span>{report.tarikh} ({report.hari})</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-500 block">Masa & Tempat:</span>
                          <span>{report.masa_mula} - {report.masa_tamat} &bull; {report.tempat}</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-500 block">Panitia:</span>
                          <span>{report.panitia || 'Umum'}</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-500 block">Pelapor:</span>
                          <span>{report.disediakan_oleh?.nama}</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-600 pt-1">
                        <strong className="text-slate-800">Ahli Kumpulan ({report.ahli_kumpulan?.length || 0}): </strong>
                        {report.ahli_kumpulan?.map((a) => a.nama).join(', ') || '-'}
                      </div>

                      {report.hasil_refleksi && (
                        <div className="text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200 italic">
                          &ldquo;{report.hasil_refleksi}&rdquo;
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Document Final Endorsement Seal */}
            <div className="text-center pt-8 border-t-2 border-slate-300 text-xs text-slate-500">
              <p className="font-bold text-slate-800 uppercase tracking-widest">
                DOKUMEN RASMI KOMUNITI PEMBELAJARAN PROFESIONAL (e-PLC)
              </p>
              <p className="text-[10px] mt-0.5">
                SMK SALAPING, PETI SURAT 449, 89108 KOTA MARUDU, SABAH &bull; KOD SEKOLAH: XEA5104
              </p>
              <p className="text-[9px] text-slate-400 mt-2">
                Dijana melalui Aplikasi e-PLC Sekolah &bull; Tarikh Cetakan: {new Date().toLocaleDateString('ms-MY')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
