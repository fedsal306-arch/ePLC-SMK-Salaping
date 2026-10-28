import { LaporanPLC } from '../types/plc';

const DB_NAME = 'eplc_db_v1';
const STORE_NAME = 'reports';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function getReportsFromIDB(): Promise<LaporanPLC[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => {
        const results = (request.result as LaporanPLC[]) || [];
        resolve(
          results.sort(
            (a, b) => new Date(b.created_at || b.tarikh).getTime() - new Date(a.created_at || a.tarikh).getTime()
          )
        );
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('IDB get failed, falling back to localStorage:', err);
    return [];
  }
}

export async function saveReportsToIDB(reports: LaporanPLC[]): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.clear();
      reports.forEach((report) => {
        store.put(report);
      });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.warn('IDB save failed:', err);
  }
}
