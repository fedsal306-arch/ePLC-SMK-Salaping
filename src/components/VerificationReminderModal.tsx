import React, { useState } from 'react';
import { LaporanPLC, Language } from '../types/plc';
import { NAMA_PENGETUA, JAWATAN_PENGETUA } from '../utils/storage';
import { getReportVerificationUrl } from '../utils/qrGenerator';
import {
  X,
  BellRing,
  Clock,
  AlertTriangle,
  MessageCircle,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Send,
  Copy,
  Check,
} from 'lucide-react';

interface VerificationReminderModalProps {
  reports: LaporanPLC[];
  onClose: () => void;
  onSelectReport: (report: LaporanPLC) => void;
  lang: Language;
}

export const VerificationReminderModal: React.FC<VerificationReminderModalProps> = ({
  reports,
  onClose,
  onSelectReport,
  lang,
}) => {
  const [copiedDigest, setCopiedDigest] = useState(false);

  // Filter only pending reports awaiting verification
  const pendingReports = reports.filter((r) => r.status === 'dihantar');

  // Calculate elapsed days
  const getElapsedDays = (dateStr: string) => {
    try {
      const created = new Date(dateStr).getTime();
      const now = new Date().getTime();
      const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    } catch {
      return 0;
    }
  };

  // Send single WhatsApp reminder
  const handleSendReminderWA = (report: LaporanPLC) => {
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
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '6' + cleanPhone;
    }

    const verifyUrl = getReportVerificationUrl(report.id);
    const tajuk = report.fokus_perkongsian?.[0] || 'Sesi Perkongsian Guru';
    const days = getElapsedDays(report.created_at || report.tarikh);

    const message = `Assalammualaikum & Salam Sejahtera Tuan Pengetua (Encik Sanaleh bin Daud),

*PERINGATAN MESRA PENGESAHAN LAPORAN e-PLC*
Mohon semakan dan pengesahan digital Tuan bagi laporan berikut (${days} hari lalu):

*Sekolah:* ${report.nama_sekolah}
*Panitia:* ${report.panitia || 'Umum'}
*Tajuk PLC:* ${tajuk}
*Tarikh Sesi:* ${report.tarikh} (${report.hari})
*Pelapor:* ${report.disediakan_oleh?.nama}

Sila klik pautan rasmi ini untuk menyemak dan menandatangani secara digital:
${verifyUrl}

Sekian, terima kasih atas sokongan Tuan Pengetua.
_Sistem e-PLC Digital SMK Salaping, Kota Marudu_`;

    const waUrl = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(waUrl, '_blank');
  };

  // Send batch WhatsApp summary digest to Principal
  const handleSendBatchDigestWA = () => {
    if (pendingReports.length === 0) return;

    let message = `Assalammualaikum & Salam Sejahtera Tuan Pengetua (Encik Sanaleh bin Daud),\n\n`;
    message += `*RINGKASAN LAPORAN e-PLC MENUNGGU PENGESAHAN TUAN PENGETUA*\n`;
    message += `Terdapat ${pendingReports.length} laporan PLC guru SMK Salaping yang sedia untuk semakan dan tandatangan digital Tuan:\n\n`;

    pendingReports.forEach((rep, idx) => {
      const tajuk = rep.fokus_perkongsian?.[0] || 'Sesi PLC';
      const verifyUrl = getReportVerificationUrl(rep.id);
      message += `${idx + 1}. *${tajuk}* (${rep.panitia || 'Umum'})\n`;
      message += `   &bull; Tarikh: ${rep.tarikh} | Pelapor: ${rep.disediakan_oleh?.nama}\n`;
      message += `   &bull; Pautan: ${verifyUrl}\n\n`;
    });

    message += `Sekian untuk makluman dan tindakan Tuan. Terima kasih.\n_Penyelaras e-PLC SMK Salaping_`;

    navigator.clipboard.writeText(message);
    setCopiedDigest(true);
    setTimeout(() => setCopiedDigest(false), 3000);

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs p-3 sm:p-4 flex items-center justify-center">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-300 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
              <BellRing className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                Jejak Peringatan Pengesahan Pengetua
              </h3>
              <p className="text-xs text-amber-100 font-medium">
                Peringatan mesra WhatsApp untuk laporan menunggu tandatangan Pengetua: {NAMA_PENGETUA}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Bar */}
        <div className="px-5 sm:px-6 py-3.5 bg-amber-50/70 border-b border-amber-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
            <Clock className="w-4 h-4 text-amber-700" />
            <span>
              Jumlah Laporan Menunggu Pengesahan:{' '}
              <span className="text-amber-800 text-sm font-black">{pendingReports.length}</span>
            </span>
          </div>

          {pendingReports.length > 0 && (
            <button
              onClick={handleSendBatchDigestWA}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-xs cursor-pointer active:scale-95"
            >
              {copiedDigest ? (
                <Check className="w-3.5 h-3.5 text-white" />
              ) : (
                <MessageCircle className="w-3.5 h-3.5" />
              )}
              <span>{copiedDigest ? 'Ringkasan Dihantar!' : 'Hantar Ringkasan Semua ke WhatsApp Pengetua'}</span>
            </button>
          )}
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 space-y-3">
          {pendingReports.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center border border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-base font-bold text-slate-800">
                Tiada Laporan Tertangguh!
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Semua laporan PLC yang dihantar telah disemak dan disahkan sepenuhnya oleh Pengetua Encik Sanaleh bin Daud.
              </p>
            </div>
          ) : (
            pendingReports.map((report) => {
              const days = getElapsedDays(report.created_at || report.tarikh);
              const isUrgent = days >= 7;
              const isWarning = days >= 3 && days < 7;

              return (
                <div
                  key={report.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-amber-300 transition shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        {report.fokus_perkongsian?.[0] || 'Sesi PLC'}
                      </span>
                      {report.panitia && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          {report.panitia}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                      <span>Tarikh: {report.tarikh} ({report.hari})</span>
                      <span>&bull;</span>
                      <span>Pelapor: {report.disediakan_oleh?.nama}</span>
                      <span>&bull;</span>
                      <span className="font-mono text-[11px] text-slate-400">ID: {report.id}</span>
                    </div>

                    <div className="pt-1 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          isUrgent
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : isWarning
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>
                          {days === 0
                            ? 'Dihantar Hari Ini'
                            : `${days} hari menunggu semakan`}
                        </span>
                      </span>
                      {isUrgent && (
                        <span className="text-[10px] text-rose-600 font-bold flex items-center gap-0.5">
                          <AlertTriangle className="w-3 h-3" /> Tindakan Segera Disyorkan
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => {
                        onClose();
                        onSelectReport(report);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    >
                      Buka Laporan
                    </button>

                    <button
                      onClick={() => handleSendReminderWA(report)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-xs cursor-pointer active:scale-95"
                      title="Hantar peringatan mesra ke WhatsApp Pengetua Sanaleh bin Daud"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Peringatan WhatsApp</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>
            e-PLC Audit & Verification Tracker &bull; Pengetua: {NAMA_PENGETUA}
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
