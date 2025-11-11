import React from 'react';
import {AccountSettingStackParamList} from '@navigation/Types/CommonTypes';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ACCOUNT_SETTING_STACK_ROUTE_NAME} from '@utils/Constants';
import AccountSettings from '@screens/AccountSettings/AccountSettings';
import ChangePasswordScreen from '@screens/ChangePassowrd/ChangePasswordScreen';

const AccountSettingStack =
  createNativeStackNavigator<AccountSettingStackParamList>();

export default function AccountSettingStackNavigator() {
  return (
    <AccountSettingStack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName={ACCOUNT_SETTING_STACK_ROUTE_NAME.ACCOUNT_SETTINGS}>
      <AccountSettingStack.Screen
        name={ACCOUNT_SETTING_STACK_ROUTE_NAME.ACCOUNT_SETTINGS}
        component={AccountSettings}
      />
      <AccountSettingStack.Screen
        name={ACCOUNT_SETTING_STACK_ROUTE_NAME.CHANGE_PASSWORD}
        component={ChangePasswordScreen}
      />
    </AccountSettingStack.Navigator>
  );
}
