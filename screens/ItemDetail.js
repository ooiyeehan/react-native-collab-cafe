import React, { useEffect, useState, useContext } from 'react';
import { Text, TextInput, TouchableOpacity, View, Image, Modal } from 'react-native';
import uuid from "react-native-uuid";
import Toast from 'react-native-toast-message';
import * as ImagePicker from "expo-image-picker";
import { doc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
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
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [price, setPrice] = useState(0.0);
  const [quantity, setQuantity] = useState(0);
  const [lastModified, setLastModified] = useState('');
  const [show, setShow] = useState(false);
  const [showType, setShowType] = useState(false);
  const { user } = useContext(AuthContext);
  
  useEffect(() => {
    if (route.params != null) {
      let itemId = route.params.itemId;
      get(itemId);
    } 
  }, []);

  async function get(itemId) {
   await getDoc(doc(db, "item", itemId
    ))
      .then((docSnap) => {
        let object = docSnap.data();
        setName(object.name);
        setDescription(object.description);
        setType(object.item_type);
        setStatus(object.status);
        setPrice(object.price);
        setQuantity(object.quantity);
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
          const imageRef = ref(storage, `item/${fileName}`);

          await uploadBytes(imageRef, blob).then((snapshot) => {});
          await getDownloadURL(imageRef).then((url) => {
            imageUrl = url;
          });
        }
        if (image && newImage == null) {
          imageUrl = image;
        }
        if (route.params != null) {
          let itemId = route.params.itemId;
          UseFirebase.saveItem(name, description, type, status, price, quantity, lastModified, imageUrl, itemId);
          Toast.show({
            type: 'success',
            text1: 'Item saved successfully.'
          });
        } else {
          UseFirebase.addItem(name, description, type, status, price, quantity, lastModified, imageUrl);
          resetFields();
          Toast.show({
            type: 'success',
            text1: 'Item added successfully.'
          });
        }
    }
    
  }

  function validation() {
    if (name == "" || description == "" || type == "" || status == "" || price == 0 || quantity == 0) {
      Toast.show({
                type:'error',
                text1:'Please fill in all fields.'
      })
      return false;
    } else {
      return true;
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
        setNewImage(result.uri);
      })
      .catch((error) => {
        Toast.show({
                type:'error',
                text1: error
      })
      });
  }

  function resetFields() {
      setName("");
      setDescription("");
      setStatus("");
      setType("");
      setPrice(0.0);
      setQuantity(0);
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
            <Avatar style={styles.setImage} label="Item Image" autoColor />
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
       <TouchableOpacity style={styles.textInput} onPress={() => { setShowType(true) }} accessible={false}>
        <TextInput editable={false} placeholder="Select Type" value={type}></TextInput>
      </TouchableOpacity>
      <TouchableOpacity style={styles.textInput} onPress={() => { setShow(true) }} accessible={false}>
        <TextInput editable={false} placeholder="Select Status" value={status}></TextInput>
      </TouchableOpacity>
      <TextInput style={styles.textInput}
        placeholder={'Price'}
        keyboardType="decimal-pad"
        onChangeText={(price) => {setPrice(price)}}
        value={String(price)}
      />
      <TextInput style={styles.textInput}
        placeholder={'Quantity'}
        keyboardType="number-pad"
        onChangeText={(quantity) => {setQuantity(quantity)}}
        value={String(quantity)}
      />
      <TextInput style={styles.textInput}
        placeholder={'Last Modified By'}
        editable={false}
        onChangeText={(lastModified) => {setLastModified(lastModified)}}
        value={lastModified}
      />
      <TouchableOpacity style={styles.buttonPrimary} onPress={() => saveData()} title="Save"><Text style={styles.buttonTextPrimary}>Save</Text></TouchableOpacity>
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
      <Modal transparent={true} visible={showType}> 
        <View style={styles.picker}>
          <Picker
            selectedValue={type}
            onValueChange={(value) => {
              setType(value);
              setShowType(false);
            }}>
            <Picker.Item label="Cuisine" value="Cuisine" />
            <Picker.Item label="Drink" value="Drink" />
            <Picker.Item label="Cake" value="Cake" />
            <Picker.Item label="Pastry" value="Pastry" />
          </Picker>
        </View>
      </Modal>
    </View>
  );
}

