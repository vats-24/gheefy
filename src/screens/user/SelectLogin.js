import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const SelectLogin = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SelectLogin</Text>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => {
          navigation.navigate('Login');
        }}>
        <Text style={styles.btnText}>Admin Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => {
          navigation.navigate('UserLogin');
        }}>
        <Text style={styles.btnText}>User Login</Text>
      </TouchableOpacity>
    </View>
  )
}

export default SelectLogin

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  btn: {
    backgroundColor: 'purple',
    height: 50,
    width: '90%',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  btnText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
})