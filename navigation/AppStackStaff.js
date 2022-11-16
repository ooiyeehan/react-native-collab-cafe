import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Order from '../screens/Order';
import Profile from '../screens/Profile';
import EditProfile from '../screens/EditProfile';
import AddLeave from '../screens/AddLeave';
import LeaveDetail from '../screens/LeaveDetail';
import OrderDetail from '../screens/OrderDetail';
import Management from "../screens/Management";
import RewardDetail from '../screens/RewardDetail';
import BannerDetail from '../screens/BannerDetail';
import ItemDetail from '../screens/ItemDetail';
import AccountDetail from '../screens/AccountDetail';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTabNavigatorStaff() {

    return (
        <Tab.Navigator
        initialRouteName={"Management"}
        screenOptions={{
            headerMode: 'screen',
            headerTintColor: '#B57F5F',
            headerTitleStyle: { fontWeight: "700", fontSize: 20 },
            headerStyle: { backgroundColor: '#FDE588'},
            unmountOnBlur: true, 
            tabBarHideOnKeyboard: true}}
       >
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
                name="Management" component={Management} options={{
                    tabBarLabel: 'Management',
                    tabBarIcon: () => (
                        <MaterialCommunityIcons name="briefcase" size={22}/>
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



export default function AppStackStaff() {

    return (
        <Stack.Navigator initialRouteName={"Management"} screenOptions={{
            headerMode: 'screen',
            headerTintColor: '#B57F5F',
            headerTitleStyle: { fontWeight: "700", fontSize: 20 },
            headerStyle: { backgroundColor: '#FDE588'},
          }}>
            <Stack.Screen name="BottomTabNavigatorStaff" component={BottomTabNavigatorStaff} options={{headerShown: false}}/>
            <Stack.Screen name="RewardDetail" component={RewardDetail} options={{ title: 'Reward' }} />
            <Stack.Screen name="BannerDetail" component={BannerDetail} options={{ title: 'Banner' }} />
            <Stack.Screen name="ItemDetail" component={ItemDetail} options={{ title: 'Item' }} />
            <Stack.Screen name="AccountDetail" component={AccountDetail} options={{ title: 'Account' }} />
            <Stack.Screen name="EditProfile" component={EditProfile} options={{title:'Edit Profile'}} /> 
            <Stack.Screen name="OrderDetail" component={OrderDetail} options={({route})=>({title: '#' + route.params.orderId})} />
            <Stack.Screen name="AddLeave" component={AddLeave} options={{title:'Request for Leave'}} /> 
            <Stack.Screen name="LeaveDetail" component={LeaveDetail} options={{title:''}} /> 
        </Stack.Navigator>
    )
}
