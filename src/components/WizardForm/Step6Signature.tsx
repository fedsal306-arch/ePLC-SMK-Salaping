import React, { useRef, useState, useEffect } from 'react';
import { DisediakanOleh, Language } from '../../types/plc';
import { translations } from '../../utils/translations';
import { PenTool, RotateCcw, CheckCircle, ShieldCheck, User, Upload, Phone, MessageCircle } from 'lucide-react';

interface Step6SignatureProps {
  disediakanOleh: DisediakanOleh;
  updateDisediakanOleh: (val: DisediakanOleh) => void;
  noTelefonPengetua: string;
  updateNoTelefonPengetua: (val: string) => void;
  lang: Language;
}

export const Step6Signature: React.FC<Step6SignatureProps> = ({
  disediakanOleh,
  updateDisediakanOleh,
  noTelefonPengetua,
  updateNoTelefonPengetua,
  lang,
}) => {
  const t = translations[lang];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set display vs pixel ratio
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.strokeStyle = '#0f766e';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // If already has signature data URL, draw it
    if (disediakanOleh.tandatangan_digital) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasDrawn(true);
      };
      img.src = disediakanOleh.tandatangan_digital;
    }
  }, []);

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
    updateDisediakanOleh({
      ...disediakanOleh,
      tandatangan_digital: dataUrl,
      tarikh_tandatangan: new Date().toISOString().slice(0, 10),
    });
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasDrawn(false);
    updateDisediakanOleh({
      ...disediakanOleh,
      tandatangan_digital: null,
    });
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
          ctx.clearRect(0, 0, rect.width, rect.height);
          ctx.drawImage(img, 0, 0, rect.width, rect.height);
          setHasDrawn(true);
        };
        img.src = dataUrl;
      }
      updateDisediakanOleh({
        ...disediakanOleh,
        tandatangan_digital: dataUrl,
        tarikh_tandatangan: new Date().toISOString().slice(0, 10),
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Reporter Details */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-teal-600" />
          <h4 className="font-bold text-base text-slate-900">
            {t.prepared_by} <span className="text-red-500">*</span>
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.reporter_name} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={disediakanOleh.nama || ''}
              onChange={(e) =>
                updateDisediakanOleh({ ...disediakanOleh, nama: e.target.value })
              }
              placeholder="Cth: Cikgu Ahmad Farhan bin Ismail"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-semibold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.reporter_role} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={disediakanOleh.jawatan || ''}
              onChange={(e) =>
                updateDisediakanOleh({ ...disediakanOleh, jawatan: e.target.value })
              }
              placeholder="Cth: Guru Kanan Sains & Matematik"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Touch Signature Pad */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <PenTool className="w-5 h-5 text-teal-600" />
            <h4 className="font-bold text-base text-slate-900">
              {t.signature_heading} <span className="text-red-500">*</span>
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 cursor-pointer flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" />
              <span>{lang === 'ms' ? 'Muat Naik Imej' : 'Upload Image'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadSignature}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-red-600 bg-slate-100 px-2.5 py-1 rounded-lg transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.clear_signature}</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-3">
          {t.sign_prompt}
        </p>

        {/* Canvas Area */}
        <div className="relative border-2 border-dashed border-teal-500/80 bg-teal-50/20 rounded-2xl overflow-hidden touch-none h-48 w-full flex items-center justify-center">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full cursor-crosshair"
            style={{ width: '100%', height: '100%' }}
          />

          {!hasDrawn && !disediakanOleh.tandatangan_digital && (
            <div className="absolute pointer-events-none text-slate-400 text-xs flex flex-col items-center gap-1">
              <PenTool className="w-6 h-6 stroke-1 text-teal-400" />
              <span>{lang === 'ms' ? 'Tandatangan di sini (Sentuh atau klik)' : 'Sign here (Touch or mouse)'}</span>
            </div>
          )}
        </div>

        {/* Validation badge */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            {lang === 'ms' ? 'Status Tandatangan:' : 'Signature Status:'}
          </span>
          {hasDrawn || disediakanOleh.tandatangan_digital ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              {lang === 'ms' ? 'Tandatangan tersedia' : 'Signature captured'}
            </span>
          ) : (
            <span className="text-amber-700 font-medium">
              {lang === 'ms' ? 'Wajib ditandatangani sebelum hantar' : 'Required before submission'}
            </span>
          )}
        </div>

        {/* Official admin notice & Pengetua details */}
        <div className="mt-5 p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-teal-900 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-teal-950 text-sm">
            <ShieldCheck className="w-5 h-5 text-teal-700" />
            <span>Pengesahan Wajib oleh Pengetua: Sanaleh bin Daud</span>
          </div>
          <p className="leading-relaxed text-teal-800">
            Semua laporan PLC SMK Salaping mesti disahkan oleh Pengetua, <strong>Encik Sanaleh bin Daud</strong>. Pautan semakan digital akan dihantar terus ke WhatsApp Pengetua sebaik sahaja anda menekan butang hantar laporan.
          </p>
        </div>
      </div>

      {/* Pengetua WhatsApp Phone Input Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/30">
        <div className="flex items-center gap-2 mb-2 text-emerald-800">
          <MessageCircle className="w-5 h-5 text-emerald-600" />
          <h4 className="font-bold text-base text-slate-900">
            Nombor WhatsApp Pengetua (Sanaleh bin Daud) <span className="text-red-500">*</span>
          </h4>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          Masukkan nombor telefon WhatsApp Pengetua untuk penghantaran pautan pengesahan pantas.
        </p>

        <div className="relative">
          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="tel"
            required
            value={noTelefonPengetua}
            onChange={(e) => updateNoTelefonPengetua(e.target.value)}
            placeholder="Cth: 013-8889999 / 019-1234567"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-slate-900 bg-white"
          />
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
          <span>Cadangan format:</span>
          <button
            type="button"
            onClick={() => updateNoTelefonPengetua('013-8889999')}
            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 transition"
          >
            013-8889999
          </button>
          <button
            type="button"
            onClick={() => updateNoTelefonPengetua('019-8765432')}
            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 transition"
          >
            019-8765432
          </button>
        </div>
      </div>
    </div>
  );
};
