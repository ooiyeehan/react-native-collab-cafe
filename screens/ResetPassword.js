import React, { useState } from 'react';
import { Text, TextInput, View, Image , TouchableOpacity} from 'react-native';
import Toast from 'react-native-toast-message';
import { sendPasswordResetEmail } from "firebase/auth";
import styles from '../styles';
import { auth } from "../helpers/Firebase";


export default function App() {

const [email, setEmail] = useState('');
function resetPassword(email){
  if (email != "") {
    sendPasswordResetEmail(auth, email)
      .then( () => {
        Toast.show({
              type: 'success',
              text1: 'Validation email is sent.'
            });
      })
       .catch((error) => {
        Toast.show({
              type: 'error',
              text1: error
            });
      });
  } else {
     Toast.show({
              type: 'error',
              text1: 'Please fill in all fields'
            });
  }
};
  return (
      <View style={styles.container}>
      <Image style={styles.icon} source={require('../assets/logo.png')}></Image>
      <TextInput style={styles.textInput}
        placeholder={'Email'}
        onChangeText={(email) => {setEmail(email)}}
        value={email}
      />
      <TouchableOpacity style={styles.buttonPrimary} onPress={() => resetPassword(email)}><Text style={styles.buttonTextPrimary}>Send Verification Email</Text></TouchableOpacity>
    </View>
  );
}

