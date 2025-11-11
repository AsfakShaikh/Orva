import scaler from '@utils/Scaler';
import React from 'react';
import {Strings} from '@locales/Localization';
import Button from '@components/Button';
import {globalStyles} from '@styles/GlobalStyles';

interface SyncDocumentationButtonProps {
  onSyncDocumentation?: () => void;
  isLoading?: boolean;
}

const SyncDocumentationButton = ({
  onSyncDocumentation,
  isLoading,
}: SyncDocumentationButtonProps) => {
  const handleSyncDocumentation = () => {
    onSyncDocumentation?.();
  };
  return (
    <Button
      disabled={isLoading}
      loading={isLoading}
      mode="contained"
      onPress={() => handleSyncDocumentation()}
      labelStyle={{fontSize: scaler(12)}}
      style={[
        globalStyles.center,
        {
          marginHorizontal: scaler(16),
          height: scaler(38),
        },
      ]}>
      {Strings.Sync_Documentation}
    </Button>
  );
};

export default SyncDocumentationButton;
