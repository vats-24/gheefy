import React, { useState,useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ImageBackground
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getPriceVariations } from '../utils/Variation.js';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-simple-toast';

const PriceVariationGraph = () => {
  const [productName, setProductName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priceVariations, setPriceVariations] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    getItems();
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

  const fetchPriceVariations = async () => {
    if (!productName || !startDate || !endDate) {
      alert('Please provide a product name and date range.');
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
      <TouchableOpacity
          style={styles.categoryBtn}
          onPress={() => setModalVisible(true)}
        >
      <TextInput
        style={styles.input}
        placeholder="Enter product name"
        value={productName}
        onChangeText={(text) => setProductName(text)}
      />
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Enter start date (YYYY-MM-DD)"
        value={startDate}
        onChangeText={(text) => setStartDate(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter end date (YYYY-MM-DD)"
        value={endDate}
        onChangeText={(text) => setEndDate(text)}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={fetchPriceVariations}
      >
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
          yAxisLabel="$"
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
    backgroundColor: '#D7DEDF'
  },
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems:'center'
  },
  headerText: {
    fontSize: 25,
    fontWeight: '700',
    color:'black'
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 16,
    backgroundColor:'white'
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