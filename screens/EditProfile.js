import React, {useState, useEffect, useContext} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, ImageBackground } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message'
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { firestore } from '../firebase';
import {AuthContext} from '../navigation/AuthProvider';
import FormButton from '../components/FormButton';
import FormInput from '../components/FormInput';


const EditProfile = ({navigation}) => {
  const {user} = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [transferred, setTransferred] = useState(0);

  useEffect(() => {
    
    async function fetchData(){
      setLoading(true)

      const docRef = doc(firestore, "user", user.uid)
      const docSnap = await getDoc(docRef)
      if(docSnap.exists) {
        setUserData(docSnap.data())
      }
      setLoading(false)
    }
    fetchData()    
  }, [])

  const choosePhotoFromLibrary = () => {
    ImagePicker.launchImageLibraryAsync({
      width: 300,
      height: 300,
      cropping: true,
      compressImageQuality: 0.7,
    }).then((image) => {
      const imageUri = image.uri;
      setSelectedImage(imageUri);
      console.log(image)
    });
  };

  const handleUpdate = async () => {

    if(userData != null){

        if(userData.name == ""){
            Toast.show({
                type:'error',
                text1:'Username must not be empty!'
            })
            return;
        }
        else if( selectedImage == null ) { 
            if(userData.profile_image != null){
                const userRef = doc(firestore, 'user', user.uid)
                await setDoc(userRef, userData, {merge: true})
                Toast.show({
                  type:'success',
                  text1:'Profile Updated!'
              })
                navigation.navigate("Profile");
            }           
        }
        else {
            const uploadUri = selectedImage;
            let filename = uploadUri.substring(uploadUri.lastIndexOf('/') + 1);
        
            // Add timestamp to File Name
            const extension = filename.split('.').pop(); 
            const name = filename.split('.').slice(0, -1).join('.');
            filename = name + Date.now() + '.' + extension;
        
            setUploading(true);
            setTransferred(0);
        
            const blob = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    resolve(xhr.response);
                };
                xhr.onerror = function (e) {
                    console.log(e);
                    reject(new TypeError("Network request failed"));
                };
                xhr.responseType = "blob";
                xhr.open("GET", uploadUri, true);
                xhr.send(null);
            });
        
            const storage = getStorage();
            const storageRef = ref(storage, `user/${filename}`);
            // Create file metadata including the content type
            const metadata = {
                contentType: 'image/jpeg',
              };
            const task = uploadBytesResumable(storageRef, blob, metadata);
        
            try {
                 // Listen for state changes, errors, and completion of the upload.
                task.on('state_changed',(snapshot) => {
                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                    switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                    break;
                    case 'running':
                        console.log('Upload is running');
                    break;
                    }
                },
                (error) => {
                    this.setState({ isLoading: false })
                    // A full list of error codes is available at
                    // https://firebase.google.com/docs/storage/web/handle-errors
                    switch (error.code) {
                    case 'storage/unauthorized':
                        console.log("User doesn't have permission to access the object");
                    break;
                    case 'storage/canceled':
                        console.log("User canceled the upload");
                    break;
                    case 'storage/unknown':
                        console.log("Unknown error occurred, inspect error.serverResponse");
                    break;
                    }
                },
                () => {
                    // Upload completed successfully, now we can get the download URL
                    getDownloadURL(task.snapshot.ref).then(async (downloadURL) => {
                        console.log('File available at', downloadURL);
                        //perform your task
                        setUploading(false);
                        setSelectedImage(null);
                        const userRef = doc(firestore, 'user', user.uid)
                        await setDoc(userRef, {...userData, profile_image: downloadURL}, {merge: true})
                        Toast.show({
                          type:'success',
                          text1:'Profile Updated!'                           
                        })
                        navigation.navigate("Profile");
                        
                    });
                });
              
            } catch (e) {
              console.log(e);
              return null;
            }      
        }
    }  

  };
  return (
    loading ? <View style={styles.loadingContainer}><ActivityIndicator size="large" /></View> :
    <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={() => choosePhotoFromLibrary()}>
          <ImageBackground
            source={
                selectedImage ? //if image exists
                {uri: selectedImage} : // use image, else 
                userData != null ?  //if userdata not null
                userData.profile_image == null ? //if profileimageurl is null
                require('../assets/user-default-icon.png') : //use default icon, else
                userData.profile_image != "" ? //if profileimageurl not blank
                {uri: userData.profile_image}  : //uri = profileimageurl, else of (if profileimageurl not blank)
                require('../assets/user-default-icon.png') : //use default icon, else of (if userdata not null)
                require('../assets/user-default-icon.png') } //use default icon
            style={{height: 150, width: 150, marginBottom: 50}}
            imageStyle={{borderRadius: 15}}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <MaterialCommunityIcons
                name="camera"
                size={35}
                color="#fff"
                style={{
                  opacity: 0.7,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#fff',
                  borderRadius: 10,
                }}
              />
            </View>
          </ImageBackground>
        </TouchableOpacity>

        <FormInput
          labelValue={userData ? userData.name : ''}
          onChangeText={(userName) => setUserData({...userData, name: userName})}
          placeholderText="NAME"
          iconType="user"
          keyboardType="default"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <FormInput
          labelValue={userData ? userData.contact_number : ''}
          onChangeText={(userContact) => setUserData({...userData, contact_number: userContact})}
          placeholderText="CONTACT"
          iconType="phone"
          keyboardType="numeric"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <FormInput
          labelValue={userData ? userData.email : ''}
          onChangeText={(userEmail) => setUserData({...userData, email: userEmail})}
          placeholderText="EMAIL"
          iconType="mail"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={false}
        />
        <Text>{'\n\n\n'}</Text>
        <FormButton
          buttonTitle={!uploading ? "SAVE" : <ActivityIndicator />}
          onPress={() => {handleUpdate()}}
        />

    </SafeAreaView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
  },
  loadingContainer:{
    flex:1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  userImg: {
    height: 150,
    width: 150,
    borderRadius: 75,
    marginBottom: 30
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  aboutUser: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  userBtnWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
  },
  userBtn: {
    borderColor: '#2e64e5',
    borderWidth: 2,
    borderRadius: 3,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 5,
  },
  userBtnTxt: {
    color: '#2e64e5',
  },
  userInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  userInfoItem: {
    justifyContent: 'center',
  },
  userInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  userInfoSubTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  item: {
    margin: 10,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignSelf: 'flex-start',
    width: "100%"
  },
  itemColumn: {
    margin: 10,
    flexDirection: 'column',
    width: "33%"
  },
  itemColumn2: {
    margin: 10,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 30
  },
  itemPhoto: {
    width: 100,
    height: 100,
    borderRadius: 75
  },
  itemText: {
    marginTop: 5,
  }
});
