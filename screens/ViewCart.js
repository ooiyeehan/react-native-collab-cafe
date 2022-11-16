import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Image, FlatList, LogBox } from "react-native";
import { Dropdown } from 'react-native-material-dropdown-v2';
import 'react-native-get-random-values'
import styles from "./styles/styles"
import FSButton from "../components/FSButton";
import { firebase } from './firebase/config';
import { AuthContext } from "../navigation/AuthProvider";



const ViewCart = () =>     {
    const { user } = useContext(AuthContext);
    const [cartID, setcartID] = useState();
    LogBox.ignoreLogs(['Animated: `useNativeDriver`']);
    const [totalPrice, setTotalPrice] = useState(0)
    const [cartProducts, setcartProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tableNumber, setTableNumber] = useState('T001');
    const tableNumberData = [
        { value: 'T001'},
        { value: 'T002' },
        { value: 'T003' },
        { value: 'T004' },
        { value: 'T005' },
        { value: 'T006' },
        { value: 'T007' },
        { value: 'T008' },
        { value: 'T009' },
        { value: 'T010' },
      ];

      const CustomRow = ({ cartitem, totalprice }) => {
        var [oldNumberofItem, setoldNumberofItem] = useState(cartitem.quantity)
        var [isShown, setIsShown] = useState(true)
        return(   
            isShown?
            <View style={{marginTop:20, borderTopColor:"#C1C7CB",borderWidth:1, paddingTop:10, paddingBottom:10}}>
            <View style={{flexDirection:"row"}}>
            <Image source={{ uri: cartitem.product_image }} style={{height:100,width:100,resizeMode:"contain",borderRadius:100,marginLeft:20}} />
            <View style={{flexDirection:"column",flex:1}}>
                <Text style={{fontSize:20,marginLeft:30}}>{cartitem.product_name}</Text>
                <Text style={{fontSize:20, marginLeft:30}}>RM{cartitem.product_price}</Text>
                    <View style={{flexDirection:"row",alignSelf:"flex-end"}}>
                    <TouchableOpacity onPress={() => 
                    {
                    if (oldNumberofItem == 1){
                        setIsShown(false)
                    }
                    minusItem(oldNumberofItem-1,cartitem.productID, cartitem.product_price); 
                    setoldNumberofItem(oldNumberofItem-1);
    
                    }} style={{borderRadius:100,backgroundColor:"#FDE588",width:35,height:35,justifyContent:'center',alignItems:'center',marginRight:5}}><Text style={{fontSize:25}}>-</Text></TouchableOpacity>
                    <TextInput editable={false} selectTextOnFocus={false} style={{fontSize:20,borderWidth:1,width:30,height:30,textAlign:"center",borderColor:'#C1C7CB', alignSelf:"flex-end"}}>{oldNumberofItem}</TextInput>
                    <TouchableOpacity onPress={() => {
                        addItem(oldNumberofItem+1,cartitem.productID, cartitem.product_price); 
                        setoldNumberofItem(oldNumberofItem+1);
    
                        }} style={{borderRadius:100,backgroundColor:"#FDE588",width:35,height:35,justifyContent:'center',alignItems:'center',marginRight:5, marginLeft:5}}><Text style={{fontSize:25}}>+</Text></TouchableOpacity>
                    </View>
            </View>
        </View>
        </View>
        :<View></View>
        )
        }
    
    const minusItem = (qty, productID, price) => {
        firebase.firestore().collection('item').doc(productID).get().then(documentSnapshot => {
            const stock = documentSnapshot.get('quantity');
            console.log('Your product id is' + productID)
            if (stock >= qty){
            firebase.firestore()
            .collection('item')
            .doc(productID)//change item id
            .update({
                'quantity': stock + 1,
            }).then(()=>{  
                if (parseInt(qty) !== 0){     
                    firebase.firestore()
                    .collection('cartProducts')
                    .where('productID','==', productID)
                        .where('cartID','==',cartID)//change item id
                        .get().then(snapshot => {
                            if (snapshot.size > 0){
                                snapshot.forEach(cartItem => {
                                    console.log(cartItem.id)
                                    firebase.firestore().collection('cartProducts').doc(cartItem.id).update({'quantity' : qty}).then(()=>{
                                        showToast('info','Update Quantity Successfully')
                                    })
                                    
                                })
                            }
                        })
                }else{
                    firebase.firestore().collection('cartProducts')
                    .where('productID','==', productID)
                        .where('cartID','==',cartID)//change item id
                        .get().then(snapshot => {
                            if (snapshot.size > 0){
                                snapshot.forEach(cartItem => {
                                    console.log(cartItem.id)
                                        firebase.firestore()
                                        .collection('cartProducts')
                                        .doc(cartItem.id)
                                        .delete()
                                        .then(() => {
                                            showToast('info','Remove Item Successfully')
                                        });
                                        showToast('info','Update Quantity Successfully')
                                    
                                    
                                })
                            }
                        })

                    
                }
    
                firebase.firestore().collection('cart').doc(cartID).get().then(doc =>{ // change user id
                    var existingTotal = doc.get("total_price")
                    var latestTotal = parseFloat(existingTotal) - parseFloat(price)
    
                    firebase.firestore().collection('cart').doc(cartID) // change user id
                    .update({
                        'total_price': latestTotal,
                    })
                })
            }
            )
        }
        })
            
        }
    
        const addItem = (qty, productID, price) => {
            firebase.firestore().collection('item').doc(productID).get().then(documentSnapshot => {
                const stock = documentSnapshot.get('quantity');
                console.log('Your stock is' + stock)
                if (stock >= qty){
                firebase.firestore()
                .collection('item')
                .doc(productID)//change item id
                .update({
                    'quantity': stock - 1,
                }).then(()=>{  
                    if (parseInt(qty) !== 0){  
                        console.log('Your productID is' + productID)
                        console.log('Your cartID is' + cartID)   
                        firebase.firestore()
                        .collection('cartProducts')
                        .where('productID','==', productID)
                        .where('cartID','==',cartID)//change item id          
                        .get().then(snapshot => {
                            console.log('Your size is' + snapshot.size)   
                            if (snapshot.size > 0){
                               
                                snapshot.forEach(cartItem => {
                                    firebase.firestore().collection('cartProducts').doc(cartItem.id).update({'quantity' : qty}
                                    .then(()=>{
                                        showToast('info','Update Quantity Successfully')
                                    }))
                                })
                            }
                        })
                    }else{
                        firebase.firestore()
                        .collection('cartProducts')
                        .doc(productID)
                        .delete()
                        .then(() => {
                            showToast('info','Remove Item Successfully')
                        });
                    }
        
                    firebase.firestore().collection('cart').doc(cartID).get().then(doc =>{ // change user id
                        var existingTotal = doc.get("total_price")
                        var latestTotal = parseFloat(existingTotal) + parseFloat(price)
        
                        firebase.firestore().collection('cart').doc(cartID) // change user id
                        .update({
                            'total_price': latestTotal,
                        })
                    })
                }
                )
            }
            })
        }
    
        const showToast = (typemsg, title1) => {
            Toast.show({
              type: typemsg,
              text1: title1,
            });
          }  

          
    useEffect(() =>  {
        async function fetchdata(){
            await firebase.firestore().collection('user').doc(user.uid).get().then(async (doc)=>{
                setcartID(doc.data().cartid)

                await firebase.firestore().collection("cartProducts").where('cartID','==',doc.data().cartid).get()//change cart id
               .then((querySnapshot) => {
                   console.log('your cart id is ' + doc.data().cartid)
                   var s = []
                   var x = 0
                   querySnapshot.forEach((doc) => {
                       var itemtoBeInserted = doc.data()
                    //    itemtoBeInserted.productID = doc.data().productID
                       itemtoBeInserted.position = x
                       s.push(itemtoBeInserted);


                   });
                   setcartProducts(s)
                   setLoading(false)
               })

               
            firebase.firestore().collection('cart').doc(doc.data().cartid)
            .get().then((doc)=>{
                    setTotalPrice(doc.get('total_price'))
                    console.log('run function price = ' + totalPrice)
            })
            })
            
           }
           fetchdata()      

        
        },[])

        
   
    return(
        loading ? <View></View> :
        <SafeAreaView style={styles.container}>
            <FlatList
                data={cartProducts}
                renderItem={({ item }) => <CustomRow cartitem={item} />}
            />
            <View style={{backgroundColor:'#B57F5F'}}>
                <Text style={{fontSize:25,color:'#FFFFFF',alignSelf:'center'}}>ORDER SUMMARY</Text>
            </View>
                <View style={{backgroundColor:"#FFFFFF", flexDirection:'row',justifyContent:"space-between"}}>
                    <Text style={{fontSize:25,color:'#949FA5',alignSelf:'center', marginLeft:15, marginTop:10}}>Grand Total</Text>
                    <Text style={{fontSize:25,color:'#FC011A',alignSelf:'center', marginRight:15, marginTop:10}}>RM{totalPrice.toFixed(2)}</Text>  
                </View>
                <View style={{backgroundColor:"#FFFFFF", flexDirection:'row',justifyContent:"space-between"}}>
                    <Text style={{fontSize:25,color:'#949FA5',alignSelf:'center', marginLeft:15, marginTop:10}}>Table Number</Text>
                        <Dropdown
                            style={{borderWidth:1, height:35, marginRight:15, marginTop:10}}
                            onChangeText={(values)=>{
                                setTableNumber(values);
                                console.log("latest number is " + tableNumber)
                            }}
                            data={tableNumberData}
                            value={tableNumber}
                        ></Dropdown>
                </View>
                <FSButton
                    title="SUM UP"
                    style={{marginTop: 18,padding: 16,marginBottom:3,borderRadius: 25,backgroundColor: "#FDE588"}}
                    onPress={() => {
                        firebase.firestore().collection('cart').doc(cartID).get()
                        .then(doc => {
                            console.log('get total price')
                            setTotalPrice(doc.get('total_price'))
                        })
                    }}
                />

                <FSButton
                    title="Check Out"
                    style={{marginTop: 18,padding: 16,marginBottom:10,borderRadius: 25,backgroundColor: "#FDE588"}}
                    onPress={() => {
                        var data = [];
                        firebase.firestore().collection('user').where('cartid','==',cartID).get()//change cart id
                        .then(querySnapshot => {
                            querySnapshot.forEach((doc) => {
                                data.push(doc.data());
                            })
                            console.log(data)
                            var today= new Date().toLocaleString('en-GB', { timeZone: 'UTC' });
                            const order = {customerID: user.uid, customer_name: data[0].name,total_price: totalPrice,table_number: tableNumber, status: "Preparing", date_time: today}//change user id
                            firebase.firestore().collection('order').add(order).then((docRef) => {
                                firebase.firestore().collection('cartProducts').where('cartID','==',cartID).get()//change cart id
                                .then(querySnapshot => {
                                    querySnapshot.forEach((doc) => {
                                        firebase.firestore().collection('OrderProducts').add({product_name:doc.data().product_name, product_image:doc.data().product_image, product_price:doc.data().product_price, quantity:doc.data().quantity, orderID:docRef.id})

                                        doc.ref.delete();
                                    })

                                    firebase.firestore()
                                    .collection('cart')
                                    .doc(cartID)//change cart id
                                    .update({
                                        'total_price': 0,
                                    })
                                    
                                    showToast('info', 'Order checked out successfully')
                                    setcartProducts([]);
                                    setTotalPrice(0);
                                })
                            })
                        })
                        
                    }}
                />
            
        </SafeAreaView>
    )   

}






export default ViewCart;