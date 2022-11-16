import React, { useEffect, useState } from 'react';
import { Text, TextInput, View, TouchableOpacity, Modal } from 'react-native';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';
import { doc, getDoc } from "firebase/firestore";
import styles from '../styles';
import UseFirebase from '../contexts/useFirebase';
import { db } from '../components/config';


export default function App({ route }) {

const [name, setName] = useState('');
const [description, setDescription] = useState('');
const [status, setStatus] = useState('');
const [point, setPoint] = useState(0);
const [show, setShow] = useState(false);

  useEffect(() => {
    if (route.params != null) {
      let rewardId = route.params.rewardId;
      get(rewardId);
    } 
  }, []); 

  async function get(rewardId) {
   await getDoc(doc(db, "reward", rewardId
    ))
      .then((docSnap) => {
        let object = docSnap.data();
        setName(object.name);
        setDescription(object.description);
        setStatus(object.status);
        setPoint(object.redeem_point);
      })
      .catch((error) => {
        Toast.show({
                type:'error',
                text1: error
      })
    });
  }

  function saveData() {
    if (validation()) {
       if (route.params != null) {
        let rewardId = route.params.rewardId;
        UseFirebase.saveReward(name, description, status, point, rewardId)
        Toast.show({
              type: 'success',
              text1: 'Reward saved successfully.'
            });
      } else {
         UseFirebase.addReward(name, description, status, point);
         resetFields();
        Toast.show({
              type: 'success',
              text1: 'Reward added successfully.'
            });
      }
    }
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
      setPoint(0);
  }

  return (
    <View style={styles.container}>
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
        placeholder={'Point'}
        keyboardType="number-pad"
        onChangeText={(point) => {setPoint(point)}}
        value={String(point)}
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
    </View>
  );
}

