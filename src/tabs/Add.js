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
    FlatList,
    ActivityIndicator
} from 'react-native';
import React , {useState, useEffect}from 'react'
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage'
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-simple-toast';


const Add = ({navigation}) => {
    const [imageData,setImageData] = useState(null)
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('')
    const [imageUrl, setImageUrl] = useState('');
    const [categories, setCategories] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false)

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

        }else{
            console.log(result);
            setImageData(result)
        }
      }
      const uploadImage = async () => {
        if (!name || !price || !category || !description || !imageData) {
          Toast.show('Please fill in all fields and upload an image.');
          return;
        }
        setLoading(true)
        Toast.show('Uploading');
        const reference = storage().ref(imageData.assets[0].fileName);
        console.log(reference)
        const pathToFile = imageData.assets[0].uri;
        // uploads file
        await reference.putFile(pathToFile);
        const url = await storage()
          .ref(imageData.assets[0].fileName)
          .getDownloadURL();
        console.log(url);
        uploadItem(url);
      };
    
      const uploadItem = async url => {
         await firestore()
          .collection('items')
          .add({
            name: name,
            price: price,
            description: description,
            category:category,
            imageUrl: url + '',
          })
          .then(() => {
            console.log('item added!');
            setName('')
            setPrice('')
            setDescription('')
            setCategory('')
            setImageUrl('')
            setImageData(null)
            setCategories([])
          });
          setLoading(false)
          Toast.show("Item Added")
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
        <Text style={styles.headerText}>Add Item</Text>
      </View>

      
        <TouchableOpacity
          style={styles.uploadCatBtn}
          value={category}
          onChangeText={(text) => setCategory(text)}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{color:'black'}}>{category ? category: 'Choose Category'}</Text>
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

        {/* <TextInput
          placeholder="Enter Item Category"
          style={styles.inputStyle}
          value={category} // Bind the input value to the selected category
          onChangeText={(text) => setCategory(text)} // This will prevent manual input
        /> */}
  
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
            source={{ uri: imageData.assets[0].uri }}
            style={styles.imageStyle}
          />
        ) : null}

        {loading ? (<ActivityIndicator size='large' color="#0000ff" />) :
          (
            <TouchableOpacity style={styles.uploadBtn} onPress={() => {
              uploadImage()
            }}>
              <Text style={{ color: '#Fff' }}>Upload Item</Text>
            </TouchableOpacity>)}
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

export default Add

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 40
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
        borderWidth: 0.8,
        paddingLeft: 20,
        paddingRight: 20,
        marginTop: 30,
        alignSelf: 'center',
        borderColor: 'black',
        backgroundColor: 'white',
      },
      categoryBtn: {
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
        marginBottom: 20,
      },
      imageStyle: {
        width: '90%',
        height: 200,
        borderRadius: 10,
        alignSelf: 'center',
        marginTop: 20,
      },
      categoryItem: {
        padding: 20,
        borderBottomWidth: 1,
        borderColor: '#ccc',
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
      buttonText: {
        color: '#fff',
        fontWeight: '700',
      },
})