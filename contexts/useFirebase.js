import uuid from "react-native-uuid";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../helpers/Firebase";


const rewardCollectionRef = collection(db, "reward");
const bannerCollectionRef = collection(db, "banner");
const itemCollectionRef = collection(db, "item");
const accountCollectionRef = collection(db, "user");
const leaveCollectionRef = collection(db, "leave");

class UseFirebase{
  getLeaves = () => {
    return getDocs(leaveCollectionRef);
  };

  getRewards = () => {
    return getDocs(rewardCollectionRef);
  };

  getReward = (rewardId) => {
   getDoc(doc(db, "reward", rewardId
    ))
      .then((docSnap) => {
        let object = docSnap.data();
        return object;
      })
      .catch((error) => {
        console.log(error);
      });
  };

  saveReward = (name, description, status, point, id) => {
    setDoc(doc(db, "reward", id), {
      name: name,
      description: description,
      status: status,
      redeem_point: parseInt(point),
    }).then(() => {
      console.log("Saved.");
    }).catch((error) => {
      console.log(error);
    });
  };

  addReward = (name, description, status, point) => {
    let randomId = uuid.v4();
    setDoc(doc(db, "reward", randomId), {
      name: name,
      description: description,
      status: status,
      redeem_point: parseInt(point),
    }).then(() => {
      console.log("Added.");
    }).catch((error) => {
      console.log(error);
    });
  };

  getBanners = () => {
    return getDocs(bannerCollectionRef);
  };

  getBanner = (bannerId) => {
   getDoc(doc(db, "banner", bannerId
    ))
      .then((docSnap) => {
        let object = docSnap.data();
        return object;
      })
      .catch((error) => {
        console.log(error);
      });
  };

  saveBanner = (name, description, status, lastModified, image, id) => {
    setDoc(doc(db, "banner", id), {
      name: name,
      description: description,
      status: status,
      last_modified_by: lastModified,
      image: image,
    }).then(() => {
      console.log("Saved.");
    }).catch((error) => {
      console.log(error);
    });
  };

  addBanner = (name, description, status, lastModified, image) => {
    let randomId = uuid.v4();
    setDoc(doc(db, "banner", randomId), {
      name: name,
      description: description,
      status: status,
      last_modified_by: lastModified,
      image: image,
    }).then(() => {
      console.log("Added.");
    }).catch((error) => {
      console.log(error);
    });
  };

  getItems = () => {
    return getDocs(itemCollectionRef);
  };

  saveItem = (name, description, type, status, price, quantity, lastModified, image, id) => {
    setDoc(doc(db, "item", id), {
      name: name,
      description: description,
      item_type: type,
      status: status,
      price: price,
      quantity: quantity,
      last_modified_by: lastModified,
      image: image,
    }).then(() => {
      console.log("Saved.");
    }).catch((error) => {
      console.log(error);
    });
  };

  addItem = (name, description, type, status, price, quantity, lastModified, image) => {
    let randomId = uuid.v4();
    setDoc(doc(db, "item", randomId), {
      name: name,
      description: description,
      item_type: type,
      status: status,
      price: price,
      quantity: quantity,
      last_modified_by: lastModified,
      image: image,
    }).then(() => {
      console.log("Added.");
    }).catch((error) => {
      console.log(error);
    });
  };

  getAccounts = () => {
    return getDocs(accountCollectionRef);
  };

  saveUser = (name, email, contact, user_type, image, status, id) => {
    setDoc(doc(db, "user", id), {
      name: name,
      contact_number: contact,
      email: email,
      user_type: user_type,
      profile_image: image,
      point: 0,
      cart_id: "",
      status: status,
    }).then(() => {
      console.log("Saved.");
    }).catch((error) => {
      console.log(error);
    });
  };

  addUser = (name, email, contact, user_type, image, status, user) => {
    createUserWithEmailAndPassword(auth, email, "password")
      .then((res) => {
        console.log(res.user.uid);
        setDoc(doc(db, "user", res.user.uid), {
          name: name,
          contact_number: contact,
          email: email,
          user_type: user_type,
          profile_image: image,
          point: 0,
          cart_id: "",
          status: status,
        }).then(() => {
          console.log("Added.");
          signOut(auth);
        }).catch((error) => {
          console.log(error);
        });
      })
      .catch((error) => {
        console.log(error);
      });
    
  };
}

export default new UseFirebase();