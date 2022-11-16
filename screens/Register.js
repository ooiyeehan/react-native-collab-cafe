import React, { useState } from "react";
import { SafeAreaView, ScrollView, Image, StyleSheet } from "react-native";
import 'react-native-get-random-values'
import Toast from 'react-native-toast-message';
import { v4 as uuidv4 } from 'uuid';
import styles from "./styles/styles"
import FSInputTextInput from "../components/FSInputTextInput";
import FSButton from "../components/FSButton";
import { firebase } from './firebase/config';

const Register = ({ navigation }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [contact, setContact] = useState("");
  
    const createUser = (u) => {

      try {
          if (isInputValid(u) === "OK"){
            const newUUID = uuidv4();
              firebase.auth().createUserWithEmailAndPassword(u.email, u.password).then((response) =>{
                const uid = response.user.uid;
                
                const cartsRef = firebase.firestore().collection('cart');
                
                console.log(newUUID);
                const newCart = {total_price:0,};
                cartsRef.add(newCart).then((response2) => {
                  const data = {
                    id: uid,
                    name:u.name,
                    profile_image: '',
                    contact_number: u.contact,
                    email: u.email,
                    user_type:'Customer',
                    point:'0',
                    status:'Active',
                    cartid:response2.id,
                };
                console.log("cart saved successfully")
                const usersRef = firebase.firestore().collection('user')
                  usersRef
                      .doc(uid)
                      .set(data)
                      .then(() => {
                          //Navigate to login screen code put here
                          showToast("info","Your account has been successfully created.");
                          firebase.auth().signOut()
                          navigation.navigate('Login')
                      })
                })
                           
              }).catch((error) => {
                if (error.code === 'auth/email-already-in-use'){
                  showToast("error","Email is already used by another user");
                }
                
              });
          }else{
              showToast("error", isInputValid(u));
              console.log(isInputValid(u))
          }
          
      } catch (error) {
        console.log(error)
      }
    };

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView>    
          <Image
          style={styles.tinyLogo}
          source={require('../assets/logo.png')}
          />
          <FSInputTextInput placeholder="Name" 
            value={name} 
            onChangeText={setName} 
          />
          <FSInputTextInput
            placeholder="Contact"
            keyboardType='numeric'
            value={contact}
            onChangeText={setContact}
          />
          <FSInputTextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <FSInputTextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secured={true}
          />
          <FSInputTextInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secured={true}
          />
          
        </ScrollView>
        <FSButton
            title="Sign Up"
            style={stylesInternal.btnRegister}
            onPress={() => {
              const user = {
                name: name,
                email: email,
                password: password,
                confirmPassword: confirmPassword,
                contact: contact,
              };

              createUser(user);
            }}
          />
      </SafeAreaView>
    );

    
  };

  const isInputValid = (u) =>{
    if (u.name === "" || u.contact === "" || u.password === "" || u.confirmPassword === "" || u.email === ""){
        return "All the field could not be blanks"
    }
    const nameRegex = /^[a-zA-Z ]{2,30}$/;
    const phoneRegex = /^[+]?[0-9]{10,13}$/;
    const emailRegx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (nameRegex.test(u.name) === false){
        return "Name given is not valid";
    }

    if (phoneRegex.test(u.contact)  === false){
        return "Phone number given is not valid";
    }

    if (emailRegx.test(u.email)  === false){
        return "Email Address given is not valid";
    }

    if (u.password !== u.confirmPassword){
      return "Passwords are not matched";
    }

    return "OK";
  };


  const showToast = (typemsg, title1) => {
    Toast.show({
      type: typemsg,
      text1: title1,
    });
  }

  const stylesInternal = StyleSheet.create({
    btnRegister:{
      marginBottom:15
    }
  });

  export default Register;