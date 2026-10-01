import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
export const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass databaseId
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Google Sign-In with Firebase Auth
export async function signInWithGooglePopup() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Firebase Google Sign-In Error:', error);
    throw error;
  }
}

// Sign Out
export async function firebaseSignOut() {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Firebase Sign-Out Error:', error);
  }
}

// Save user data to Firestore
export async function saveUserToFirestore(userId: string, data: any) {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...data,
      id: userId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving user to Firestore:', err);
    handleFirestoreError(err, OperationType.WRITE, `users/${userId}`);
  }
}

// Load user data from Firestore
export async function getUserFromFirestore(userId: string) {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.error('Error getting user from Firestore:', err);
    handleFirestoreError(err, OperationType.GET, `users/${userId}`);
  }
}

// Save transaction to Firestore sub-collection
export async function saveTransactionToFirestore(userId: string, transaction: any) {
  try {
    const txRef = doc(db, 'users', userId, 'transactions', transaction.id);
    await setDoc(txRef, {
      ...transaction,
      userId,
      savedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving transaction to Firestore:', err);
    handleFirestoreError(err, OperationType.WRITE, `users/${userId}/transactions/${transaction.id}`);
  }
}

// Get user transactions from Firestore
export async function getUserTransactionsFromFirestore(userId: string) {
  try {
    const txCol = collection(db, 'users', userId, 'transactions');
    const snap = await getDocs(txCol);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('Error fetching transactions from Firestore:', err);
    handleFirestoreError(err, OperationType.LIST, `users/${userId}/transactions`);
  }
}

// Validate connection
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore is offline or initializing.');
    }
  }
}
