import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
  } from 'react-native';
  import React, {useState} from 'react';
  import firestore from '@react-native-firebase/firestore';
  import uuid from 'react-native-uuid';

  const Signup = ({navigation}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const saveUser = () => {
      setModalVisible(true);
      const userId = uuid.v4();
      firestore()
        .collection('users')
        .doc(userId)
        .set({
          name: name,
          email: email,
          password: password,
          mobile: mobile,
          userId: userId,
          role:"user"
        })
        .then(res => {
          navigation.goBack();
        })
        .catch(error => {
          console.log(error);
        });
    };

    const onPressLogin = () => {
        navigation.navigate('Login')
      }
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Sign up</Text>
        <TextInput
          style={styles.inputStyle}
          placeholder={'Enter Name'}
          value={name}
          onChangeText={txt => setName(txt)}
        />
        <TextInput
          style={styles.inputStyle}
          placeholder={'Enter Email Id'}
          value={email}
          onChangeText={txt => setEmail(txt)}
        />
        <TextInput
          style={styles.inputStyle}
          placeholder={'Enter Mobile'}
          keyboardType={'number-pad'}
          value={mobile}
          onChangeText={txt => setMobile(txt)}
        />
        <TextInput
          style={styles.inputStyle}
          placeholder={'Enter Password '}
          value={password}
          onChangeText={txt => setPassword(txt)}
        />
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => {
            if (
              email !== '' &&
              password !== '' &&
              name !== '' &&
              mobile !== '' &&
              mobile.length > 9
            ) {
              saveUser();
            } else {
              alert('Please Enter Data');
            }
          }}>
          <Text style={styles.btnText}>Sign up</Text>
        </TouchableOpacity>
        <Text style={{alignSelf: 'center', marginTop: 20, fontSize: 16}}>Already a User?</Text>
        <TouchableOpacity
          onPress={onPressLogin}>
          <Text style={[styles.forgotAndSignUpText, {fontWeight:'700', fontSize: 13}]}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  export default Signup;
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: '#000',
      marginTop: 100,
      alignSelf: 'center',
    },
    inputStyle: {
      paddingLeft: 20,
      height: 50,
      alignSelf: 'center',
      marginTop: 30,
      borderWidth: 0.5,
      borderRadius: 10,
      width: '90%',
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
        alignSelf: 'center'
    },
  });