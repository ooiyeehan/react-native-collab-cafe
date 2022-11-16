import React, { useEffect, useState, useContext } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { Avatar } from '@react-native-material/core'; 
import { doc, getDoc } from "firebase/firestore";
import styles from '../styles';
import UseFirebase from '../contexts/useFirebase';
import { AuthContext } from '../navigation/AuthProvider';
import { db } from "../helpers/Firebase";

const App = ({ navigation }) => {
  const [banners, setBanners] = useState([]);
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
      let data = await UseFirebase.getBanners();
      setHolder(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      setBanners(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
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
          setBanners(holder);
      }

      const updatedData = holder.filter((item) => {
        const key = `${item.name.toUpperCase()})`;
        const query = text.toUpperCase();
          return key.indexOf(query) > -1;
        });
        setBanners(updatedData); 
        setSearchQuery(text); 
  };
  

return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ paddingBottom: 5 }}>
            <View style={styles.container}>
                <SearchBar 
                    round
                    lightTheme
                    placeholder="Search Name"
                    onChangeText={(text) => searchFunction(text)}
                    value={searchQuery}
                />
        {banners
          ? banners.map((doc, i) => {
              return (
                <TouchableOpacity disabled={position == "Manager" ? false: true} style={styles.list} key={i} onPress={() => navigation.navigate("BannerDetail", {
                            bannerId: doc.id
                        })}>
                  {doc.image ? (
                    <Avatar image={{ uri: doc.image }} />
                  ) : (
                    <Avatar label="Banner Image" autoColor />
                  )}
                  <View style={styles.subList}>
                    <Text style={styles.listMainText}>{doc.name}</Text>
                    <Text style={styles.listSecondaryText}>{doc.status}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          : null} 
        </View>
    </ScrollView>
 <TouchableOpacity style={styles.buttonPrimary} disabled={position == "Manager" ? false: true} onPress={() => navigation.push('BannerDetail')}>
          <Text style={styles.buttonTextPrimary}>Add New</Text>
    </TouchableOpacity>
    </SafeAreaView>
  );
};

export default App;