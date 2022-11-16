import React, { useContext, useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { app, firestore } from '../firebase';
import { AuthContext } from './AuthProvider';
import AuthStack from './AuthStack';
import AppStackCustomer from './AppStackCustomer';
import AppStackStaff from './AppStackStaff'

const Router = () => {

    const {user, setUser} = useContext(AuthContext);
    const [userData, setUserData] = useState()
    const [initializing, setInitializing] = useState(true);
    const auth = getAuth(app);
  
    useEffect(() => {
      const unsubscribeFromAuthStatusChanged = onAuthStateChanged(auth, async (user) => {
          if (user) {
              // User is signed in, see docs for a list of available properties
              // https://firebase.google.com/docs/reference/js/firebase.User
              setUser(user);
              const docRef = doc(firestore, "user", user.uid)
              const docSnap = await getDoc(docRef)
              if(docSnap.exists) {
                setUserData(docSnap.data())
              }

              if (initializing) setInitializing(false);
          } else {
              // User is signed out
              setUser(null);
              if (initializing) setInitializing(false);
          }
      });
      return unsubscribeFromAuthStatusChanged;
    }, []);
  
    if (initializing) return null;

  return (
    <NavigationContainer>
      {
      user && userData ? // If user is logged in and user is found in firestore database
      userData.user_type == "Customer" ? // If user is Customer
      <AppStackCustomer /> : // Use AppStackCustomer (Cart, Order, Dashboard, Menu, Profile)
      userData.user_type == "Staff" || userData.user_type == "Manager" ? // Else If user is Staff or Manager
      <AppStackStaff /> : // Use AppStackStaff (Order, Management, Profile)
      <AuthStack /> : // Else if user is not staff, manager or Customer, use AuthStack (Login, Signup)
      <AuthStack /> // Else if user not logged in and user is not found in firestore database, use AuthStack (Login, Signup)
      } 
    </NavigationContainer>
  );
};

export default Router;
