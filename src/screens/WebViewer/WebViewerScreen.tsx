import {Strings} from '@locales/Localization';
import {MainStackParamList} from '@navigation/Types/CommonTypes';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {globalStyles} from '@styles/GlobalStyles';
import {theme} from '@styles/Theme';
import {MAIN_STACK_ROUTE_NAME} from '@utils/Constants';
import scaler from '@utils/Scaler';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {IconButton, Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {WebView} from 'react-native-webview';

const {colors} = theme;

const WebViewerScreen = () => {
  const {goBack} =
    useNavigation<
      NavigationProp<MainStackParamList, MAIN_STACK_ROUTE_NAME.WEB_VIEWER>
    >();
  const {params} =
    useRoute<RouteProp<MainStackParamList, MAIN_STACK_ROUTE_NAME.WEB_VIEWER>>();
  const {top} = useSafeAreaInsets();

  return (
    <View style={globalStyles.flex1}>
      <View style={[styles.topBar, {paddingTop: top}]}>
        <IconButton
          onPress={goBack}
          size={scaler(20)}
          icon={'close'}
          iconColor={colors.foreground.inverted}
        />
        <Text style={styles.header}>{Strings.Help_and_Support}</Text>
      </View>
      <WebView
        source={{
          uri: params?.source,
        }}
        originWhitelist={['*']}
        startInLoadingState
        nestedScrollEnabled
        onShouldStartLoadWithRequest={request => {
          const isAllowed = request.url.startsWith(params?.source);
          return isAllowed;
        }}
        setSupportMultipleWindows={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4E4E4E',
    zIndex: 10,
  },
  header: {
    fontSize: scaler(14),
    color: colors.foreground.inverted,
  },
  navigationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default WebViewerScreen;
