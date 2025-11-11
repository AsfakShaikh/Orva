import {SettingStackParamList} from '@navigation/Types/CommonTypes';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import VoiceOptimisation from '@components/VoiceOptimisation';
import {SETTING_STACK_ROUTE_NAME} from '@utils/Constants';
import SettingsScreen from '@screens/settings/SettingsScreen';

const SettingStack = createNativeStackNavigator<SettingStackParamList>();

export default function SettingStackNavigator() { 
  return (
    <SettingStack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName={SETTING_STACK_ROUTE_NAME.SETTINGS}>
      <SettingStack.Screen
        name={SETTING_STACK_ROUTE_NAME.SETTINGS}
        component={SettingsScreen}
      />
      <SettingStack.Screen
        name={SETTING_STACK_ROUTE_NAME.VOICE_OPTIMISATION}
        component={VoiceOptimisation}
      />
    </SettingStack.Navigator>
  );
}
