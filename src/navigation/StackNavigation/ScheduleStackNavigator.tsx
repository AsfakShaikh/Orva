import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ScheduleStackParamList} from '@navigation/Types/CommonTypes';
import {SCHEDULE_STACK_ROUTE_NAME} from '@utils/Constants';
import ConfirmPatientScreen from '@screens/ConfirmPatient/ConfirmPatientScreen';
import CaseScheduleScreen from '@screens/CaseSchedule/CaseScheduleScreen';

const ScheduleStack = createNativeStackNavigator<ScheduleStackParamList>();

export default function CaseScheduleStackNavigator() {
  return (
    <ScheduleStack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName={SCHEDULE_STACK_ROUTE_NAME.CASE_SCHEDULE}>
      <ScheduleStack.Screen
        name={SCHEDULE_STACK_ROUTE_NAME.CASE_SCHEDULE}
        component={CaseScheduleScreen}
      />
      <ScheduleStack.Screen
        name={SCHEDULE_STACK_ROUTE_NAME.CONFIRM_PATIENT}
        component={ConfirmPatientScreen}
      />
    </ScheduleStack.Navigator>
  );
}
