import { Language } from '../types/plc';

export const translations = {
  ms: {
    app_title: 'e-PLC',
    app_subtitle: 'Sistem Pelaporan PLC Digital Sekolah',
    school_sharing_session: 'Borang Sesi Perkongsian Guru (PLC)',
    tagline: 'Lapor pantas, jimat masa, format rasmi KPM',
    
    // Nav & Common
    nav_dashboard: 'Papan Pemuka',
    nav_reports: 'Senarai Laporan',
    nav_new_report: 'Isi Laporan Baru',
    nav_school_settings: 'Maklumat Sekolah',
    nav_staff: 'Senarai Guru',
    role_teacher: 'Guru',
    role_admin: 'Pentadbir / PK',
    role_switch_hint: 'Tukar peranan untuk uji capaian pengesahan atau semakan',
    online: 'Dalam Talian',
    offline: 'Luar Talian',
    sync_needed: 'Draf disimpan tempatan - sedia disegerakkan',
    search_placeholder: 'Cari tajuk, tempat, atau nama ahli...',
    filter_all: 'Semua Status',
    filter_draft: 'Draf',
    filter_submitted: 'Dihantar',
    filter_verified: 'Disahkan',
    date_from: 'Dari Tarikh',
    date_to: 'Hingga Tarikh',
    no_reports_found: 'Tiada laporan PLC ditemui.',
    create_first_report: 'Cipta Laporan PLC Pertama',
    
    // Status
    status_draft: 'Draf',
    status_submitted: 'Dihantar',
    status_verified: 'Telah Disahkan',

    // Wizard Steps
    step1_title: 'Maklumat Asas',
    step1_desc: 'Tempat, tarikh, & masa sesi PLC dijalankan',
    step2_title: 'Ahli Kumpulan',
    step2_desc: 'Senarai guru yang menyertai sesi perkongsian',
    step3_title: 'Fokus Perkongsian',
    step3_desc: 'Topik utama & agenda perbincangan',
    step4_title: 'Interpretasi & Refleksi',
    step4_desc: 'Impak pembelajaran murid & profesionalisme',
    step5_title: 'Gambar Aktiviti',
    step5_desc: 'Muat naik minima 1 bukti bergambar aktiviti',
    step6_title: 'Pengesahan & Tandatangan',
    step6_desc: 'Tandatangan digital pelapor & hantar',

    // Step 1 Labels
    school_name: 'Nama Sekolah',
    venue: 'Tempat Sesi PLC',
    venue_placeholder: 'Cth: Bilik Gerakan / Makmal Komputer 1',
    date: 'Tarikh Sesi',
    day: 'Hari',
    start_time: 'Masa Mula',
    end_time: 'Masa Tamat',
    duration: 'Tempoh Masa',
    duration_unit: 'jam',
    panitia_label: 'Panitia / Unit (Pilihan)',

    // Step 2 Labels
    members_list: 'Senarai Ahli Kumpulan PLC',
    add_member: 'Tambah Ahli',
    pick_from_directory: 'Pilih Dari Direktori Guru',
    member_name: 'Nama Penuh Guru',
    member_ic: 'No. Kad Pengenalan',
    member_ic_hint: 'Format 12 digit (######-##-####)',
    member_role: 'Jawatan / Bidang',
    member_role_placeholder: 'Cth: Guru Kanan Sains / KP Matematik',
    remove_member: 'Padam Ahli',

    // Step 3 Labels
    focus_heading: 'Fokus & Tajuk Perkongsian',
    add_focus_item: 'Tambah Fokus Perkongsian',
    focus_quick_select: 'Cadangan Topik Pantas (Klik untuk tambah):',
    focus_placeholder: 'Nyatakan fokus perkongsian...',

    // Step 4 Labels
    interpretation_heading: 'Interpretasi',
    interpretation_sub: 'Aspek penting / relevan dan impak kepada pembelajaran murid',
    interpretation_guidance: 'Soalan Panduan: Apakah isu/amalan yang dibincangkan? Bagaimanakah ia membantu meningkatkan kefahaman atau motivasi murid?',
    reflection_heading: 'Hasil Refleksi',
    reflection_sub: 'Apa yang dipelajari dan kesan kepada peningkatan profesionalisme diri',
    reflection_guidance: 'Soalan Panduan: Apakah kemahiran/ilmu baharu yang guru peroleh? Apakah tindakan susulan yang akan diaplikasikan di dalam bilik darjah?',

    // Step 5 Labels
    photos_heading: 'Gambar Aktiviti PLC (Wajib)',
    take_photo: 'Buka Kamera Peranti',
    upload_photo: 'Pilih Dari Galeri',
    photo_requirement: 'Minima 1 gambar aktiviti PLC. Gambar akan dimampatkan secara automatik (< 1MB) demi kelajuan data.',
    photo_caption_placeholder: 'Keterangan gambar (pilihan)...',
    remove_photo: 'Padam',

    // Step 6 Labels
    signature_heading: 'Tandatangan Digital Pelapor',
    sign_prompt: 'Lukis tandatangan di bawah menggunakan jari atau tetikus:',
    clear_signature: 'Padam & Lukis Semula',
    prepared_by: 'Disediakan Oleh',
    reporter_name: 'Nama Pelapor',
    reporter_role: 'Jawatan Pelapor',
    admin_verification_note: 'Laporan ini akan dihantar kepada Penolong Kanan / Pentadbir untuk pengesahan rasmi.',

    // Actions
    btn_next: 'Seterusnya',
    btn_back: 'Kembali',
    btn_save_draft: 'Simpan Draf',
    btn_submit_report: 'Hantar Laporan Rasmi',
    btn_download_pdf: 'Muat Turun PDF Rasmi',
    btn_print: 'Cetak Laporan',
    btn_share_whatsapp: 'Kongsi via WhatsApp',
    btn_verify: 'Sahkan Laporan Ini',
    btn_export_excel: 'Eksport ke Excel (SKPMg2)',
    btn_install_pwa: 'Pasang Aplikasi (PWA)',

    // Alerts & Notifications
    alert_auto_saved: 'Draf disimpan secara automatik pada',
    alert_submit_success: 'Laporan PLC telah berjaya dihantar!',
    alert_verify_success: 'Laporan telah disahkan oleh pentadbir.',
    alert_validation_error: 'Sila lengkapkan semua medan wajib sebelum menghantar.',
    alert_min_photo: 'Sila muat naik sekurang-kurangnya 1 gambar aktiviti!',
    alert_min_signature: 'Sila tandatangan laporan sebelum menghantar!',
    alert_min_member: 'Sila masukkan sekurang-kurangnya 1 ahli kumpulan PLC!',
  },
  en: {
    app_title: 'e-PLC',
    app_subtitle: 'Digital School PLC Reporting System',
    school_sharing_session: 'Teacher Sharing Session Form (PLC)',
    tagline: 'Fast reporting, time-saving, official school format',
    
    // Nav & Common
    nav_dashboard: 'Dashboard',
    nav_reports: 'Reports List',
    nav_new_report: 'New PLC Report',
    nav_school_settings: 'School Details',
    nav_staff: 'Teachers Directory',
    role_teacher: 'Teacher',
    role_admin: 'Admin / Senior Assistant',
    role_switch_hint: 'Switch roles to test admin verification or teacher submission',
    online: 'Online',
    offline: 'Offline',
    sync_needed: 'Draft saved locally - ready to sync',
    search_placeholder: 'Search topic, venue, or member name...',
    filter_all: 'All Statuses',
    filter_draft: 'Draft',
    filter_submitted: 'Submitted',
    filter_verified: 'Verified',
    date_from: 'From Date',
    date_to: 'To Date',
    no_reports_found: 'No PLC reports found.',
    create_first_report: 'Create First PLC Report',

    // Status
    status_draft: 'Draft',
    status_submitted: 'Submitted',
    status_verified: 'Verified',

    // Wizard Steps
    step1_title: 'Basic Info',
    step1_desc: 'Venue, date, and time of the PLC session',
    step2_title: 'Team Members',
    step2_desc: 'List of participating teachers',
    step3_title: 'Sharing Focus',
    step3_desc: 'Main topics and discussion agenda',
    step4_title: 'Interpretation & Reflection',
    step4_desc: 'Student learning impact & professionalism',
    step5_title: 'Activity Photos',
    step5_desc: 'Upload at least 1 activity photo evidence',
    step6_title: 'Verification & Signature',
    step6_desc: 'Digital signature and official submission',

    // Step 1 Labels
    school_name: 'School Name',
    venue: 'PLC Session Venue',
    venue_placeholder: 'e.g., Meeting Room / Computer Lab 1',
    date: 'Session Date',
    day: 'Day',
    start_time: 'Start Time',
    end_time: 'End Time',
    duration: 'Duration',
    duration_unit: 'hours',
    panitia_label: 'Department / Unit (Optional)',

    // Step 2 Labels
    members_list: 'PLC Group Members List',
    add_member: 'Add Member',
    pick_from_directory: 'Select from Staff Directory',
    member_name: 'Teacher Full Name',
    member_ic: 'Identity Card Number (IC)',
    member_ic_hint: '12-digit format (######-##-####)',
    member_role: 'Designation / Subject',
    member_role_placeholder: 'e.g., Senior Science Teacher / Head of Math',
    remove_member: 'Remove Member',

    // Step 3 Labels
    focus_heading: 'Focus & Discussion Topics',
    add_focus_item: 'Add Discussion Focus',
    focus_quick_select: 'Quick Topic Suggestions (Click to add):',
    focus_placeholder: 'State sharing focus point...',

    // Step 4 Labels
    interpretation_heading: 'Interpretation',
    interpretation_sub: 'Key relevant aspects & direct impact on student learning',
    interpretation_guidance: 'Guiding Question: What instructional issue was addressed? How will it improve student understanding or engagement?',
    reflection_heading: 'Reflection Output',
    reflection_sub: 'Key takeaways and impact on teaching professionalism',
    reflection_guidance: 'Guiding Question: What new pedagogical insight was acquired? What next pedagogical step will be implemented in class?',

    // Step 5 Labels
    photos_heading: 'PLC Activity Photos (Required)',
    take_photo: 'Open Device Camera',
    upload_photo: 'Select From Gallery',
    photo_requirement: 'At least 1 photo is required. Images are automatically compressed (< 1MB) for fast mobile upload.',
    photo_caption_placeholder: 'Photo description (optional)...',
    remove_photo: 'Delete',

    // Step 6 Labels
    signature_heading: 'Reporter Digital Signature',
    sign_prompt: 'Draw your signature below using touch finger or mouse:',
    clear_signature: 'Clear & Redraw',
    prepared_by: 'Prepared By',
    reporter_name: 'Reporter Name',
    reporter_role: 'Reporter Designation',
    admin_verification_note: 'This report will be forwarded to the School Administrator for official endorsement.',

    // Actions
    btn_next: 'Next Step',
    btn_back: 'Back',
    btn_save_draft: 'Save Draft',
    btn_submit_report: 'Submit Official Report',
    btn_download_pdf: 'Download Official PDF',
    btn_print: 'Print Report',
    btn_share_whatsapp: 'Share via WhatsApp',
    btn_verify: 'Endorse & Verify Report',
    btn_export_excel: 'Export to Excel (Audit)',
    btn_install_pwa: 'Install App (PWA)',

    // Alerts & Notifications
    alert_auto_saved: 'Draft auto-saved at',
    alert_submit_success: 'PLC report submitted successfully!',
    alert_verify_success: 'Report endorsed by school administrator.',
    alert_validation_error: 'Please fill in all required fields before submitting.',
    alert_min_photo: 'Please upload at least 1 activity photo!',
    alert_min_signature: 'Please provide a digital signature before submitting!',
    alert_min_member: 'Please add at least 1 group member!',
  }
};

