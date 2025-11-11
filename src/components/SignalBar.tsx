import {globalStyles} from '@styles/GlobalStyles';
import {theme} from '@styles/Theme';
import {STATUS} from '@utils/Constants';
import scaler from '@utils/Scaler';
import React, {FC, useEffect, useMemo, useState} from 'react';
import {
  DimensionValue,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  AnimatedStyle,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const {colors} = theme;

interface WaveProps extends ViewStyle {
  color?: string | Array<string>;
  fadeCorners?: boolean;
  animatedStyle: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
}

const Wave: FC<WaveProps> = ({
  color,
  fadeCorners = true,
  animatedStyle,
  ...props
}) => {
  const gradientColors = useMemo(() => {
    let colorArr = ['#212BFC', '#915EF6', '#915EF6', '#BE2B95', '#915EF6'];
    if (Array.isArray(color)) {
      colorArr = color;
    }
    if (typeof color === 'string') {
      colorArr = [color];
    }
    if (fadeCorners) {
      return ['transparent', ...colorArr, 'transparent'];
    }
    return colorArr;
  }, [color, fadeCorners]);

  return (
    <View style={[styles.container, props]}>
      <Animated.View style={animatedStyle}>
        <LinearGradient
          style={globalStyles.flex1}
          colors={gradientColors}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
        />
      </Animated.View>
    </View>
  );
};

interface StatusProps extends ViewStyle {
  type?: STATUS;
  statusWidth?: DimensionValue;
  fadeCorners?: boolean;
}

const Status: FC<StatusProps> = ({
  type,
  statusWidth = '100%',
  fadeCorners = true,
  ...props
}) => {
  const color = useMemo(() => {
    switch (type) {
      case STATUS.ERROR:
        return colors.background.attention;
      case STATUS.SUCCESS:
        return colors.background.progress;
      default:
        return 'transparent';
    }
  }, [type]);

  const gradientColors = useMemo(() => {
    if (fadeCorners) {
      return ['transparent', color, 'transparent'];
    }
    return [color];
  }, [color, fadeCorners]);

  return (
    <View style={[styles.container, props]}>
      <LinearGradient
        style={{width: statusWidth}}
        colors={gradientColors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
      />
    </View>
  );
};

interface LoaderProps extends ViewStyle {
  color?: string;
  fadeCorners?: boolean;
  loaderWidth?: number | `${number}%`;
}

const Loader: FC<LoaderProps> = ({
  color = '#915EF6',
  fadeCorners = true,
  loaderWidth = '30%',
  ...props
}) => {
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const barWidth = useMemo(() => {
    return typeof loaderWidth === 'string'
      ? (parseInt(loaderWidth, 10) / 100) * containerWidth
      : loaderWidth;
  }, [loaderWidth, containerWidth]);

  const translateX = useSharedValue(-barWidth);

  useEffect(() => {
    if (containerWidth > 0) {
      translateX.value = withRepeat(
        withTiming(containerWidth, {
          duration: 1000,
          easing: Easing.linear,
        }),
        -1,
        false,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}],
    position: 'absolute',
    left: 0,
    top: 0,
    width: barWidth,
    height: '100%',
  }));

  const gradientColors = useMemo(() => {
    if (fadeCorners) {
      return ['transparent', color, 'transparent'];
    }
    return [color];
  }, [color, fadeCorners]);

  return (
    <View
      style={[styles.container, props]}
      onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}>
      <Animated.View style={[{width: barWidth}, animatedStyle]}>
        <LinearGradient
          style={globalStyles.flex1}
          colors={gradientColors}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
        />
      </Animated.View>
    </View>
  );
};

interface SignalBarProps extends FC {
  Wave: FC<WaveProps>;
  Status: FC<StatusProps>;
  Loader: FC<LoaderProps>;
}

const SignalBar: SignalBarProps = () => {
  return null;
};

SignalBar.Wave = Wave;
SignalBar.Status = Status;
SignalBar.Loader = Loader;

export default SignalBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    height: scaler(6),
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
});
