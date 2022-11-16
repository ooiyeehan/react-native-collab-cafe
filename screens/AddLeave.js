import React, {useState, useEffect, useContext} from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Pressable } from 'react-native';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { uuidv4 } from '@firebase/util';
import Toast from 'react-native-toast-message'
import DateTimePicker from '@react-native-community/datetimepicker';
import FormButton from '../components/FormButton';
import FormInput from '../components/FormInput';
import { firestore } from '../firebase';
import {AuthContext} from '../navigation/AuthProvider';


const AddLeave = ({navigation}) => {
  const {user} = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [name, setName] = useState();
  const [reason, setReason] = useState();
  const [leaveFrom, setLeaveFrom] = useState();
  const [leaveTo, setLeaveTo] = useState();
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState(new Date())
  const [openLeaveFrom, setOpenLeaveFrom] = useState(false)
  const [openLeaveTo, setOpenLeaveTo] = useState(false)
  const [leaveFromDate, setLeaveFromDate] = useState()
  const [leaveToDate, setLeaveToDate] = useState()


  useEffect(() => {
    
    async function fetchData(){
      setLoading(true)

      const docRef = doc(firestore, "user", user.uid)
      const docSnap = await getDoc(docRef)
      if(docSnap.exists) {
        setUserData(docSnap.data())
      }
      setLoading(false)
    }
    fetchData()    
  }, [])

  const handleSubmit = async () => {
    if(leaveFromDate > leaveToDate){
      Toast.show({
        type:'error',
        text1:'Leave To date cannot be greater than Leave From date!'
      })
      return;
    }
    if(reason == "" || reason == null) {
      Toast.show({
        type:'error',
        text1:'Please insert reason for taking leave!'
      })
      return;
    }
    if(leaveFrom == "" || leaveFrom == null) {
      Toast.show({
        type:'error',
        text1:'Please select a date you are leaving from!'
      })
      return;
    }
    if(leaveTo == "" || leaveTo == null) {
      Toast.show({
        type:'error',
        text1:'Please select a date you are leaving to!'
      })
      return;
    }
    if(userData != null){
      const date = new Date()
      const currentDate =  date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
      const uuid = uuidv4()
      const leaveData = {
        staff_id: user.uid,
        reason: reason,
        leave_from: leaveFromDate,
        leave_to: leaveToDate,
        date_requested: currentDate,
        status: 'Pending',
        managed_by: ''
      }
      const leaveRef = doc(firestore, 'leave', uuid)
      await setDoc(leaveRef, leaveData)
      Toast.show({
        type:'success',
        text1:'Leave Added!'                           
      })
      navigation.navigate('Management')
    }


  }

  return (
    loading ? <View style={styles.loadingContainer}><ActivityIndicator size="large" /></View> :
    <SafeAreaView style={styles.container}>
         {openLeaveFrom && (
          <DateTimePicker
              minimumDate={new Date()}
              value={date}
              mode={'date'}
              display='default'
              onChange={(event, date) => {
                const tempDate = date
                const changeDate = tempDate.getDate() + "/" + (tempDate.getMonth() + 1) + "/" + tempDate.getFullYear()
                setOpenLeaveFrom(false)
                setLeaveFrom(changeDate) //readable leave from date tobe displayed to users (e.g. 21/7/2022)
                const tempDateHours = tempDate.setHours(0, 0, 0, 0)

                setLeaveFromDate(tempDateHours) //to be stored in firestore as timestamp and for date range validation
                if(leaveToDate != null){ //if leave to date is not null
                  if(tempDate > leaveToDate){ //if user changes the leave from date and is greater than leave to date
                    setLeaveTo(changeDate) //set leave to date as the same value as leave from date (readable date)
                    setLeaveToDate(tempDateHours) //set leave to date as the same value as leave from date (timestamp for firestore)
                  }
                }
              }}
        />)}
        {openLeaveTo && (
          <DateTimePicker
              minimumDate={new Date(leaveFromDate) != null ? new Date(leaveFromDate) : new Date()}
              value={new Date(leaveFromDate) != null ? new Date(leaveFromDate) : date}
              mode={'date'}
              display='default'
              onChange={(event, date) => {
                const tempDate = date
                const changeDate = tempDate.getDate() + "/" + (tempDate.getMonth() + 1) + "/" + tempDate.getFullYear()
                const tempDateHours = tempDate.setHours(0, 0, 0, 0)
                setOpenLeaveTo(false)
                setLeaveTo(changeDate)
                setLeaveToDate(tempDateHours)
              }}
        />)}
        
        <FormInput
          labelValue={userData ? userData.name : ''}
          onChangeText={(userName) => setName(userName)}
          placeholderText="NAME"
          iconType="user"
          keyboardType="default"
          autoCapitalize="none"
          autoCorrect={false}
          editable={false}
        />

        <FormInput
          labelValue={reason}
          onChangeText={(userReason) => setReason(userReason)}
          placeholderText="REASON"
          iconType="ellipsis1"
          keyboardType="default"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable onPress={() => {setOpenLeaveFrom(true)}}>
          <FormInput
            disabled
            labelValue={leaveFrom}
            onChangeText={(userLeaveFrom) => setLeaveFrom(userLeaveFrom)}
            placeholderText="LEAVE FROM"
            iconType="arrowleft"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={false}
          />
        </Pressable>
        <Pressable onPress={() => {setOpenLeaveTo(true)}}>
          <FormInput
            labelValue={leaveTo}
            onChangeText={(userLeaveTo) => setLeaveTo(userLeaveTo)}
            placeholderText="LEAVE TO"
            iconType="arrowright"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={false}
          />
        </Pressable>
        <Text>{'\n\n\n'}</Text>
        <FormButton
          buttonTitle="SAVE"
          onPress={() => handleSubmit() }
        />

    </SafeAreaView>
  );
};

export default AddLeave;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
  },
  loadingContainer:{
    flex:1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  userImg: {
    height: 150,
    width: 150,
    borderRadius: 75,
    marginBottom: 30
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  aboutUser: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  userBtnWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
  },
  userBtn: {
    borderColor: '#2e64e5',
    borderWidth: 2,
    borderRadius: 3,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 5,
  },
  userBtnTxt: {
    color: '#2e64e5',
  },
  userInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  userInfoItem: {
    justifyContent: 'center',
  },
  userInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  userInfoSubTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  item: {
    margin: 10,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignSelf: 'flex-start',
    width: "100%"
  },
  itemColumn: {
    margin: 10,
    flexDirection: 'column',
    width: "33%"
  },
  itemColumn2: {
    margin: 10,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 30
  },
  itemPhoto: {
    width: 100,
    height: 100,
    borderRadius: 75
  },
  itemText: {
    marginTop: 5,
  }
});
