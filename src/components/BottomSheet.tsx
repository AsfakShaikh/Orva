import React, {useCallback, useEffect, useMemo, useState} from 'react';
import Modal, {ModalProps} from './Modal';
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  ViewStyle,
  StyleProp,
} from 'react-native';
import scaler from '@utils/Scaler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import {Portal} from 'react-native-paper';
import {globalStyles} from '@styles/GlobalStyles';

const {height: screenHeight} = Dimensions.get('window');

export interface BottomSheetProps extends Omit<ModalProps, 'animationType'> {
  height?: number | `${number}%`;
  minHeight?: number;
  maxHeight?: number | `${number}%`;
  showDragHandle?: boolean;
  dragHandleColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  children: React.ReactNode;
  onDismiss?: () => void;
  contentContainerStyle?: StyleProp<ViewStyle>;
  dismissOnBackdropPress?: boolean;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  height = 0,
  minHeight = 0,
  maxHeight = '90%',
  showDragHandle = true,
  dragHandleColor,
  backgroundColor,
  children,
  visible,
  onDismiss = () => {},
  contentContainerStyle,
  dismissOnBackdropPress = true,
  ...modalProps
}) => {
  const [containerHeight, setContainerHeight] = useState<number>(0);

  const sheetHeight = useMemo(() => {
    if (height) {
      return typeof height === 'string'
        ? (parseInt(height, 10) / 100) * screenHeight
        : height;
    }

    return Math.max(containerHeight, minHeight, scaler(16));
  }, [height, containerHeight, minHeight]);

  const sheetMaxHeight =
    typeof maxHeight === 'string'
      ? (parseInt(maxHeight, 10) / 100) * screenHeight
      : maxHeight;

  const maxTranslateY = 0;

  const minTranslateY = useMemo(() => {
    return Math.min(sheetHeight, sheetMaxHeight, 0.9 * screenHeight);
  }, [sheetHeight, sheetMaxHeight]);

  // Reanimated shared values
  const translateY = useSharedValue(minTranslateY);

  // Animated styles
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: translateY.value}],
    };
  });

  const animatedOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [minTranslateY, maxTranslateY],
      [0, 0.5],
      Extrapolation.CLAMP,
    );
    return {
      opacity,
    };
  });

  // Handle close with backdrop press
  const handleBottomSheet = useCallback(
    (isVisible?: boolean) => {
      translateY.value = withTiming(
        isVisible ? maxTranslateY : minTranslateY,
        {
          duration: 500,
          easing: Easing.linear,
        },
        finished => {
          if (finished && !isVisible) {
            runOnJS(onDismiss);
          }
        },
      );
    },
    [translateY, minTranslateY, onDismiss],
  );

  // Gesture handler
  const panGesture = Gesture.Pan()
    .onUpdate(event => {
      if (Math.abs(event.translationY) > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd(event => {
      if (event.translationY > minTranslateY / 4 || event.velocityY > 0.35) {
        runOnJS(handleBottomSheet)(false);
      } else {
        translateY.value = withTiming(maxTranslateY, {
          duration: 100,
          easing: Easing.bounce,
        });
      }
    });

  // Animate in on mount
  useEffect(() => {
    if (visible) {
      handleBottomSheet(visible);
    }
  }, [translateY, maxTranslateY, visible, handleBottomSheet]);

  return (
    <Portal>
      <Modal
        visible={visible}
        onBackdropPress={() => {
          dismissOnBackdropPress && handleBottomSheet(false);
        }}
        containerStyle={styles.modalContainer}
        animatedOverlayStyle={animatedOverlayStyle}
        {...modalProps}>
        <Animated.View
          style={[
            styles.contentContainer,
            {
              minHeight: minTranslateY,
              backgroundColor: backgroundColor ?? '#ffffff',
            },
            animatedContainerStyle,
          ]}>
          <View style={[globalStyles.flex1, contentContainerStyle]}>
            {showDragHandle && (
              // eslint-disable-next-line react-native/no-inline-styles
              <GestureHandlerRootView style={{flex: 0}}>
                <GestureDetector gesture={panGesture}>
                  <View style={styles.dragHandleContainer}>
                    <View
                      style={[
                        styles.dragHandle,
                        {backgroundColor: dragHandleColor ?? '#d3d3d3'},
                      ]}
                    />
                  </View>
                </GestureDetector>
              </GestureHandlerRootView>
            )}
            <ScrollView showsVerticalScrollIndicator={false}>
              <View
                onLayout={e => {
                  if (!height) {
                    setContainerHeight(
                      e.nativeEvent.layout.height +
                        (showDragHandle ? scaler(16) : 0),
                    );
                  }
                }}>
                {children}
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'flex-end',
  },
  contentContainer: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: scaler(12),
  },
  dragHandle: {
    width: scaler(40),
    height: scaler(4),
    borderRadius: scaler(2),
  },
});

export default BottomSheet;
