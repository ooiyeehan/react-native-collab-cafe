import React, { useState, useEffect, useContext } from 'react'
import { StyleSheet, Text, View, Image, FlatList, ActivityIndicator } from 'react-native'
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';
import { setDoc, doc, getDocs, collection, getDoc, where, query } from 'firebase/firestore';
import FormButton from '../components/FormButton';
import { firestore } from '../firebase';
import { AuthContext } from '../navigation/AuthProvider';


const OrderDetail = ({route, navigation}) => {
    const {user} = useContext(AuthContext);
    const {orderId} = route.params
    const [selectedStatus, setSelectedStatus] = useState();
    const [userData, setUserData] = useState(null);
    const [loadedOrder, setLoadedOrder] = useState([])
    const [loadedOrderProducts, setLoadedOrderProducts] = useState([])
    const [loading, setLoading] = useState(false)
    const [customerData, setCustomerData] = useState(null);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            async function fetchData(){
                setLoading(true)
                const q = query(collection(firestore, "OrderProducts"), where("orderID", "==", orderId))
                const querySnapshot = await getDocs(q);
                setLoadedOrderProducts(querySnapshot.docs.map((doc) => (doc.data())))

                const docRef = doc(firestore, "user", user.uid)
                const docSnap = await getDoc(docRef)
                if(docSnap.exists) {
                    setUserData(docSnap.data())
                }

                const docRef2 = doc(firestore, "order", orderId)
                const docSnap2 = await getDoc(docRef2)
                if(docSnap2.exists) {
                    setLoadedOrder(docSnap2.data())
                    setSelectedStatus(docSnap2.data().status)
                    const docRef3 = doc(firestore, "user", docSnap2.data().customerID)
                    const docSnap3 = await getDoc(docRef3)
                    if(docSnap3.exists) {
                        setCustomerData(docSnap3.data())
                    }
                }
                

                setLoading(false)
            }  
            fetchData() 
            // Return the function to unsubscribe from the event so it gets removed on unmount
            return unsubscribe;  
        })       
    }, [navigation])

    useEffect(() => {
        if(loadedOrder && userData){
          if(userData.user_type == "Staff" || userData.user_type == "Manager"){
            setLoadedOrder({...loadedOrder, status: selectedStatus})
            if(selectedStatus == "Completed"){
                var randomPoint = Math.floor(Math.random() * 10) + 1 ;
                if(customerData){
                    if(customerData.point == null || customerData.point == 0 || customerData.point == ""){
                        setCustomerData({...customerData, point: randomPoint})
                    }
                    if(customerData.point != null || customerData.point != 0 || customerData.point != ""){
                        setCustomerData({...customerData, point: customerData.point + randomPoint})
                    }
                }
            }
          }
        }
      }, [selectedStatus])

    const ListItem = ({ item }) => {
        return (
            <View style={styles.item}>
                <Image
                    source={{
                    uri: item.product_image,
                    }}
                    style={styles.itemPhoto}
                    resizeMode="cover"
                />
                <View style={styles.itemColumn}>
                    <Text style={styles.itemTextBold}>{item.product_name}</Text>
                    <Text style={styles.itemText}>Quantity: {item.quantity}</Text>
                </View>

            </View>
        );
    };

    const handleSubmit = async () => {
        setLoading(true)
        const orderRef = doc(firestore, 'order', orderId)
        await setDoc(orderRef, loadedOrder, {merge: true})

        if(loadedOrder.status == "Completed"){ //if order is set to completed, award the customer who ordered with points
            const userRef = doc(firestore, 'user', loadedOrder.customerID)
            await setDoc(userRef, customerData, {merge: true})
        }
        Toast.show({
          type:'success',
          text1:'Order Status Updated!'                           
        })
        setLoading(false)
        navigation.navigate('Order') 
      }

  return (
    loading ? <View style={styles.loadingContainer}><ActivityIndicator size="large" /></View> :
    <View style={styles.container}>
        <View style={{flexDirection: 'row', margin: 20, justifyContent: 'space-between'}}>
            <Text style={styles.itemTableNumber}>Table No.: {loadedOrder ? loadedOrder.table_number : ''}</Text>
           
            {
                userData ?
                userData.user_type == "Customer" ?
                (
                    <Text style={styles.itemStatus}>{selectedStatus}</Text>
                ) :
                (
                    <View style={styles.itemStatus}>
                        <Picker
                            // style={{color: '#fff'}}
                            selectedValue={selectedStatus}
                            onValueChange={(itemValue, itemIndex) =>
                            setSelectedStatus(itemValue)
                            }>
                            <Picker.Item label="Preparing" value="Preparing" />
                            <Picker.Item label="Completed" value="Completed" />
                            <Picker.Item label="Cancelled" value="Cancelled" />
                        </Picker>
                    </View>
                ) :
                null
            }        
        </View>
        <Text style={styles.orderDate}> Ordered on: {loadedOrder ? loadedOrder.date_time : ''}</Text>

        <FlatList
          style={{marginBottom: 50}}
          vertical
          data={loadedOrderProducts}
          renderItem={({ item }) => <ListItem item={item} />}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={()=><Text style={styles.flatListHeader}>ITEMS</Text>}
        />
        {
            userData ?
            userData.user_type == "Customer" ?
            null :
            (
                <View style={{margin: 10}}>
                    <FormButton
                        buttonTitle="UPDATE ORDER STATUS"
                        onPress={() => handleSubmit()}
                    />
                </View>
            ) :
            null
        }
       
    </View>
  )
}

export default OrderDetail

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
    item: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        padding: 10,
        borderRadius: 3,
        width: '100%',
        elevation: 1,
        shadowColor: '#e5e9eb',
    },
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
    itemTableNumber: {
        width: "50%",
        fontWeight:'500', 
        padding: 10, 
        alignSelf: 'center', 
        fontSize: 16, 
        color: '#455b6b',
        justifyContent: 'center'
    },
    orderDate: {
        fontWeight:'500', 
        padding: 10, 
        alignSelf: 'center', 
        fontSize: 16, 
        color: '#455b6b',
        justifyContent: 'center'
    },
    itemStatus: {
        width: "50%",
        borderRadius: 30, 
        padding: 10, 
        color: '#fff', 
        textAlign: 'center',
        backgroundColor: '#7f8c93', 
        fontWeight:'500', 
        alignSelf: 'flex-end', 
        fontSize: 16
    },
    itemText: {
        marginTop: 5,
        marginBottom: 20
    },
    itemTextBold: {
        fontWeight:'bold', 
        marginBottom: 10, 
        fontSize: 20, 
        color: '#455b6b'
    },
    flatListHeader: {
        fontWeight: 'bold', 
        textAlign: 'center', 
        padding: 10, 
        backgroundColor: '#9f6e50', 
        color:'#fff'
    }
})