import React, { useEffect, useState, useContext } from 'react';
import { Text, TextInput, TouchableOpacity, View, Image, Modal } from 'react-native';
import uuid from "react-native-uuid";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { doc, getDoc } from "firebase/firestore";
import { Picker } from '@react-native-picker/picker';
import { Avatar } from '@react-native-material/core';
import Toast from 'react-native-toast-message';
import styles from '../styles';
import UseFirebase from '../contexts/useFirebase';
import { db, storage } from "../helpers/Firebase";
import { AuthContext } from '../navigation/AuthProvider';

export default function App({ route }) {
  
const [image, setImage] = useState(null); 
const [newImage, setNewImage] = useState(null); 
const [name, setName] = useState('');
const [description, setDescription] = useState('');
const [status, setStatus] = useState('');
const [lastModified, setLastModified] = useState('');
const [show, setShow] = useState(false);
const {user} = useContext(AuthContext);
  
  useEffect(() => {
    if (route.params != null) {
      let bannerId = route.params.bannerId;
      get(bannerId);
    } 
  }, []);
  
async function get(bannerId) {
   await getDoc(doc(db, "banner", bannerId
    ))
      .then((docSnap) => {
        let object = docSnap.data();
        setName(object.name);
        setDescription(object.description);
        setStatus(object.status);
        setLastModified(object.last_modified_by);
        setImage(object.image);
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
      let lastModified = user.uid + " (" + user.email + ")";
      let imageUrl = "";
      if (newImage) {
        let randomImageId = uuid.v4();
        let fileExtension = newImage.split(".").pop();
        let fileName = `${randomImageId}.${fileExtension}`;
        let response = await fetch(newImage);
        let blob = await response.blob();
        const imageRef = ref(storage, `banner/${fileName}`);

        await uploadBytes(imageRef, blob).then((snapshot) => {});
        await getDownloadURL(imageRef).then((url) => {
          imageUrl = url;
        });
      }
      if (image && newImage == null) {
        imageUrl = image;
      }
      if (route.params != null) {
        let bannerId = route.params.bannerId;
        UseFirebase.saveBanner(name, description, status, lastModified, imageUrl, bannerId);
        Toast.show({
            type: 'success',
            text1: 'Banner saved successfully.'
          });
      } else {
        UseFirebase.addBanner(name, description, status, lastModified, imageUrl);
        resetFields();
        Toast.show({
            type: 'success',
            text1: 'Banner added successfully.'
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
        console.error(error);
      });
  }

  function validation() {
    if (name == "" || description == "" || status == "") {
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
      setDescription("");
      setStatus("");
      setLastModified("");
      setImage(null);
      setNewImage(null);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.alignCenter} onPress={() => changeImage()}>
        {image || newImage ? (
          <Avatar style={styles.setImage} image={<Image source={{ uri: newImage ? newImage : image }} style={styles.setCustomImage} />} />
          ) : (
            <Avatar style={styles.setImage} label="Banner Image" autoColor />
          )} 
      </TouchableOpacity>
      <TextInput style={styles.textInput}
        placeholder={'Name'}
        keyboardType="default"
        onChangeText={(name) => {setName(name)}}
        value={name}
      />
      <TextInput style={styles.textInput}
        placeholder={'Description'}
        keyboardType="default"
        onChangeText={(description) => {setDescription(description)}}
        value={description}
      />
      <TouchableOpacity style={styles.textInput} onPress={() => { setShow(true) }} accessible={false}>
        <TextInput editable={false} placeholder="Select Status" value={status}></TextInput>
      </TouchableOpacity>
      <TextInput style={styles.textInput}
        placeholder={'Last Modified By'}
        editable={false}
        onChangeText={(lastModified) => {setLastModified(lastModified)}}
        value={lastModified}
      />
      <TouchableOpacity style={styles.buttonPrimary} onPress={() => saveData()}><Text style={styles.buttonTextPrimary}>Save</Text></TouchableOpacity>
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

