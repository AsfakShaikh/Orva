import scaler from '@utils/Scaler';
import React, {forwardRef} from 'react';
import {StyleSheet} from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
} from 'react-native-keyboard-aware-scroll-view';

type BodyProps = {
  childern?: any;
  isInsideKeyboardAvoidingView?: boolean;
} & KeyboardAwareScrollViewProps;

function Body(Props: BodyProps, ref?: React.Ref<any>) {
  const {style, isInsideKeyboardAvoidingView = false} = Props;

  return (
    <KeyboardAwareScrollView
      ref={ref}
      contentContainerStyle={[styles.containerStyle, style]}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={false}
      showsVerticalScrollIndicator={false}
      extraHeight={scaler(146)}
      extraScrollHeight={isInsideKeyboardAvoidingView ? scaler(-245) : 0}
      {...Props}
    />
  );
}

export default forwardRef(Body);

const styles = StyleSheet.create({
  containerStyle: {
    flexGrow: 1,
    backgroundColor: 'transparent',
  },
});
