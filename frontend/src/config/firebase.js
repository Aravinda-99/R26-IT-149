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
    apiKey: "AIzaSyAMPxVjR2_lXTe5iZiPl6G0RSxZIR8Cb88",
    authDomain: "research-project-7247c.firebaseapp.com",
    projectId: "research-project-7247c",
    storageBucket: "research-project-7247c.firebasestorage.app",
    messagingSenderId: "905117548022",
    appId: "1:905117548022:web:3edfa08c1501a5f5a1dbd7",
    measurementId: "G-GZVKWHK6GZ",
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
