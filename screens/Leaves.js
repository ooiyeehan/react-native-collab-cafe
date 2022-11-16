import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, } from 'react-native';
import { SearchBar } from 'react-native-elements';
import styles from '../styles';
import UseFirebase from '../contexts/useFirebase';

  

const App = ({ navigation }) => {
  const [leaves, setLeaves] = useState([]);
  const [holder, setHolder] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    useEffect(() => {
      const unsubscribe = navigation.addListener('focus', () => {
        getData();
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
    }, []);

  const getData = async () => {
      let data = await UseFirebase.getLeaves();
      setHolder(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      setLeaves(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };
  
    
    const searchFunction = (text) => {
      if (text == null | text == "") {
          setLeaves(holder);
      }

      const updatedData = holder.filter((item) => {
        const key = `${item.reason.toUpperCase()})`;
        const query = text.toUpperCase();
          return key.indexOf(query) > -1;
        });
        setLeaves(updatedData); 
        setSearchQuery(text); 
    };

return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ paddingBottom: 5 }}>
            <View style={styles.container}>
                <SearchBar 
                    round
                    lightTheme
                    placeholder="Search Reason"
                    onChangeText={(text) => searchFunction(text)}
                    value={searchQuery}
                />
        {leaves
          ? leaves.map((doc, i) => {
              return (
                <TouchableOpacity style={styles.list} key={i} onPress={() => navigation.navigate("LeaveDetail", {
                            leaveId: doc.id
                        })}>
                  <View style={styles.subList}>
                    <Text style={styles.listMainText}>{doc.reason} ({doc.date_requested})</Text>
                    <Text style={styles.listSecondaryText}>{doc.status}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          : null}
        </View>
    </ScrollView>
 <TouchableOpacity style={styles.buttonPrimary} onPress={() => navigation.push('AddLeave')}>
          <Text style={styles.buttonTextPrimary}>Add New</Text>
    </TouchableOpacity>
    </SafeAreaView>
  );
};

export default App;