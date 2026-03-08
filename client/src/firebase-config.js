// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBM81FBSm0Y91HER_2iUEUq6Wwyjh5xsVU",
  authDomain: "sp-app-a5722.firebaseapp.com",
  projectId: "sp-app-a5722",
  storageBucket: "sp-app-a5722.firebasestorage.app",
  messagingSenderId: "121507250889",
  appId: "1:121507250889:web:29546eac5375f327e54318",
  measurementId: "G-4HPVMLD6Y3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);

export default app;