/* eslint-disable react-native/no-inline-styles */
import React, {Fragment, useCallback} from 'react';
import {
  Platform,
  StatusBar,
  StatusBarStyle,
  View,
  ViewProps,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import SafeAreaBox from './SafeAreaBox';
import {isDarkMode, theme} from '@styles/Theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type ContainerProps = {
  fullScreen?: boolean;
  children?: React.ReactNode;
  backgroundColor?: string;
  statusBarBackgroundColor?: string;
  safeAreaBackgroundColor?: string;
  statusBarStyle?: StatusBarStyle;
  screenBackgroundColor?: string;
} & ViewProps;

function Container(Props: ContainerProps) {
  const {colors} = theme;

  const {
    fullScreen,
    children,
    backgroundColor = colors.background.secondary,
    statusBarBackgroundColor = 'transparent',
    safeAreaBackgroundColor,
    statusBarStyle = isDarkMode ? 'light-content' : 'dark-content',
    screenBackgroundColor = 'transparent',
    style,
    ...props
  } = Props;

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android' && !fullScreen) {
        StatusBar.setTranslucent(true);
        StatusBar.setBackgroundColor(
          statusBarBackgroundColor ?? backgroundColor,
        );
      }
      StatusBar.setBarStyle(statusBarStyle);
    }, [fullScreen, statusBarStyle, statusBarBackgroundColor, backgroundColor]),
  );

  const {bottom} = useSafeAreaInsets();

  return (
    <View
      style={[{flex: 1, backgroundColor: backgroundColor}, style]}
      {...props}>
      {fullScreen ? (
        <Fragment>{children}</Fragment>
      ) : (
        <Fragment>
          {/* <View
            style={{height: top, backgroundColor: statusBarBackgroundColor}}
          /> */}
          <SafeAreaBox
            style={{
              flex: 1,
              backgroundColor: screenBackgroundColor,
            }}>
            {children}
          </SafeAreaBox>
          {Platform.OS === 'ios' && (
            <View
              style={{
                height: bottom,
                backgroundColor: safeAreaBackgroundColor ?? backgroundColor,
              }}
            />
          )}
        </Fragment>
      )}
    </View>
  );
}

export default Container;
