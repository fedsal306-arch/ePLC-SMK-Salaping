import { LaporanPLC, StafSekolah, UserProfile } from '../types/plc';

const STORAGE_KEY_REPORTS = 'eplc_reports_v3';
const STORAGE_KEY_DRAFT = 'eplc_current_draft_v3';
const STORAGE_KEY_SCHOOL = 'eplc_school_info_v3';
const STORAGE_KEY_STAFF = 'eplc_staff_directory_v3';
const STORAGE_KEY_USER = 'eplc_current_user_v3';

export const SMK_SALAPING_LOGO = '/assets/aistudio/photo_6199221801112945872_y_2a2f7abc.jpg';

export interface SchoolInfo {
  nama_sekolah: string;
  logo_sekolah: string;
  alamat_sekolah: string;
  no_telefon: string;
  no_faks: string;
  email_sekolah: string;
  kod_sekolah: string;
}

export const DEFAULT_SCHOOL: SchoolInfo = {
  nama_sekolah: 'SMK Salaping, Kota Marudu',
  logo_sekolah: SMK_SALAPING_LOGO,
  alamat_sekolah: 'SMK Salaping, Beg Berkunci 18, 89108, Kota Marudu',
  no_telefon: '088-088661319',
  no_faks: '088661296',
  email_sekolah: 'xea5105@moe.edu.my',
  kod_sekolah: 'XEA5105',
};

export const NAMA_PENGETUA = 'Sanaleh bin Daud';
export const JAWATAN_PENGETUA = 'Pengetua, SMK Salaping';
export const NAMA_PK_HEM = 'Arman bin Aliamat';
export const JAWATAN_PK_HEM = 'Penolong Kanan HEM, SMK Salaping';

export const DEFAULT_STAFF: StafSekolah[] = [
  { id: 'staf-pengetua', nama: 'Sanaleh bin Daud', no_kp: '730514-12-5123', jawatan: 'Pengetua', panitia: 'Pengurusan & Pentadbiran' },
  { id: 'staf-arman', nama: 'Arman bin Aliamat', no_kp: '780912-12-5188', jawatan: 'Penolong Kanan HEM', panitia: 'Pengurusan & Pentadbiran' },
  { id: 'staf-1', nama: 'Cikgu Ahmad Farhan bin Ismail', no_kp: '860412-14-5541', jawatan: 'Guru Kanan Sains & Matematik', panitia: 'Sains' },
  { id: 'staf-2', nama: 'Puan Siti Nurhaliza binti Zulkifli', no_kp: '891005-10-5226', jawatan: 'Ketua Panitia Bahasa Melayu', panitia: 'Bahasa Melayu' },
  { id: 'staf-3', nama: 'Encik Mohd Razali bin Abdullah', no_kp: '840722-08-5933', jawatan: 'Setiausaha Transformasi HEM', panitia: 'Pendidikan Islam' },
  { id: 'staf-4', nama: 'Puan Lee Mei Ling', no_kp: '910214-14-5882', jawatan: 'Guru Cemerlang Bahasa Inggeris', panitia: 'Bahasa Inggeris' },
  { id: 'staf-5', nama: 'Ustazah Noraini binti Hashim', no_kp: '880315-03-5114', jawatan: 'Penolong Kanan Pentadbiran', panitia: 'Pentadbiran' },
  { id: 'staf-7', nama: 'Cikgu Farah Wahida binti Kamaruddin', no_kp: '930819-01-6022', jawatan: 'Guru Penyelaras Bestari / ICT', panitia: 'RBT & Sains Komputer' },
  { id: 'staf-8', nama: 'Cikgu Tan Wei Keat', no_kp: '921103-07-5671', jawatan: 'Ketua Panitia Matematik', panitia: 'Matematik' },
];

export const PRESET_TOPICS = [
  'Analisis Item & Skor Pentaksiran Bilik Darjah (PBD)',
  'Perkongsian Amalan Terbaik Pedagogi Abad Ke-21 (PAK-21)',
  'Penyediaan Modul Intervensi Murid Galus (Gagal Lulus)',
  'Integrasi Alat AI & Canva Digital dalam PdPc Interaktif',
  'Lesson Study: Pemantapan Konsep Pecahan Algebra',
  'Learning Walk: Penilaian Suasana Pembelajaran Kolaboratif',
  'Penulisan Rancangan Pengajaran Harian (RPH) Pendekatan Terbeza',
  'Peer Coaching: Teknik Penyoalan Aras Tinggi (KBAT)',
  'Penyelarasan Rubrik Ujian Akhir Sesi Akademik (UASA)',
  'Modul Pemulihan Membaca & Menulis Khas Murid TP1-TP2',
];

