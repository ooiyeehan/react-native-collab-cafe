import React from "react";
import { Text, TouchableOpacity } from "react-native";
import styles from "../screens/styles/styles";

const FSButton = (props) => {
  const { title, style, onPress } = props;
  return (
    <TouchableOpacity style={[styles.buttonPrimary, style]} onPress={onPress}>
      <Text style={styles.buttonTextPrimary}>{title.toUpperCase()}</Text>
    </TouchableOpacity>
  );
};

export default FSButton;