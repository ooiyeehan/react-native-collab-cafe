import React from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import { windowHeight } from '../utils/Dimensions'

const FormButton = ({buttonTitle, ...rest}) => {
  return (
    <TouchableOpacity style={styles.buttonContainer} {...rest}>
        <Text style={styles.buttonText}>{buttonTitle}</Text>
    </TouchableOpacity>
  )
}

export default FormButton

const styles = StyleSheet.create({
    buttonContainer:{
        marginTop: 10,
        width: "100%",
        height: windowHeight / 15,
        backgroundColor: '#fde588',
        padding: 10,
        alignItems: "center",
        justifyContent: 'center',
        borderRadius: 30
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#b0845a',

    }
})