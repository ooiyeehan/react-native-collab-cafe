import React, { useState, useContext, useEffect } from 'react'
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator, ScrollView } from 'react-native'
import { Card, Title, Paragraph } from 'react-native-paper';
import { doc, getDocs, collection, getDoc, where, query } from 'firebase/firestore';
import { AuthContext } from '../navigation/AuthProvider';
import { firestore } from '../firebase';

export default function Reward({navigation}) {
  const {user, logout} = useContext(AuthContext)
  const [userData, setUserData] = useState({})
  const [loading, setLoading] = useState(false)
  const [loadedItems, setLoadedItems] = useState([])
  const [loadedBanners, setLoadedBanners] = useState([])
  const [imgActive, setImgActive] = useState(0)

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      async function fetchData(){
        setLoading(true)     
        const q = query(collection(firestore, "item"), where("status", "==", "Active"))
        const querySnapshot = await getDocs(q);
        setLoadedItems(querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id})))

        const q2 = query(collection(firestore, "banner"), where("status", "==", "D"))
        const querySnapshot2 = await getDocs(q2);
        setLoadedBanners(querySnapshot2.docs.map((doc) => ({...doc.data(), id: doc.id})))
 
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

  const onChange = (nativeEvent) => {
    if(nativeEvent){
      const slide = Math.ceil(nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width)
      if(slide != imgActive){
        setImgActive(slide)
      }
    }
  }

  return (
       loading ? <View style={styles.container}><ActivityIndicator size="large" /></View> :     
        <SafeAreaView style={styles.container}>
          <ScrollView
            onScroll={({nativeEvent}) => onChange(nativeEvent)}
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            horizontal
            style={styles.wrap}
          >
              {
                loadedBanners ? loadedBanners.map((e, index) =>
                <Image
                  key={e.id}
                  resizeMode='stretch'
                  style={styles.wrap}
                  source={{uri: e.image}} 
                />
                ) : ''
              }
          </ScrollView>
          <Text style={styles.text}>Top Picks</Text>
          <FlatList 
            style={{width:'100%'}}
            data={loadedItems}
            showsVerticalScrollIndicator={false}
            renderItem={({item}) => (
                <View style={styles.flatView}>
                <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('ViewItemDetails', {itemId: item.id})
                    }}
                >
                  <Card>
                    <Card.Cover 
                      source={{uri: item.image}}
                    />
                    <Card.Content>
                      <Title>{item.name}</Title>
                      <Paragraph style={{marginBottom: 10}}>{item.description}</Paragraph>
                      <Paragraph style={{fontWeight: 'bold', fontSize:20}}>RM {item.price}</Paragraph>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
                </View>
            )}
            keyExtractor={item => item.id}
          /> 
        </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  wrap: {
    width: 300,
    height: 300,
    marginBottom: 20
  },
  flatViewContainer:{
    flex: 1,
    padding: 20,
    paddingTop:50,
    width: '100%',
    maxWidth: 340,
    height: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flatView: {
    justifyContent: 'center',
    paddingTop: 10,
    borderRadius: 2,
  },
  profileIcon:{
    position: 'absolute',
    top:30,
    right:5
  },
  logo: {
    height: 150,
    width: 150,
    resizeMode: 'cover',
  },
  text: {
    fontSize: 16,
    color: '#b68061',
    alignSelf: 'flex-start',
    fontWeight: '500'
  }
})