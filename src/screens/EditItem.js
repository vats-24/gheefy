import {
    StyleSheet,
    TextInput,
    View,
    Text,
    ScrollView,
    Image,
    Keyboard,
    TouchableOpacity,
    KeyboardAvoidingView,
    PermissionsAndroid,
    Modal,
    FlatList
} from 'react-native';
import React , {useState, useEffect}from 'react'
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage'
import firestore from '@react-native-firebase/firestore';
import { useRoute } from '@react-navigation/native';
import Toast from 'react-native-simple-toast';

const EditItem = ({navigation}) => {
    const route = useRoute()
    const [imageData, setImageData] = useState({
        assets: [{uri: route.params.data.imageUrl}],
      });
      const [name, setName] = useState(route.params.data.name);
      const [price, setPrice] = useState(route.params.data.price);
      const [description, setDescription] = useState(route.params.data.description);
      const [category, setCategory] = useState(route.params.data.category)
      const [imageUrl, setImageUrl] = useState('');
      const [categories, setCategories] = useState([]);
      const [modalVisible, setModalVisible] = useState(false);


      useEffect(() => {
        firestore()
          .collection('categories')
          .onSnapshot((querySnapshot) => {
            const data = [];
            querySnapshot.forEach((documentSnapshot) => {
              data.push({ id: documentSnapshot.id, ...documentSnapshot.data() });
            });
            setCategories(data);
          });
      }, []);

    const requestCameraPermission = async () => {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Cool Photo App Camera Permission',
              message:
                'Cool Photo App needs access to your camera ' +
                'so you can take awesome pictures.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('You can use the camera');
            openGallery();
          } else {
            console.log('Camera permission denied');
          }
        } catch (err) {
          console.warn(err);
        }
      };
    const openGallery = async()=>{
        const result = await launchImageLibrary({mediaType:'photo'});
        if(result.didCancel){
          alert("Some Problem Happened")
        }else{
            console.log(result);
            setImageData(result)
        }
      }
      const uploadImage = async () => {
        if (imageData.assets[0].uri !== route.params.data.imageUrl){        const reference = storage().ref(imageData.assets[0].fileName);
        const pathToFile = imageData.assets[0].uri;
        // uploads file
        await reference.putFile(pathToFile);
        const url = await storage()
          .ref(imageData.assets[0].fileName)
          .getDownloadURL();
        console.log(url);
        uploadItem(url);
      }else {
        uploadItem(route.params.data.imageUrl)
      }
      };
    
      const uploadItem = (imageUrl) => {
        if(price!= route.params.data.price)
        {
        firestore()
        .collection('priceVariations')
        .add({
          name: name,
          name_lowercase: name.toLowerCase(),
          productId: route.params.id,
          price: parseFloat(price), // Assuming price is a string; convert it to a number if needed.
          date: new Date().toISOString().split('T')[0],
        })
        .then(() => {
          console.log('Price variation added!');
        })
        .catch((error) => {
          console.error('Error adding price variation:', error);
        });
      }
        firestore()
          .collection('items')
          .doc(route.params.id)
          .update({
            name: name,
            price: price,
            description: description,
            category:category,
            imageUrl: imageUrl,
          })
          .then(() => {
            Toast.show("Item Updated")
            console.log('User added!');
            navigation.goBack();
          });
      };
      const handleGoBack = () => {
        navigation.navigate('Dashboard');
      };

      const renderItem = ({ item }) => (
        <TouchableOpacity
          style={styles.categoryItem}
          onPress={() => {
            setCategory(item.name); 
            setModalVisible(false);
          }}
        >
          <Text>{item.name}</Text>
        </TouchableOpacity>
      );
  return (
    <ScrollView style={styles.container}>
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Edit Item</Text>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Image source={require('../images/back.png')} style={[
                    styles.TabImg,
                    {tintColor: 'black'}]}/>
          </TouchableOpacity>
      </View>

      <TouchableOpacity
          style={styles.uploadCatBtn}
          value={category}
          onChangeText={(text) => setCategory(text)}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{ color: 'black' }}>{category ? category : 'Choose Category'}</Text>
        </TouchableOpacity>

        <TextInput placeholder='Enter Item Name'
               style={styles.inputStyle}
                value={name}
                onChangeText={text => setName(text)}
              />

              <TextInput placeholder='Enter Item Price'
               style={styles.inputStyle}
               value={price}
               onChangeText={text => setPrice(text)}
               />

              <TextInput placeholder='Enter Item Description'
               style={styles.inputStyle}
               value={description}
               onChangeText={text => setDescription(text)}
               />

        <TouchableOpacity style={styles.pickBtn} onPress={() => {
          requestCameraPermission()
        }}>
          <Text>Pick Image From Gallery</Text>
        </TouchableOpacity>

        <Text style={{alignSelf: 'center', marginTop: 20, fontSize: 20}}>OR</Text>

        <TextInput placeholder='Enter Image Url'
               style={styles.inputStyle}
               value={imageUrl}
               onChangeText={text => setImageUrl(text)}
               />

      {imageData !== null ? (
          <Image
            source={{uri: imageData.assets[0].uri}}
            style={styles.imageStyle}
          />
        ) : null}



      <TouchableOpacity style={styles.uploadBtn} onPress={()=>{
        uploadImage()
      }}>
        <Text style={{color:'#Fff'}}>Update Item</Text>
      </TouchableOpacity>
    </View>
    <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Choose Category</Text>
            <FlatList
              data={categories}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
            />
            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

export default EditItem

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:'white'
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
      inputStyle: {
        width: '90%',
        height: 50,
        borderRadius: 10,
        borderWidth: 0.5,
        paddingLeft: 20,
        paddingRight: 20,
        marginTop: 30,
        alignSelf: 'center',
      },
      pickBtn: {
        width: '90%',
        height: 50,
        borderWidth: 0.5,
        borderRadius: 10,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
      },
      uploadBtn: {
        backgroundColor: '#5246f2',
        width: '90%',
        height: 50,
        borderRadius: 10,
        alignSelf: 'center',
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
      },
      imageStyle: {
        width: '90%',
        height: 200,
        borderRadius: 10,
        alignSelf: 'center',
        marginTop: 20,
        borderWidth:0.3,
        borderColor:'black'
      },
      backBtn: {
        width: '90%',
        height: 50,
        borderWidth: 0.5,
        borderRadius: 10,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom:10
      },
      uploadCatBtn: {
        backgroundColor: 'white',
        width: '90%',
        height: 50,
        borderRadius: 10,
        alignSelf: 'center',
        marginTop: 20,
        justifyContent: 'center',
        //alignItems: 'center',
        paddingLeft:8,
        marginBottom: 0,
        borderWidth: 0.5
      },
        backButton: {
    position: 'absolute',
    top: 15,
    right: 10,
  },
  TabImg: {
    width: 35,
    height: 25,
},
modalContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
},
modalView: {
  width: '90%',
  backgroundColor: '#FFF',
  elevation:3,
  borderRadius: 10,
  padding: 20,
},
modalText: {
  fontSize: 20,
  fontWeight: '700',
  marginBottom: 20,
},
categoryItem: {
  padding: 20,
  borderBottomWidth: 1,
  borderColor: '#ccc',
},
closeModalBtn: {
  width: '50%',
  alignSelf: 'center',
  borderWidth: 0.3,
  borderRadius: 10,
  padding: 10,
  alignItems: 'center',
  marginTop: 20,
  backgroundColor: '#5246f2',
},
buttonText: {
  color: '#fff',
  fontWeight: '700',
},
})