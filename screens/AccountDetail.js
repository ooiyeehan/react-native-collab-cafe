import React, { useEffect, useState, useContext } from 'react';
import { Text, TextInput, TouchableOpacity, View, Image, Modal } from 'react-native';

import * as ImagePicker from "expo-image-picker";
import uuid from "react-native-uuid";
import Toast from 'react-native-toast-message';
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { doc, getDoc } from "firebase/firestore";
import { Avatar } from '@react-native-material/core';
import { Picker } from '@react-native-picker/picker';

import styles from '../styles';
import UseFirebase from '../contexts/useFirebase';
import { db, storage } from "../helpers/Firebase";
import { AuthContext } from '../navigation/AuthProvider';

export default function App({ route }) {

const [image, setImage] = useState(null); 
const [newImage, setNewImage] = useState(null); 
const [name, setName] = useState('');
const [contact, setContact] = useState('');
const [email, setEmail] = useState('');
const [userType, setUserType] = useState('');
const [status , setStatus] = useState('');
const [show, setShow] = useState(false);
const [showType, setShowType] = useState(false);
const {user} = useContext(AuthContext);
  
useEffect(() => {
    if (route.params != null) {
      let userId = route.params.userId;
      get(userId);
    } 
}, []);
  
async function get(userId) {
   await getDoc(doc(db, "user", userId
    ))
      .then((docSnap) => {
        let object = docSnap.data();
        setName(object.name);
        setContact(object.contact_number);
        setEmail(object.email);
        setUserType(object.user_type);
        setImage(object.profile_image);
        setStatus(object.status);
      })
      .catch((error) => {
        Toast.show({
                type:'error',
                text1: error
      })
    });
  }

  async function saveData() {
    if (validation()) {
      let imageUrl = "";
      if (newImage) {
        let randomImageId = uuid.v4();
        let fileExtension = newImage.split(".").pop();
        let fileName = `${randomImageId}.${fileExtension}`;
        let response = await fetch(newImage);
        let blob = await response.blob();
        const imageRef = ref(storage, `user/${fileName}`);

        await uploadBytes(imageRef, blob).then((snapshot) => {});
        await getDownloadURL(imageRef).then((url) => {
          imageUrl = url;
        });
      }
      if (image && newImage == null) {
        imageUrl = image;
      }
      if (route.params != null) {
        let userId = route.params.userId;
        UseFirebase.saveUser(name, email, contact, userType, imageUrl, status, userId);
        Toast.show({
              type: 'success',
              text1: 'User saved successfully.'
            });
      } else {
        UseFirebase.addUser(name, email, contact, userType, imageUrl, status, user);
        resetFields();
        Toast.show({
              type: 'success',
              text1: 'User added successfully, please reset password before login.'
            });
      }
    }
    
  }

  async function changeImage() {
    await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    })
      .then((result) => {
        if (result.cancelled) {
          return;
        }
        console.log("SET!");
        setNewImage(result.uri);
      })
      .catch((error) => {
        Toast.show({
                type:'error',
                text1: error
      })
      });
  }

  function validation() {
    if (name == "" || contact == "" || email == "" || userType == "" || status == 0) {
      Toast.show({
                type:'error',
                text1:'Please fill in all fields.'
      })
      return false;
    } else {
      return true;
    }
  }

  function resetFields() {
      setName("");
      setContact("");
      setEmail("");
      setUserType("");
      setImage(null);
      setNewImage(null);
      setStatus("");
  }
  

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.alignCenter} onPress={() => changeImage()}>
        {image || newImage ? (
          <Avatar style={styles.setImage} image={<Image source={{ uri: newImage ? newImage : image }} style={styles.setCustomImage} />} />
          ) : (
            <Avatar style={styles.setImage} label="User Image" autoColor />
          )} 
      </TouchableOpacity>
      <TextInput style={styles.textInput}
        placeholder={'Name'}
        keyboardType="default"
        onChangeText={(name) => {setName(name)}}
        value={name}
      />
      <TextInput style={styles.textInput}
        placeholder={'Contact'}
        keyboardType="phone-pad"
        onChangeText={(contact) => {setContact(contact)}}
        value={contact}
      />
      <TextInput style={styles.textInput}
        placeholder={'Email'}
        keyboardType="email-address"
        editable={route.params == null ? true : false}
        onChangeText={(email) => {setEmail(email)}}
        value={email}
      />
      <TouchableOpacity style={styles.textInput} onPress={() => { setShowType(true) }} accessible={false}>
        <TextInput editable={false} placeholder="Select User Type" value={userType}></TextInput>
      </TouchableOpacity>
      <TouchableOpacity style={styles.textInput} onPress={() => { setShow(true) }} accessible={false}>
        <TextInput editable={false} placeholder="Select Status" value={status}></TextInput>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonPrimary} onPress={() => saveData()}><Text style={styles.buttonTextPrimary}>Save</Text></TouchableOpacity>
      <Modal transparent={true} visible={showType}> 
        <View style={styles.picker}>
          <Picker
            selectedValue={userType}
            onValueChange={(value) => {
              setUserType(value);
              setShowType(false);
            }}>
            <Picker.Item label="Staff" value="Staff" />
            <Picker.Item label="Manager" value="Manager" />
          </Picker>
        </View>
      </Modal>
      <Modal transparent={true} visible={show}> 
        <View style={styles.picker}>
          <Picker
            selectedValue={status}
            onValueChange={(value) => {
              setStatus(value);
              setShow(false);
            }}>
            <Picker.Item label="Active" value="Active" />
            <Picker.Item label="Inactive" value="Inactive" />
          </Picker>
        </View>
      </Modal>
    </View>
  );
}