export function getDayName(dateString: string, lang: Language = 'ms'): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  if (lang === 'ms') {
    const daysMs = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
    return daysMs[date.getDay()];
  } else {
    const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return daysEn[date.getDay()];
  }
}

export function calculateDuration(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 1.0;
  const [h1, m1] = startTime.split(':').map(Number);
  const [h2, m2] = endTime.split(':').map(Number);
  
  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return 1.0;
  
  let diffMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (diffMinutes < 0) diffMinutes += 24 * 60; // crossover
  if (diffMinutes <= 0) return 1.0;
  
  return Number((diffMinutes / 60).toFixed(1));
}

export function formatIC(value: string): string {
  // Clean non-digits
  const digits = value.replace(/\D/g, '').slice(0, 12);
  if (digits.length <= 6) return digits;
  if (digits.length <= 8) return `${digits.slice(0, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 12)}`;
}

export function maskICForDisplay(ic: string): string {
  if (!ic) return '';
  const clean = ic.trim();
  if (clean.length < 12) return clean;
  // Mask middle and some digits e.g. 850312-08-**** for PDPA compliance
  const parts = clean.split('-');
  if (parts.length === 3) {
    return `${parts[0]}-${parts[1]}-****`;
  }
  return clean.slice(0, 8) + '****';
}
