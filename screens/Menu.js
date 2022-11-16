import React, { useContext, useState, useEffect } from 'react';
import { Image, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { doc, getDocs, collection, getDoc, where, query } from 'firebase/firestore';
import { windowWidth } from '../utils/Dimensions';
import { AuthContext } from '../navigation/AuthProvider';
import { firestore } from '../firebase';

const Menu = ({navigation}) => {
  const {user} = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState(DATA)
  const [arrayHolder, setArrayHolder] = useState([])
  const [selected, setSelected] = useState('All')
  const [loadedItems, setLoadedItems] = useState([])
  const [loading, setLoading] = useState(false)
  
  const setSelectedFilter = (selected) =>{
    if(selected !== "All"){
      setSearchQuery('')
      setData([...loadedItems.filter(e => e.item_type === selected)])
    } else {
      setData(loadedItems)
    }
    setSelected(selected)
  }
  const DATA = [
    {
      id: '1',
      name: 'First Item',
      description: 'First description',
      item_type: 'Cuisine',
      price: 'RM 33.90',
      uri: 'https://picsum.photos/id/1/200',
  
    },
    {
      id: '2',
      name: 'Second Item',
      description: 'Second description',
      item_type: 'Drink',
      price: 'RM 66.90',
      uri: 'https://picsum.photos/id/10/200',
    },
    {
      id: '3',
      name: 'Third Item',
      description: 'Third description',
      item_type: 'Cake',
      price: 'RM 99.90',
      uri: 'https://picsum.photos/id/1002/200',
    },
    {
      id: '4',
      name: 'Fourth Item',
      description: 'Fourth description',
      item_type: 'Pastry',
      price: 'RM 129.90',
      uri: 'https://picsum.photos/id/1002/200',
    }
  ];

  const listTab = [
    {
      id: '1',
      item_type: "All"
    },
    {
      id: '2',
      item_type: "Cuisine"
    },
    {
      id: '3',
      item_type: "Drink"
    },
    {
      id: '4',
      item_type: "Cake"
    },
    {
      id: '5',
      item_type: "Pastry"
    },
  ]

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      async function fetchData(){
        setLoading(true)
        setSelected('All')       
        const q = query(collection(firestore, "item"), where("status", "==", "Active"))
        const querySnapshot = await getDocs(q);
        setLoadedItems(querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id})))
        setData(querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id})))
        setArrayHolder(querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id})))   

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

  const ListItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.item}
        onPress={() => {navigation.navigate('ViewItemDetails', {itemId: item.id} )}}
      >
        <Image
          source={{
            uri: item.image,
          }}
          style={styles.itemPhoto}
          resizeMode="cover"
        />
        <View style={styles.itemColumn}>
          <Text style={{fontWeight:'bold', fontSize: 20, color: '#455b6b'}}>{item.name}</Text>
          <Text style={styles.itemText}>{item.description}</Text>
          <Text style={{fontWeight:'500', alignSelf: 'flex-end', fontSize: 16, color: '#455b6b'}}>RM {item.price}</Text>
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
      const item_data = `${item.name.toUpperCase()})`;
      const text_data = text.toUpperCase();
      return item_data.indexOf(text_data) > -1;
    });
    setData(updatedData) 
    setSearchQuery(text)
  };

  const listEmptyComponent = () => {
    return (
        <View style={styles.loadingContainer}>
            <Text style={styles.itemText}>Item not found in menu!</Text>
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
            placeholder="Search Menu"
            onChangeText={(text) => searchFunction(text)}
            value={searchQuery}
        />
        <View style={styles.listTab}>
          {
            listTab.map(e => (
              <TouchableOpacity
                key={e.id}
                style={[styles.btnTab, selected === e.item_type && styles.btnTabActive]}
                onPress={() => {setSelectedFilter(e.item_type)}}>
                  <Text style={[styles.textTab, selected === e.item_type && styles.textTabActive]}>{e.item_type}</Text>
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

export default Menu

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
  userImg: {
    height: 150,
    width: 150,
    borderRadius: 75,
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
    width: "60%"
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
    marginBottom: 20
  },
  listTab: {
    flexDirection: 'row',
    // alignSelf: 'center',
    justifyContent: 'space-evenly',
    marginVertical: 20,
  },
  btnTab:{
    width: windowWidth / 5,
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
    fontSize: 12
  },
  textTabActive: {
    color: '#fff'
  }
})