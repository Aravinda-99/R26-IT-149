/**
 * Firebase Configuration
 * ======================
 * Uses Firebase v10 modular SDK (installed via npm).
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDaUfEr5IumQL3gL8ihU52XsRvJcuFDNjM",
    authDomain: "codequest-166ca.firebaseapp.com",
    projectId: "codequest-166ca",
    storageBucket: "codequest-166ca.firebasestorage.app",
    messagingSenderId: "286274866379",
    appId: "1:286274866379:web:a8ee3c7b5a765c949a5f4e",
    measurementId: "G-MYMRH59MQN"
};

let app, auth, db, analytics;

export function initFirebase() {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        analytics = getAnalytics(app);
        console.log("[OK] Firebase initialized");
    } catch (error) {
        console.warn("[WARN] Firebase init failed:", error.message);
    }
}

export { app, auth, db, analytics };
