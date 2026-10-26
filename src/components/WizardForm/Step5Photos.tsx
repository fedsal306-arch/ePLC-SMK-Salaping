import React, { useRef, useState } from 'react';
import { GambarAktiviti, Language } from '../../types/plc';
import { translations } from '../../utils/translations';
import { compressImage } from '../../utils/imageCompressor';
import { Camera, Image as ImageIcon, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface Step5PhotosProps {
  photos: GambarAktiviti[];
  updatePhotos: (photos: GambarAktiviti[]) => void;
  lang: Language;
}

export const Step5Photos: React.FC<Step5PhotosProps> = ({
  photos,
  updatePhotos,
  lang,
}) => {
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressMsg, setCompressMsg] = useState('');

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    setCompressMsg(lang === 'ms' ? 'Memampatkan gambar (< 1MB)...' : 'Compressing image (< 1MB)...');

    const newPhotos: GambarAktiviti[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const { dataUrl, sizeKb } = await compressImage(file, 1280, 0.8);
        newPhotos.push({
          id: 'photo-' + Date.now() + '-' + i,
          url: dataUrl,
          keterangan: lang === 'ms' ? `Sesi perkongsian PLC guru (${sizeKb} KB)` : `PLC sharing activity (${sizeKb} KB)`,
          saiz: `${sizeKb} KB`,
        });
      }
      updatePhotos([...photos, ...newPhotos]);
    } catch (err) {
      console.error('Error compressing image:', err);
      alert(lang === 'ms' ? 'Gagal memproses gambar. Sila cuba lagi.' : 'Failed to process image. Please try again.');
    } finally {
      setIsCompressing(false);
      setCompressMsg('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleRemove = (id: string) => {
    updatePhotos(photos.filter((p) => p.id !== id));
  };

  const handleCaptionChange = (id: string, caption: string) => {
    updatePhotos(
      photos.map((p) => (p.id === id ? { ...p, keterangan: caption } : p))
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <Camera className="w-5 h-5 text-teal-600" />
          <h4 className="font-bold text-base text-slate-900">
            {t.photos_heading} <span className="text-red-500">*</span>
          </h4>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          {t.photo_requirement}
        </p>

        {/* Upload Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {/* Direct Camera on Mobile */}
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            disabled={isCompressing}
            className="flex items-center justify-center gap-2.5 p-3.5 rounded-xl border-2 border-dashed border-teal-500 bg-teal-50/60 text-teal-800 hover:bg-teal-100 hover:border-teal-600 transition font-bold text-xs sm:text-sm cursor-pointer active:scale-98"
          >
            <Camera className="w-5 h-5 text-teal-600" />
            <span>{t.take_photo}</span>
          </button>

          {/* Gallery Picker */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isCompressing}
            className="flex items-center justify-center gap-2.5 p-3.5 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition font-bold text-xs sm:text-sm cursor-pointer active:scale-98"
          >
            <ImageIcon className="w-5 h-5 text-slate-600" />
            <span>{t.upload_photo}</span>
          </button>

          {/* Hidden Inputs */}
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFiles}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFiles}
            accept="image/*"
            multiple
            className="hidden"
          />
        </div>

        {/* Loading Spinner during Compression */}
        {isCompressing && (
          <div className="p-4 mb-4 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center gap-2 text-teal-800 text-xs font-semibold">
            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
            <span>{compressMsg}</span>
          </div>
        )}

        {/* Status indicator */}
        <div className="flex items-center justify-between text-xs font-semibold py-2 px-3 rounded-lg bg-slate-50 border border-slate-200 mb-4">
          <span className="text-slate-600">
            {lang === 'ms' ? 'Jumlah Gambar Dimuat Naik:' : 'Uploaded Photos Count:'}
          </span>
          <span
            className={`flex items-center gap-1 ${
              photos.length > 0 ? 'text-emerald-700' : 'text-amber-700'
            }`}
          >
            {photos.length > 0 ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{photos.length} {lang === 'ms' ? 'gambar (Memenuhi syarat)' : 'photos (Qualified)'}</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                <span>0 {lang === 'ms' ? 'gambar (Wajib minima 1)' : 'photos (Minimum 1 required)'}</span>
              </>
            )}
          </span>
        </div>

        {/* Photos Grid */}
        {photos.length === 0 ? (
          <div className="text-center py-10 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
            <Camera className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">
              {lang === 'ms' ? 'Belum ada gambar aktiviti' : 'No activity photos yet'}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              {lang === 'ms'
                ? 'Gunakan kamera telefon anda untuk mengambil gambar sesi perbincangan atau pilih daripada galeri.'
                : 'Use your phone camera to take photo of the discussion or select from gallery.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {photos.map((pic, idx) => (
              <div
                key={pic.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs relative group flex flex-col"
              >
                <div className="h-44 bg-slate-100 flex items-center justify-center overflow-hidden relative">
                  <img
                    src={pic.url}
                    alt={`Aktiviti ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-slate-900/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    Gambar #{idx + 1}
                  </div>
                  {pic.saiz && (
                    <div className="absolute bottom-2 left-2 bg-emerald-700/85 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {pic.saiz}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(pic.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600/90 text-white hover:bg-red-700 transition cursor-pointer shadow-sm"
                    title={t.remove_photo}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3 bg-white flex-1">
                  <input
                    type="text"
                    value={pic.keterangan || ''}
                    onChange={(e) => handleCaptionChange(pic.id, e.target.value)}
                    placeholder={t.photo_caption_placeholder}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
