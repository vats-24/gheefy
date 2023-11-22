// FirebaseService.js
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-simple-toast';

// Function to fetch price variations for a specific product name within a date range
export const getPriceVariations = async (productName, startDate, endDate) => {
  try {
    // Validate the input parameters
    if (!productName || !startDate || !endDate) {
      throw new Error('Please provide a product name and date range.');
    }

    // Fetch the product ID based on the entered product name
    console.log(productName)
    const productId = await getProductIdByName(productName);
    console.log(productId)
    if (!productId) {
      throw new Error('Product not found.'); // Handle the case where the product name is not found
    }

    console.log("hello")
    // Fetch price variations based on the retrieved productId and date range
    const querySnapshot = await firestore()
      .collection('priceVariations')
      .where('productId', '==', productId)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .orderBy('date', 'asc')
      .get();

      console.log('Number of documents in querySnapshot:', querySnapshot.size);

    const priceVariations = [];

    querySnapshot.forEach((documentSnapshot) => {
      const variation = documentSnapshot.data();
      priceVariations.push(variation);
    });


    return priceVariations;

  } catch (error) {
    throw error;
  }
};

// Helper function to get the product ID based on the product name
const getProductIdByName = async (productName) => {
    
  try {
    const querySnapshot = await firestore()
      .collection('priceVariations') // Assuming 'products' is the collection containing product name and corresponding productId
      .where('name_lowercase', '==', productName.toLowerCase())
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      //Toast.show("Price for this product didn't vary")
      return null; // Product name not found
    }
    const documentSnapshot = querySnapshot.docs[0];
    const productData = documentSnapshot.data();
    return productData.productId; // Replace 'productId' with the actual field name for the product ID
  } catch (error) {
    throw error;
  }
};
