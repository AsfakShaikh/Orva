import React from 'react';
import {View} from 'react-native';
import {globalStyles} from '@styles/GlobalStyles';
import {Strings} from '@locales/Localization';
import SubmitedCasesList from '../../modules/CasesModule/Components/SubmitedCasesList';

export default function SubmittedCasesScreen() {
  return (
    <View style={globalStyles.flex1}>
      <SubmitedCasesList title={Strings.submitted_cases_list_header_text} />
    </View>
  );
}
