import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {TrackerStackParamList} from '@navigation/Types/CommonTypes';
import {TRACKER_STACK_ROUTE_NAME} from '@utils/Constants';
import CaseTrackerScreen from '@screens/CaseTracker/CaseTrackerScreen';
import LastCaseConfirmationScreen from '@screens/LastCaseConfirmation/LastCaseConfirmationScreen';
import NoActiveCaseScreen from '@screens/NoActiveCase/NoActiveCaseScreen';
import useTrackerValue from '@modules/TrackerModule/Hooks/useTrackerValues';

const TrackerStack = createNativeStackNavigator<TrackerStackParamList>();

export default function TrackerStackNavigator() {
  const {currentActiveCase} = useTrackerValue();

  return (
    <TrackerStack.Navigator screenOptions={{headerShown: false}}>
      {currentActiveCase ? (
        <>
          <TrackerStack.Screen
            name={TRACKER_STACK_ROUTE_NAME.CASE_TRACKER}
            component={CaseTrackerScreen}
          />
          <TrackerStack.Screen
            name={TRACKER_STACK_ROUTE_NAME.LAST_CASE_CONFIRMATION}
            component={LastCaseConfirmationScreen}
          />
        </>
      ) : (
        <TrackerStack.Screen
          name={TRACKER_STACK_ROUTE_NAME.NO_ACTIVE_CASE}
          component={NoActiveCaseScreen}
        />
      )}
    </TrackerStack.Navigator>
  );
}
