import scaler from '@utils/Scaler';
import React, {useState} from 'react';
import {View} from 'react-native';
import {ActivityIndicator, Icon, IconButton} from 'react-native-paper';
import {theme} from '@styles/Theme';

import {Strings} from '@locales/Localization';
import {BottomSnackbarHandler} from '@components/BottomSnackbar';

const {colors} = theme;

const SyncDocumentationIconButton = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingSuccess, setIsSyncingSuccess] = useState(false);

  const handleSyncDocumentation = () => {
    setIsSyncing(true);

    setTimeout(() => {
      setIsSyncingSuccess(true);
      setIsSyncing(false);
      BottomSnackbarHandler.successToast({
        title: Strings.Documentation_synced_msg,
      });
    }, 2000);

    setTimeout(() => {
      setIsSyncingSuccess(false);
    }, 5000);
  };

  if (!isSyncing && !isSyncingSuccess) {
    return (
      <IconButton
        icon="sync"
        onPress={handleSyncDocumentation}
        iconColor={colors.foreground.brand}
        size={scaler(22)}
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          marginHorizontal: 0,
          marginVertical: 0,
        }}
      />
    );
  }
  if (isSyncing && !isSyncingSuccess) {
    return (
      <ActivityIndicator
        size={scaler(16)}
        color={colors.foreground.secondary}
        style={{
          backgroundColor: colors.background.primary,
          borderRadius: scaler(16),
          padding: scaler(4),
          marginHorizontal: scaler(8),
        }}
      />
    );
  }
  if (!isSyncing && isSyncingSuccess) {
    return (
      <View style={{marginHorizontal: scaler(8)}}>
        <Icon
          source={'check-circle'}
          size={scaler(22)}
          color={colors.foreground.progress}
        />
      </View>
    );
  }
};

export default SyncDocumentationIconButton;
