import React, { useEffect, useState, useContext } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { Avatar } from '@react-native-material/core';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../helpers/Firebase";
import { AuthContext } from '../navigation/AuthProvider';
import UseFirebase from '../contexts/useFirebase';
import styles from '../styles';

const App = ({ navigation }) => {
  const [accounts, setAccounts] = useState([]);
  const [holder, setHolder] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useContext(AuthContext);
  const [position, setPosition] = useState(""); 
  
    useEffect(() => {
      const unsubscribe = navigation.addListener('focus', () => {
        get(user.uid);
        getData();
        
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
    }, []);

  const getData = async () => {
      
      let data = await UseFirebase.getAccounts();
      setHolder(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      setAccounts(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };
  
  async function get(userId) {
   await getDoc(doc(db, "user", userId
    ))
      .then((docSnap) => {
        let object = docSnap.data();
        setPosition(object.user_type);

      })
      .catch((error) => {
        Toast.show({
                type:'error',
                text1: error
      })
    });
  }
    const searchFunction = (text) => {
      if (text == null | text == "") {
          setAccounts(holder);
      }

      const updatedData = holder.filter((item) => {
        const key = `${item.name.toUpperCase()})`;
        const query = text.toUpperCase();
          return key.indexOf(query) > -1;
        });
      setAccounts(updatedData); 
      
        setSearchQuery(text); 
    };

return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ paddingBottom: 5 }}>
            <View style={styles.container}>
        <SearchBar
                    round
                    lightTheme
                    placeholder="Search"
                    onChangeText={(text) => searchFunction(text)}
                    value={searchQuery}
        />
        
        {accounts
          ? accounts.map((doc, i) => {
              return (
                <TouchableOpacity disabled={position == "Manager" && user.uid != doc.id ? false: true} style={styles.list} key={i} onPress={() => navigation.navigate("AccountDetail", {
                            userId: doc.id
                })}>
                  {doc.profile_image ? (
                    <Avatar image={{ uri: doc.profile_image }} />
                  ) : (
                    <Avatar label="User Image" autoColor />
                  )}
                  <View style={styles.subList}>
                    <Text style={styles.listMainText}>{doc.name} ({doc.email})</Text>
                    <Text style={styles.listSecondaryText}>{doc.user_type}</Text>
                  </View>
                  
                </TouchableOpacity> 
              );
            })
          : null}
         
      </View>
      
    </ScrollView>
 <TouchableOpacity style={styles.buttonPrimary} disabled={position == "Manager" ? false: true} onPress={() => navigation.push('AccountDetail')}>
          <Text style={styles.buttonTextPrimary}>Add New</Text>
    </TouchableOpacity>
    </SafeAreaView>
  );
};

export default App;