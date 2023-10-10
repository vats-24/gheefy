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
  } from 'react-native';
import React, { useEffect, useState } from 'react'
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = ({navigation}) => {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');


  const adminLogin = async ()=>{
    try {
      if (email !== '' && password !== ''){
        const userDoc = await firestore()
        .collection('users')
        .where('email', '==', email)
        .where('password', '==', password)
        .get();
        if (!userDoc.empty) {
          const user = userDoc.docs[0].data();
          await AsyncStorage.setItem('EMAIL', email);

          // Check the user's role and navigate accordingly
          if (user.role === 'admin') {
            navigation.navigate('Dashboard');
          } else if (user.role === 'user') {
            navigation.navigate('UserDashboard');
          }
        } else {
          alert('Invalid email or password');
        }
      } else {
        alert('Please enter email and password');
      }
    } catch (error) {
      
    }

    console.log(users.docs[0]._data);
  }

  const onPressSignUp = () => {
    navigation.navigate('SignUp')
  }

  return (
    <View style={styles.container}>
      <View style={styles.centre}>
      <Text style={styles.title}>Admin Login</Text>
      <TextInput
        style={styles.inputStyle}
        placeholder={'Enter Email Id'}
        value={email}
        onChangeText={txt=>setEmail(txt)}
      />
      <TextInput
        style={styles.inputStyle}
        placeholder={'Enter Password '}
        value={password}
        onChangeText={txt=>setPassword(txt)}
      />
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
        <Text style={{alignSelf: 'center', marginTop: 20, fontSize: 16}}>Don't have an account?</Text>
        <TouchableOpacity
          onPress={onPressSignUp}>
          <Text style={[styles.forgotAndSignUpText, {fontWeight:'700', fontSize: 13}]}>Signup</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Login

const styles = StyleSheet.create({
    container:{
      flex: 1,
      backgroundColor: '#9999FF'
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
        backgroundColor: 'orange',
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
        color: '#000',
      },
      forgotAndSignUpText:{
        color:"black",
        fontSize:11,
        marginTop: 10,
        alignSelf: 'center',
        justifyContent: 'center'
        },
})