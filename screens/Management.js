import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Rewards from './Rewards';
import Banners from './Banners';
import Items from './Items';
import Accounts from './Accounts';
import Leaves from './Leaves';

const Tab = createMaterialTopTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator screenOptions={{
      tabBarLabelStyle: { color: '#ffffff', fontWeight: "500", },
      tabBarIndicatorStyle: { backgroundColor: '#ffffff' },
        tabBarStyle: { backgroundColor: '#9F6E50' },
      }}>
      <Tab.Screen name="Rewards" component={Rewards} />
      <Tab.Screen name="Banners" component={Banners} />
      <Tab.Screen name="Items" component={Items} />
      <Tab.Screen name="Accounts" component={Accounts} />
      <Tab.Screen name="Leaves" component={Leaves} />
    </Tab.Navigator>
  );
}

export default MyTabs;
