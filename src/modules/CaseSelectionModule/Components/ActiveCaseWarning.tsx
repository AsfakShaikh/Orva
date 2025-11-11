import {View} from 'react-native';
import React from 'react';
import {Text} from 'react-native-paper';
import Button from '@components/Button';
import {Strings} from '@locales/Localization';
import scaler from '@utils/Scaler';
import {useNavigation} from '@react-navigation/native';
import {MainStackParamList} from '@navigation/Types/CommonTypes';
import {MAIN_STACK_ROUTE_NAME} from '@utils/Constants';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {USER_SELECTED_OT} from '@modules/AuthModule/Types/CommonTypes';

type ActiveCaseWarningProps = Readonly<{
  activeCase: USER_SELECTED_OT;
}>;

export default function ActiveCaseWarning({
  activeCase,
}: ActiveCaseWarningProps) {
  const {replace} =
    useNavigation<
      NativeStackNavigationProp<
        MainStackParamList,
        MAIN_STACK_ROUTE_NAME.OT_SELECTION
      >
    >();
  const {name, mrn, currentMilestone} = activeCase;

  return (
    <View style={{marginTop: scaler(8)}}>
      <Text style={{textAlign: 'center'}}>
        {`${name} with MRN ${mrn} is currently on the ‘${currentMilestone}’
        milestone. Would you like to continue with this patient?`}
      </Text>
      <Button
        onPress={() => {
          replace(MAIN_STACK_ROUTE_NAME.HOME_DRAWER, {
            isContinueWithActiveCase: true,
          });
        }}
        style={{marginVertical: scaler(24)}}
        mode="contained">
        {Strings.Yes_continue_with_this_patient}
      </Button>
      <Button
        onPress={() => {
          replace(MAIN_STACK_ROUTE_NAME.HOME_DRAWER, {
            isContinueWithActiveCase: false,
          });
        }}
        mode="outlined">
        {Strings.No_select_a_different_patient}
      </Button>
    </View>
  );
}
