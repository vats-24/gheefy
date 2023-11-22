import { View, Text, StyleSheet } from 'react-native'
import React, {useEffect} from 'react'

const Splash = ({navigation}) => {
    useEffect(()=>{
        setTimeout(()=>{
            navigation.replace('UserDashboard')
        },500) 
    },[])
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>EDAIRYTRADE</Text>
    </View>
  )
}

export default Splash
const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
    logo:{
        fontSize: 40,
        fontWeight: '800',
        color: 'red'
    }
})