// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhRSGNQedo2dr5eJehbCgqVfWO0YaBsfo",
  authDomain: "my-pantry-application.firebaseapp.com",
  projectId: "my-pantry-application",
  storageBucket: "my-pantry-application.appspot.com",
  messagingSenderId: "703968924062",
  appId: "1:703968924062:web:95b53c8d260c3f813d068f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app)

export {firestore}