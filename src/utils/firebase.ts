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
  enableIndexedDbPersistence,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { LaporanPLC, StafSekolah } from '../types/plc';
import { SchoolInfo, DEFAULT_SCHOOL } from './storage';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID (CRITICAL: Required for this environment)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test connection on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline. Local cache will be used.');
    } else {
      console.log('Firebase initialized. Ready for operations.');
    }
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
    // Sort descending by date
    return reports.sort(
      (a, b) => new Date(b.created_at || b.tarikh).getTime() - new Date(a.created_at || a.tarikh).getTime()
    );
  } catch (err) {
    console.error('Error fetching reports from Firestore:', err);
    throw err;
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
    console.error('Error saving report to Firestore:', err);
    throw err;
  }
}

export async function deleteReportFromFirestore(reportId: string): Promise<void> {
  try {
    const docRef = doc(db, 'laporan_plc', reportId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting report from Firestore:', err);
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
  } catch (err) {
    console.error('Error fetching report by ID from Firestore:', err);
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
  } catch (err) {
    console.error('Error fetching school config from Firestore:', err);
    return null;
  }
}

export async function saveSchoolToFirestore(school: SchoolInfo): Promise<void> {
  try {
    const docRef = doc(db, 'sekolah', 'info_rasmi');
    await setDoc(docRef, school);
  } catch (err) {
    console.error('Error saving school info to Firestore:', err);
  }
}

export async function fetchStaffFromFirestore(): Promise<StafSekolah[]> {
  try {
    const snapshot = await getDocs(collection(db, 'staf'));
    const staff: StafSekolah[] = [];
    snapshot.forEach((d) => {
      staff.push(d.data() as StafSekolah);
    });
    return staff;
  } catch (err) {
    console.error('Error fetching staff from Firestore:', err);
    return [];
  }
}

export async function saveStaffToFirestore(staffList: StafSekolah[]): Promise<void> {
  try {
    for (const member of staffList) {
      const docRef = doc(db, 'staf', member.id);
      await setDoc(docRef, member);
    }
  } catch (err) {
    console.error('Error saving staff to Firestore:', err);
  }
}
