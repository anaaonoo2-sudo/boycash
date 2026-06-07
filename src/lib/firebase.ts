/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import { initializeApp, setLogLevel } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

setLogLevel('error');

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export enum OperationType {
  WRITE = 'write',
  GET = 'get',
  LIST = 'list'
}

export function handleFirestoreError(error: any, op: OperationType, path: string | null) {
  console.error(`Error ${op} at ${path}:`, error);
}
