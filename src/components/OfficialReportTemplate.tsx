import React, { useState, useEffect } from 'react';
import { LaporanPLC } from '../types/plc';
import { maskICForDisplay } from '../utils/translations';
import { generateVerificationQRCode, getReportVerificationUrl } from '../utils/qrGenerator';
import { Award, CheckCircle2, Clock, Calendar, MapPin, Users, BookOpen, Image as ImageIcon, QrCode, ShieldCheck } from 'lucide-react';

interface OfficialReportTemplateProps {
  report: LaporanPLC;
  maskIC?: boolean;
}

export const OfficialReportTemplate: React.FC<OfficialReportTemplateProps> = ({ report, maskIC = false }) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const verifyUrl = getReportVerificationUrl(report.id);

  useEffect(() => {
    let isMounted = true;
    generateVerificationQRCode(verifyUrl).then((dataUrl) => {
      if (isMounted && dataUrl) {
        setQrCodeDataUrl(dataUrl);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [verifyUrl]);
  return (
    <div
      id="printable-official-plc-report"
      className="bg-white text-slate-900 p-6 md:p-8 max-w-4xl mx-auto border border-slate-300 shadow-sm font-sans"
      style={{ minHeight: '1000px' }}
    >
      {/* Official School Header */}
      <div className="flex items-center gap-5 pb-4 border-b-2 border-slate-900">
        <div className="w-24 h-24 shrink-0 flex items-center justify-center p-0.5 bg-white">
          {report.logo_sekolah ? (
            <img
              src={report.logo_sekolah}
              alt={`Lencana ${report.nama_sekolah}`}
              className="max-h-24 max-w-24 object-contain"
              style={{ objectFit: 'contain' }}
            />
          ) : (
            <div className="w-18 h-18 rounded-xl bg-teal-800 text-white flex flex-col items-center justify-center p-1 text-center shadow-xs">
              <Award className="w-8 h-8 text-amber-300" />
              <span className="text-[8px] font-extrabold uppercase tracking-tighter">e-PLC KPM</span>
            </div>
          )}
        </div>
        <div className="flex-1 text-center pr-4">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wide text-slate-950 font-serif">
            {report.nama_sekolah || 'SMK SALAPING, KOTA MARUDU'}
          </h2>
          <p className="text-xs text-slate-700 mt-0.5 leading-snug font-medium">
            {report.alamat_sekolah || 'Peti Surat 449, 89108 Kota Marudu, Sabah'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-0.5 text-[11px] text-slate-600 mt-1">
            {report.no_telefon && <span>Tel: {report.no_telefon}</span>}
            {report.no_faks && <span>Faks: {report.no_faks}</span>}
            {report.email_sekolah && <span>Emel: {report.email_sekolah}</span>}
            {report.kod_sekolah && <span className="font-semibold text-slate-800">Kod Sekolah: {report.kod_sekolah}</span>}
          </div>
        </div>
      </div>

      {/* Official Document Title Badge */}
      <div className="text-center my-4 py-2 bg-slate-100 border border-slate-300 rounded-sm">
        <h1 className="text-base md:text-lg font-extrabold tracking-wider text-slate-900 uppercase">
          LAPORAN SESI PERKONGSIAN GURU (PLC)
        </h1>
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mt-0.5">
          PROFESSIONAL LEARNING COMMUNITY &bull; SKPM KUALITI / AUDIT SEKOLAH
        </p>
      </div>

      {/* Meta ID & Status */}
      <div className="flex items-center justify-between text-xs text-slate-600 mb-4 px-1">
        <div>
          <span className="font-semibold">No. Rujukan Laporan: </span>
          <span className="font-mono">{report.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">Status: </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
              report.status === 'disahkan'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : report.status === 'dihantar'
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}
          >
            {report.status}
          </span>
        </div>
      </div>

      {/* Section 1: Maklumat Sesi Perkongsian */}
      <div className="mb-5">
        <div className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>1. Maklumat Sesi Perkongsian Guru</span>
        </div>
        <table className="w-full text-xs border border-collapse border-slate-400 mt-1">
          <tbody>
            <tr>
              <td className="w-1/4 p-2 bg-slate-50 font-semibold border border-slate-300 text-slate-800">
                Tempat Sesi
              </td>
              <td className="w-3/4 p-2 border border-slate-300 font-medium text-slate-900">
                {report.tempat || '-'}
              </td>
            </tr>
            <tr>
              <td className="p-2 bg-slate-50 font-semibold border border-slate-300 text-slate-800">
                Tarikh & Hari
              </td>
              <td className="p-2 border border-slate-300 font-medium text-slate-900">
                {report.tarikh ? `${report.tarikh} (${report.hari || 'Hari Sesi'})` : '-'}
              </td>
            </tr>
            <tr>
              <td className="p-2 bg-slate-50 font-semibold border border-slate-300 text-slate-800">
                Masa & Tempoh
              </td>
              <td className="p-2 border border-slate-300 font-medium text-slate-900">
                {report.masa_mula || '-'} hingga {report.masa_tamat || '-'} &bull;{' '}
                <span className="font-bold text-teal-800">{report.tempoh_jam || 1} Jam</span>
              </td>
            </tr>
            {report.panitia && (
              <tr>
                <td className="p-2 bg-slate-50 font-semibold border border-slate-300 text-slate-800">
                  Panitia / Unit
                </td>
                <td className="p-2 border border-slate-300 font-medium text-slate-900">
                  {report.panitia}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Section 2: Senarai Ahli Kumpulan PLC */}
      <div className="mb-5">
        <div className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          <span>2. Senarai Ahli Kumpulan PLC</span>
        </div>
        <table className="w-full text-xs border border-collapse border-slate-400 mt-1">
          <thead>
            <tr className="bg-slate-100 text-slate-800 font-bold">
              <th className="w-10 p-2 border border-slate-300 text-center">Bil</th>
              <th className="p-2 border border-slate-300 text-left">Nama Guru</th>
              <th className="w-40 p-2 border border-slate-300 text-left">No. Kad Pengenalan</th>
              <th className="w-56 p-2 border border-slate-300 text-left">Jawatan / Bidang</th>
            </tr>
          </thead>
          <tbody>
            {report.ahli_kumpulan && report.ahli_kumpulan.length > 0 ? (
              report.ahli_kumpulan.map((ahli, idx) => (
                <tr key={ahli.id || idx} className="hover:bg-slate-50">
                  <td className="p-2 border border-slate-300 text-center font-semibold text-slate-700">
                    {idx + 1}.
                  </td>
                  <td className="p-2 border border-slate-300 font-bold text-slate-950">
                    {ahli.nama}
                  </td>
                  <td className="p-2 border border-slate-300 font-mono text-slate-800">
                    {maskIC ? maskICForDisplay(ahli.no_kp) : ahli.no_kp || '-'}
                  </td>
                  <td className="p-2 border border-slate-300 text-slate-700">
                    {ahli.jawatan || '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-3 text-center text-slate-500 italic border border-slate-300">
                  Tiada ahli kumpulan dimasukkan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Section 3: Fokus Perkongsian */}
      <div className="mb-5">
        <div className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          <span>3. Fokus Perkongsian (Amalan / Isu / Pedagogi)</span>
        </div>
        <div className="p-3 border border-slate-400 mt-1 bg-white">
          {report.fokus_perkongsian && report.fokus_perkongsian.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-900 leading-relaxed font-medium">
              {report.fokus_perkongsian.map((item, idx) => (
                <li key={idx} className="pl-1">
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">Tiada fokus perkongsian dinyatakan.</p>
          )}
        </div>
      </div>

      {/* Section 4: Interpretasi */}
      <div className="mb-5">
        <div className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 uppercase tracking-wider">
          4. Interpretasi (Aspek Penting / Relevan & Impak Kepada Pembelajaran Murid)
        </div>
        <div className="p-3 border border-slate-400 mt-1 bg-white text-xs text-slate-900 leading-relaxed whitespace-pre-wrap min-h-16 font-medium">
          {report.interpretasi || (
            <span className="text-slate-400 italic">Tiada catatan interpretasi.</span>
          )}
        </div>
      </div>

      {/* Section 5: Hasil Refleksi */}
      <div className="mb-5">
        <div className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 uppercase tracking-wider">
          5. Hasil Refleksi (Apa Yang Dipelajari & Kesan Kepada Peningkatan Profesionalisme)
        </div>
        <div className="p-3 border border-slate-400 mt-1 bg-white text-xs text-slate-900 leading-relaxed whitespace-pre-wrap min-h-16 font-medium">
          {report.hasil_refleksi || (
            <span className="text-slate-400 italic">Tiada catatan hasil refleksi.</span>
          )}
        </div>
      </div>

      {/* Section 6: Gambar Aktiviti Bergambar */}
      <div className="mb-6">
        <div className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 uppercase tracking-wider flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>6. Bukti Gambar Aktiviti PLC</span>
        </div>
        <div className="p-3 border border-slate-400 mt-1 bg-slate-50">
          {report.gambar_aktiviti && report.gambar_aktiviti.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {report.gambar_aktiviti.map((pic, idx) => (
                <div key={pic.id || idx} className="bg-white p-2 border border-slate-300 rounded shadow-xs text-center">
                  <div className="w-full h-48 bg-slate-100 flex items-center justify-center overflow-hidden rounded">
                    <img
                      src={pic.url}
                      alt={`Aktiviti PLC ${idx + 1}`}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] font-semibold text-slate-700">
                    Gambar {idx + 1}: {pic.keterangan || 'Sesi perkongsian guru dijalankan.'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-slate-500 italic">
              Tiada gambar aktiviti dilampirkan.
            </div>
          )}
        </div>
      </div>

      {/* Section 7: Tandatangan Pelapor & Pengesahan Pentadbir */}
      <div className="grid grid-cols-2 gap-6 pt-4 border-t-2 border-slate-800 text-xs">
        {/* Disediakan Oleh */}
        <div className="flex flex-col justify-between border border-slate-300 p-3 bg-white rounded">
          <div>
            <p className="font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1">
              Disediakan Oleh (Pelapor PLC):
            </p>
            <div className="h-20 my-2 flex items-center justify-start">
              {report.disediakan_oleh?.tandatangan_digital ? (
                <img
                  src={report.disediakan_oleh.tandatangan_digital}
                  alt="Tandatangan Pelapor"
                  className="max-h-18 max-w-44 object-contain"
                />
              ) : (
                <div className="text-[11px] text-slate-400 italic">
                  [Tandatangan Digital Pelapor]
                </div>
              )}
            </div>
          </div>
          <div className="border-t border-slate-300 pt-2 text-slate-900 leading-snug">
            <p className="font-extrabold text-sm">{report.disediakan_oleh?.nama || 'Nama Guru'}</p>
            <p className="text-slate-700">{report.disediakan_oleh?.jawatan || 'Jawatan'}</p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Tarikh: {report.disediakan_oleh?.tarikh_tandatangan || report.tarikh || '-'}
            </p>
          </div>
        </div>

        {/* Disahkan Oleh (Pengetua) */}
        <div className="flex flex-col justify-between border border-slate-300 p-3 bg-white rounded">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
              <p className="font-bold text-slate-800 uppercase tracking-wider">
                Disahkan Oleh (Pengetua Sekolah):
              </p>
              {report.status === 'disahkan' && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  DISAHKAN
                </span>
              )}
            </div>
            <div className="h-20 my-2 flex items-center justify-start">
              {report.disahkan_oleh?.tandatangan_digital ? (
                <img
                  src={report.disahkan_oleh.tandatangan_digital}
                  alt="Tandatangan Pengetua"
                  className="max-h-18 max-w-44 object-contain"
                />
              ) : (
                <div className="text-[11px] text-slate-400 italic">
                  {report.status === 'disahkan'
                    ? '[Disahkan secara digital oleh Pengetua]'
                    : '[Menunggu pengesahan Pengetua: Sanaleh bin Daud]'}
                </div>
              )}
            </div>
          </div>
          <div className="border-t border-slate-300 pt-2 text-slate-900 leading-snug">
            <p className="font-extrabold text-sm">
              {report.disahkan_oleh?.nama || 'Sanaleh bin Daud'}
            </p>
            <p className="text-slate-700">
              {report.disahkan_oleh?.jawatan || 'Pengetua, SMK Salaping'}
            </p>
            {report.disahkan_oleh?.catatan && (
              <p className="text-slate-600 italic text-[11px] mt-1 bg-slate-50 p-1 rounded">
                &ldquo;{report.disahkan_oleh.catatan}&rdquo;
              </p>
            )}
            <p className="text-slate-500 text-[11px] mt-0.5">
              Tarikh: {report.disahkan_oleh?.tarikh_pengesahan || (report.status === 'disahkan' ? report.updated_at.slice(0, 10) : '-')}
            </p>
          </div>
        </div>
      </div>

      {/* Official Verification QR Certificate Badge */}
      <div className="mt-5 p-3.5 rounded-lg border-2 border-dashed border-teal-700/40 bg-teal-50/50 flex flex-col sm:flex-row items-center gap-4 text-xs">
        <div className="shrink-0 bg-white p-1.5 rounded-md border border-teal-200 shadow-xs flex flex-col items-center">
          {qrCodeDataUrl ? (
            <img
              src={qrCodeDataUrl}
              alt="Kod QR Pengesahan Rasmi e-PLC"
              className="w-24 h-24 object-contain"
            />
          ) : (
            <div className="w-24 h-24 bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
              <QrCode className="w-8 h-8 text-teal-700 animate-pulse" />
            </div>
          )}
          <span className="text-[9px] font-bold text-teal-900 mt-1 uppercase tracking-tighter">
            Imbas Untuk Sah
          </span>
        </div>

        <div className="flex-1 space-y-1 text-slate-700">
          <div className="flex items-center gap-2">
            <span className="font-extrabold uppercase text-[11px] text-teal-900 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              Perakuan Ketulenan Digital (e-PLC SMK Salaping)
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                report.status === 'disahkan'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 text-white'
              }`}
            >
              {report.status === 'disahkan' ? 'Telah Disahkan' : 'Menunggu Pengesahan'}
            </span>
          </div>

          <p className="text-[11px] leading-relaxed text-slate-600">
            Laporan ini direkodkan secara digital dalam pangkalan data e-PLC SMK Salaping (Kod Sekolah: <span className="font-bold text-slate-900">XEA5104</span>).
            {report.status === 'disahkan' && (
              <span> Disahkan secara digital oleh Pengetua, <strong className="text-slate-900">Encik Sanaleh bin Daud</strong> pada <strong className="text-slate-900">{report.disahkan_oleh?.tarikh_pengesahan || report.updated_at.slice(0, 10)}</strong>.</span>
            )}
          </p>

          <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-slate-500 font-mono">
            <span>Ref: {report.id}</span>
            <span>&bull;</span>
            <span className="truncate max-w-xs">{verifyUrl}</span>
          </div>
        </div>
      </div>

      {/* Official Footnote */}
      <div className="mt-6 pt-3 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-500">
        <span>Sistem Pelaporan PLC Digital (e-PLC) &bull; Format Piawai KPM / SKPMg2</span>
        <span>Dicetak pada: {new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>
    </div>
  );
};
