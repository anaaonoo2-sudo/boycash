import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAwgUr4WOwRbZEyMonnfhUqyovieEVZJAY",
  authDomain: "boycash-dc4e4.firebaseapp.com",
  projectId: "boycash-dc4e4",
  storageBucket: "boycash-dc4e4.firebasestorage.app",
  messagingSenderId: "367328224851",
  appId: "1:367328224851:web:7668abe98d1a409b5cc8a6"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  GET = 'get',
  LIST = 'list',
  WRITE = 'write'
}

export const handleFirestoreError = (error: any, operation: OperationType, path?: string) => {
  console.error(`Firestore ${operation} error at ${path}:`, error);
  return error;
};
