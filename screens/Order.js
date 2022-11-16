import React, { useState, useEffect, useContext } from 'react'
import { TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { SearchBar } from 'react-native-elements';
import { doc, getDocs, collection, getDoc, where, query } from 'firebase/firestore';
import { windowWidth } from '../utils/Dimensions';
import { firestore } from '../firebase';
import { AuthContext } from '../navigation/AuthProvider';

const Order = ({navigation}) => {
  const {user} = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(DATA)
  const [arrayHolder, setArrayHolder] = useState([])
  const [selected, setSelected] = useState('All')
  const [loadedOrders, setLoadedOrders] = useState([])

  const setSelectedFilter = (selected) =>{
    if(selected !== "All"){
      setSearchQuery('')
      setData([...loadedOrders.filter(e => e.status === selected)])
    } else {
      setData(loadedOrders)
    }
    setSelected(selected)
  }
  const DATA = [
    {
      id: 'QQXSAR7jBUhwY1l2wkDD9gZSAyJ2',
      item_count: '8',
      date_time: '2022/7/26 7.30PM',
      table_number: 'T001',
      status: 'Completed',  
    },
    {
      id: '3tQPG95Oqxdg48WyygAhdMMnsUx2',
      item_count: '8',
      date_time: '2022/7/26 7.30PM',
      table_number: 'T002',
      status: 'Preparing',
    },
    {
      id: 'ZTZdh3DfrVfTOOLKV0F4TbotfT03',
      item_count: '8',
      date_time: '2022/7/26 7.30PM',
      table_number: 'T003',
      status: 'Cancelled',  
    },
    {
      id: 'rt8To2lftTQVd2eu87NRj61oScM2',
      item_count: '8',
      date_time: '2022/7/26 7.30PM',
      table_number: 'T004',
      status: 'Completed',  
    },
  ];

  const listTab = [
    {
      id: '1',
      status: "All"
    },
    {
      id: '2',
      status: "Preparing"
    },
    {
      id: '3',
      status: "Completed"
    },
    {
      id: '4',
      status: "Cancelled"
    },
  ]

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      async function fetchData(){
        setLoading(true)
        setSelected('All')
        const docRef = doc(firestore, "user", user.uid)
        const docSnap = await getDoc(docRef)
        if(docSnap.exists) {
          setUserData(docSnap.data())
        }
        if(docSnap.id == user.uid){
          if(docSnap.data().user_type == "Staff" || docSnap.data().user_type == "Manager"){
            const q = query(collection(firestore, "order"))
            const querySnapshot = await getDocs(q);
            setLoadedOrders(querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id})))
            setData(querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id})))
            setArrayHolder(querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id})))
            setLoading(false)
          }
          if(docSnap.data().user_type == "Customer"){
            const q = query(collection(firestore, "order"), where("customerID", "==", user.uid))
            const querySnapshot = await getDocs(q);
            setLoadedOrders(querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id})))
            setData(querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id})))
            setArrayHolder(querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id})))
            setLoading(false)
          }
        }
    }  
      fetchData() 
    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;  
    })       
  }, [navigation]) 

  const ListItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.item}
        onPress={() => {navigation.navigate('OrderDetail', {orderId: item.id} )}}
      >
        <View style={styles.itemColumn}>
          <Text style={{fontWeight:'bold', fontSize: 20, color: '#455b6b'}}>#{item.id}</Text>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{marginTop: 5, width: "60%", alignSelf:'flex-start'}}>Date: {item.date_time}</Text>
            <Text style={{marginTop: 5, width: "40%", alignSelf: 'flex-end'}}>Table No.:{item.table_number}</Text>
          </View>
        </View>
  
      </TouchableOpacity>
    );
  };

  const searchFunction = (text) => {
    setSelected('All')
    if(text == null){
      setArrayHolder(DATA)
    }
    const updatedData = arrayHolder.filter((item) => {
      const item_data = `${item.id.toUpperCase()})`;
      const text_data = text.toUpperCase();
      return item_data.indexOf(text_data) > -1;
    });
    setData(updatedData) 
    setSearchQuery(text)
  };

  const listEmptyComponent = () => {
    return (
        <View style={styles.noOrderContainer}>
            <Text style={styles.itemText}>No Order found!</Text>
        </View>
    )
  }

  return (
    loading ? <View style={styles.loadingContainer}><ActivityIndicator size="large" /></View> :
    <View style={styles.container}>
        <SearchBar
            containerStyle={{backgroundColor: "#fff"}}
            round
            lightTheme
            placeholder="Search Order"
            onChangeText={(text) => searchFunction(text)}
            value={searchQuery}
        />
        <View style={styles.listTab}>
          {
            listTab.map(e => (
              <TouchableOpacity
                key={e.id}
                style={[styles.btnTab, selected === e.status && styles.btnTabActive]}
                onPress={() => {setSelectedFilter(e.status)}}>
                  <Text style={[styles.textTab, selected === e.status && styles.textTabActive]}>{e.status}</Text>
              </TouchableOpacity>
            ))
          }
        </View>
         <FlatList
          style={{marginBottom: 50}}
          vertical
          data={data}
          renderItem={({ item }) => <ListItem item={item} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={listEmptyComponent()}
        />
    </View>
  )
}

export default Order

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 2,
    backgroundColor: "#fff"
  },
  loadingContainer:{
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    marginTop: 30
  },
  noOrderContainer:{
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    marginTop: 30
  },
  item: {
    // margin: 10,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: 10,
    // alignItems: 'flex-start',
    borderRadius: 3,
    width: '100%',
    elevation: 1,
    shadowColor: '#e5e9eb',
  },
  // elevation: {
  //   elevation: 1,
  //   shadowColor: '#e5e9eb',
  // },
  itemColumn: {
    margin: 10,
    flexDirection: 'column',
    flex: 1,
    // width: "100%"
  },
  itemColumn2: {
    margin: 10,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  itemPhoto: {
    width: 100,
    height: 100,
    borderRadius: 75,
    alignSelf: 'center',
  },
  itemText: {
    marginTop: 5,
    // marginBottom: 20
  },
  listTab: {
    flexDirection: 'row',
    // alignSelf: 'center',
    justifyContent: 'space-evenly',
    marginVertical: 20,
  },
  btnTab:{
    width: windowWidth / 4,
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: "#EBEBEB",
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnTabActive: {
    backgroundColor: '#b57f5f'
  },
  textTab: {
    fontSize: 10
  },
  textTabActive: {
    color: '#fff'
  }
})