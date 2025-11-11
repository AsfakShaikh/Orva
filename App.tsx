import Router from '@navigation/Router';
import {globalStyles} from '@styles/GlobalStyles';
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client';
import {mmkvPersistor, queryClient} from '@utils/ReactQueryConfig';
import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {PaperProvider, useTheme} from 'react-native-paper';
import * as Sentry from '@sentry/react-native';
import Config from 'react-native-config';

const isDebugMode = __DEV__;
Sentry.init({
  dsn: Config.SENTRY_DSN,
  sendDefaultPii: true,
  debug: isDebugMode,
  release: Config.APP_VERSION,
  environment: Config.APP_ENVIRONMENT ?? 'development',
});

function App() {
  const theme = useTheme();

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{persister: mmkvPersistor}}>
      <PaperProvider theme={theme}>
        <GestureHandlerRootView style={globalStyles.flex1}>
          <Router />
        </GestureHandlerRootView>
      </PaperProvider>
    </PersistQueryClientProvider>
  );
}

export default Sentry.wrap(App);
