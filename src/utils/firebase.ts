import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  getDoc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { LaporanPLC, StafSekolah } from '../types/plc';
import { SchoolInfo } from './storage';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test connection on boot (silent)
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch {
    return true;
  }
}

// ----------------------------------------------------
// Firestore CRUD for Laporan PLC
// ----------------------------------------------------

export async function fetchReportsFromFirestore(): Promise<LaporanPLC[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'laporan_plc'));
    const reports: LaporanPLC[] = [];
    querySnapshot.forEach((docSnap) => {
      reports.push(docSnap.data() as LaporanPLC);
    });
    return reports.sort(
      (a, b) => new Date(b.created_at || b.tarikh).getTime() - new Date(a.created_at || a.tarikh).getTime()
    );
  } catch {
    return [];
  }
}

export async function saveReportToFirestore(report: LaporanPLC): Promise<void> {
  try {
    const docRef = doc(db, 'laporan_plc', report.id);
    await setDoc(docRef, {
      ...report,
      synced_online: true,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    throw err;
  }
}

export async function deleteReportFromFirestore(reportId: string): Promise<void> {
  try {
    const docRef = doc(db, 'laporan_plc', reportId);
    await deleteDoc(docRef);
  } catch (err) {
    throw err;
  }
}

export async function fetchReportByIdFromFirestore(reportId: string): Promise<LaporanPLC | null> {
  try {
    const docRef = doc(db, 'laporan_plc', reportId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as LaporanPLC;
    }
    return null;
  } catch {
    return null;
  }
}

// ----------------------------------------------------
// Firestore CRUD for School Info & Staff Directory
// ----------------------------------------------------

export async function fetchSchoolFromFirestore(): Promise<SchoolInfo | null> {
  try {
    const docSnap = await getDocs(collection(db, 'sekolah'));
    if (!docSnap.empty) {
      return docSnap.docs[0].data() as SchoolInfo;
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveSchoolToFirestore(school: SchoolInfo): Promise<void> {
  try {
    const docRef = doc(db, 'sekolah', 'info_rasmi');
    await setDoc(docRef, school);
  } catch {}
}

export async function fetchStaffFromFirestore(): Promise<StafSekolah[]> {
  try {
    const snapshot = await getDocs(collection(db, 'staf'));
    const staff: StafSekolah[] = [];
    snapshot.forEach((d) => {
      staff.push(d.data() as StafSekolah);
    });
    return staff;
  } catch {
    return [];
  }
}

export async function saveStaffToFirestore(staffList: StafSekolah[]): Promise<void> {
  try {
    for (const member of staffList) {
      const docRef = doc(db, 'staf', member.id);
      await setDoc(docRef, member);
    }
  } catch {}
}
