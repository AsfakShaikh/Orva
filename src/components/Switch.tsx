import {View, Text, StyleSheet, TouchableWithoutFeedback} from 'react-native';
import React, {FC, useEffect, useState} from 'react';
import scaler from '@utils/Scaler';
import {theme} from '@styles/Theme';
import Animated from 'react-native-reanimated';
import useDebounce from '@hooks/useDebounce';
import Icons from '@assets/Icons';
const {colors} = theme;

type SwitchProps = {
  bulletColor?: string;
  title?: string;
  value?: boolean;
  isAIGenerated?: boolean;
  onValueChange?: (val: boolean) => void;
};

const Switch: FC<SwitchProps> = ({
  title,
  bulletColor,
  value,
  isAIGenerated,
  onValueChange,
}) => {
  const [localValue, setLocalValue] = useState(value ?? false);
  const debouncedValue = useDebounce(localValue, 500);

  useEffect(() => {
    if (debouncedValue !== undefined) {
      onValueChange?.(debouncedValue as boolean);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  useEffect(() => {
    setLocalValue(value as boolean);
  }, [value]);

  const handlePress = () => {
    setLocalValue(!localValue);
  };
  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.container}>
        <View style={styles.leftContent}>
          {bulletColor && (
            <View style={[styles.bullet, {backgroundColor: bulletColor}]} />
          )}
          <Text style={styles.title}>{title}</Text>
          {isAIGenerated && <Icons.AIGenerated />}
        </View>
        <View
          style={[
            styles.switchContainer,
            {
              backgroundColor: localValue
                ? colors?.border.strong
                : colors.background.secondary,
              borderColor: localValue
                ? colors?.border.strong
                : colors?.border.default,
            },
          ]}>
          <Animated.View
            style={[
              styles.switchKnob,
              {
                transform: [{translateX: localValue ? 24 : 0}],
                backgroundColor: colors.background.primary,
                borderColor: localValue
                  ? colors?.border.strong
                  : colors?.border.default,
              },
            ]}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: scaler(24),
  },
  title: {
    fontSize: scaler(16),
    color: colors.foreground.primary,
  },
  bullet: {
    width: scaler(24),
    height: scaler(24),
    borderRadius: scaler(999),
    marginRight: scaler(8),
    borderColor: colors.border.inactive,
    borderWidth: scaler(1),
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchContainer: {
    width: scaler(56),
    height: scaler(32),
    borderRadius: scaler(16),
    borderWidth: 1,
    padding: 0,
    justifyContent: 'center',
  },
  switchKnob: {
    width: scaler(31),
    height: scaler(31),
    borderRadius: scaler(15.5),
    borderWidth: 1,
    position: 'absolute',
    left: 0,
  },
});

export default Switch;
