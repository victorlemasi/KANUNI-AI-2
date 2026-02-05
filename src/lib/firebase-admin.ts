import admin from "firebase-admin";

const isConfigured = process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY;

if (!admin.apps.length) {
    if (isConfigured) {
        // Handle private key formatting (newlines)
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/"/g, '');

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
        });
    } else {
        console.warn("Firebase Admin not configured. Saving will fail. Please provide Service Account credentials.");
    }
}

const adminDb = admin.apps.length ? admin.firestore() : {} as FirebaseFirestore.Firestore;
const adminAuth = admin.apps.length ? admin.auth() : {} as admin.auth.Auth;

export { adminDb, adminAuth };
