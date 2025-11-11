import React, {FC, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import {theme} from '@styles/Theme';
import scaler from '@utils/Scaler';
const {colors} = theme;

type DotsLoaderProps = {
  size?: number;
  color?: string;
  gap?: number;
};

const DotsLoader: FC<DotsLoaderProps> = ({
  size = scaler(8),
  color = colors.foreground.brand,
  gap,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(3, {duration: 1000}), -1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const leftDotStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0, 1, 2, 3],
      [0.2, 0.2, 1, 0.2],
    );
    return {opacity};
  });

  const centerDotStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 1, 2, 3], [1, 0.2, 0.2, 1]);
    return {opacity};
  });

  const rightDotStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0, 1, 2, 3],
      [0.2, 1, 0.2, 0.2],
    );
    return {opacity};
  });

  const dotStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
  };

  return (
    <View style={[styles.container, {gap: gap ?? size / 3}]}>
      <Animated.View style={[dotStyle, leftDotStyle]} />
      <Animated.View style={[dotStyle, centerDotStyle]} />
      <Animated.View style={[dotStyle, rightDotStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scaler(4),
  },
});

export default DotsLoader;
