/* eslint-disable react-native/no-inline-styles */
import React, {FC, useCallback, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import scaler from '@utils/Scaler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from '@styles/Theme';
import {Strings} from '@locales/Localization';
import useTrackerValue from '@modules/TrackerModule/Hooks/useTrackerValues';
import formatDateTime from '@helpers/formatDateTime';
import {addMinutes, differenceInMinutes} from 'date-fns';
import {globalStyles} from '@styles/GlobalStyles';
import {LinearGradient} from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useAnimatedProps,
  Easing,
  AnimatedStyle,
} from 'react-native-reanimated';
import {MILESTONE_TRACKER_STEPS} from '@utils/Constants';

const {colors} = theme;

type StepWizardProps = {
  labels?: string[];
  subLabels?: string[];
} & Omit<StepWizardItemProps, 'label' | 'subLabel' | 'index'>;

interface StepWizardItemProps {
  isError?: boolean;
  customStyle?: {
    lineWidth: number;
    left?: number;
  };
  stepCount: number;
  label?: string;
  subLabel?: string;
  currentPosition: number;
  onStepChange?: (position: number) => void;
  index: number;
}

const StepWizard: FC<StepWizardProps> = ({
  labels,
  currentPosition = 0,
  onStepChange,
  stepCount = 0,
  subLabels,
  isError,
  customStyle = {lineWidth: 0, left: 0},
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: labels || subLabels ? scaler(20) : 0,
        },
      ]}>
      {Array.from({length: stepCount}).map((item, index) => {
        const label = labels?.[index];
        const subLabel = subLabels?.[index];

        return (
          <StepWizardItem
            key={`${label ?? 'step'}-${index}`}
            label={label}
            subLabel={subLabel}
            currentPosition={currentPosition}
            onStepChange={onStepChange}
            isError={isError}
            customStyle={customStyle}
            stepCount={stepCount}
            index={index}
          />
        );
      })}
    </View>
  );
};

const StepWizardItem: FC<StepWizardItemProps> = ({
  isError,
  customStyle,
  label,
  subLabel,
  currentPosition,
  onStepChange,
  index,
  stepCount,
}) => {
  const isCompleted = index < currentPosition;
  const isCurrent = index === currentPosition;

  const fadeAnim = useSharedValue(1);

  useEffect(() => {
    if (isCurrent) {
      fadeAnim.value = withRepeat(
        withSequence(
          withTiming(0.5, {duration: 700}),
          withTiming(1, {duration: 700}),
        ),
        -1,
        true,
      );
    }
  }, [fadeAnim, isCurrent]);

  const fadeAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
    };
  });

  const stepContainerStyle = useMemo(() => {
    let style: StyleProp<ViewStyle> = [styles.stepContainer];
    if (index === stepCount - 1 || !!customStyle?.lineWidth) {
      style.push(styles.lastStepContainer);
    }
    return style;
  }, [customStyle?.lineWidth, index, stepCount]);

  const labelContainerStyle = useMemo(() => {
    let style: StyleProp<ViewStyle> = [styles.step];
    if (customStyle?.lineWidth) {
      style.push({width: customStyle?.lineWidth / 1.2});
    }
    if (stepCount === 4) {
      style.push({alignItems: 'center'});
    }
    if (index === 0) {
      style.push({left: 0});
    }
    if (index !== 0 && index === stepCount - 1) {
      style.push({right: 0});
    }
    return style;
  }, [customStyle?.lineWidth, index, stepCount]);

  const labelStyle = useMemo(() => {
    let style: StyleProp<TextStyle> = [styles.label];
    if (isCurrent) {
      style.push(styles.currentLabel);
    }
    return style;
  }, [isCurrent]);

  const lineStyle = useMemo(() => {
    let style: StyleProp<ViewStyle> = [styles.line];
    if (!customStyle?.lineWidth) {
      style.push(globalStyles.flex1);
    } else {
      style.push({width: customStyle?.lineWidth});
    }
    if (isCompleted) {
      style.push(styles.completedLine);
    } else {
      style.push(styles.unfinishedLine);
    }
    return style;
  }, [customStyle?.lineWidth, isCompleted]);

  const animatedCircleStyle = useMemo(() => {
    let style: StyleProp<AnimatedStyle> = [styles.circle];
    if (isError && isCurrent) {
      style.push(styles.errorCircle);
    } else if (isCompleted || isCurrent) {
      style.push(styles.completedCircle);
    }
    if (isCurrent) {
      style.push(fadeAnimStyle);
    }
    return style;
  }, [isError, isCurrent, isCompleted, fadeAnimStyle]);

  const renderAnimatedCircle = useCallback(() => {
    if (isError && isCurrent) {
      return <Icon name="exclamation" color={colors?.error} />;
    } else if (isCompleted || isCurrent) {
      return <View style={styles.innerDot} />;
    }
    return null;
  }, [isCompleted, isCurrent, isError]);

  return (
    <View style={stepContainerStyle} key={label ?? `step-${index}`}>
      <View
        style={{
          alignItems: 'center',
          position: 'relative',
          justifyContent: 'center',
        }}>
        <TouchableOpacity
          onPress={() => onStepChange?.(index)}
          activeOpacity={0.8}>
          <Animated.View style={animatedCircleStyle}>
            {renderAnimatedCircle()}
          </Animated.View>
        </TouchableOpacity>
        <View style={labelContainerStyle}>
          {label && (
            <Text numberOfLines={1} style={labelStyle}>
              {label}
            </Text>
          )}
          {subLabel && (
            <Text numberOfLines={1} style={{textAlign: 'center'}}>
              {subLabel}
            </Text>
          )}
        </View>
        {label === MILESTONE_TRACKER_STEPS.WHEELS_OUT && (
          <View
            style={{
              position: 'absolute',
              right: 0,
            }}>
            <ScheduleBox />
          </View>
        )}
      </View>
      {index < stepCount - 1 && <View style={lineStyle} />}
    </View>
  );
};

