import { StyleSheet } from 'react-native';
import React from 'react';
import { Strings } from '@locales/Localization';
import scaler from '@utils/Scaler';
import { Text } from 'react-native-paper';
import OtSelectionForm from '@modules/CaseSelectionModule/Components/OtSelectionForm';
import ActiveCaseWarning from '@modules/CaseSelectionModule/Components/ActiveCaseWarning';
import useAuthValue from '@modules/AuthModule/Hooks/useAuthValue';
import LoginFromWraper from '@modules/AuthModule/Components/LoginFromWraper';
import UserPermissionAlert from '@components/userPermissionAlert';

export default function OtSelectionScreen() {
  const { selectedOt, firstName } = useAuthValue();

  return (
    <LoginFromWraper>
      <Text
        style={
          styles.welcomeText
        }>{`${Strings.Welcome_Back}, ${firstName}!`}</Text>
      {!selectedOt?.caseId && !selectedOt?.mrn ? (
        <>
          <OtSelectionForm />
          <UserPermissionAlert />
        </>
      ) : (
        <ActiveCaseWarning activeCase={selectedOt} />
      )}
    </LoginFromWraper>
  );
}

const styles = StyleSheet.create({
  welcomeText: {
    marginTop: scaler(24),
    textAlign: 'center',
    fontWeight: '700',
    fontSize: scaler(18),
  },
});
