import React, { useState, useContext, useEffect  } from "react";
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Image } from "react-native";
import 'react-native-get-random-values'
import Toast from 'react-native-toast-message';
import { v4 as uuidv4 } from 'uuid';
import styles from "./styles/styles"
import { firebase } from './firebase/config';
import { AuthContext } from '../navigation/AuthProvider';

const ViewItemDetails = ({ navigation, route }) => {
    const [name, setName] = useState("Item Name");
    const [profilePicture, setProfilePicture] = useState("https://png.vector.me/files/images/1/4/145000/icon_food_bowl_plate_dan_outline_symbol_silhouette_cartoon_dish_free_knife_logo_fork_plates_cartoons_spoon_dinner_iammisc_spoons_forks_knives_sendok_garpu_diner_piring.jpg");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [qty, setQty] = useState(0);
    const [qtyInStock, setqtyInstock] = useState(0);
    const {itemId} = route.params;
    const [cartID, setcartID] = useState();
    const { user } = useContext(AuthContext);
    const [productID, setProductID] = useState();

    useEffect(() => {
        console.log('item id is' + itemId);
        var data = [];
        firebase.firestore()
        .collection('item').doc(itemId)//change item id
        .get()
        .then(documentSnapshot => {
                data.push({
                description:documentSnapshot.get("description"),
                image:documentSnapshot.get("image"),
                item_type:documentSnapshot.get("item_type"),
                last_modified_by:documentSnapshot.get("last_modified_by"),
                name:documentSnapshot.get("name"),
                quantity:documentSnapshot.get("quantity"),
                status:documentSnapshot.get("status"),
                price:documentSnapshot.get("price")
               
            })

                setProductID(documentSnapshot.id)
                setName(data[0].name)
                setProfilePicture(data[0].image)
                setDescription(data[0].description)
                setPrice(data[0].price)
                setqtyInstock(data[0].quantity)



                firebase.firestore().collection('user').doc(user.uid).get().then((doc)=>{
                    setcartID(doc.data().cartid)

                })
        }).catch(error =>{
            console.log(error)
        })
      },[]);

      const addnewItem = (CartProductObject, qtyInStock) => {
        const cartsRef = firebase.firestore().collection('cartProducts');
        const totalCartPrice = parseFloat(CartProductObject.quantity) * parseFloat(CartProductObject.product_price)//convert to integer first
    
            //get existing cart total
            var latestNumberofStock = 0;
            firebase.firestore()
            .collection('item').doc(itemId)//change item id
            .get()
            .then(documentSnapshot => {
                    latestNumberofStock = documentSnapshot.get("quantity")
            
    
            firebase.firestore()
            .collection('cart').doc(cartID)//change cart id
            .get()
            .then(documentSnapshot => {
                    var existingTotal = documentSnapshot.get("total_price")
                const totalOfCart = parseFloat(existingTotal) + parseFloat(totalCartPrice)
                console.log(existingTotal)
                        // update the number of item in item db
                        if (latestNumberofStock >= CartProductObject.quantity){
                            const updatedQty = latestNumberofStock - CartProductObject.quantity
                                firebase.firestore()
                                .collection('item')
                                .doc(itemId)//change item id
                                .update({
                                    'quantity': updatedQty,
                                })
                                .then(() => {
                                    //add new cart into table
                                    const uuid = uuidv4()
                                    cartsRef.doc(uuid).get().then(snap => {//change item id
                                        if (snap.exists){
                                            cartsRef.doc(uuid)//change item id
                                            .update({
                                                'quantity': parseInt(CartProductObject.quantity) + parseInt(snap.get('quantity')),
                                            }).then(() => {
                                                showToast('info','Items have been sucessfully added to cart')  
                                            })
                                        }else{
                                            cartsRef.doc(uuid).set(CartProductObject).then(() =>{//change item id
                                                //update total price in cart
                                                showToast('info','Items have been sucessfully added to cart')    
                                            })
    
                                            firebase.firestore()
                                                .collection('cart')
                                                .doc(cartID)//change cart id
                                                .update({
                                                    'total_price': totalOfCart,
                                                })
                                        }
    
                                        
                                    })
    
                                    
                                    
                                });
                        }else{
                            showToast('error','There are only '+latestNumberofStock+' items in stock, your: '+CartProductObject.quantity+'')
                        }
                 
        })
    })
    
    }
    
    const minusItem = (qty) => {
        if (qty > 0){
        return qty - 1
        }
    
        return 0
    }
    
    const showToast = (typemsg, title1) => {
        Toast.show({
          type: typemsg,
          text1: title1,
        });
      }

            return(    
                <SafeAreaView style={styles.container}>
                    <ScrollView>
                    <Image
                    style={styles.itempicture}
                    source={{uri:profilePicture}}
                    />
                    <Text style={styles.itemNameTitle}>{name}</Text>
                    <Text style={styles.itemDescription}>{description}</Text>
                    <View style={{flexDirection:'row',flex:1,justifyContent:'space-between'}}>
                        <Text  style={styles.itemPrice}>RM{price}</Text>
                        <View style={{flexDirection:'row',flex:1,justifyContent:'flex-end'}}>
                        <TouchableOpacity onPress={() => setQty(minusItem(qty))} style={{fontSize:20,borderRadius:100,backgroundColor:"#FDE588",width:50,height:50,justifyContent:'center',alignItems:'center',marginRight:5}}><Text style={{fontSize:30}}>-</Text></TouchableOpacity>
                        <TextInput editable={false} selectTextOnFocus={false} style={{fontSize:20,borderWidth:1,width:50,height:50,textAlign:"center",borderColor:'#C1C7CB'}}>{qty}</TextInput>
                        <TouchableOpacity onPress={() => setQty(qty + 1)} style={{fontSize:20,borderRadius:100,backgroundColor:"#FDE588",width:50,height:50,justifyContent:'center',alignItems:'center',marginLeft:5,marginRight:5}}><Text style={{fontSize:30}}>+</Text></TouchableOpacity>
                        </View>     
                    </View>
                    </ScrollView>
                    <TouchableOpacity onPress={() => {
                                            console.log('Your cart id: ' + cartID)
                        addnewItem({product_name: name, product_image:profilePicture, product_price:price, quantity:qty, cartID: cartID, productID}, qtyInStock)}} style={{fontSize:20,borderRadius:100,backgroundColor:"#FDE588",width:"90%",height:50,justifyContent:'center',alignItems:'center',marginBottom:10,alignSelf:"center",marginLeft:5,marginRight:5}}><Text style={{fontSize:30}}>Add Items</Text></TouchableOpacity>
                </SafeAreaView>
            )
          
        
}




export default ViewItemDetails;