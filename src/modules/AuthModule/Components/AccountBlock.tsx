import Icons from '@assets/Icons';
import { togglePopUpMenu } from '@components/PopUpMenu';
import UserFav from '@components/UserFav';
import useInternetState from '@hooks/useInternetState';
import { globalStyles } from '@styles/GlobalStyles';
import { theme } from '@styles/Theme';
import scaler from '@utils/Scaler';
import React from 'react';
import {
  Image,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import useAuthValue from '../Hooks/useAuthValue';

const { colors } = theme;

const AccountBlock = () => {
  const { selectedOt, tenantLogo } = useAuthValue();
  const { isInternetConnected } = useInternetState();

  const getTextStyles = (text: string | undefined): TextStyle => {
    const switchVariable = text ? text?.length : 0;
    switch (switchVariable) {
      case 5:
        return {
          fontSize: scaler(11),
          fontWeight: '400',
          lineHeight: scaler(11),
        };
      case 4:
        return {
          fontSize: scaler(13),
          fontWeight: '700',
          lineHeight: scaler(18),
        };
      default:
        return {
          fontSize: scaler(16),
          fontWeight: '700',
          lineHeight: scaler(20),
        };
    }
  };

  return (
    <View style={[globalStyles.rowCenter, { gap: scaler(12) }]}>
      {!isInternetConnected && (
        <View style={[styles.otStyle, { backgroundColor: colors.background.primary }]}>
          <Icons.NoInternetAlert />
        </View>
      )}
      <TouchableOpacity style={styles.profileViewStyle} onPress={togglePopUpMenu}>
        <View style={styles.otStyle}>
          <Text style={[styles.otTxtStyle, getTextStyles(selectedOt?.name)]}>
            {selectedOt?.name}
          </Text>
        </View>
        <View style={styles.hospStyle}>
          <Image
            source={{ uri: tenantLogo }}
            alt="Tenant Logo"
            resizeMode="cover"
            style={styles.imgStyle}
          />
        </View>
        <UserFav />
      </TouchableOpacity>
    </View>
  );
};

export default AccountBlock;

const styles = StyleSheet.create({
  profileViewStyle: {
    marginLeft: 'auto',
    borderRadius: 50,
    padding: scaler(4),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
  },
  otStyle: {
    height: scaler(36),
    width: scaler(36),
    borderRadius: 40,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hospStyle: {
    height: scaler(36),
    width: scaler(96),
    overflow: 'hidden',
    borderRadius: 40,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: scaler(8),
  },
  otTxtStyle: { color: colors.foreground.primary, fontWeight: '700' },
  imgStyle: {
    resizeMode: 'contain',
    marginHorizontal: scaler(25),
    width: scaler(60),
    height: 'auto',
    aspectRatio: 1,
  },
});
