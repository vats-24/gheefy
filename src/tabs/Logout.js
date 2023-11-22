import { View, Text, StyleSheet,TouchableOpacity } from 'react-native'
import React from 'react'

const Logout = ({navigation}) => {
  return (
    <View>
        <TouchableOpacity
        style={styles.loginBtn}
        onPress={() => {
            navigation.navigate('UserDashboard')
        }}>
        <Text style={styles.btnText}>Logout</Text>
        </TouchableOpacity>
    </View>
  )
}

export default Logout

const styles = StyleSheet.create({
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
})