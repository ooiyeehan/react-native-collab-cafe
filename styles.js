import { StyleSheet } from "react-native";

const CafeTheme = {
    primaryColor: "#9F6E50",
    secondaryColor: "#FDE588",
    inputColor: "#455B6B",
    borderColor: "#7F8C93",
    bgColor: "#F9FCFC",
    marginX: 12,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CafeTheme.bgColor,
  },
  primaryText: {
    marginTop: 18,
    marginHorizontal: CafeTheme.marginX,
    fontSize: 18,
    color: CafeTheme.primaryColor,
  },
  textInput: {
    marginTop: 15,
    marginHorizontal: CafeTheme.marginX,
    padding: 10,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: CafeTheme.borderColor,
    borderRadius: 25,
    color: CafeTheme.inputColor,
    fontWeight: "500",
  },
  setImage: {
    marginTop: 15,
    alignItems: "center",
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  setCustomImage: {
    alignItems: "center",
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  buttonPrimary: {
    marginTop: 15,
    marginHorizontal: CafeTheme.marginX,
    padding: 16,
    borderRadius: 25,
    backgroundColor: CafeTheme.secondaryColor,
    color: CafeTheme.primaryColor,
    textTransform: "uppercase",
  },
  buttonTextPrimary: {
    textAlign: "center",
    fontSize: 18,
    color: CafeTheme.primaryColor,
    fontWeight: "700",
  },
  externalLink: {
    marginHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: CafeTheme.primaryColor,
  },
  alignCenter: {
    alignItems: "center",
  },
  FAB: {
    justifyContent: "flex-end",
    alignItems: "flex-end",
    margin: 20,
  },
  list: {
    justifyContent: 'space-evenly',
    padding: 10,
    flexDirection: "row",
  },
  subList: {
    flex: 1,
    padding: 10,
    flexDirection: "column",
  },
  listMainText: {
    textTransform: "uppercase",
    color: "#455B6B",
    fontWeight: "700",
    fontSize: 15,
  },
  listSecondaryText: {
    justifyContent: "flex-end",
    alignItems: "flex-end",
    textAlign: "right",
    fontWeight: "500",
    color: "#455B6B",
    fontSize: 13,

  },
  topTabBar: {
    color: CafeTheme.primaryColor,
    
  },
  icon: {
    width: 150,
    height: 150,
    margin: 25,
    alignSelf: "center",
    marginHorizontal: CafeTheme.marginX
  },
  picker: {
    height: 150,
    flex: 1,
    justifyContent: 'flex-end',
  },
});

export default styles;
