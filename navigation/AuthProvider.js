import React, { createContext, useState, useEffect } from 'react';
import Toast from "react-native-toast-message";
import { EmailAuthProvider, updatePassword, reauthenticateWithCredential, getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { app } from '../firebase';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribeFromAuthStatusChanged = onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
            setUser(user);
        } else {
            // User is signed out
            setUser(null);
        }
    });
    return unsubscribeFromAuthStatusChanged;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login: async (navigation, email, password) => {
          try {
            await signInWithEmailAndPassword(auth, email, password);
            // navigation.navigate('Dashboard');
            
            Toast.show({
              type:'success',
              text1:'Login Successful!'
          })
          } catch (e) {
            Toast.show({
              type:'error',
              text1:'Incorrect email or password!'
          })
          }
        },
        changePassword: async(currentPassword, newPassword) => {
          var currentUser = auth.currentUser;
          var cred = EmailAuthProvider.credential(currentUser.email, currentPassword)
          reauthenticateWithCredential(currentUser, cred).then(() =>{
            updatePassword(currentUser, newPassword).then(() => {
              console.log("Password updated!")
            })
          })
        },
        register: async (email, password) => {
          try {
            await createUserWithEmailAndPassword(auth, email, password)
            .then(async() => {
              //Once the user creation has happened successfully, we can add the currentUser into firestore
              //with the appropriate details.
              Toast.show({
                type:'success',
                text1:'Register Successful!'
            })
            })
            //we need to catch the whole sign up process if it fails too.
            .catch(error => {
                console.log(error.code);
                switch(error.code){
                  case 'auth/invalid-email':
                    Toast.show({
                      type:'error',
                      text1:'Invalid Email!'
                  })
                    break;
                  case 'auth/email-already-in-use':
                    Toast.show({
                      type:'error',
                      text1:'Email is already in use!'
                  })
                    break;
                  case 'auth/weak-password':
                    Toast.show({
                      type:'error',
                      text1:'Weak Password',
                      text2: 'Password must be at least 6 characters or longer!'
                  })
                    break;
                  default:
                    Toast.show({
                      type:'error',
                      text1:'Unexpected Firebase Error',
                      text2: 'Error: ' + error
                  })
                  
                }             
            });
          } catch (e) {
            console.log(e);
          }
        },
        logout: async (navigation) => {
          try {
            await signOut(auth);
            Toast.show({
              type:'success',
              text1:'You have been succesfully logout!'
          })
          } catch (e) {
            console.log(e);
          }
        },
      }}>
      {children}
      <Toast />
    </AuthContext.Provider>
  );
};
