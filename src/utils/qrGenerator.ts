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
    // Fallback simple SVG QR placeholder if generation fails
    return '';
  }
}

/**
 * Returns the public verification URL for a given report ID.
 */
export function getReportVerificationUrl(reportId: string): string {
  if (typeof window === 'undefined') return `https://smksalaping.edu.my/?verify=${reportId}`;
  return `${window.location.origin}${window.location.pathname}?verify=${reportId}`;
}
