import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-simple-toast';

const { width } = Dimensions.get('window');

const Items = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getItems();
  }, [isFocused]);

  const getItems = () => {
    setLoading(true)
    firestore()
      .collection('items')
      .get()
      .then((querySnapshot) => {
        const tempData = [];
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

  const deleteItem = (docId) => {
    Toast.show("Item Deleted")
    firestore()
      .collection('items')
      .doc(docId)
      .delete()
      .then(() => {
        getItems();
      });
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
    <ScrollView style={styles.container}>
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
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          // ... your item rendering code
          <View style={styles.itemView}>
          <Image
            source={{ uri: item.data.imageUrl }}
            style={styles.itemImage}
          />
          <View style={styles.detailsView}>
            <Text style={styles.nameText}>{item.data.name}</Text>
            <Text style={styles.catText}>Category: {item.data.category}</Text>
            <Text style={styles.descText}>{item.data.description}</Text>
            <View style={styles.priceView}>
              <Text style={styles.priceText}>{`₹${item.data.price}`}</Text>
            </View>
          </View>
          <View style={styles.iconContainer}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('EditItem', {
                  data: item.data,
                  id: item.id,
                });
              }}
            >
              <Image
                source={require('../images/edit.png')}
                style={styles.icon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                deleteItem(item.id);
              }}
            >
              <Image
                source={require('../images/delete.png')}
                style={[styles.icon, styles.deleteIcon]}
              />
            </TouchableOpacity>
          </View>
        </View>
        )}
      />)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    marginBottom: 60,
  },
    itemView: {
    flexDirection: 'row',
    width: width - 20,
    alignSelf: 'center',
    backgroundColor: '#fff',
    elevation: 3,
    marginTop: 10,
    borderRadius: 10,
    padding: 10,
    borderWidth:0.5,
    borderColor:'black'
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 10,
  },
  detailsView: {
    flex: 1,
  },
  nameText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 5,
  },
  catText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  descText: {
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 5,
  },
  priceView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 18,
    color: 'green',
    fontWeight: '700',
  },
  deleteIcon: {
    marginTop: 20,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    width: 24,
    height: 24,
  },
  searchBox: {
    margin: 10,
    padding: 10,
    borderColor: 'black',
    borderWidth: 1.5,
    borderRadius: 8,
  },
  // ... your other styles
  categoryModalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    //justifyContent: 'center',
    //alignItems: 'center',
  },
  categoryModal: {
    width: width - 20,
    backgroundColor: 'white',
    elevation: 3,
    borderRadius: 10,
    padding: 10,
  },
  categoryItem: {
    fontSize: 18,
    padding: 10,
    textAlign: 'center',
  },
  categoryButton: {
    margin: 10,
    padding: 10,
    borderColor: 'black',
    borderWidth: 0.5,
    borderRadius: 8,
    backgroundColor: 'white'
  },
  categoryButtonText: {
    fontSize: 14,
  },
  categoryModalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryModal: {
    width: width - 20,
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
    borderBottomWidth: 0.5,
    borderBottomColor: 'black'
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: '700',
  },
});

export default Items;
/* final caseeeeeeeeeeeeeeee
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
  Dimensions,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-simple-toast';

const { width } = Dimensions.get('window');

const Items = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    getItems();
  }, [isFocused]);

  const getItems = () => {
    firestore()
      .collection('items')
      .get()
      .then((querySnapshot) => {
        const tempData = [];
        querySnapshot.forEach((documentSnapshot) => {
          tempData.push({
            id: documentSnapshot.id,
            data: documentSnapshot.data(),
          });
        });
        setItems(tempData);
        setFilteredItems(tempData);
      });
  };

  const deleteItem = (docId) => {
    Toast.show("Item Deleted")
    firestore()
      .collection('items')
      .doc(docId)
      .delete()
      .then(() => {
        getItems();
      });
  };

  const searchFilter = (text) => {
    if (text) {
      const newData = items.filter((item) => {
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

  return (
    <ScrollView style={styles.container}>
      <SafeAreaView>
        <TextInput
          placeholder="Search by category"
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
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.itemView}>
            <Image
              source={{ uri: item.data.imageUrl }}
              style={styles.itemImage}
            />
            <View style={styles.detailsView}>
              <Text style={styles.nameText}>{item.data.name}</Text>
              <Text style={styles.catText}>Category: {item.data.category}</Text>
              <Text style={styles.descText}>{item.data.description}</Text>
              <View style={styles.priceView}>
                <Text style={styles.priceText}>{`₹${item.data.price}`}</Text>
              </View>
            </View>
            <View style={styles.iconContainer}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('EditItem', {
                    data: item.data,
                    id: item.id,
                  });
                }}
              >
                <Image
                  source={require('../images/edit.png')}
                  style={styles.icon}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  deleteItem(item.id);
                }}
              >
                <Image
                  source={require('../images/delete.png')}
                  style={[styles.icon, styles.deleteIcon]}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    marginBottom:60
  },
  itemView: {
    flexDirection: 'row',
    width: width - 20,
    alignSelf: 'center',
    backgroundColor: '#fff',
    elevation: 3,
    marginTop: 10,
    borderRadius: 10,
    padding: 10,
    borderWidth:0.5,
    borderColor:'black'
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 10,
  },
  detailsView: {
    flex: 1,
  },
  nameText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 5,
  },
  catText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  descText: {
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 5,
  },
  priceView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 18,
    color: 'green',
    fontWeight: '700',
  },
  deleteIcon: {
    marginTop: 20,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    width: 24,
    height: 24,
  },
  searchBox: {
    margin: 10,
    padding: 10,
    borderColor: 'black',
    borderWidth: 1.5,
    borderRadius: 8,
  },
});

export default Items;
------------------------*/

/*import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {useIsFocused, useNavigation} from '@react-navigation/native';
const Items = () => {

  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [search,setSearch] = useState('')
  const [selectedCategory,setSelectedCategory] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [clicked, setClicked] = useState(false)
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

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
          //console.log("Hello",text)
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
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('EditItem', {
                      data: item.data,
                      id: item.id,
                    });
                  }}>
                  <Image
                    source={require('../images/edit.png')}
                    style={styles.icon}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    deleteItem(item.id);
                  }}>
                  <Image
                    source={require('../images/delete.png')}
                    style={[styles.icon, {marginTop: 20}]}
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

export default Items;
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
    elevation: 0,
    marginTop: 10,
    borderRadius: 10,
    height: 100,
    marginBottom: 10,
    elevation:5
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
    borderRadius:8,
  },
  header: {
    height: 60,
    width: '100%',
    backgroundColor: '#fff',
    elevation: 5,
    paddingTop:15
    //paddingLeft: 20,
    //justifyContent: 'center',
  },
});*/