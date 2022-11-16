import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCGJYVysnLpaxGhCzsPz2nOvAhenIAsgfQ",
    authDomain: "react-native-cafe-fe8ea.firebaseapp.com",
    projectId: "react-native-cafe-fe8ea",
    storageBucket: "react-native-cafe-fe8ea.appspot.com",
    messagingSenderId: "1030661822847",
    appId: "1:1030661822847:web:0369864cafccb190eba24a"
};

if (!firebase.apps.length) 
{
    firebase.initializeApp(firebaseConfig)
  } else {
    firebase.app()
  }
 
export { firebase };
