// ─── FIREBASE CONFIG ─────────────────────────────────────────────────────────
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getStorage, ref, uploadString, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js';

const firebaseConfig = {
  apiKey: "AIzaSyCi2G_wS4PXiupQnBBXX8NWjojHNq40Kfc",
  authDomain: "casaclean-bf843.firebaseapp.com",
  projectId: "casaclean-bf843",
  storageBucket: "casaclean-bf843.firebasestorage.app",
  messagingSenderId: "515255870782",
  appId: "1:515255870782:web:f32514ae8b9baf6194386f"
};

const app = initializeApp(firebaseConfig);
export const db  = getFirestore(app);
export const storage = getStorage(app);

export { doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs, query, orderBy, ref, uploadString, getDownloadURL };
