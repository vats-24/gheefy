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
    Linking,
} from 'react-native';
import React, { useState, useEffect } from 'react'
import Items from '../tabs/Items';
import Profile from '../tabs/Profile';
import PriceVariationGraphScreen from '../tabs/PriceVariationGraphScreen';
import UserItems from '../tabs/User/UserItems';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SendIntentAndroid from 'react-native-send-intent';
import { useLinkTo } from '@react-navigation/native';
import Contacts from 'react-native-contacts';
import firestore from '@react-native-firebase/firestore';



const UserDashboard = ({navigation}) => {
    const [selectedTab, setSelectedTab] = useState(0)


    if(selectedTab == 1){
    }
    const linkTo = useLinkTo();

    const takeContacts =() =>{
        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
            title: 'Contacts',
            message: 'This app would like to view your contacts.',
            buttonPositive: 'Please accept',
        })
            .then((res) => {
                console.log('Permission: ', res);
                Contacts.getAll()
                    .then((contacts) => {
                        contacts.forEach(async (contact)=>{
                            
                            const {phoneNumbers,givenName} = contact
                            console.log(givenName)
                            console.log(phoneNumbers[0].number)
                            // work with contacts
                            //console.log(contacts.phoneNumbers);


                            const contactRef = firestore().collection('contacts');
                            const querySnapshot = await contactRef
                              .where('number', '==', phoneNumbers[0].number)
                              .get();
                        
                            if (!querySnapshot.empty) {
                                console.log("Contact Already added")
                            } else {
                              //Toast.show('Category Adding');
                              // Save the category to Firestore
                              try {
                                await firestore()
                                .collection('contacts')
                                .add({
                                  name: givenName,
                                  number: phoneNumbers[0].number 
                                })
                                .then(()=>{
                                    console.log('contact added')
                                });
                            }catch(error){
                                console.error('Error adding contacts', error)
                            }
                        }
                        })
                    })
                    .catch((e) => {
                        console.log(e);
                    });
            })
            .catch((error) => {
                console.error('Permission error: ', error);
            });

    }

    const openDialer = () => {
        //requestContactsPermission();
        const adminPhoneNumber = '9827385790'; // Replace with the admin's phone number           
        const phoneNumber = `tel:${adminPhoneNumber}`;
        Linking.openURL(phoneNumber);
      };
      const phoneNumber = '9827385790';

      const openWhatsAppChat = () => {
        const phoneNumberWithCountryCode = `91${phoneNumber}`; // Replace '91' with the appropriate country code
        const url = `https://api.whatsapp.com/send?phone=${phoneNumberWithCountryCode}`;
        Linking.openURL(url)
        }
    return (
        <View style={styles.container}>
            {selectedTab == 0 ? (
                <UserItems/>
            ) :selectedTab==1?(<PriceVariationGraphScreen />):navigation.navigate('Login')}
            <View style={styles.bottomView}>
                <TouchableOpacity style={styles.bottomTab} onPress={() => {
                    //takeContacts()
                    setSelectedTab(0)
                }}>
                    <Image source={require('../images/ghee.png')} style={[
                        styles.bottomTabImgG,
                        // {tintColor: selectedTab==0 ? '#FCF55F' : null}
                    ]}
                    />
                </TouchableOpacity>

                <TouchableOpacity style={styles.bottomTab} onPress={() => {
                    setSelectedTab(1)
                }}>
                    <Image source={require('../images/bar-chart.png')} style={[
                        styles.bottomTabImg,
                        { tintColor: selectedTab == 1 ? '#FCF55F' : 'white' }]} />
                </TouchableOpacity>

                <TouchableOpacity style={{...styles.bottomTab}} onPress={openWhatsAppChat}>
                    <Image
                        source={require('../images/whatsapp.png')} 
                        style={[styles.bottomTabImg, { tintColor: 'white'}]}
                    />
                </TouchableOpacity>

                <TouchableOpacity style={styles.bottomTab} onPress={() => {
                    setSelectedTab(2)
                }}>
                    <Image source={require('../images/user.png')} style={[
                        styles.bottomTabImg,
                        { tintColor: selectedTab == 2 ? '#FCF55F' : 'white' }]} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default UserDashboard
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bottomView: {
        width: '100%',
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        backgroundColor: '#39559e',
        opacity: 0.7
    },
    bottomTab: {
        height: '100%',
        width: '20%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomTabImg: {
        width: 40,
        height: '80%',
    },
    bottomTabImgG: {
        width: 100,
        height: 100,
    },
})