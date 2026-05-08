import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {});
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  READ = 'read',
  WRITE = 'write'
}

export const handleFirestoreError = (error: any, operation: OperationType) => {
  console.error(`Firestore ${operation} error:`, error);
  return error;
};
