import {Animated, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';
import {Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from '@styles/Theme';
import scaler from '@utils/Scaler';
import {globalStyles} from '@styles/GlobalStyles';

export type SystemAlertProps = {
  type?: 'ERROR' | 'INFO' | 'SUCCESS';
  heading?: string;
  subHeading?: string;
  iconName?: string;
  iconColor?: string;
  iconSize?: number;
};

const SHOW_SYSTEM_ALERT_EVENT = 'SHOW_SYSTEM_ALERT_EVENT';
const HIDE_SYSTEM_ALERT_EVENT = 'HIDE_SYSTEM_ALERT_EVENT';

export const showSystemAlert = (data: SystemAlertProps) => {
  emitEvent(SHOW_SYSTEM_ALERT_EVENT, data);
};

export const hideSystemAlert = () => {
  emitEvent(HIDE_SYSTEM_ALERT_EVENT);
};

const {colors} = theme;

const SystemAlerts = () => {
  const [isVisible, setIsVisible] = useState(false);
  const opacityAnimValue = useRef(new Animated.Value(0)).current;
  const [alertDetails, setAlertDetails] = useState<SystemAlertProps>();

  const {type, heading, subHeading, iconName, iconColor, iconSize} =
    alertDetails ?? {};

  useEventEmitter(SHOW_SYSTEM_ALERT_EVENT, (data: SystemAlertProps) => {
    setIsVisible(true);
    fadeAnimation();
    setAlertDetails(data);

    setTimeout(() => {
      fadeAnimation(() => setIsVisible(false));
    }, 3000);
  });

  useEventEmitter(HIDE_SYSTEM_ALERT_EVENT, () => {
    fadeAnimation(() => setIsVisible(false));
  });

  const fadeAnimation = useCallback(
    (onSuccess?: () => void) => {
      Animated.timing(opacityAnimValue, {
        toValue: !isVisible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start(onSuccess);
    },
    [isVisible, opacityAnimValue],
  );

  const {iconColorD, iconNameD, iconStyle} = useMemo(() => {
    let name;
    let color;
    let style;

    switch (type) {
      case 'INFO':
        name = 'exclamation';
        color = colors?.foreground?.primary;
        style = styles.infoIconContainer;
        break;

      case 'ERROR':
        name = 'exclamation';
        color = colors?.error;
        style = styles.errorIconContainer;
        break;

      default:
        name = 'check-bold';
        color = colors?.foreground?.inverted;
        style = styles.successIconCntainer;
        break;
    }

    return {iconNameD: name, iconColorD: color, iconStyle: style};
  }, [type]);

  return (
    isVisible && (
      <Animated.View style={[styles.container, {opacity: opacityAnimValue}]}>
        <View style={[styles.iconContainer, iconStyle]}>
          <Icon
            name={iconName ?? iconNameD}
            color={iconColor ?? iconColorD}
            size={iconSize ?? scaler(16)}
          />
        </View>
        <View style={[globalStyles.flex1, {marginHorizontal: scaler(8)}]}>
          <Text style={styles.heading}>{heading}</Text>
          <Text style={styles.subHeading}>{subHeading}</Text>
        </View>
        <TouchableOpacity hitSlop={scaler(8)} onPress={hideSystemAlert}>
          <Icon name="close-thick" size={scaler(18)} />
        </TouchableOpacity>
      </Animated.View>
    )
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderRadius: scaler(16),
    width: scaler(440),
    position: 'absolute',
    bottom: scaler(20),
    padding: scaler(12),
    alignSelf: 'center',
  },
  heading: {
    fontFamily: 'Inter',
    fontSize: scaler(18),
    fontWeight: '700',
  },
  subHeading: {
    marginTop: scaler(4),
    fontFamily: 'Inter',
    fontSize: scaler(13),
    fontWeight: '400',
  },
  iconContainer: {
    width: scaler(24),
    height: scaler(24),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scaler(12),
  },
  errorIconContainer: {
    borderWidth: scaler(2),
    borderRadius: scaler(12),
    borderColor: colors.error,
  },
  infoIconContainer: {
    borderWidth: scaler(2),
    borderRadius: scaler(12),
    borderColor: colors.foreground.primary,
  },
  successIconCntainer: {
    backgroundColor: colors.foreground.inactive,
  },
});

export default SystemAlerts;
