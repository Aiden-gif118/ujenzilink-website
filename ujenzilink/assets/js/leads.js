import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyD_n3Plzf7nx_AiwLEzCf5EgsGARtpHqDM",
  authDomain: "ujenzilink-f60c5.firebaseapp.com",
  projectId: "ujenzilink-f60c5",
  storageBucket: "ujenzilink-f60c5.firebasestorage.app",
  messagingSenderId: "406394005237",
  appId: "1:406394005237:web:f5bd425c8f8a68618c07bc"
});
const db = getFirestore(app);

export function saveLead(lead) {
  return addDoc(collection(db, "leads"), Object.assign({}, lead, {
    status: "New",
    notes: "",
    createdAt: serverTimestamp()
  }));
}