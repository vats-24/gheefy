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
    Linking,
} from 'react-native';
import React, { useState } from 'react'
import Items from '../tabs/Items';
import Profile from '../tabs/Profile';
import PriceVariationGraphScreen from '../tabs/PriceVariationGraphScreen';
import UserItems from '../tabs/User/UserItems';
import Contacts from 'react-native-contacts';
import firestore from '@react-native-firebase/firestore';


const UserDashboard = () => {
    const [selectedTab, setSelectedTab] = useState(0)

    const openDialer = () => {
        requestContactsPermission();
        const adminPhoneNumber = '1234567890'; // Replace with the admin's phone number
        const phoneNumber = `tel:${adminPhoneNumber}`;
        Linking.openURL(phoneNumber);
      };
    return (
        <View style={styles.container}>
            {selectedTab == 0 ? (
                <UserItems />
            ) : (<PriceVariationGraphScreen />)}
            <View style={styles.bottomView}>
                <TouchableOpacity style={styles.bottomTab} onPress={() => {
                    setSelectedTab(0)
                }}>
                    <Image source={require('../images/ghee.png')} style={[
                        styles.bottomTabImg,
                        // {tintColor: selectedTab==0 ? 'red' : 'black'}
                    ]}
                    />
                </TouchableOpacity>

                <TouchableOpacity style={styles.bottomTab} onPress={() => {
                    setSelectedTab(1)
                }}>
                    <Image source={require('../images/bar-chart.png')} style={[
                        styles.bottomTabImg,
                        { tintColor: selectedTab == 1 ? 'red' : 'black' }]} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.bottomTab} onPress={openDialer}>
                    <Image
                        source={require('../images/phone-call.png')} // Replace with your phone icon image
                        style={styles.bottomTabImg}
                    />
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
        height: 60,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        backgroundColor: '#fff',
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
})