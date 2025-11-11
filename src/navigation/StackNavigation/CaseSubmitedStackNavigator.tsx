import React from 'react';
import {CaseSubmittedStackParamList} from '@navigation/Types/CommonTypes';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SUBMIT_CASES_STACK_ROUTE_NAME} from '@utils/Constants';
import SubmittedCasesScreen from '@screens/SubmitedCases/SubmittedCasesScreen';
import CaseDetailScreen from '@screens/SubmitedCases/CaseDetailScreen';

const caseSubmitStack =
  createNativeStackNavigator<CaseSubmittedStackParamList>();

export default function CaseSubmitedStackNavigator() {
  return (
    <caseSubmitStack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName={SUBMIT_CASES_STACK_ROUTE_NAME.SUBMITTED_CASES}>
      <caseSubmitStack.Screen
        name={SUBMIT_CASES_STACK_ROUTE_NAME.SUBMITTED_CASES}
        component={SubmittedCasesScreen}
      />
      <caseSubmitStack.Screen
        name={SUBMIT_CASES_STACK_ROUTE_NAME.CASE_DETAIL}
        component={CaseDetailScreen}
      />
    </caseSubmitStack.Navigator>
  );
}
