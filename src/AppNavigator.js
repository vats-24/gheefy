import { View, Text } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'
import Splash from './screens/Splash'
import Login from './screens/Login'
import Dashboard from './screens/Dashboard'
import EditItem from './screens/EditItem'
import UserDashboard from './screens/UserDashboard'


const Stack = createStackNavigator();
const AppNavigator = () => {
  return (
    <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen
            component={Splash}
            name="Splash"
            options={{headerShown: false}}
            />
            <Stack.Screen
            component={Dashboard}
            name="Dashboard"
            options={{headerShown: false}}
            />
            <Stack.Screen
            component={UserDashboard}
            name="UserDashboard"
            options={{headerShown: false}}
            />
            <Stack.Screen
            component={EditItem}
            name="EditItem"
            options={{headerShown: false}}
            />
            <Stack.Screen
            component={Login}
            name="Login"
            options={{headerShown: false}}
            />    
        </Stack.Navigator>
    </NavigationContainer>
  )
}

export default AppNavigator