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
    PermissionsAndroid
} from 'react-native';
import React , {useState}from 'react'
import Items from '../tabs/Items';
import Add from '../tabs/Add';
import PriceVariationGraphScreen from '../tabs/PriceVariationGraphScreen';
import Login from './Login';
import Logout from '../tabs/Logout';
import CategoryScreen from '../tabs/Category';
import Contacts from 'react-native-contacts';

const Dashboard = ({navigation}) => {
    const [selectedTab, setSelectedTab] = useState(0)
    return (
    <View style={styles.container}>
        {selectedTab==0?(
        <Items/>
        ):selectedTab==1?
        (<Add/>):selectedTab==2?(<PriceVariationGraphScreen/>):selectedTab==3?(<CategoryScreen/>):
        navigation.navigate('Splash')}
        <View style={styles.bottomView}>                
            <TouchableOpacity style={styles.bottomTab} onPress={()=>{
                setSelectedTab(0)
            }}>
                <Image source={require('../images/ghee.png')} style={[
                    styles.bottomTabImgG,
                    // {tintColor: selectedTab==0 ? '#FCF55F' : null}
                ]}
                    />
            </TouchableOpacity>

            <TouchableOpacity style={styles.bottomTab} onPress={()=>{
                setSelectedTab(2)
            }}>
                <Image source={require('../images/bar-chart.png')} style={[
                    styles.bottomTabImg,
                    {tintColor: selectedTab==2 ? 'yellow' : 'black'}]}/>
            </TouchableOpacity>

            <TouchableOpacity style={styles.bottomTab} onPress={()=>{
                setSelectedTab(1)
            }}>
                <Image source={require('../images/add.png')} style={[
                    styles.bottomTabImg,
                    {tintColor: selectedTab==1 ? 'yellow' : 'black'}]}/>
            </TouchableOpacity>

            <TouchableOpacity style={styles.bottomTab} onPress={()=>{
                setSelectedTab(3)
            }}>
                <Image source={require('../images/menu.png')} style={[
                    styles.bottomTabImg,
                    {tintColor: selectedTab==3 ? 'yellow' : 'black'}]}/>
            </TouchableOpacity>

            <TouchableOpacity style={styles.bottomTab} onPress={()=>{
                setSelectedTab(4)
            }}>
                <Image source={require('../images/logout.png')} style={[
                    styles.bottomTabImg,
                    {tintColor: selectedTab==4 ? 'yellow' : 'black'}]}/>
            </TouchableOpacity>
        </View>
    </View>
    );
};

export default Dashboard
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
        height: 40,
    },
    bottomTabImgG: {
        width: 100,
        height: 100,
    },
})