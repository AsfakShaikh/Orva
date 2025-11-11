import {StyleSheet, View} from 'react-native';
import React from 'react';
import {Text} from 'react-native-paper';
import Button from '@components/Button';
import {Strings} from '@locales/Localization';
import scaler from '@utils/Scaler';
import {
  CommonActions,
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import {TrackerStackParamList} from '@navigation/Types/CommonTypes';
import {
  SCHEDULE_STACK_ROUTE_NAME,
  TRACKER_STACK_ROUTE_NAME,
} from '@utils/Constants';
import {globalStyles} from '@styles/GlobalStyles';
import Container from '@components/Container';
import {theme} from '@styles/Theme';
import useLogoutMutation from '@modules/AuthModule/Hooks/useLogoutMutation';
const {colors} = theme;

export default function LastCaseConfirmation() {
  const {getParent} =
    useNavigation<
      NavigationProp<
        TrackerStackParamList,
        TRACKER_STACK_ROUTE_NAME.CASE_TRACKER
      >
    >();
  const {mutate: logoutMutate, isPending: isLoggingOut} = useLogoutMutation();

  return (
    <Container backgroundColor="transparent">
      <View style={globalStyles.colCenter}>
        <View style={styles.lscontainer}>
          <View style={styles.mtop}>
            <Text style={styles.containerTitle}>
              {Strings.Last_Case_of_the_Day_Submitted}
            </Text>
            <Text style={styles.containerSubTitle}>
              {Strings.Last_Case_Sub_Heading}
            </Text>
            <Button
              disabled={isLoggingOut}
              onPress={() => {
                getParent()?.dispatch(
                  CommonActions.navigate(
                    SCHEDULE_STACK_ROUTE_NAME.CASE_SCHEDULE,
                  ),
                );
              }}
              style={styles.mVertical}
              mode="contained">
              {Strings.Return_to_Case_Selection}
            </Button>
            <Button
              loading={isLoggingOut}
              disabled={isLoggingOut}
              onPress={() => {
                logoutMutate();
              }}
              mode="outlined">
              {Strings.Log_Out}
            </Button>
          </View>
        </View>
      </View>
    </Container>
  );
}
const styles = StyleSheet.create({
  lscontainer: {
    backgroundColor: colors.onPrimary,
    width: scaler(400),
    borderRadius: scaler(16),
    padding: scaler(16),
  },
  mtop: {marginTop: scaler(8)},
  containerTitle: {
    textAlign: 'center',
    fontSize: scaler(18),
    fontWeight: 700,
    lineHeight: scaler(24),
  },
  containerSubTitle: {
    textAlign: 'center',
    fontSize: scaler(16),
    fontWeight: 400,
    lineHeight: scaler(20),
    marginTop: scaler(8),
  },
  mVertical: {marginVertical: scaler(24)},
});
