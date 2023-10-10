import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Dimensions,ScrollView} from 'react-native';
import { LineChart } from 'react-native-chart-kit';// Import the function
import { getPriceVariations } from '../utils/Variation.js';
import { TouchableOpacity } from 'react-native-gesture-handler';

const PriceVariationGraphScreen = () => {

  const [productName, setProductName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priceVariations, setPriceVariations] = useState([]);

  // Function to fetch price variations based on product name and date range
  const fetchPriceVariations = async () => {
    try {
      if (!productName || !startDate || !endDate) {
        alert('Please provide a product name and date range.');
        return;
      }
  
      const variations = await getPriceVariations(productName, startDate, endDate);
      console.log(variations)

      setPriceVariations(variations);

      console.log(priceVariations.map((variation) => variation.price))

    } catch (error) {
      console.error('Error fetching price variations:', error);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>prdoxut vary  Item</Text>
      </View>
      <TextInput style={styles.input}
        placeholder="Enter product name"
        value={productName}
        onChangeText={(text) => setProductName(text)}
      />

      <TextInput style={styles.input}
        placeholder="Enter start date (YYYY-MM-DD)"
        value={startDate}
        onChangeText={(text) => setStartDate(text)}
      />

      <TextInput style={styles.input}
        placeholder="Enter end date (YYYY-MM-DD)"
        value={endDate}
        onChangeText={(text) => setEndDate(text)}
      />
      <TouchableOpacity style={styles.button} title="Fetch Price Variations" onPress={fetchPriceVariations} >
      <Text style={{color:'#Fff'}}>See Variation</Text>
      </TouchableOpacity>
  <Text>Bezier Line Chart</Text>
{priceVariations.length>0 &&
(<LineChart
data={{
  labels: priceVariations.map((variation) => variation.date),
  datasets: [
    {
      data: priceVariations.map((variation) => variation.price),
    },
  ],
}}
 width={Dimensions.get("window").width}
height={220}
yAxisLabel="$"
yAxisInterval={1}
// Configure chart options
    chartConfig={{
      backgroundColor: "#e26a00",
      backgroundGradientFrom: "#fb8c00",
      backgroundGradientTo: "#ffa726",
      decimalPlaces: 2, // optional, defaults to 2dp
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      style: {
        borderRadius: 16
      },
      propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: "#ffa726"
      }
    }}
    bezier
    style={{
      marginVertical: 8,
      borderRadius: 16
    }}
/>)}
    </View>
    </ScrollView>
  );
};

export default PriceVariationGraphScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    width: '100%',
    backgroundColor: '#fff',
    elevation: 5,
    paddingLeft: 20,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
  },
  input: {
    width: '90%',
    height: 50,
    borderRadius: 10,
    borderWidth: 0.5,
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 30,
    alignSelf: 'center',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#5246f2',
    width: '90%',
    height: 50,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 70,
  },
  chartContainer: {
    width: '90%',
    height: 200,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 20,
  },
});


/*
updated one
  <LineChart
data={{
  labels: priceVariations.map((variation) => variation.date),
  datasets: [
    {
      data: priceVariations.map((variation) => variation.price),
    },
  ],
}}
 width={Dimensions.get("window").width}
height={220}
yAxisLabel="$"
yAxisInterval={1}
// Configure chart options
    chartConfig={{
      backgroundColor: "#e26a00",
      backgroundGradientFrom: "#fb8c00",
      backgroundGradientTo: "#ffa726",
      decimalPlaces: 2, // optional, defaults to 2dp
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      style: {
        borderRadius: 16
      },
      propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: "#ffa726"
      }
    }}
    bezier
    style={{
      marginVertical: 8,
      borderRadius: 16
    }}
/>






<TextInput
placeholder="Enter product name"
value={productName}
onChangeText={(text) => setProductName(text)}
/>

<Text>Start Date:</Text>
<TextInput
placeholder="Enter start date (YYYY-MM-DD)"
value={startDate}
onChangeText={(text) => setStartDate(text)}
/>

<Text>End Date:</Text>
<TextInput
placeholder="Enter end date (YYYY-MM-DD)"
value={endDate}
onChangeText={(text) => setEndDate(text)}
/>

<Button title="Fetch Price Variations" onPress={fetchPriceVariations} />

{/* Display the price variations using a LineChart 
<LineChart
data={{
  labels: priceVariations.map((variation) => variation.date),
  datasets: [
    {
      data: priceVariations.map((variation) => variation.price),
    },
  ],
}}
 width={Dimensions.get("window").width}
height={220}
yAxisLabel="$"
yAxisInterval={1}
// Configure chart options
    chartConfig={{
      backgroundColor: "#e26a00",
      backgroundGradientFrom: "#fb8c00",
      backgroundGradientTo: "#ffa726",
      decimalPlaces: 2, // optional, defaults to 2dp
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      style: {
        borderRadius: 16
      },
      propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: "#ffa726"
      }
    }}
    bezier
    style={{
      marginVertical: 8,
      borderRadius: 16
    }}
/>
*/