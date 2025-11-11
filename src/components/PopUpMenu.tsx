import {getNameInitials} from '@helpers/getNameInitials';
import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';
import useAuthValue from '@modules/AuthModule/Hooks/useAuthValue';
import useLogoutMutation from '@modules/AuthModule/Hooks/useLogoutMutation';
import scaler from '@utils/Scaler';
import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import Modal from './Modal';
import {theme} from '@styles/Theme';
import {Text} from 'react-native-paper';
import {globalStyles} from '@styles/GlobalStyles';
import Button from './Button';
import Divider from './Divider';
import {Strings} from '@locales/Localization';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {HOME_DRAWER_ROUTE_NAME, MAIN_STACK_ROUTE_NAME} from '@utils/Constants';
import {MainStackParamList} from '@navigation/Types/CommonTypes';

const {colors} = theme;

const TOGGLE_USER_MENU = 'TOGGLE_USER_MENU';

export const togglePopUpMenu = () => {
  emitEvent(TOGGLE_USER_MENU);
};

const PopUpMenu = () => {
  const {navigate} =
    useNavigation<
      NavigationProp<MainStackParamList, MAIN_STACK_ROUTE_NAME.HOME_DRAWER>
    >();
  const {selectedOt, user, hospitalName} = useAuthValue();
  const {firstName, lastName, username} = user ?? {};

  const [visible, setVisible] = useState(false);

  const {mutate: logoutMutate, isPending: isLoggingOut} = useLogoutMutation();

  useEventEmitter(TOGGLE_USER_MENU, () => {
    setVisible(prev => !prev);
  });

  return (
    <Modal
      visible={visible}
      statusBarTranslucent
      onBackdropPress={() => setVisible(false)}
      backdropBg="#00000066">
      <View style={styles.container}>
        <View style={[globalStyles.center, {marginBottom: scaler(32)}]}>
          <Text style={styles.label}>
            {hospitalName}, <Text>{selectedOt?.name}</Text>
          </Text>
          <View style={[styles.initialsView, globalStyles.center]}>
            <Text
              variant="headlineLarge"
              style={{color: colors.foreground.inverted}}>
              {getNameInitials(firstName, lastName)}
            </Text>
          </View>
          <Text variant="headlineLarge" style={styles.fullName}>
            {firstName} <Text>{lastName}</Text>
          </Text>
          <Text style={styles.label}>{username}</Text>
        </View>

        <Button
          onPress={() => {
            //@ts-ignore
            navigate(HOME_DRAWER_ROUTE_NAME.ACCOUNT_SETTINGS_STACK);
            setVisible(false);
          }}
          style={styles.btn}>
          {Strings.Account_Settings}
        </Button>
        <Divider
          style={{marginVertical: scaler(16)}}
          backgroundColor={colors.border.inactive}
        />
        <Button
          loading={isLoggingOut}
          disabled={isLoggingOut}
          style={styles.btn}
          onPress={() => logoutMutate()}>
          {Strings.Log_Out}
        </Button>
      </View>
    </Modal>
  );
};

export default PopUpMenu;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    width: scaler(340),
    alignSelf: 'center',
    borderRadius: scaler(16),
    padding: scaler(24),
  },

  label: {
    fontSize: scaler(16),
    color: colors.foreground.secondary,
  },

  fullName: {
    fontSize: scaler(18),
    color: colors.foreground.primary,
    lineHeight: scaler(24),
  },

  initialsView: {
    backgroundColor: colors.foreground.secondary,
    width: scaler(80),
    height: scaler(80),
    borderRadius: scaler(40),
    marginVertical: scaler(16),
  },

  btn: {height: scaler(40), justifyContent: 'center'},
});
