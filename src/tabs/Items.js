import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  TextInput
} from 'react-native';
import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {useIsFocused, useNavigation} from '@react-navigation/native';
const Items = () => {

  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [search,setSearch] = useState('')
  const [filteredItems, setFilteredItems] = useState([]);
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
          onChangeText={(text)=> searchFilter(text)}/>
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
                    {'$' + item.data.price}
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
});