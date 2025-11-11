import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AuthStackParamList} from '@navigation/Types/CommonTypes';
import {AUTH_STACK_ROUTE_NAME} from '@utils/Constants';
import LoginScreen from '@screens/Login/LoginScreen';
import RecoverUsernameScreen from '@screens/RecoverUsername/RecoverUsernameScreen';
import RecoverPasswordScreen from '@screens/RecoverPassword/RecoverPasswordScreen';
import HeaderSnackbar from '@components/HeaderSnackbar';
import {StyleSheet, View} from 'react-native';
import scaler from '@utils/Scaler';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStackNavigator() {
  return (
    <>
      <View style={styles?.header}>
        <HeaderSnackbar />
      </View>
      <AuthStack.Navigator screenOptions={{headerShown: false}}>
        <AuthStack.Screen
          name={AUTH_STACK_ROUTE_NAME.LOGIN}
          component={LoginScreen}
        />
        <AuthStack.Screen
          name={AUTH_STACK_ROUTE_NAME.RECOVER_USERNAME}
          component={RecoverUsernameScreen}
        />
        <AuthStack.Screen
          name={AUTH_STACK_ROUTE_NAME.RECOVER_PASSWORD}
          component={RecoverPasswordScreen}
        />
      </AuthStack.Navigator>
    </>
  );
}

const styles = StyleSheet.create({
  header: {position: 'absolute', top: scaler(24), left: 0, right: 0},
});
