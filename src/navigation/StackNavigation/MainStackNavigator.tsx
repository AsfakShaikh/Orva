import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MainStackParamList} from '@navigation/Types/CommonTypes';
import {MAIN_STACK_ROUTE_NAME} from '@utils/Constants';
import HomeDrawerNavigator from '@navigation/DrawerNavigation/HomeDrawerNavigation';
import OtSelectionScreen from '@screens/OtSelection/OtSelectionScreen';
import SystemAlerts from '@modules/TrackerModule/Components/SystemAlerts';
import WebViewerScreen from '@screens/WebViewer/WebViewerScreen';
import SessionTimeoutAlert from '@modules/AuthModule/Components/SessionTimeoutAlert';

const MainStack = createNativeStackNavigator<MainStackParamList>();

export default function MainStackNavigator() {
  return (
    <>
      <MainStack.Navigator screenOptions={{headerShown: false}}>
        <MainStack.Screen
          name={MAIN_STACK_ROUTE_NAME.OT_SELECTION}
          component={OtSelectionScreen}
        />
        <MainStack.Screen
          name={MAIN_STACK_ROUTE_NAME.HOME_DRAWER}
          component={HomeDrawerNavigator}
        />
        <MainStack.Screen
          name={MAIN_STACK_ROUTE_NAME.WEB_VIEWER}
          component={WebViewerScreen}
        />
      </MainStack.Navigator>
      <SystemAlerts />
      <SessionTimeoutAlert />
    </>
  );
}
