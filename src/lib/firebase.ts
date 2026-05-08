import { initializeApp, setLogLevel } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

setLogLevel('error');

const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {});
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
