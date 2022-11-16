import React, {useState, useEffect, useContext} from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import FormButton from '../components/FormButton';
import FormInput from '../components/FormInput';
import { firestore } from '../firebase';
import { AuthContext } from '../navigation/AuthProvider';

const LeaveDetail = ({route, navigation}) => {
  const {leaveId} = route.params
  const {user} = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null)
  const [loadedLeave, setLoadedLeave] = useState([])
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState(new Date())
  const [openLeaveFrom, setOpenLeaveFrom] = useState(false)
  const [openLeaveTo, setOpenLeaveTo] = useState(false)
  const [leaveFromDate, setLeaveFromDate] = useState() //readable leave from date (display in field)
  const [leaveToDate, setLeaveToDate] = useState()  //readable leave to date (display in field)
  const [selectedStatus, setSelectedStatus] = useState();
  const [loadedLeaveId, setLoadedLeaveId] = useState()
  const [managerName, setManagerName] = useState()


  useEffect(() => {
    
    async function fetchData(){
      setLoading(true)

      const currentUserRef = doc(firestore, "user", user.uid)
      const currentUserSnap = await getDoc(currentUserRef)
      if(currentUserSnap.exists) {
        setCurrentUserData({...currentUserSnap.data(), id: currentUserSnap.id})
      }

      const docRef = doc(firestore, "leave", leaveId) 
      const docSnap = await getDoc(docRef)
      if(docSnap.exists) {
        console.log(docSnap.data())
        setLoadedLeave(docSnap.data())
        setLoadedLeaveId(docSnap.id)
        setSelectedStatus(docSnap.data().status)
        const leaveFromDate = new Date(docSnap.data().leave_from)
        const readableDate = leaveFromDate.getDate() + "/" + (leaveFromDate.getMonth() + 1) + "/" + leaveFromDate.getFullYear()
        const leaveToDate = new Date(docSnap.data().leave_to)
        const readableDate2 = leaveToDate.getDate() + "/" + (leaveToDate.getMonth() + 1) + "/" + leaveToDate.getFullYear()

        setLeaveFromDate(readableDate) //readable leave from date
        setLeaveToDate(readableDate2) //readable leave to date

        const docRef2 = doc(firestore, "user", docSnap.data().staff_id)
        const docSnap2 = await getDoc(docRef2)
        if(docSnap2.exists) {
          setUserData(docSnap2.data())
        }
        if(docSnap.data().managed_by != "" ){
          const docRef3 = doc(firestore, "user", docSnap.data().managed_by)
          const docSnap3 = await getDoc(docRef3)
          if(docSnap3.exists) {
            setManagerName(docSnap3.data().name)
          }
        }
      }

      setLoading(false)
    }
    fetchData()    
  }, [])

  useEffect(() => {
    if(loadedLeave && currentUserData){
      if(currentUserData.user_type == "Manager"){
        setLoadedLeave({...loadedLeave, managed_by: currentUserData.id, status: selectedStatus})
      }
    }
  }, [selectedStatus])
  

  const handleSubmit = async () => {
    if(loadedLeave){
      if(loadedLeave.leave_from > loadedLeave.leave_to){
        Toast.show({
          type:'error',
          text1:'Leave To date cannot be greater than Leave From date!'
        })
        return;
      }
      if(loadedLeave.reason == '' || loadedLeave.reason == null){
        Toast.show({
          type:'error',
          text1:'Please insert reason for taking leave!'
        })
        return;
      }
      if(loadedLeave.leave_from == "" || loadedLeave.leave_from == null) {
        Toast.show({
          type:'error',
          text1:'Please select a date you are leaving from!'
        })
        return;
      }
      if(loadedLeave.leave_to == "" || loadedLeave.leave_to == null) {
        Toast.show({
          type:'error',
          text1:'Please select a date you are leaving to!'
        })
        return;
      }
      if(currentUserData){
        if(loadedLeave.staff_id == currentUserData.id) {
          const leaveRef = doc(firestore, 'leave', loadedLeaveId)
          await setDoc(leaveRef, loadedLeave, {merge: true})
          Toast.show({
            type:'success',
            text1:'Leave Updated!'                           
          })
          navigation.navigate('Management')
        }
        if(loadedLeave.staff_id != currentUserData.id && currentUserData.user_type == "Manager"){
         
            const leaveRef = doc(firestore, 'leave', loadedLeaveId)
            await setDoc(leaveRef, loadedLeave, {merge: true})
            Toast.show({
              type:'success',
              text1:'Leave Status Updated!'                           
            })
            navigation.navigate('Management')
            

          
        }
      }
    }

  }

  return (
    loading ? <View style={styles.loadingContainer}><ActivityIndicator size="large" /></View> :
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{alignItems: 'center'}}>
          {openLeaveFrom && (
            <DateTimePicker
                minimumDate={new Date()}
                value={date}
                mode={'date'}
                display='default'
                onChange={(event, date) => {
                  const tempDate = date
                  const changeDate = tempDate.getDate() + "/" + (tempDate.getMonth() + 1) + "/" + tempDate.getFullYear()
                  const tempDateHours = tempDate.setHours(0, 0, 0, 0)

                  setOpenLeaveFrom(false)
                  setLoadedLeave({...loadedLeave, leave_from: tempDateHours}) //store in firestore as timestamp
                  setLeaveFromDate(changeDate) //to be displayed to user as readable date
                  // setLeaveFromDatePicker(tempDate) // to be used for date picker validation
                  if(loadedLeave){
                    if(loadedLeave.leave_to != null){   //if leave to date is not null
                      if(tempDateHours > loadedLeave.leave_to){ //if user changes the leave from date and is greater than leave to date
                        setLoadedLeave({...loadedLeave, leave_from: tempDateHours, leave_to: tempDateHours})  //set leave to date as the same value as leave from date (timestamp for firestore)
                        setLeaveToDate(changeDate)  //set leave to date as the same value as leave from date (readable date)
                      }
                    }
                  }
                }}
          />)}
          {openLeaveTo && (
            <DateTimePicker
                minimumDate={loadedLeave ? new Date(loadedLeave.leave_from) : new Date()} 
                value={loadedLeave ? new Date(loadedLeave.leave_from) : date}
                mode={'date'}
                display='default'
                onChange={(event, date) => {
                  const tempDate = date
                  const changeDate = tempDate.getDate() + "/" + (tempDate.getMonth() + 1) + "/" + tempDate.getFullYear()
                  const tempDateHours = tempDate.setHours(0, 0, 0, 0)
                  setOpenLeaveTo(false)
                  setLoadedLeave({...loadedLeave, leave_to: tempDateHours}) //store in firestore as timestamp
                  setLeaveToDate(changeDate) //to be displayed to user as readable date
                }}
          />)}
          <Text style={{alignSelf: 'flex-start', fontSize: 20, margin: 10, fontWeight: 'bold'}}>Name</Text>
          <FormInput
            labelValue={userData ? userData.name : ''}
            // onChangeText={(userName) => setName(userName)}
            placeholderText="NAME"
            iconType="user"
            keyboardType="default"
            autoCapitalize="none"
            autoCorrect={false}
            editable={false}
          />
          <Text style={{alignSelf: 'flex-start', fontSize: 20, margin: 10, fontWeight: 'bold'}}>Reason</Text>
          <FormInput
            labelValue={loadedLeave ? loadedLeave.reason : ''}
            onChangeText={(userReason) => setLoadedLeave({...loadedLeave, reason: userReason})}
            placeholderText="REASON"
            iconType="ellipsis1"
            keyboardType="default"
            autoCapitalize="none"
            autoCorrect={false}
            editable=
            {
              userData && loadedLeave ? // If user is logged in and leave data exist
              userData.user_type == "Staff" && user.uid == loadedLeave.staff_id ? // if user is staff and leave is belong to this staff
              loadedLeave.status == "Approved" || loadedLeave.status == "Rejected" ? //If leave is already approved or rejected
              false: // staff cannot edit reason if leave is already approved or rejected
              true : // else staff can edit reason
              false : // else if user is not staff and leave is not belong to this staff, user cannot edit reason
              false //If user is not logged in and leave data not exist, user cannot edit reason
            } 
          />
          <Text style={{alignSelf: 'flex-start', fontSize: 20, margin: 10, fontWeight: 'bold'}}>Leave From</Text>

          <Pressable onPress={() => {
            currentUserData ? 
            currentUserData.user_type == "Staff" ? // If user is staff
            loadedLeave.status == "Approved" || loadedLeave.status == "Rejected" ? //If leave is already approved or rejected
            {} : // Date picker will not be shown when pressed
            setOpenLeaveFrom(true) : // else if leave is not approved or rejected, show date picker when pressed
            {} : //else if user is not staff, date picker will not be shown when pressed
            {} // else if currentUserData and loadedLeave not exist, date picker will not be shown when pressed
            }}>
            <FormInput
              disabled
              labelValue={leaveFromDate}
              onChangeText={(userLeaveFrom) => setLeaveFromDate(userLeaveFrom)}
              placeholderText="LEAVE FROM"
              iconType="arrowleft"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={false}
            />
          </Pressable>
          <Text style={{alignSelf: 'flex-start', fontSize: 20, margin: 10, fontWeight: 'bold'}}>Leave To</Text>
          <Pressable onPress={() => {
            currentUserData && loadedLeave ? 
            currentUserData.user_type == "Staff" ? // If user is staff
            loadedLeave.status == "Approved" || loadedLeave.status == "Rejected" ? //If leave is already approved or rejected
            {} : // Date picker will not be shown when pressed
            setOpenLeaveTo(true) : // else if leave is not approved or rejected, show date picker when pressed
            {} : //else if user is not staff, date picker will not be shown when pressed
            {} // else if currentUserData and loadedLeave not exist, date picker will not be shown when pressed
            }}>
            <FormInput
              labelValue={leaveToDate}
              onChangeText={(userLeaveTo) => setLeaveToDate(userLeaveTo)}
              placeholderText="LEAVE TO"
              iconType="arrowright"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={false}
            />
          </Pressable>
          {currentUserData ? currentUserData.user_type == "Manager" ? (
            <Text style={{alignSelf: 'flex-start', fontSize: 20, margin: 10, fontWeight: 'bold'}}>Leave Requested On</Text>
          ): null: null}
          {currentUserData ? currentUserData.user_type == "Manager" ? (
             <FormInput
                labelValue={loadedLeave ? loadedLeave.date_requested : ''}
                // onChangeText={(userName) => setName(userName)}
                placeholderText="STATUS"
                iconType="upload"
                keyboardType="default"
                autoCapitalize="none"
                autoCorrect={false}
                editable={false}
              />
          ) : null : null}

          <Text style={{alignSelf: 'flex-start', fontSize: 20, margin: 10, fontWeight: 'bold'}}>Status</Text>
          {currentUserData ? currentUserData.user_type == "Manager" ? (
            <Picker
            style={{width: "100%", backgroundColor: '#808080', color: '#fff'}}
            selectedValue={selectedStatus}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedStatus(itemValue)
            }>
            <Picker.Item label="Pending" value="Pending" />
            <Picker.Item label="Approved" value="Approved" />
            <Picker.Item label="Rejected" value="Rejected" />
          </Picker>
          ): (
            <FormInput
              labelValue={loadedLeave ? loadedLeave.status : ''}
              // onChangeText={(userName) => setName(userName)}
              placeholderText="STATUS"
              iconType="infocirlceo"
              keyboardType="default"
              autoCapitalize="none"
              autoCorrect={false}
              editable={false}
          />
          
          ): (
            <FormInput
              labelValue={loadedLeave ? loadedLeave.status : ''}
              // onChangeText={(userName) => setName(userName)}
              placeholderText="STATUS"
              iconType="infocirlceo"
              keyboardType="default"
              autoCapitalize="none"
              autoCorrect={false}
              editable={false}
          />
          )}
          <Text style={{alignSelf: 'flex-start', fontSize: 20, margin: 10, fontWeight: 'bold'}}>Leave Status Managed By</Text>
          <FormInput
              labelValue={managerName}
              // onChangeText={(userName) => setName(userName)}
              placeholderText="Not managed by anyone yet"
              iconType="user"
              keyboardType="default"
              autoCapitalize="none"
              autoCorrect={false}
              editable={false}
          />
            <Text>{'\n\n\n'}</Text>
            
            {
              loadedLeave && currentUserData ? // if leave and user data exists in firestore database
              currentUserData.user_type == "Manager" ? //if user is manager
              (<FormButton
                buttonTitle={currentUserData ? currentUserData.user_type == "Manager" ? "UPDATE LEAVE STATUS" : "SAVE" : "SAVE"}
                onPress={() => handleSubmit()}
                />) : //display button
              currentUserData.user_type != "Manager" ? //if user is not manager
              loadedLeave.status == "Approved" || loadedLeave.status == "Rejected" ? // and if leave status is approved or rejected
              null : // dont display button to user (staff will not be able to edit the leave details anymore)
              (<FormButton
              buttonTitle={currentUserData ? currentUserData.user_type == "Manager" ? "UPDATE LEAVE STATUS" : "SAVE" : "SAVE"}
              onPress={() => handleSubmit()}
              />) : //if leave status is not approved or rejected (pending), display button
              null : //if user is not manager or staff, dont display button
              null //if leave user data dont exist in firestore database, dont display button
            }


      </ScrollView>
    </View>
  );
};

export default LeaveDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20
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
