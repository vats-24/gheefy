import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-simple-toast';

const CategoryScreen = () => {
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const addButtonScale = new Animated.Value(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingCategory, setIsAddingCategory] = useState(false);



  useEffect(() => {
    fetchCategories();
  }, []);
  const fetchCategories = async () => {
    setIsLoading(true)
    const querySnapshot = await firestore().collection('categories').get();
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  setCategories(data);
  setIsLoading(false)
  };

  const deleteCategory = async (id, categoryName) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            // Delete the category
            await firestore()
              .collection('categories')
              .doc(id)
              .delete()
              .then(async () => {
                Toast.show('Category Deleted');
                console.log('Category deleted successfully!');
              })
              .catch((error) => {
                console.error('Error deleting category: ', error);
              });

            // Find items with the same category name and delete them
            const itemsToDelete = await firestore()
              .collection('items')
              .where('category', '==', categoryName)
              .get();

            itemsToDelete.forEach(async (itemDoc) => {
              const itemId = itemDoc.id;
              await firestore().collection('items').doc(itemId).delete();
            });

            fetchCategories(); // Refresh the category list after deletion
          },
        },
      ],
      { cancelable: false }
    );
  };

  const saveCategory = async () => {
    if (category && !isAddingCategory) { // Check if not already adding a category
      setIsAddingCategory(true);

      const trimmedCategory = category.replace(/\s+/g, '');
      console.log(trimmedCategory)
      if(trimmedCategory.length === 0){
        Toast.show("Category name cannot be empty")
        setIsAddingCategory(false)
        return;
      }
      const lowercaseCategory = trimmedCategory.toLowerCase();
      console.log(lowercaseCategory)
      // Check if a category with the same name already exists
      const categoryRef = firestore().collection('categories');
      const querySnapshot = await categoryRef
        .where('name_lowercase', '==', lowercaseCategory)
        .get();
  
      if (!querySnapshot.empty) {
        // A category with the same name already exists
        Toast.show('Category with this name already exists');
        setCategory('');
        setIsAddingCategory(false); // Set isAddingCategory to false
      } else {
        Toast.show('Category Adding');
        // Save the category to Firestore
        try {
          await categoryRef.add({ name: category, name_lowercase: lowercaseCategory });
          console.log('Category added successfully!');
          setCategory(''); // Clear the input field
          fetchCategories(); // Refresh the category list after addition
          Toast.show('Category Added');
        } catch (error) {
          Toast.show('Error adding category: Try Later');
          console.error('Error adding category: ', error);
        } finally {
          setIsAddingCategory(false); // Ensure that isAddingCategory is set to false
        }
      }
    }
  };
  

  return (
    <View style={styles.container}>
      <ScrollView>
        <TextInput
          style={styles.input}
          placeholder="Enter category name"
          value={category}
          onChangeText={(text) => setCategory(text)}
        />
        <Button
          title="Add"
          onPress={saveCategory}
          disabled={!category || isAddingCategory}
          style={styles.addBtn}
        />
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.categoryItemContainer}>
              <Text style={styles.categoryItem}>{item.name}</Text>
              <TouchableOpacity
                onPress={() => deleteCategory(item.id, item.name)}
              >
                <Image
                  source={require('../images/delete.png')}
                  style={[styles.icon, styles.deleteIcon]}
                />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  categoryItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10
  },
  categoryItem: {
    fontSize: 15,
    marginBottom: 6,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: 'black',
    flex: 1,
  },
  addBtn:{
    width: '90%',
    height: 50,
    borderWidth: 0.5,
    borderRadius: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    borderColor:'blue',
    backgroundColor: "#21DEEA"
  },
  icon: {
    width: 30,
    height: 30,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default CategoryScreen;

/* latestttt codeeee-----------
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  Image
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-simple-toast';


const CategoryScreen = () => {
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const addButtonScale = new Animated.Value(1);

  useEffect(() => {
    getItems();
    // Fetch categories from Firestore
    const unsubscribe = firestore()
      .collection('categories')
      .onSnapshot((querySnapshot) => {
        const data = [];
        querySnapshot.forEach((documentSnapshot) => {
          data.push({ id: documentSnapshot.id, ...documentSnapshot.data() });
        });
        setCategories(data);
      });
    return () => unsubscribe();
  }, []);

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
        getCategories(tempData);
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

  const saveCategory = async () => {
    if (category) {
      const lowercaseCategory = category.toLowerCase();
      // Check if a category with the same name already exists
      const categoryRef = firestore().collection('categories');
      const querySnapshot = await categoryRef
      .where('name_lowercase', '==', lowercaseCategory)
      .get();
  
      if (!querySnapshot.empty) {
        // A category with the same name already exists
        Toast.show('Category with this name already exists');
        setCategory('');
      } else {
        Toast.show('Category Added');
        // Save the category to Firestore
        await categoryRef
          .add({ name: category,name_lowercase: lowercaseCategory })
          .then(() => {
            console.log('Category added successfully!');
            setCategory(''); // Clear the input field
          })
          .catch((error) => {
            Toast.show('Error adding category: Try Later');
            console.error('Error adding category: ', error);
          });
      }
    }
  };
  

  const deleteCategory = (id) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            firestore()
              .collection('categories')
              .doc(id)
              .delete()
              .then(() => {
                Toast.show("Category Deleted")
                console.log('Category deleted successfully!');
              })
              .catch((error) => {
                console.error('Error deleting category: ', error);
              });
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <TextInput
          style={styles.input}
          placeholder="Enter category name"
          value={category}
          onChangeText={(text) => setCategory(text)}
        />
        <Button
          title="Add"
          onPress={saveCategory}
          disabled={!category}
          style={styles.addBtn}
        />
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.categoryItemContainer}>
              <Text style={styles.categoryItem}>{item.name}</Text>
            <TouchableOpacity
              onPress={() => deleteCategory(item.id)}
            >
              <Image
                source={require('../images/delete.png')}
                style={[styles.icon, styles.deleteIcon]}
              />
            </TouchableOpacity>
            </View>
          )}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  categoryItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10
  },
  categoryItem: {
    fontSize: 15,
    marginBottom: 6,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: 'black',
    flex: 1,
  },
  addBtn:{
    width: '90%',
    height: 50,
    borderWidth: 0.5,
    borderRadius: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    borderColor:'blue',
    backgroundColor: "#21DEEA"
  },
  icon: {
    width: 30,
    height: 30,
  },
});

export default CategoryScreen;
*/


/*latest code with animation
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

const CategoryScreen = () => {
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const addButtonScale = new Animated.Value(1);

  useEffect(() => {
    // Fetch categories from Firestore
    const unsubscribe = firestore()
      .collection('categories')
      .onSnapshot((querySnapshot) => {
        const data = [];
        querySnapshot.forEach((documentSnapshot) => {
          data.push({ id: documentSnapshot.id, ...documentSnapshot.data() });
        });
        setCategories(data);
      });

    return () => unsubscribe();
  }, []);

  const saveCategory = () => {
    if (category) {
      // Save the category to Firestore
      firestore()
        .collection('categories')
        .add({ name: category })
        .then(() => {
          console.log('Category added successfully!');
          setCategory(''); // Clear the input field
        })
        .catch((error) => {
          console.error('Error adding category: ', error);
        });
    }
  };

  const handleAddButtonPress = () => {
    setIsAddingCategory(true);

    // Add a smooth animation to the "Add" button
    Animated.spring(addButtonScale, {
      toValue: 0.8,
      useNativeDriver: true,
    }).start();
  };

  const handleCancelButtonPress = () => {
    setIsAddingCategory(false);

    // Reset the "Add" button animation
    Animated.spring(addButtonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const deleteCategory = (id) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            firestore()
              .collection('categories')
              .doc(id)
              .delete()
              .then(() => {
                console.log('Category deleted successfully!');
              })
              .catch((error) => {
                console.error('Error deleting category: ', error);
              });
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <TextInput
          style={styles.input}
          placeholder="Enter category name"
          value={category}
          onChangeText={(text) => setCategory(text)}
        />
        <Animated.View
          style={{ transform: [{ scale: addButtonScale }] }}
        >
          {isAddingCategory ? (
            <View style={styles.addButtonContainer}>
              <Button
                title="Cancel"
                onPress={handleCancelButtonPress}
                color="red"
              />
              <Button title="Add" onPress={saveCategory} />
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleAddButtonPress}
              style={styles.addButton}
            >
              <Text style={styles.addButtonLabel}>+</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.categoryItemContainer}>
              <Text style={styles.categoryItem}>{item.name}</Text>
              <Button
                title="Delete"
                onPress={() => deleteCategory(item.id)}
                color="red"
              />
            </View>
          )}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  addButton: {
    backgroundColor: 'blue',
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 10,
  },
  addButtonLabel: {
    fontSize: 30,
    color: 'white',
  },
  addButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  categoryItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryItem: {
    fontSize: 18,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: 'black',
    flex: 1,
  },
});

export default CategoryScreen;
*/


/* existing one use this after everything
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

const CategoryScreen = () => {
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const addButtonScale = new Animated.Value(1);

  useEffect(() => {
    // Fetch categories from Firestore
    const unsubscribe = firestore()
      .collection('categories')
      .onSnapshot((querySnapshot) => {
        const data = [];
        querySnapshot.forEach((documentSnapshot) => {
          data.push({ id: documentSnapshot.id, ...documentSnapshot.data() });
        });
        setCategories(data);
      });

    return () => unsubscribe();
  }, []);

  const saveCategory = () => {
    if (category) {
      // Save the category to Firestore
      firestore()
        .collection('categories')
        .add({ name: category })
        .then(() => {
          console.log('Category added successfully!');
          setCategory(''); // Clear the input field
        })
        .catch((error) => {
          console.error('Error adding category: ', error);
        });
    }
  };

  const handleAddButtonPress = () => {
    setIsAddingCategory(true);

    // Add a smooth animation to the "Add" button
    Animated.spring(addButtonScale, {
      toValue: 0.8,
      useNativeDriver: true,
    }).start();
  };

  const handleCancelButtonPress = () => {
    setIsAddingCategory(false);

    // Reset the "Add" button animation
    Animated.spring(addButtonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <TextInput
          style={styles.input}
          placeholder="Enter category name"
          value={category}
          onChangeText={(text) => setCategory(text)}
        />
        <Animated.View
          style={{ transform: [{ scale: addButtonScale }] }}
        >
          {isAddingCategory ? (
            <View style={styles.addButtonContainer}>
              <Button
                title="Cancel"
                onPress={handleCancelButtonPress}
                color="red"
              />
              <Button title="Add" onPress={saveCategory} />
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleAddButtonPress}
              style={styles.addButton}
            >
              <Text style={styles.addButtonLabel}>+</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Text style={styles.categoryItem}>{item.name}</Text>
          )}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  addButton: {
    backgroundColor: 'blue',
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom:10
  },
  addButtonLabel: {
    fontSize: 30,
    color: 'white',
  },
  addButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  categoryItem: {
    fontSize: 18,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: 'black',
  },
});

export default CategoryScreen;*/



/*import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const CategoryScreen = () => {
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Fetch categories from Firestore
    const unsubscribe = firestore()
      .collection('categories')
      .onSnapshot((querySnapshot) => {
        const data = [];
        querySnapshot.forEach((documentSnapshot) => {
          data.push({ id: documentSnapshot.id, ...documentSnapshot.data() });
        });
        setCategories(data);
      });

    return () => unsubscribe();
  }, []);

  const saveCategory = () => {
    if (category) {
      // Save the category to Firestore
      firestore()
        .collection('categories')
        .add({ name: category })
        .then(() => {
          console.log('Category added successfully!');
          setCategory(''); // Clear the input field
        })
        .catch((error) => {
          console.error('Error adding category: ', error);
        });
    }
  };

  return (
    <View style={styles.container}>
        <ScrollView>
      <TextInput
        style={styles.input}
        placeholder="Enter category name"
        value={category}
        onChangeText={(text) => setCategory(text)}
      />
      <Button title="Add Category" onPress={saveCategory} />
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.categoryItem}>{item.name}</Text>
        )}
      />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  categoryItem: {
    fontSize: 18,
    marginBottom: 10,
    backgroundColor: '#f0f0f0', // Background color for each category item
    padding: 10, // Padding around each category item
    borderRadius: 5, // Rounded corners
    borderWidth: 1, // Border width
    borderColor: '#ccc',
  },
});

export default CategoryScreen;
*/