import React from 'react';
import CaseListTable from '@modules/CaseSelectionModule/Components/CaseListTable';
import CaseDeleteModal from '@modules/CaseSelectionModule/Components/CaseDeleteModal';
import MoveCaseModal from '@modules/CaseSelectionModule/Components/MoveCaseModal';
import ActiveCaseAlert from '@modules/CaseSelectionModule/Components/ActiveCaseAlert';
import ManualPatientEntryModal from '@modules/CaseSelectionModule/Components/ManualPatientEntryModal';
import {View} from 'react-native';
import {globalStyles} from '@styles/GlobalStyles';
import CaseResetModal from '@modules/CaseSelectionModule/Components/CaseResetModal';

export default function CaseScheduleScreen() {
  return (
    <View style={globalStyles.flex1}>
      <CaseListTable />
      <CaseDeleteModal />
      <CaseResetModal />
      <MoveCaseModal />
      <ActiveCaseAlert />
      <ManualPatientEntryModal />
    </View>
  );
}
