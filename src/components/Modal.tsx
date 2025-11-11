import {globalStyles} from '@styles/GlobalStyles';
import React from 'react';
import {
  Modal as BaseModal,
  ModalProps as BaseModalProps,
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {useTheme} from 'react-native-paper';
import Animated from 'react-native-reanimated';

export interface ModalProps extends BaseModalProps {
  onBackdropPress?: () => void;
  backdropBg?: string;
  containerStyle?: Omit<StyleProp<ViewStyle>, 'backgroundColor'>;
  animatedOverlayStyle?: StyleProp<ViewStyle>;
}

export default function Modal(Props: Readonly<ModalProps>) {
  const {colors} = useTheme();
  const {
    onBackdropPress,
    backdropBg = colors?.backdrop,
    transparent,
    containerStyle,
    animatedOverlayStyle,
    ...props
  } = Props;

  return (
    <BaseModal statusBarTranslucent transparent animationType="fade" {...props}>
      <Animated.View
        style={[
          globalStyles.blurView,
          // eslint-disable-next-line react-native/no-inline-styles
          {backgroundColor: transparent ? 'transparent' : backdropBg},
          animatedOverlayStyle,
        ]}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={event => {
            if (event.target !== event.currentTarget) {
              return;
            } else {
              onBackdropPress?.();
            }
          }}
          style={[globalStyles.flex1]}
        />
      </Animated.View>
      <View style={[globalStyles.colCenter, containerStyle]}>
        {props.children}
      </View>
    </BaseModal>
  );
}
