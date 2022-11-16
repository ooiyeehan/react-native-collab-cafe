import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/Login'
import Register from '../screens/Register';
import ResetPassword from '../screens/ResetPassword';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{
      headerMode: 'screen',
      headerTintColor: '#B57F5F',
      headerTitleStyle: { fontWeight: "700", fontSize: 20 },
      headerStyle: { backgroundColor: '#FDE588' },
    }}>
        <Stack.Screen
            name="Login"
            component={Login}
            options={{headerShown: false}}
        />
        <Stack.Screen
            name="Register"
            component={Register}
            // options={{headerShown: false}}
      />
      <Stack.Screen name="ResetPassword" component={ResetPassword} options={{ title: 'Reset Password' }} /> 
  </Stack.Navigator>
  )
}

export default AuthStack
