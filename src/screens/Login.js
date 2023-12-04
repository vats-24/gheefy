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
    BackHandler,
  } from 'react-native';
import React, { useEffect, useState } from 'react'
import Icon from 'react-native-vector-icons/FontAwesome'
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = ({navigation}) => {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Navigate to UserDashboard when the back button is pressed
      //navigation.navigate('Splash');
      BackHandler.exitApp();
      return true; // Return true to indicate that the event has been handled
    });
    //backHandler.remove();
    return () => {
      backHandler.remove(); // Remove the event listener when the component unmounts
     };
  }, []);


  const adminLogin = async ()=>{
    try {
      if (email !== '' && password !== ''){
        const userDoc = await firestore()
        .collection('users')
        .where('email', '==', email)
        .get();
        if (!userDoc.empty) {
          const user = userDoc.docs[0].data();
          if(password == user.password){
            // console.log(user.role)
            if (user.role === 'admin') {
              // AsyncStorage.setItem('isLoggedIn', 'true');
              navigation.navigate('Dashboard');
            } else if (user.role === 'user') {
              navigation.navigate('UserDashboard');
            }
          }
          else {
            alert('Invalid email or password');
          }
        
        } else {
          alert('Invalid email or password');
        }
      } else {
        alert('Please enter email and password');
      }
    } catch (error) {
      console.error('Error in adminLogin:', error);
      alert('An error occurred. Please try again later.');
    }

    // console.log(users.docs[0]._data);
  }

  const onPressSignUp = () => {
    navigation.navigate('SignUp')
  }

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prevIsPasswordVisible) => !prevIsPasswordVisible);
  };

  return (
    <View style={styles.container}>
      <View style={styles.centre}>
      <Text style={styles.title}>Admin Login</Text>
      <TextInput
        style={styles.passwordInput}
        placeholder={'Enter Email Id'}
        value={email}
        onChangeText={txt=>setEmail(txt)}
      />
      <View style={styles.passwordInput}>
      <TextInput
        style={styles.inputField}
        placeholder="Enter Password"
        value={password}
        onChangeText={(txt) => setPassword(txt)}
        secureTextEntry={!isPasswordVisible}
      />
      <TouchableOpacity onPress={togglePasswordVisibility}>
        {isPasswordVisible?<Image source={require("../images/view.png")} style={styles.bottomTab} />:<Image source={require("../images/hide.png")} style={styles.bottomTab}/>}
      </TouchableOpacity>
    </View>
      {/* <TextInput
        style={styles.inputStyle}
        placeholder={'Enter Password '}
        value={password}
        onChangeText={txt=>setPassword(txt)}
      /> */}
        <TouchableOpacity
        style={styles.loginBtn}
        onPress={() => {
          if (email !== '' && password !== '') {
            adminLogin();
          } else {
            alert('Please Enter Data');
          }
        }}>
        <Text style={styles.btnText}>Login</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bottomView}>
      <TouchableOpacity style={styles.bottomTab} onPress={()=>{
        navigation.navigate('Splash')
            }}>
                <Image source={require('../images/logout.png')} style={[
                    styles.bottomTabImg,
                    {tintColor:'white'}]}/>
            </TouchableOpacity>
      </View>
    </View>
  )
}

export default Login

const styles = StyleSheet.create({
    container:{
      flex: 1,
      backgroundColor: 'black',
    },
    centre:{
        flex:1,
        margin: 30,
        backgroundColor: 'white',
        borderRadius: 20
    },
    title:{
        fontSize: 20,
        fontWeight: '800',
        color: '#000',
        marginTop: 40,
        alignSelf: 'center'
        
    },
  bottomView: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'black',
  },
  bottomTab: {
    height: '100%',
    width: '20%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomTabImg: {
    width: 40,
    height: 40,
  },
    inputStyle: {
        paddingLeft: 20,
        height: 50,
        alignSelf: 'center',
        marginTop: 30,
        borderWidth: 0.5,
        borderRadius: 10,
        width: '90%',
        backgroundColor: 'white'
      },
      loginBtn: {
        backgroundColor: 'black',
        width: '90%',
        height: 50,
        alignSelf: 'center',
        borderRadius: 10,
        marginTop: 50,
        justifyContent: 'center',
        alignItems: 'center',
      },
      btnText: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
      },
      forgotAndSignUpText:{
        color:"black",
        fontSize:11,
        marginTop: 10,
        alignSelf: 'center',
        justifyContent: 'center'
        },
        passwordInput: {
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: 'black',
          borderRadius: 10,
          paddingHorizontal: 10,
          margin: 10,
        },
        inputField: {
          flex: 1,
        },
        eyeIcon: {
          marginRight: 10,
        },
        bottomTabImgG: {
          width: 10,
          height: 10,
      },
      bottomTab:{
        width: 30,
        height: 30,
      }
})