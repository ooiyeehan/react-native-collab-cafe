import { StyleSheet } from "react-native";

const CafeTheme = {
    bgColor: "#FFFFFF",
    primaryColor: "#9F6E50",
    buttonColor:"#FDE588",
    marginX: 12,
    itemNametitlecolor:"#455B6B",
    itemDescriptionColor:"#949FA5"
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: CafeTheme.bgColor,
    },
    tinyLogo:{
      width: 120,
      height: 120,
      alignSelf: 'center',
      marginTop:20,
    },
    itempicture:{
        height: 200,
        resizeMode: 'contain',
        flex: 1,
        width: null,
        marginTop:20
    },
    itemNameTitle:{
      fontSize: 30,
      color: CafeTheme.itemNametitlecolor,
      marginTop: 20,
      marginHorizontal: CafeTheme.marginX
    },
    itemDescription:{
      fontSize: 20,
      color: CafeTheme.itemDescriptionColor,
      marginTop: 10,
      marginHorizontal: CafeTheme.marginX
    },
    itemPrice:{
      fontSize: 25,
      fontWeight: 'bold',
      color: CafeTheme.itemDescriptionColor,
      marginTop: 10,
      justifyContent: 'flex-start',
      marginHorizontal: CafeTheme.marginX
    },
    title: {
        fontSize: 48,
        color: CafeTheme.primaryColor,
        marginTop: 70,
        marginHorizontal: CafeTheme.marginX,
      },
      buttonPrimary: {
        marginTop: 18,
        marginHorizontal: CafeTheme.marginX,
        padding: 16,
        borderRadius: 25,
        backgroundColor: CafeTheme.buttonColor,
      },
      buttonTextPrimary: {
        textAlign: "center",
        fontSize: 18,
        color: "#AB7D57",
      },
      textInput: {
        marginTop: 18,
        marginHorizontal: CafeTheme.marginX,
        padding: 16,
        borderWidth: 2,
        fontSize: 24,
        borderColor: "#C7CDD0",
        borderRadius: 30,
      }
  });

  export default styles;