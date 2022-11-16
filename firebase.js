// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import 'firebase/compat/auth';
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGJYVysnLpaxGhCzsPz2nOvAhenIAsgfQ",
  authDomain: "react-native-cafe-fe8ea.firebaseapp.com",
  projectId: "react-native-cafe-fe8ea",
  storageBucket: "react-native-cafe-fe8ea.appspot.com",
  messagingSenderId: "1030661822847",
  appId: "1:1030661822847:web:0369864cafccb190eba24a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export {app}
export const firestore = getFirestore()