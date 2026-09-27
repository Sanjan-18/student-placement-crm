import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getMessaging, type Messaging } from "firebase-admin/messaging";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

function getFirebaseAdmin(): { app: App | null; messaging: Messaging | null } {
  if (getApps().length > 0) {
    const app = getApps()[0];
    return { app, messaging: getMessaging(app) };
  }
  if (projectId && clientEmail && privateKey) {
    try {
      const app = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
      return { app, messaging: getMessaging(app) };
    } catch (err) {
      console.warn("Failed to initialize Firebase Admin:", err);
      return { app: null, messaging: null };
    }
  }
  return { app: null, messaging: null };
}

const adminInstance = getFirebaseAdmin();
export const firebaseAdminApp = adminInstance.app;
export const firebaseMessaging = adminInstance.messaging;

