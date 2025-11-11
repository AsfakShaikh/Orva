import React from 'react';
import {Platform, SafeAreaView, StatusBar, View} from 'react-native';
import {SafeAreaViewProps} from 'react-native-safe-area-context';

export type SafeAreaBlockProps = {
  showExtraAndroidHeight?: boolean;
} & SafeAreaViewProps;

export default function SafeAreaBox(Props: SafeAreaBlockProps) {
  const {
    children,
    onLayout,
    pointerEvents,
    showExtraAndroidHeight = false,
    testID,
    ...rest
  } = Props;
  return (
    <SafeAreaView
      testID={testID}
      onLayout={onLayout}
      pointerEvents={pointerEvents}
      {...rest}>
      {Platform.OS === 'android' && showExtraAndroidHeight && (
        <View style={{height: StatusBar.currentHeight}} />
      )}
      {children}
    </SafeAreaView>
  );
}
