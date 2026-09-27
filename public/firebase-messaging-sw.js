/* Firebase Cloud Messaging service worker */
importScripts("https://www.gstatic.com/firebasejs/11.0.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey:"YOUR_API_KEY",
  authDomain:"YOUR_PROJECT.firebaseapp.com",
  projectId:"YOUR_PROJECT_ID",
  messagingSenderId:"YOUR_MESSAGING_SENDER_ID",
  appId:"YOUR_APP_ID"
});

const messaging=firebase.messaging();

messaging.onBackgroundMessage((payload)=>{
  const title=payload.notification?.title||"Placement CRM";
  const options={body:payload.notification?.body||"You have a new notification.",icon:"/icon-192.png"};
  self.registration.showNotification(title,options);
});
