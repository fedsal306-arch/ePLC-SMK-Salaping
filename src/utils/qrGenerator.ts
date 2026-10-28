import QRCode from 'qrcode';

/**
 * Generates a high-quality Data URL (PNG) of a QR code for a given verification URL.
 */
export async function generateVerificationQRCode(url: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: 180,
      margin: 1,
      color: {
        dark: '#0f766e', // SMK Salaping teal theme
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    return '';
  }
}

/**
 * Returns the public verification URL for a given report ID.
 * Automatically targets the permanent production domain (https://e-plc-smk-salaping.vercel.app)
 * to ensure WhatsApp links sent to mobile devices (Pengetua / PK HEM) open reliably.
 */
export function getReportVerificationUrl(reportId: string): string {
  const productionBase = 'https://e-plc-smk-salaping.vercel.app';
  if (typeof window === 'undefined') return `${productionBase}/?verify=${reportId}`;

  const currentOrigin = window.location.origin;
  if (currentOrigin.includes('ais-dev') || currentOrigin.includes('ais-pre') || currentOrigin.includes('run.app')) {
    return `${productionBase}/?verify=${reportId}`;
  }
  return `${currentOrigin}${window.location.pathname}?verify=${reportId}`;
}
