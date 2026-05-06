// ─── FIREBASE CONFIG ───────────────────────────────────────────────────────────────
// Usando Firebase v8 compat (CDN) para funcionar com scripts globais
// sem necessidade de bundler ou type=module

// Os scripts do Firebase v8 são carregados no index.html via CDN
// e ficam disponíveis como firebase.firestore() globalmente

const firebaseConfig = {
  apiKey: "AIzaSyCi2G_wS4PXiupQnBBXX8NWjojHNq40Kfc",
  authDomain: "casaclean-bf843.firebaseapp.com",
  projectId: "casaclean-bf843",
  storageBucket: "casaclean-bf843.firebasestorage.app",
  messagingSenderId: "515255870782",
  appId: "1:515255870782:web:f32514ae8b9baf6194386f"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
