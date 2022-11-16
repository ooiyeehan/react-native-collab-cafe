import React, {useState, useEffect, useContext} from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, FlatList, Alert, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { setDoc, doc, getDocs, collection, getDoc, where, query } from 'firebase/firestore';
import { firestore } from '../firebase';
import { AuthContext } from '../navigation/AuthProvider';


const Profile = ({navigation}) => {
  const {user, logout} = useContext(AuthContext);
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState(null);
  const [loadedRewards, setLoadedRewards] = useState([])
  
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      async function fetchData(){
        setLoading(true)
        const q = query(collection(firestore, "reward"), where("status", "==", "Active"))
        const querySnapshot = await getDocs(q);
        setLoadedRewards(querySnapshot.docs.map((doc) => (doc.data())))

        const docRef = doc(firestore, "user", user.uid)
        const docSnap = await getDoc(docRef)
        if(docSnap.exists) {
          setUserData(docSnap.data())
        }
        setLoading(false)
    }  
      fetchData() 
    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;  
    })       
  }, [navigation]) 

  const handleSubmit = async (userPoint, rewardPoint) => {
    if(userPoint < rewardPoint){
      Toast.show({
        type:'error',
        text1:"You don't have enough points to redeem!"
      })
      return;
    }
    if(userPoint >= rewardPoint){
      setLoading(true)
      userData.point = userPoint - rewardPoint
      const userRef = doc(firestore, 'user', user.uid)
      await setDoc(userRef, userData, {merge: true}).then(() =>{
        Toast.show({
          type:'success',
          text1:"Reward redeemed!"
        })
        navigation.navigate("Profile")
        setLoading(false)
      })

    }
  }

const ListItem = ({ item }) => {
    return (
      <View style={styles.item}>
        <View style={styles.itemColumn}>
          <Text style={{fontWeight:'bold', fontSize: 20, color: '#455b6b'}}>{item.name}</Text>
          <Text style={styles.itemText}>{item.description}</Text>
          <Text style={{fontWeight:'500', fontSize: 16, color: '#455b6b'}}>Points Required: {item.redeem_point}</Text>
        </View>
  
        <View style={styles.itemColumn2}>
          <TouchableOpacity onPress={() => 
              {
                Platform.OS === 'web' ?
                handleSubmit(userData.point, item.redeem_point) :
                Alert.alert(
                  "Caution",
                  "Are you sure you want to redeem this reward with your points?",
                  [
                    {
                      text: "No",
                      onPress: () => {return;},
                      style: "cancel"
                    },
                    { text: "Yes", onPress: () => handleSubmit(userData.point, item.redeem_point) }
                  ]
                )
              }
            }
          >
            <Ionicons name="gift" size={30} color='#b57f5f'/>
          </TouchableOpacity>
        </View>
      </View>
    );
  
};

  return (
    loading ? <View style={styles.loadingContainer}><ActivityIndicator size="large" /></View> :
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center'}}>
      {/* <ScrollView
        // style={styles.container}
        contentContainerStyle={{justifyContent: 'center', alignItems: 'center'}}
        showsVerticalScrollIndicator={false}> */}
        <Image
          style={styles.userImg}
          source=
          {
            userData ? 
            userData.profile_image == null || userData.profile_image == "" ? 
            require('../assets/user-default-icon.png') : 
            {uri: userData.profile_image} : 
            require('../assets/user-default-icon.png') 
          }
        />
        <Text style={styles.userName}>{userData != null ? userData.name : null}</Text>

        <Text style={styles.aboutUser}>
        {user.email}
        </Text>
        <View style={styles.userBtnWrapper}>
              <TouchableOpacity
                style={styles.userBtn}
                onPress={() => {
                  navigation.navigate('EditProfile');
                }}>
                <Text style={styles.userBtnTxt}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.userBtn} onPress={() => logout(navigation)}>
                <Text style={styles.userBtnTxt}>Logout</Text>
              </TouchableOpacity>
        </View>
        {
            userData ?
            userData.user_type == "Customer" ?
            (
              <View style={styles.userInfoWrapper}>
                <View style={styles.userInfoItem}>
                  <Text style={styles.userInfoTitle}>{userData ? userData.point : 0}</Text>
                  <Text style={styles.userInfoSubTitle}>Points</Text>
                </View>
              </View>
            ) :
            null :
            null

          }
        

          {
            userData ?
            userData.user_type == "Customer" ?
            (<Text style={styles.reward}>Redeem Your Rewards</Text>) :
            null :
            null           
          }

          {
             userData ?
             userData.user_type == "Customer" ?
             (
              <FlatList
              style={{marginBottom: 50}}
              vertical
              data={loadedRewards}
              renderItem={({ item }) => <ListItem item={item} />}
              showsHorizontalScrollIndicator={false}
              // ListEmptyComponent={listEmptyComponent()}
            />
             ) :
             null :
             null
          }

    </SafeAreaView>
  );
};

export default Profile;

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
    borderWidth: 0.5,
    borderColor: "black"
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
  reward: {
    fontWeight:'bold',
    fontSize: 20, 
    color: '#b57f5f', 
    textAlign: 'center', 
    padding: 20
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
    width: "60%"
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
