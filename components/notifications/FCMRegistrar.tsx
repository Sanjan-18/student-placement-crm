"use client";

import { useEffect } from "react";

export default function FCMRegistrar() {
  useEffect(() => {
    async function registerFCM() {
      try {
        if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        const firebaseConfig = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        };
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey || !firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.messagingSenderId || !firebaseConfig.appId) return;

        const { initializeApp, getApps } = await import("firebase/app");
        const { getMessaging, getToken } = await import("firebase/messaging");
        const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        await navigator.serviceWorker.ready;
        const messaging = getMessaging(app);
        const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });

        if (!token) return;
        await fetch("/api/notifications/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, deviceType: "WEB" }),
        });
      } catch (error) {
        console.warn("FCM registration skipped", error);
      }
    }
    registerFCM();
  }, []);
  return null;
}
