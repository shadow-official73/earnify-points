import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, getDocs, deleteDoc, where, orderBy } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDsNlbQOsOl9WH1SNHJsuq5FAsNvE1pPvU",
  authDomain: "shadow-7340.firebaseapp.com",
  projectId: "shadow-7340",
  storageBucket: "shadow-7340.firebasestorage.app",
  messagingSenderId: "105861964193",
  appId: "1:105861964193:web:f46be6e06d17d78008abe0",
  measurementId: "G-DLC54GCYT0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Phone Auth helpers
export function setupRecaptcha(elementId: string): RecaptchaVerifier {
  const verifier = new RecaptchaVerifier(auth, elementId, {
    size: "invisible",
  });
  return verifier;
}

export async function sendOTP(phoneNumber: string, recaptchaVerifier: RecaptchaVerifier): Promise<ConfirmationResult> {
  return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
}

// Firestore helpers
export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

export async function createUserProfile(uid: string, phone: string) {
  const today = new Date().toISOString().split("T")[0];
  await setDoc(doc(db, "users", uid), {
    phone,
    name: "User",
    avatar: null,
    points: 0,
    miningActive: false,
    miningSecondsToday: 0,
    pointsAwardedToday: 0,
    lastResetDate: today,
    miningStartTimestamp: null,
    daysActive: 1,
    firstUseDate: today,
    banned: false,
    createdAt: new Date().toISOString(),
  });
}

export async function updateUserProfile(uid: string, data: Record<string, any>) {
  await updateDoc(doc(db, "users", uid), data);
}

// Roles
export async function getUserRole(uid: string): Promise<string> {
  const snap = await getDoc(doc(db, "user_roles", uid));
  return snap.exists() ? snap.data().role : "user";
}

export async function setUserRole(uid: string, role: string) {
  await setDoc(doc(db, "user_roles", uid), { role, updatedAt: new Date().toISOString() });
}

// Admin: get all users
export async function getAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  const users: any[] = [];
  snap.forEach((d) => users.push({ id: d.id, ...d.data() }));
  return users;
}

export async function deleteUserData(uid: string) {
  await deleteDoc(doc(db, "users", uid));
  await deleteDoc(doc(db, "user_roles", uid));
}

// Recharge history
export async function addRechargeRecord(uid: string, number: string, points: number) {
  const id = Date.now().toString();
  await setDoc(doc(db, "users", uid, "recharges", id), {
    date: new Date().toISOString(),
    number,
    points,
  });
}

export async function getRechargeHistory(uid: string) {
  const snap = await getDocs(collection(db, "users", uid, "recharges"));
  const records: any[] = [];
  snap.forEach((d) => records.push({ id: d.id, ...d.data() }));
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
