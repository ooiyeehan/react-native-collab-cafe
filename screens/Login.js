import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import FormInput from '../components/FormInput'
import FormButton from '../components/FormButton';
import { AuthContext } from '../navigation/AuthProvider';

const Login = ({navigation}) => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  const {login} = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
      />
      <Text style={styles.text}>Café</Text>

      <FormInput
        labelValue={email}
        onChangeText={(userEmail) => setEmail(userEmail)}
        placeholderText="Email"
        iconType="mail"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <FormInput
        labelValue={password}
        onChangeText={(userPassword) => setPassword(userPassword)}
        placeholderText="Password"
        iconType="lock"
        secureTextEntry={true}
      />
      <TouchableOpacity style={styles.forgotButton} onPress={() => navigation.navigate("ResetPassword")}>
        <Text style={styles.navButtonText}>Forgot Password?</Text>
      </TouchableOpacity>

      <FormButton
        buttonTitle="LOGIN"
        onPress={() => login(navigation, email, password)}
      />

      <FormButton
        buttonTitle="SIGN UP"
        onPress={() => navigation.navigate("Register")}
      />
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50
  },
  logo: {
    height: 150,
    width: 150,
    resizeMode: 'cover',
  },
  text: {
    fontSize: 28,
    marginBottom: 10,
    color: '#9f6e50',
    fontWeight: 'bold'
  },
  navButton: {
    marginTop: 15,
  },
  forgotButton: {
    marginVertical: 10,
    alignSelf: 'flex-end'
  },
  navButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#617481'
  },
});
