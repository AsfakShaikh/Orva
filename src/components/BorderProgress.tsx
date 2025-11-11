import {globalStyles} from '@styles/GlobalStyles';
import scaler from '@utils/Scaler';
import React, {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  StyleSheet,
  StyleProp,
  ViewStyle,
  View,
  LayoutChangeEvent,
} from 'react-native';
import Animated, {
  withTiming,
  useSharedValue,
  useAnimatedProps,
  runOnJS,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import Svg, {Rect} from 'react-native-svg';

interface BorderProgressProps {
  children: ReactNode;
  borderWidth?: number;
  borderRadius?: number;
  filledColor?: string;
  unfilledColor?: string;
  duration?: number;
  completedDuration?: number;
  containerStyle?: StyleProp<ViewStyle>;
  isPaused?: boolean;
  onComplete?: () => void;
}

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const BorderProgress: FC<BorderProgressProps> = ({
  children,
  borderWidth = scaler(2),
  borderRadius = scaler(18),
  filledColor = '#65558F',
  unfilledColor = '#D9D9D9',
  duration = 2000,
  completedDuration = 0,
  containerStyle,
  isPaused = false,
  onComplete,
}) => {
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });

  const {width: containerWidth, height: containerHeight} = containerDimensions;
  const {
    progressWidth,
    progressHeight,
    progressContainerWidth,
    progressContainerHeight,
  } = useMemo(
    () => ({
      progressWidth: containerWidth - borderWidth,
      progressHeight: containerHeight - borderWidth,
      progressContainerWidth: containerWidth + borderWidth * 2,
      progressContainerHeight: containerHeight + borderWidth * 2,
    }),
    [containerWidth, containerHeight, borderWidth],
  );

  const progressStartValue = Math.min(1, completedDuration / duration);

  const animatedProgress = useSharedValue(progressStartValue);

  const startAnimation = useCallback(
    (animDuration?: number) => {
      animatedProgress.value = withTiming(
        1,
        {
          duration: animDuration,
          easing: Easing.linear,
        },
        isFinished => {
          if (isFinished && onComplete) {
            runOnJS(onComplete)();
          }
        },
      );
    },
    [animatedProgress, onComplete],
  );

  const pauseAnimation = useCallback(() => {
    cancelAnimation(animatedProgress);
  }, [animatedProgress]);

  useEffect(() => {
    if (isPaused) {
      pauseAnimation();
    } else {
      const remainingDuration = Math.max(0, duration - completedDuration);
      startAnimation(remainingDuration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused]);

  const perimeter =
    2 * (containerWidth + containerHeight - borderWidth * 2) + 1;

  const dashOffset = useAnimatedProps(() => {
    return {
      strokeDashoffset:
        perimeter * (1 - parseFloat(animatedProgress.value.toFixed(3))),
    };
  });

  const handleLayout = (event: LayoutChangeEvent) => {
    const {width, height} = event.nativeEvent.layout;
    setContainerDimensions({width, height});
  };

  return (
    <View
      onLayout={handleLayout}
      style={[
        {
          borderColor: unfilledColor,
          borderRadius: borderRadius,
          borderWidth: borderWidth,
        },
        globalStyles.center,
        containerStyle,
      ]}>
      <Svg
        width={progressContainerWidth}
        height={progressContainerHeight}
        style={[
          StyleSheet.absoluteFill,
          {
            top: -borderWidth,
            left: -borderWidth,
          },
        ]}>
        <AnimatedRect
          x={borderWidth / 2}
          y={borderWidth / 2}
          height={progressHeight}
          width={progressWidth}
          stroke={filledColor}
          strokeWidth={borderWidth}
          fill="transparent"
          strokeDasharray={perimeter}
          animatedProps={dashOffset}
          rx={borderRadius}
          ry={borderRadius}
        />
      </Svg>
      {children}
    </View>
  );
};

export default BorderProgress;
