import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LaporanPLC } from '../types/plc';
import { getReportVerificationUrl } from './qrGenerator';

/**
 * Generates and downloads an official A4 PDF report from the DOM element.
 */
export async function downloadReportPDF(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return false;
  }

  try {
    // Generate high-resolution canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Multi-page support if report is long with multiple photos
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback: trigger print dialog
    window.print();
    return false;
  }
}

/**
 * Creates a clean WhatsApp summary text and launches WhatsApp share.
 */
export function shareReportWhatsApp(report: LaporanPLC): void {
  const members = report.ahli_kumpulan?.map((a) => a.nama).join(', ') || 'Semua Ahli';
  const topics = report.fokus_perkongsian?.join('; ') || 'Sesi Perkongsian Guru';
  const verifyUrl = getReportVerificationUrl(report.id);

  const text = `*LAPORAN SESI PERKONGSIAN GURU (PLC)*
Sekolah: ${report.nama_sekolah}
Tarikh: ${report.tarikh} (${report.hari})
Masa: ${report.masa_mula} - ${report.masa_tamat} (${report.tempoh_jam} Jam)
Tempat: ${report.tempat}

*Ahli Kumpulan:*
${report.ahli_kumpulan?.map((a, i) => `${i + 1}. ${a.nama} (${a.jawatan})`).join('\n')}

*Fokus Perkongsian:*
${topics}

*Status:* ${report.status.toUpperCase()}
Disediakan oleh: ${report.disediakan_oleh?.nama} (${report.disediakan_oleh?.jawatan})

🔗 *Pautan Semakan & Pengesahan Digital:*
${verifyUrl}

_Dihantar melalui Sistem e-PLC Digital Sekolah_`;

  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

/**
 * Sends direct verification link to Pengetua (Sanaleh bin Daud) via WhatsApp.
 */
export function sendVerificationLinkToPengetuaWhatsApp(
  report: LaporanPLC,
  pengetuaPhone: string,
  verifyUrl: string
): void {
  // Clean phone to international format: e.g. 0138889999 -> 60138889999
  let cleanPhone = (pengetuaPhone || '').replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '6' + cleanPhone;
  }

  const topics = report.fokus_perkongsian?.join('; ') || 'Sesi Perkongsian Guru';
  const members = report.ahli_kumpulan?.map((a) => a.nama).join(', ') || 'Ahli Kumpulan';

  const message = `Assalammualaikum & Salam Sejahtera Tuan Pengetua (Encik Sanaleh bin Daud),

Mohon semakan dan pengesahan Tuan bagi Laporan Sesi Perkongsian Guru (PLC) yang telah selesai dijalankan:

*SEKOLAH:* ${report.nama_sekolah}
*NO. RUJUKAN:* ${report.id}
*TARIKH:* ${report.tarikh} (${report.hari})
*MASA:* ${report.masa_mula} - ${report.masa_tamat} (${report.tempoh_jam || 1} Jam)
*TEMPAT:* ${report.tempat}
*FOKUS:* ${topics}
*AHLI TERLIBAT:* ${members}
*DISEDIAKAN OLEH:* ${report.disediakan_oleh?.nama} (${report.disediakan_oleh?.jawatan})

Sila klik pautan rasmi di bawah untuk menyemak dan mengesahkan laporan ini secara digital:
${verifyUrl}

Sekian, terima kasih.
_Sistem e-PLC Digital SMK Salaping, Kota Marudu_`;

  const waUrl = cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');
}

/**
 * Exports all reports to CSV for Excel / SKPMg2 school audit.
 * Uses UTF-8 BOM so Malay characters and formatting display perfectly in Excel.
 */
export function exportReportsToExcel(reports: LaporanPLC[]): void {
  if (!reports || reports.length === 0) {
    alert('Tiada laporan untuk dieksport.');
    return;
  }

  const headers = [
    'Bil',
    'No. Rujukan Laporan',
    'Sekolah',
    'Tarikh',
    'Hari',
    'Masa Mula',
    'Masa Tamat',
    'Tempoh (Jam)',
    'Tempat',
    'Panitia',
    'Fokus Perkongsian',
    'Jumlah Ahli',
    'Senarai Ahli & Jawatan',
    'Disediakan Oleh',
    'Disahkan Oleh',
    'Status Laporan',
  ];

  const rows = reports.map((rep, idx) => {
    const ahliStr = rep.ahli_kumpulan?.map((a) => `${a.nama} [${a.jawatan}]`).join('; ') || '';
    const fokusStr = rep.fokus_perkongsian?.join('; ') || '';

    return [
      idx + 1,
      `"${rep.id}"`,
      `"${rep.nama_sekolah}"`,
      `"${rep.tarikh}"`,
      `"${rep.hari}"`,
      `"${rep.masa_mula}"`,
      `"${rep.masa_tamat}"`,
      rep.tempoh_jam || 1,
      `"${rep.tempat || ''}"`,
      `"${rep.panitia || ''}"`,
      `"${fokusStr.replace(/"/g, '""')}"`,
      rep.ahli_kumpulan?.length || 0,
      `"${ahliStr.replace(/"/g, '""')}"`,
      `"${rep.disediakan_oleh?.nama || ''}"`,
      `"${rep.disahkan_oleh?.nama || ''}"`,
      `"${rep.status.toUpperCase()}"`,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Rekod_Pelaporan_PLC_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
