import { useState, useContext, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, FontAwesome5, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { doc, getDoc } from 'firebase/firestore';
import Order from '../screens/Order';
import Dashboard from '../screens/Dashboard';
import Menu from '../screens/Menu';
import Profile from '../screens/Profile';
import ViewItemDetails from '../screens/ViewItemDetails'
import EditProfile from '../screens/EditProfile'
import OrderDetail from '../screens/OrderDetail';
import ViewCart from '../screens/ViewCart';
import { AuthContext } from './AuthProvider';
import { firestore } from '../firebase';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTabNavigatorCustomer() {

    const {user} = useContext(AuthContext);
    const [userData, setUserData] = useState()

    useEffect(() => {
        async function fetchData(){
            if (user) {
                const docRef = doc(firestore, "user", user.uid)
                const docSnap = await getDoc(docRef)
                if(docSnap.exists) {
                  setUserData(docSnap.data())
                }
            } 
        }
        fetchData()
      }, []);

    return (
        <Tab.Navigator
        initialRouteName={"Dashboard"}
        screenOptions={{
            headerMode: 'screen',
            headerTintColor: '#B57F5F',
            headerTitleStyle: { fontWeight: "700", fontSize: 20 },
            headerStyle: { backgroundColor: '#FDE588'},
            unmountOnBlur: true, 
            tabBarHideOnKeyboard: true 
          }}
        >
            <Tab.Screen 
                name="ViewCart" component={ViewCart} options={{
                    tabBarLabel: 'Cart',
                    tabBarIcon: () => (
                        <FontAwesome5 name="shopping-cart" size={22}/>
                    ),
                    // headerShown: false
                }}
            />
            <Tab.Screen 
                name="Order" component={Order} options={{
                    tabBarLabel: 'Order',
                    tabBarIcon: () => (
                        <FontAwesome name="file" size={22}/>
                    )
                    
                    // headerShown: false
                }}
            />
            <Tab.Screen 
                name="Dashboard" component={Dashboard} options={{
                    tabBarLabel: 'Dashboard',
                    tabBarIcon: () => (
                        <MaterialCommunityIcons name="view-dashboard" size={22}/>
                    ),
                    title: userData != null ? 'Hi, ' + userData.name : 'Hi, User'
                    // headerShown: false
                }}
            />
            <Tab.Screen 
                name="Menu" component={Menu} options={{
                    tabBarLabel: 'Menu',
                    tabBarIcon: () => (
                        <MaterialIcons name="restaurant-menu" size={22}/>
                    ),
                    // headerShown: false
                }}
            />
            <Tab.Screen 
                name="Profile" component={Profile} options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: () => (
                        <FontAwesome name="user" size={22}/>
                    ),
                    // headerShown: false
                }}
            />
        </Tab.Navigator>
    )
}

export default function AppStackCustomer() {

    return (
        <Stack.Navigator initialRouteName={"Dashboard"} screenOptions={{
            headerMode: 'screen',
            headerTintColor: '#B57F5F',
            headerTitleStyle: { fontWeight: "700", fontSize: 20 },
            headerStyle: { backgroundColor: '#FDE588'},
        }}>
            
            <Stack.Screen name="BottomTabNavigatorCustomer" component={BottomTabNavigatorCustomer} options={{headerShown: false}}/> 
            <Stack.Screen name="EditProfile" component={EditProfile} options={{title:'Edit Profile'}} /> 
            <Stack.Screen name="OrderDetail" component={OrderDetail} options={({route})=>({title: '#' + route.params.orderId})} />
            <Stack.Screen name="ViewItemDetails" component={ViewItemDetails} options={{title:'View Item Details'}} /> 
        </Stack.Navigator>
    )
}
