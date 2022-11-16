import React from "react";
import { TextInput } from "react-native";
import styles from "../screens/styles/styles";

const FSInputTextInput = (props) => {
  // Destructure the object passed from props
  const { placeholder, value, onChangeText, secured } = props;
  return (
    <TextInput
      style={styles.textInput}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secured ? secured : false}
    />
  );
};

export default FSInputTextInput;