export const PRESET_VENUES = [
  'Bilik Mesyuarat Utama',
  'Bilik Gerakan PLC',
  'Pusat Sumber Sekolah (PSS)',
  'Makmal Komputer Bestari',
  'Makmal Sains 1',
  'Bilik Guru Kanan',
  'Bilik Seminar Bestari',
  'Bilik Kaunseling',
];

// Clean initial reports: Empty array for production readiness!
export const INITIAL_REPORTS: LaporanPLC[] = [];

export function getStoredReports(): LaporanPLC[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REPORTS);
    const school = getStoredSchool();
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify([]));
      return [];
    }
    const parsed: LaporanPLC[] = JSON.parse(raw);
    const migrated = parsed.map((r) => ({
      ...r,
      nama_sekolah: school.nama_sekolah,
      alamat_sekolah: school.alamat_sekolah,
      no_telefon: school.no_telefon,
      no_faks: school.no_faks,
      email_sekolah: school.email_sekolah,
      kod_sekolah: school.kod_sekolah,
    }));
    return migrated;
  } catch (e) {
    console.error('Failed to parse stored reports', e);
    return [];
  }
}

export function saveStoredReports(reports: LaporanPLC[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
  } catch (e) {
    console.error('Failed to save reports to localStorage', e);
  }
}

export function clearAllLocalData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_REPORTS);
    localStorage.removeItem(STORAGE_KEY_DRAFT);
  } catch (e) {
    console.error('Failed to clear data', e);
  }
}

export function getStoredSchool(): SchoolInfo {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SCHOOL);
    if (!raw) return DEFAULT_SCHOOL;
    const parsed = JSON.parse(raw);
    if (
      !parsed.nama_sekolah ||
      parsed.kod_sekolah === 'XEA5104' ||
      parsed.alamat_sekolah?.includes('Peti Surat 449') ||
      parsed.no_telefon === '088-661002' ||
      parsed.nama_sekolah.includes('BINTANG')
    ) {
      saveStoredSchool(DEFAULT_SCHOOL);
      return DEFAULT_SCHOOL;
    }
    return parsed;
  } catch {
    return DEFAULT_SCHOOL;
  }
}

export function saveStoredSchool(school: SchoolInfo): void {
  try {
    localStorage.setItem(STORAGE_KEY_SCHOOL, JSON.stringify(school));
  } catch (e) {
    console.error('Failed to save school info', e);
  }
}

export function getStoredStaff(): StafSekolah[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STAFF);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(DEFAULT_STAFF));
      return DEFAULT_STAFF;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_STAFF;
  }
}

export function saveStoredStaff(staff: StafSekolah[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(staff));
  } catch (e) {
    console.error('Failed to save staff directory', e);
  }
}

export function getSavedDraft(): Partial<LaporanPLC> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DRAFT);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveDraft(draft: Partial<LaporanPLC>): void {
  try {
    localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(draft));
  } catch (e) {
    console.error('Failed to save draft to localStorage', e);
  }
}

export function clearSavedDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_DRAFT);
  } catch (e) {
    console.error('Failed to clear draft', e);
  }
}

export function getCurrentUser(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) {
      const defaultUser: UserProfile = {
        nama: 'Cikgu Ahmad Farhan bin Ismail',
        email: 'farhan.ismail@moe-dl.edu.my',
        jawatan: 'Guru Kanan Sains & Matematik',
        peranan: 'guru',
        no_kp: '860412-14-5541',
        sekolah: 'SMK Salaping, Kota Marudu'
      };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(defaultUser));
      return defaultUser;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.sekolah || parsed.sekolah.includes('BINTANG')) {
      parsed.sekolah = 'SMK Salaping, Kota Marudu';
      saveCurrentUser(parsed);
    }
    return parsed;
  } catch {
    return {
      nama: 'Cikgu Ahmad Farhan bin Ismail',
      email: 'farhan.ismail@moe-dl.edu.my',
      jawatan: 'Guru Kanan Sains & Matematik',
      peranan: 'guru',
      no_kp: '860412-14-5541',
      sekolah: 'SMK Salaping, Kota Marudu'
    };
  }
}

export function saveCurrentUser(user: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save user', e);
  }
}
