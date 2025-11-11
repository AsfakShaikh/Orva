/* eslint-disable react-native/no-inline-styles */
import scaler from '@utils/Scaler';
import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {LinearTransition} from 'react-native-reanimated';
interface ToggleButtonProps extends TouchableOpacityProps {
  containerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  value?: boolean;
  onValueChange?: (val: boolean) => void;
}
const ToggleButton = ({
  containerStyle,
  contentStyle,
  onValueChange,
  value = false,
  ...rest
}: ToggleButtonProps) => {
  const [val, setVal] = useState(false);

  useEffect(() => {
    if (value !== val) {
      setVal(value);
    }
  }, [val, value]);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        onValueChange?.(!val);
        setVal(prev => !prev);
      }}
      {...rest}>
      <View
        style={[
          containerStyle,
          {
            borderColor: '#79747E',
          },
        ]}>
        <View
          style={[
            styles.main,
            contentStyle,
            {
              alignItems: val ? 'flex-end' : 'flex-start',
              backgroundColor: val ? '#65558F' : '#DADADA',
              borderWidth: val ? 0 : scaler(2),
              borderRadius: scaler(18),
            },
          ]}>
          <Animated.View
            layout={LinearTransition.springify()}
            style={[
              styles.circleBtn,
              {
                backgroundColor: val ? 'white' : '#79747E',
                width: val ? scaler(24) : scaler(16),
                height: val ? scaler(24) : scaler(16),
              },
              val && {right: scaler(4)},
              !val && {left: scaler(6)},
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ToggleButton;

const styles = StyleSheet.create({
  main: {
    height: scaler(13),
    justifyContent: 'center',
    width: scaler(22),
  },
  circleBtn: {
    width: scaler(16),
    height: scaler(16),
    position: 'absolute',
    borderRadius: 20,
    backgroundColor: '#79747E',
  },
});