const ScheduleBox = () => {
  const {currentActiveCase} = useTrackerValue();

  const {endTime, startTime, procedure} = currentActiveCase ?? {};

  const wheelsInTime = procedure?.milestones?.find(
    m => m?.displayName === MILESTONE_TRACKER_STEPS.WHEELS_IN,
  )?.completedTimestamp;

  const deltaTime =
    wheelsInTime && startTime && differenceInMinutes(wheelsInTime, startTime);

  const projectedTime = endTime && deltaTime && addMinutes(endTime, deltaTime);
  const isCaseDelay = deltaTime && deltaTime > 0;
  const deltaSign = isCaseDelay ? '+' : '';

  const rotateAnim = useSharedValue(0);

  useEffect(() => {
    rotateAnim.value = withRepeat(
      withTiming(360, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [rotateAnim]);

  const rotateAnimProps = useAnimatedProps(() => ({
    transform: [{rotate: `${rotateAnim.value}deg`}],
  }));

  if (!projectedTime && !endTime) {
    return null;
  }

  return (
    <View style={styles.scleduleContainer}>
      <Animated.View style={rotateAnimProps}>
        <LinearGradient
          colors={['#7E75FF', '#B775FF', '#EDE7F4', '#F3F3F3']}
          useAngle={true}
          angleCenter={{x: 0.5, y: 0.5}}
          angle={90}
          style={styles.gradientBorder}
        />
      </Animated.View>

      <View style={styles.scheduleContent}>
        <Text numberOfLines={1} style={styles.scheduleLabel}>
          {projectedTime ? Strings.Projected : Strings.Scheduled}
        </Text>

        <View style={globalStyles.rowCenter}>
          <View>
            <Text numberOfLines={1} style={styles.scheduleTime}>
              {formatDateTime(projectedTime ?? endTime)}
            </Text>
          </View>
          {!!deltaTime && (
            <View
              style={[
                styles.deltaContainer,
                isCaseDelay
                  ? styles.deltaDelayContainer
                  : styles.deltaEarlyContainer,
              ]}>
              <Text
                style={[
                  styles.scheduleTime,
                  isCaseDelay ? styles.deltaDelayText : styles.deltaEarlyText,
                ]}>
                {deltaSign + deltaTime}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  stepContainer: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastStepContainer: {
    flexGrow: 0,
  },
  step: {
    position: 'absolute',
    top: scaler(24),
  },
  circle: {
    width: scaler(20),
    height: scaler(20),
    borderRadius: scaler(10),
    borderWidth: scaler(1),
    borderColor: '#aaaaaa',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  completedCircle: {
    borderColor: colors.background.activity,
  },
  errorCircle: {
    borderColor: colors.error,
  },
  gradientBorder: {
    width: scaler(140),
    height: scaler(140),
    borderRadius: scaler(140),
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{translateX: -scaler(70)}, {translateY: -scaler(70)}],
  },
  innerDot: {
    width: scaler(12),
    height: scaler(12),
    borderRadius: scaler(6),
    backgroundColor: colors.background.activity,
  },
  label: {
    width: '100%',
    color: '#999999',
    fontSize: scaler(12),
    textAlign: 'center',
  },
  currentLabel: {
    color: '#000000',
    fontSize: scaler(12),
  },
  line: {
    height: scaler(4),
    marginHorizontal: scaler(2),
    borderRadius: scaler(16),
  },
  completedLine: {
    backgroundColor: '#213FE8',
  },
  unfinishedLine: {
    backgroundColor: '#aaaaaa',
  },
  scleduleContainer: {
    borderRadius: scaler(5),
    padding: scaler(1),
    minWidth: scaler(80),
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'red',
  },
  scheduleContent: {
    backgroundColor: colors.background.secondary,
    borderRadius: scaler(4),
    paddingVertical: scaler(1),
    alignItems: 'center',
  },
  scheduleLabel: {
    fontSize: scaler(7),
    fontWeight: '500',
    color: colors.foreground.primary,
    width: '100%',
    textAlign: 'center',
  },
  scheduleTime: {
    fontSize: scaler(11),
    color: colors.foreground.primary,
    width: '100%',
  },
  deltaDelayText: {
    color: 'rgba(228, 105, 98, 1)',
    lineHeight: scaler(14),
  },
  deltaEarlyText: {
    color: 'rgba(0, 122, 2, 1)',
    lineHeight: scaler(14),
  },
  deltaContainer: {
    borderRadius: scaler(2),
    marginLeft: scaler(4),
    paddingHorizontal: scaler(2),
  },
  deltaDelayContainer: {
    backgroundColor: 'rgba(228, 105, 98, 0.2)',
  },
  deltaEarlyContainer: {
    backgroundColor: 'rgba(0, 122, 2, 0.2)',
  },
});

export default StepWizard;
