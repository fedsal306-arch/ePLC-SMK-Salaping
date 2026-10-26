export type PLCStatus = 'draf' | 'dihantar' | 'disahkan';

export interface AhliKumpulan {
  id: string;
  nama: string;
  no_kp: string; // ######-##-####
  jawatan: string; // cth: Guru Kanan Sains, Setiausaha Transformasi HEM, dsb.
}

export interface DisediakanOleh {
  nama: string;
  jawatan: string;
  tandatangan_digital: string | null; // Data URL
  tarikh_tandatangan: string;
}

export interface DisahkanOleh {
  nama: string;
  jawatan: string;
  tandatangan_digital: string | null;
  tarikh_pengesahan: string | null;
  catatan: string;
}

export interface GambarAktiviti {
  id: string;
  url: string; // Data URL or storage URL
  keterangan?: string;
  saiz?: string;
}

export interface LaporanPLC {
  id: string;
  // Maklumat Sekolah
  nama_sekolah: string;
  logo_sekolah: string;
  alamat_sekolah: string;
  no_telefon: string;
  no_faks: string;
  email_sekolah: string;
  kod_sekolah?: string;

  // Maklumat Sesi
  tajuk_sesi?: string;
  tempat: string;
  tarikh: string; // YYYY-MM-DD
  hari: string; // Isnin, Selasa, etc.
  masa_mula: string; // HH:MM
  masa_tamat: string; // HH:MM
  tempoh_jam: number; // auto-calculated, e.g. 1.5

  // Ahli Kumpulan
  ahli_kumpulan: AhliKumpulan[];

  // Pengisian PLC
  fokus_perkongsian: string[];
  interpretasi: string;
  hasil_refleksi: string;

  // Bukti Aktiviti & Tandatangan
  gambar_aktiviti: GambarAktiviti[];
  disediakan_oleh: DisediakanOleh;
  disahkan_oleh?: DisahkanOleh;

  // Metadata & Pengesahan Pengetua
  panitia?: string;
  nama_pengetua?: string;
  no_telefon_pengetua?: string;
  status: PLCStatus;
  created_at: string;
  updated_at: string;
  synced_online?: boolean;
}

export interface StafSekolah {
  id: string;
  nama: string;
  no_kp: string;
  jawatan: string;
  panitia?: string;
  email?: string;
}

export interface UserProfile {
  nama: string;
  email: string;
  jawatan: string;
  peranan: 'guru' | 'pentadbir';
  no_kp?: string;
  sekolah: string;
}

export type Language = 'ms' | 'en';
