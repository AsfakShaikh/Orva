/* eslint-disable react-native/no-inline-styles */
import {View, StyleSheet} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {CASE_STATUS, HEADER_ARRAY, SORT_DIRECTION} from '../Types/CommonTypes';
import {Text} from 'react-native-paper';
import scaler from '@utils/Scaler';
import {theme} from '@styles/Theme';
import useAuthValue, {
  updateAuthValue,
} from '@modules/AuthModule/Hooks/useAuthValue';
import FlatListView from '@components/FlatListView';
import Divider from '@components/Divider';
import {
  CommonActions,
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import {ScheduleStackParamList} from '@navigation/Types/CommonTypes';
import {
  HOME_DRAWER_ROUTE_NAME,
  SUBMIT_CASES_STACK_ROUTE_NAME,
  SCHEDULE_STACK_ROUTE_NAME,
} from '@utils/Constants';
import useGetCaseByOtsQuery from '../Hooks/useGetCaseByOtsQuery';
import {globalStyles} from '@styles/GlobalStyles';
import {Strings} from '@locales/Localization';
import Button from '@components/Button';
import {toggleManualPatientEntryModal} from './ManualPatientEntryModal';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import {toggleActiveCaseAlert} from './ActiveCaseAlert';
import {listDynamicSort} from '@helpers/listDynamicSort';
import useEventEmitter from '@hooks/useEventEmitter';
import {fireSetStausEvent} from '@navigation/DrawerNavigation/HomeDrawerNavigation';
import {
  NAVIGATION_INTENTS_ARRAY,
  VOICE_COMAND_STATUS,
  VOICE_INETENT_EVENT,
  VOICE_INTENT,
} from '@modules/VoiceComandModule/Types/CommonTypes';
import getCaseStatusDisplayText from '../Helpers/getCaseStatusDisplayText';
import useSyncCasesMutation from '../Hooks/useSyncCasesMutation';
import formatDateTime, {FORMAT_DATE_TYPE} from '@helpers/formatDateTime';

import CaseDetailsSideDrawer from './CaseDetailsSideDrawer';
import useTrackerValue from '@modules/TrackerModule/Hooks/useTrackerValues';
import OtSelectMenu from './OtSelectMenu';

const NOT_ACCEPTED_VOICE_INTENT = VOICE_INTENT.CONFIRM_PATIENT;

const headersArr: HEADER_ARRAY = [
  {
    key: 'patient',
    value: 'Patient',
    flex: 1.3,
  },
  {
    key: 'missingMandatoryData',
    value: '',
    sortableDisable: true,
    position: 'flex-end',
    flex: 0.1,
  },
  {
    key: 'dob',
    value: 'DOB',
    position: 'flex-end',
    flex: 0.7,
  },
  {
    key: 'procedureName',
    value: 'Procedure',
  },
  {
    key: 'assignedSurgeon',
    value: 'Surgeon',
  },
  {
    key: 'schedule',
    value: 'Scheduled',
    position: 'flex-end',
  },
  {
    key: 'statusDisplayText',
    value: 'Status',
    flex: 0.7,
  },
];

interface CaseItem {
  id: string;
  status: CASE_STATUS;
  caseDetail: any;
  missingMandatoryData?: boolean;
}

export default function CaseListTable() {
  const {navigate, getParent} =
    useNavigation<
      NavigationProp<
        ScheduleStackParamList,
        SCHEDULE_STACK_ROUTE_NAME.CASE_SCHEDULE
      >
    >();

  const {selectedOt, selectedOtsArr = []} = useAuthValue();
  const {
    uuid: otId = '',
    caseId,
    mrn,
    isCaseboardOnly,
    name,
  } = selectedOt ?? {};
  const {currentActiveCase} = useTrackerValue();

  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState(SORT_DIRECTION.ASCENDING);
  const [voiceIntent, setVoiceIntent] = useState<VOICE_INTENT>();
  const hasActiveCase = !!currentActiveCase?.id;

  const [selectedHeaders, setSelectedHeaders] = useState(
    Array.from({length: headersArr?.length}, (_, i) => i),
  );

  const {mutate: syncCasesMutate, isPending: isSyncingCases} =
    useSyncCasesMutation();

  const otIdsString = useMemo(
    () => selectedOtsArr?.map(ot => ot?.uuid)?.join(','),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isCaseboardOnly, otId, selectedOtsArr],
  );

  const {data: caseListData = []} = useGetCaseByOtsQuery({
    otIds: otIdsString,
  });

  const caseList = useMemo(
    () =>
      caseListData?.map?.(caseDetail => {
        const {
          id,
          patient,
          procedure,
          assignedSurgeon,
          startTime,
          endTime,
          actualStartTime,
          actualEndTime,
          status,
          isLastCase = false,
          missingMandatoryData = false,
        } = caseDetail ?? {};
        return {
          id,
          patient: {
            title: patient?.firstName
              ? patient?.firstName + ' ' + patient?.lastName
              : null,
            subTitle: `MRN ${patient?.mrn}`,
          },
          dob: patient?.dob
            ? formatDateTime(patient?.dob, FORMAT_DATE_TYPE.NONE, 'dd-MM-yyyy')
            : null,
          procedureName: procedure?.name,
          assignedSurgeon,
          schedule: {
            title:
              formatDateTime(startTime) +
              (endTime ? ' - ' : '') +
              formatDateTime(endTime),
          },
          startTime,
          endTime,
          actualStartTime,
          actualEndTime,
          status,
          statusDisplayText: getCaseStatusDisplayText(status),
          isLastCase,
          missingMandatoryData,
          caseDetail: caseDetail,
        };
      }),

    [caseListData],
  );

  const sortedCaseList = useMemo(
    () => listDynamicSort(caseList, sortKey, sortDirection),
    [caseList, sortDirection, sortKey],
  );

  const ListHeaderComponent = (
    <>
      <TableHeader
        sortKey={sortKey}
        setSortKey={setSortKey}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        headersArr={headersArr}
        selectedHeaders={selectedHeaders}
        setSelectedHeaders={setSelectedHeaders}
      />
      {caseList && caseList?.length > 0 && (
        <Divider backgroundColor={colors.border.default} />
      )}
    </>
  );

  const handleCasePress = (item: CaseItem) => {
    const {status, id, caseDetail, missingMandatoryData} = item;

    if (status === CASE_STATUS.SUBMITTED) {
      return getParent()?.dispatch(
        CommonActions.navigate(HOME_DRAWER_ROUTE_NAME.CASES, {
          screen: SUBMIT_CASES_STACK_ROUTE_NAME.CASE_DETAIL,
          params: {caseId: id},
        }),
      );
    }

    if (status === CASE_STATUS.PLANNED && caseId && mrn) {
      return toggleActiveCaseAlert();
    }

    if (missingMandatoryData) {
      return toggleManualPatientEntryModal(caseDetail);
    }

    return navigate(SCHEDULE_STACK_ROUTE_NAME.CONFIRM_PATIENT, {
      caseDetail,
    });
  };

  const onNextPatient = () => {
    if (caseId && mrn) {
      toggleActiveCaseAlert();
    } else {
      const nextPlannedCase = sortedCaseList?.find(
        item => item?.status === CASE_STATUS.PLANNED,
      );

      if (nextPlannedCase) {
        nextPlannedCase?.missingMandatoryData
          ? toggleManualPatientEntryModal(nextPlannedCase?.caseDetail)
          : navigate(SCHEDULE_STACK_ROUTE_NAME.CONFIRM_PATIENT, {
              caseDetail: nextPlannedCase?.caseDetail,
            });
      }
    }
  };

  useEventEmitter(VOICE_INETENT_EVENT, (voiceIntentData: VOICE_INTENT) => {
    if (voiceIntentData === NOT_ACCEPTED_VOICE_INTENT) {
      return;
    }
    setVoiceIntent(voiceIntentData);
  });

  useEffect(() => {
    if (!voiceIntent) {
      return;
    }
    switch (voiceIntent) {
      case VOICE_INTENT.CASE_SELECT:
        if (hasActiveCase || isCaseboardOnly) {
          fireSetStausEvent(VOICE_COMAND_STATUS.NEGATIVE);
        } else {
          fireSetStausEvent(VOICE_COMAND_STATUS.POSITIVE);
          onNextPatient();
        }
        break;
      case VOICE_INTENT.ENTER_PATIENT_INFORMATION:
      case VOICE_INTENT.ADD_NEW_CASE:
        if (hasActiveCase || isCaseboardOnly) {
          fireSetStausEvent(VOICE_COMAND_STATUS.NEGATIVE);
        } else {
          fireSetStausEvent(VOICE_COMAND_STATUS.POSITIVE);
          toggleManualPatientEntryModal();
        }
        break;
      case VOICE_INTENT.VOICE_NOTE:
      case VOICE_INTENT.SET_TIMER:
      case VOICE_INTENT.SET_ALARM:
        fireSetStausEvent(VOICE_COMAND_STATUS.NEGATIVE);
        break;
      default:
        if (!NAVIGATION_INTENTS_ARRAY.includes(voiceIntent)) {
          fireSetStausEvent(VOICE_COMAND_STATUS.NEGATIVE);
        }
        break;
    }
    setVoiceIntent(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceIntent]);

  useEffect(() => {
    if (selectedOtsArr.length < 1) {
      updateAuthValue({
        selectedOtsArr: [{uuid: otId, name}],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOt]);

  return (
    <View style={globalStyles.flex1}>
      {/* Header buttons */}
      <View style={styles.caseSelectionHeaderView}>
        <Text style={[globalStyles.flex1, globalStyles.screenHeader]}>
          {Strings.Case_Schedule}
        </Text>
        {!isCaseboardOnly && (
          <Button
            disabled={isSyncingCases}
            loading={isSyncingCases}
            onPress={() => syncCasesMutate()}
            mode="outlined"
            style={{marginHorizontal: scaler(16)}}>
            {Strings.Sync_Cases}
          </Button>
        )}
        {!hasActiveCase && !isCaseboardOnly && (
          <>
            <Button
              onPress={() => toggleManualPatientEntryModal()}
              icon="account-voice"
              mode="outlined"
              style={{marginHorizontal: scaler(16)}}>
              {Strings.Add_New_Case}
            </Button>
            <Button
              onPress={onNextPatient}
              icon="account-voice"
              mode="contained">
              {Strings.Next_Patient}
            </Button>
          </>
        )}
        {(isCaseboardOnly || (!hasActiveCase && !isCaseboardOnly)) && (
          <OtSelectMenu />
        )}
      </View>

      {/* Table View */}
      <FlatListView
        viewProps={{
          flex: 1,
          borderRadius: scaler(16),
          overflow: 'hidden',
          margin: scaler(16),
        }}
        contentContainerStyle={{
          borderRadius: scaler(16),
          overflow: 'hidden',
        }}
        data={sortedCaseList}
        renderItem={({item, index}) => (
          <TableRow
            onPress={() => handleCasePress(item)}
            headersArr={headersArr}
            selectedHeaders={selectedHeaders}
            item={item}
            index={index}
          />
        )}
        ItemSeparatorComponent={Divider}
        ListHeaderComponent={ListHeaderComponent}
        stickyHeaderIndices={[0]}
      />

      <CaseDetailsSideDrawer />
    </View>
  );
}

const {colors} = theme;

const styles = StyleSheet.create({
  caseSelectionHeaderView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaler(24),
    paddingTop: scaler(16),
  },
});
