import React, { useState, useRef, useEffect } from 'react';
import { LaporanPLC, Language, UserProfile } from '../types/plc';
import { translations } from '../utils/translations';
import { OfficialReportTemplate } from './OfficialReportTemplate';
import { downloadReportPDF, shareReportWhatsApp, sendVerificationLinkToPengetuaWhatsApp } from '../utils/pdfGenerator';
import { NAMA_PENGETUA, JAWATAN_PENGETUA } from '../utils/storage';
import confetti from 'canvas-confetti';
import {
  X,
  Download,
  Printer,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  Edit,
  Loader2,
  MessageCircle,
  PenTool,
  RotateCcw,
  Upload,
} from 'lucide-react';

interface ReportDetailModalProps {
  report: LaporanPLC;
  onClose: () => void;
  currentUser: UserProfile;
  lang: Language;
  onVerifyReport: (reportId: string, catatan: string, tandatanganDigital?: string) => void;
  onEditReport?: (report: LaporanPLC) => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  onClose,
  currentUser,
  lang,
  onVerifyReport,
  onEditReport,
}) => {
  const t = translations[lang];
  const [maskIC, setMaskIC] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verifyCatatan, setVerifyCatatan] = useState(
    'Disahkan oleh Pengetua. Sesi perkongsian amalan terbaik PLC ini memenuhi kualiti kurikulum SMK Salaping.'
  );

  // Digital canvas signature state for Pengetua
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [pengetuaSigDataUrl, setPengetuaSigDataUrl] = useState<string | null>(null);

  // Initialize canvas when verify modal opens
  useEffect(() => {
    if (!showVerifyDialog) return;

    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      // Deep teal/navy ink for official school endorsement
      ctx.strokeStyle = '#0f766e';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (pengetuaSigDataUrl) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, rect.width, rect.height);
          setHasDrawn(true);
        };
        img.src = pengetuaSigDataUrl;
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [showVerifyDialog]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else if ('clientX' in e) {
      return {
        x: (e as React.MouseEvent).clientX - rect.left,
        y: (e as React.MouseEvent).clientY - rect.top,
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    setPengetuaSigDataUrl(dataUrl);
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasDrawn(false);
    setPengetuaSigDataUrl(null);
  };

  const handleUploadSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
        const img = new Image();
        img.onload = () => {
          const rect = canvas.getBoundingClientRect();
          const dpr = window.devicePixelRatio || 1;
          ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
          ctx.drawImage(img, 0, 0, rect.width, rect.height);
          setHasDrawn(true);
          setPengetuaSigDataUrl(dataUrl);
        };
        img.src = dataUrl;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    const filename = `Laporan_PLC_${report.tarikh}_${report.tempat.replace(/\s+/g, '_')}`;
    await downloadReportPDF('printable-official-plc-report', filename);
    setIsGeneratingPDF(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmVerify = () => {
    const finalSig =
      pengetuaSigDataUrl ||
      (canvasRef.current && hasDrawn ? canvasRef.current.toDataURL('image/png') : undefined);

    onVerifyReport(report.id, verifyCatatan, finalSig);
    setShowVerifyDialog(false);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleSendToPengetua = () => {
    const verifyUrl = `${window.location.origin}/?verify=${report.id}`;
    let phone = report.no_telefon_pengetua;
    if (!phone) {
      const input = prompt(
        'Masukkan nombor WhatsApp Pengetua (Sanaleh bin Daud):',
        '013-8889999'
      );
      if (!input) return;
      phone = input;
    }
    sendVerificationLinkToPengetuaWhatsApp(report, phone, verifyUrl);
  };

  const canVerify = currentUser.peranan === 'pentadbir' && report.status !== 'disahkan';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs p-2 sm:p-4 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl border border-slate-300 max-h-[94vh] flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-900 text-white border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h3 className="font-bold text-sm sm:text-base tracking-wide">
              {lang === 'ms' ? 'Laporan PLC Rasmi SMK Salaping' : 'Official PLC Report Preview'}
            </h3>
            <span className="hidden sm:inline text-xs font-mono text-slate-400">
              ({report.id})
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-teal-700 text-white hover:bg-teal-800 transition cursor-pointer shadow-xs"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{t.btn_download_pdf}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.btn_print}</span>
            </button>

            <button
              onClick={handleSendToPengetua}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer shadow-xs"
              title="Hantar pautan semakan ke WhatsApp Pengetua Sanaleh bin Daud"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Link WhatsApp Pengetua</span>
            </button>

            <button
              onClick={() => shareReportWhatsApp(report)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.btn_share_whatsapp}</span>
            </button>

            {onEditReport && report.status !== 'disahkan' && (
              <button
                onClick={() => onEditReport(report)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 transition cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>{lang === 'ms' ? 'Kemaskini' : 'Edit'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Privacy Mask Toggle for IC */}
            <button
              onClick={() => setMaskIC(!maskIC)}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
              title="Topeng No. KP untuk paparan awam / PDPA"
            >
              {maskIC ? <EyeOff className="w-3 h-3 text-amber-600" /> : <Eye className="w-3 h-3 text-slate-500" />}
              <span>{maskIC ? 'No. KP Ditopeng' : 'No. KP Penuh'}</span>
            </button>

            {/* Admin Verification Action */}
            {canVerify && (
              <button
                onClick={() => setShowVerifyDialog(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer shadow-sm animate-pulse"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Sahkan Sebagai Pengetua</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Report Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100">
          <OfficialReportTemplate report={report} maskIC={maskIC} />
        </div>

        {/* Admin Verification Dialog for Pengetua with Digital Canvas Signature */}
        {showVerifyDialog && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4">
            <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center gap-2.5 mb-2.5 text-emerald-800">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <ShieldCheck className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900 leading-tight">
                    Pengesahan Rasmi Pengetua
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {NAMA_PENGETUA} &bull; {JAWATAN_PENGETUA}
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 mb-4">
                <p className="text-xs text-emerald-950 leading-relaxed font-medium">
                  Sebagai Pengetua <strong>SMK Salaping (XEA5104)</strong>, sila turunkan tandatangan digital anda pada ruangan kanvas di bawah bagi mengesahkan pelaksanaan sesi PLC ini.
                </p>
              </div>

              {/* Digital Canvas Signature Pad */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tandatangan Digital Pengetua (Canvas):</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleClearSignature}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition cursor-pointer border border-rose-200"
                      title="Padam dan lukis semula"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Padam Semula</span>
                    </button>
                    <label
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer border border-slate-200"
                      title="Muat naik fail tandatangan"
                    >
                      <Upload className="w-3 h-3 text-slate-500" />
                      <span>Muat Naik</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUploadSignature}
                      />
                    </label>
                  </div>
                </div>

                <div className="relative border-2 border-dashed border-emerald-400/80 rounded-2xl bg-white overflow-hidden shadow-inner group">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-36 bg-slate-50/50 cursor-crosshair block touch-none"
                    style={{ touchAction: 'none' }}
                  />

                  {/* Canvas Baseline & Watermark */}
                  {!hasDrawn && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400">
                      <PenTool className="w-6 h-6 mb-1 text-slate-300 stroke-1" />
                      <span className="text-xs font-medium text-slate-400">
                        Lukis tandatangan di sini dengan jari, stylus, atau tetikus
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-2 left-4 right-4 border-b border-slate-200 pointer-events-none flex justify-between text-[10px] text-slate-400">
                    <span>X __________________________________</span>
                    <span>Tandatangan Pengetua</span>
                  </div>
                </div>

                <div className="mt-1.5 flex items-center justify-between text-[11px]">
                  {hasDrawn ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Tandatangan digital dikesan &amp; sedia dimeterai
                    </span>
                  ) : (
                    <span className="text-amber-700 font-medium">
                      * Sila tandatangan di atas kanvas sebelum mengesahkan
                    </span>
                  )}
                  <span className="text-slate-400 text-[10px]">
                    Resolusi retina automatik
                  </span>
                </div>
              </div>

              {/* Catatan / Ulasan Pengetua */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan / Ulasan Pengetua:
                </label>
                <textarea
                  rows={2}
                  value={verifyCatatan}
                  onChange={(e) => setVerifyCatatan(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-slate-50 focus:bg-white"
                  placeholder="Masukkan ulasan atau cadangan penambahbaikan..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowVerifyDialog(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  {lang === 'ms' ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmVerify}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sahkan Laporan &amp; Meterai Tandatangan</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
