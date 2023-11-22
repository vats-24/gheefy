import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  TouchableWithoutFeedback,
  FlatList
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getPriceVariations } from '../utils/Variation.js';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-simple-toast';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from '@react-native-picker/picker';

const PriceVariationGraph = () => {
  const [productName, setProductName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priceVariations, setPriceVariations] = useState([]);
  const [items, setItems] = useState([]);
  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  
  useEffect(() => {
    getItems();
  }, []);

  const getItems = async () => {
    setIsLoading(true);
    await firestore()
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
        setIsLoading(false);
      });
  };

  const showStartDatePicker = () => {
    setStartDatePickerVisible(true);
  };

  const hideStartDatePicker = () => {
    setStartDatePickerVisible(false);
  };

  const handleStartDateConfirm = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setStartDate(formattedDate);
    hideStartDatePicker();
  };

  const showEndDatePicker = () => {
    setEndDatePickerVisible(true);
  };

  const hideEndDatePicker = () => {
    setEndDatePickerVisible(false);
  };

  const handleEndDateConfirm = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setEndDate(formattedDate);
    hideEndDatePicker();
  };

  const fetchPriceVariations = async () => {
    if (!productName || !startDate || !endDate) {
      Toast.show('Please provide a product name and date range.');
      return;
    }
    try {
      const variations = await getPriceVariations(productName, startDate, endDate);
      Toast.show("Generating Graph")
      setPriceVariations(variations);
    } catch (error) {
      Toast.show("Product Not Found or The price didn't vary")
      console.error('Error fetching price variations:', error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => {
        setProductName(item.data.name); 
        setIsCategoryModalVisible(false);
      }}
    >
      <Text>{item.data.name}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Product Price Variation</Text>
      </View>
      {/* <Text style={{fontSize: 17,color:'black'}}>Select Product Name:</Text> */}
      {/* <Picker
        selectedValue={productName}
        style={styles.picker}
        onValueChange={(itemValue, itemIndex) =>
          setProductName(itemValue)
        }>

        {items.map((item) => (
          <Picker.Item
            key={item.id}
            label={item.data.name}
            value={item.data.name}
          />
        ))}
      </Picker> */}


      <SafeAreaView>
        <TouchableOpacity
          style={styles.categoryButton}
          onPress={() => setIsCategoryModalVisible(true)}
        >
          <Text style={styles.categoryButtonText}>
            {productName ||'Search Product Name'}
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
              <Text style={styles.modalText}>Choose Product Name</Text>
              <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
            />
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
      <TouchableOpacity style={styles.datePickerButton} onPress={showStartDatePicker}>
        <Text style={styles.datePickerButtonText}>
          {startDate ? startDate : 'Select Start Date'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.datePickerButton} onPress={showEndDatePicker}>
        <Text style={styles.datePickerButtonText}>
          {endDate ? endDate : 'Select End Date'}
        </Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isStartDatePickerVisible}
        mode="date"
        onConfirm={handleStartDateConfirm}
        onCancel={hideStartDatePicker}
        maximumDate={new Date()}
      />
      <DateTimePickerModal
        isVisible={isEndDatePickerVisible}
        mode="date"
        onConfirm={handleEndDateConfirm}
        onCancel={hideEndDatePicker}
        maximumDate={new Date()}
      />
      <TouchableOpacity style={styles.button} onPress={fetchPriceVariations}>
        <Text style={styles.buttonText}>See Variation</Text>
      </TouchableOpacity>
{isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (<ScrollView horizontal>
      {priceVariations.length > 0 && (
        <LineChart
          data={{
            labels: priceVariations.map((variation) => variation.date),
            datasets: [
              {
                data: priceVariations.map((variation) => variation.price),
              },
            ],
          }}
          width={Dimensions.get('window').width}
          height={220}
          yAxisLabel="₹"
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: '#5246f2',
            backgroundGradientFrom: '#5246f2',
            backgroundGradientTo: '#5246f2',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#fff',
            },
          }}
          bezier
          style={styles.chartContainer}
        />
      )}
      </ScrollView>)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#D7DEDF',
  },
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 25,
    fontWeight: '700',
    color: 'black',
  },
  picker: {
    height: 50,
    borderWidth: 4,
    borderColor: 'black',
    borderRadius: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: 'white',
  },
  datePickerButton: {
    height: 50,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  datePickerButtonText: {
    color: 'black',
  },
  button: {
    backgroundColor: '#5246f2',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  chartContainer: {
    marginTop: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  categoryItem: {
    fontSize: 18,
    padding: 10,
    textAlign: 'center',
  },
  categoryButton: {
    height: 50,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: 'white',
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
    width: "90%",
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
    textAlign: 'center',
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
  }
});

export default PriceVariationGraph;

/* latest this one should be used
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getPriceVariations } from '../utils/Variation.js';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-simple-toast';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from '@react-native-picker/picker';

const PriceVariationGraph = () => {
  const [productName, setProductName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priceVariations, setPriceVariations] = useState([]);
  const [items, setItems] = useState([]);
  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);

  useEffect(() => {
    getItems();
  }, []);

  const getItems = async () => {
    await firestore()
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
      });
  };

  const showStartDatePicker = () => {
    setStartDatePickerVisible(true);
  };

  const hideStartDatePicker = () => {
    setStartDatePickerVisible(false);
  };

  const handleStartDateConfirm = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setStartDate(formattedDate);
    hideStartDatePicker();
  };

  const showEndDatePicker = () => {
    setEndDatePickerVisible(true);
  };

  const hideEndDatePicker = () => {
    setEndDatePickerVisible(false);
  };

  const handleEndDateConfirm = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setEndDate(formattedDate);
    hideEndDatePicker();
  };

  const fetchPriceVariations = async () => {
    if (!productName || !startDate || !endDate) {
      Toast.show('Please provide a product name and date range.');
      return;
    }
    try {
      const variations = await getPriceVariations(productName, startDate, endDate);
      Toast.show("Generating Graph")
      setPriceVariations(variations);
    } catch (error) {
      Toast.show("Product Not Found or The price didn't vary")
      console.error('Error fetching price variations:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Product Price Variation</Text>
      </View>
      <Picker
        selectedValue={productName}
        style={styles.picker}
        onValueChange={(itemValue, itemIndex) =>
          setProductName(itemValue)
        }>
        {items.map((item) => (
          <Picker.Item
            key={item.id}
            label={item.data.name}
            value={item.data.name}
          />
        ))}
      </Picker>
      <TouchableOpacity style={styles.datePickerButton} onPress={showStartDatePicker}>
        <Text style={styles.datePickerButtonText}>
          {startDate ? startDate : 'Select Start Date'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.datePickerButton} onPress={showEndDatePicker}>
        <Text style={styles.datePickerButtonText}>
          {endDate ? endDate : 'Select End Date'}
        </Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isStartDatePickerVisible}
        mode="date"
        onConfirm={handleStartDateConfirm}
        onCancel={hideStartDatePicker}
        maximumDate={new Date()}
      />
      <DateTimePickerModal
        isVisible={isEndDatePickerVisible}
        mode="date"
        onConfirm={handleEndDateConfirm}
        onCancel={hideEndDatePicker}
        maximumDate={new Date()}
      />
      <TouchableOpacity style={styles.button} onPress={fetchPriceVariations}>
        <Text style={styles.buttonText}>See Variation</Text>
      </TouchableOpacity>
      {priceVariations.length > 0 && (
        <LineChart
          data={{
            labels: priceVariations.map((variation) => variation.date),
            datasets: [
              {
                data: priceVariations.map((variation) => variation.price),
              },
            ],
          }}
          width={Dimensions.get('window').width}
          height={220}
          yAxisLabel="₹"
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: '#e26a00',
            backgroundGradientFrom: '#fb8c00',
            backgroundGradientTo: '#ffa726',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#ffa726',
            },
          }}
          bezier
          style={styles.chartContainer}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#D7DEDF',
  },
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 25,
    fontWeight: '700',
    color: 'black',
  },
  picker: {
    height: 50,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: 'white',
  },
  datePickerButton: {
    height: 50,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  datePickerButtonText: {
    color: 'black',
  },
  button: {
    backgroundColor: '#5246f2',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  chartContainer: {
    marginTop: 20,
  },
});

export default PriceVariationGraph;
==========================
*/


/*
  const [productName, setProductName] = useState('');
  const [priceVariations, setPriceVariations] = useState([]);
  const [items, setItems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [categories, setCategories] = useState([]);


    useEffect(() => {
      firestore()
        .collection('items')
        .onSnapshot((querySnapshot) => {
          const data = [];
          querySnapshot.forEach((documentSnapshot) => {
            data.push({ id: documentSnapshot.id, ...documentSnapshot.data() });
          });
          setCategories(data);
        });
    }, []);

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
        console.log("Hello",tempData.data)
      });
  };

      <TextInput
          placeholder="Enter Product Name"
          style={styles.input}
          value={productName} // Bind the input value to the selected category
          onChangeText={(text) => setProductName(text)} // This will prevent manual input
        />
      <TouchableOpacity
          style={styles.productBtn}
          onPress={() => setModalVisible(true)}
        >
          <Text>Choose Product Name</Text>
        </TouchableOpacity>




        modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalView: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
  },
  modalText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  closeModalBtn: {
    width: '50%',
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginTop: 20,
  },
*/ 

