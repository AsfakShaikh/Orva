import React, {useMemo, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import FlatListView from '@components/FlatListView';
import {listDynamicSort} from '@helpers/listDynamicSort';
import {Strings} from '@locales/Localization';
import TableHeader from '@modules/CaseSelectionModule/Components/TableHeader';
import TableRow from '@modules/CaseSelectionModule/Components/TableRow';
import useGetSubmitedCaseByOtsQuery from '@modules/CaseSelectionModule/Hooks/useGetCasesList';
import {
  CASE_STATUS,
  HEADER_ARRAY,
  SORT_DIRECTION,
} from '@modules/CaseSelectionModule/Types/CommonTypes';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {globalStyles} from '@styles/GlobalStyles';
import {theme} from '@styles/Theme';
import {
  HOME_DRAWER_ROUTE_NAME,
  SUBMIT_CASES_STACK_ROUTE_NAME,
} from '@utils/Constants';
import scaler from '@utils/Scaler';
import {Text} from 'react-native-paper';
import Feather from 'react-native-vector-icons/Feather';
import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';
import Divider from '@components/Divider';
import getFirstCharAndLastFullName from '@helpers/userNameUtility';
import formatDateTime, {FORMAT_DATE_TYPE} from '@helpers/formatDateTime';
import getCaseStatusDisplayText from '@modules/CaseSelectionModule/Helpers/getCaseStatusDisplayText';
const {colors} = theme;
const SUBMITTED_CASE_EVENT = 'SUBMITTED_CASE_EVENT';
export const emitSubmittedUpdateEvent = () => {
  emitEvent(SUBMITTED_CASE_EVENT);
};

type SubmittedListProps = Readonly<{
  isFromHome?: boolean;
  title: string;
}>;
export default function SubmitedCasesList({
  isFromHome = false,
  title,
}: SubmittedListProps) {
  const {navigate} = useNavigation<NavigationProp<any>>();
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState(SORT_DIRECTION.ASCENDING);
  const headersArr: HEADER_ARRAY = [
    {
      key: 'patient',
      value: 'Patient',
      flex: 1.3,
    },
    {
      key: 'procedureName',
      value: 'Procedure',
    },
    {
      key: 'room',
      value: 'Room',
      position: 'flex-end',
      flex: 0.7,
    },
    {
      key: 'surgeon',
      value: 'Surgeon',
    },
    {
      key: 'owner',
      value: isFromHome ? 'Owner' : 'Submitted by',
      flex: 0.7,
    },
    {
      key: 'submitted',
      value: 'Submitted',
      position: 'flex-end',
    },
  ];
  if (isFromHome) {
    headersArr.push({
      key: 'statusDisplayText',
      value: 'Status',
      flex: 0.7,
    });
  }
  const [selectedHeaders, setSelectedHeaders] = useState(
    Array.from({length: headersArr?.length}, (_, i) => i),
  );

  const {data: caseListData, refetch: submitedCaseList} =
    useGetSubmitedCaseByOtsQuery(isFromHome);

  useEventEmitter(SUBMITTED_CASE_EVENT, () => {
    submitedCaseList();
  });

  // Keys which has to be display from caseList item must be same as headersArr keys
  const modifiedCaseList = useMemo(
    () =>
      (caseListData ?? [])?.map?.(caseDetail => {
        const {
          procedureName,
          surgeon,
          owner,
          submitted,
          room,
          caseId,
          patientName,
          mrn,
        } = caseDetail ?? {};
        return {
          patient: {
            title: patientName,
            subTitle: `MRN ${mrn}`,
          },
          procedureName,
          surgeon,
          owner: {
            title: owner ? getFirstCharAndLastFullName(owner) : null,
            subTitle: owner,
          },
          submitted: {
            title: formatDateTime(
              submitted,
              FORMAT_DATE_TYPE.LOCAL,
              'dd-MMM-yyyy',
            ),
            subTitle: formatDateTime(
              submitted,
              FORMAT_DATE_TYPE.LOCAL,
              'hh:mmaaa',
            ),
            value: submitted,
          },
          room,
          caseId,
          statusDisplayText: getCaseStatusDisplayText(CASE_STATUS.SUBMITTED),
          status: CASE_STATUS.SUBMITTED,
        };
      }),

    [caseListData],
  );

  const sortedCaseList = useMemo(
    () => listDynamicSort(modifiedCaseList, sortKey, sortDirection),
    [modifiedCaseList, sortDirection, sortKey],
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
      {modifiedCaseList && modifiedCaseList?.length > 0 && (
        <Divider backgroundColor={colors.border.default} />
      )}
    </>
  );

  return (
    <>
      <View
        style={[
          styles.textRow,
          {
            marginBottom: isFromHome ? scaler(20) : scaler(0),
          },
        ]}>
        <Text
          style={[
            globalStyles.screenHeader,
            {paddingHorizontal: isFromHome ? scaler(0) : scaler(20)},
          ]}>
          {sortedCaseList?.length > 0 ? title : Strings.no_case_display_text}
        </Text>
        {isFromHome && (
          <Text
            style={styles.anchorStyle}
            onPress={() => navigate(HOME_DRAWER_ROUTE_NAME.CASES)}>
            {Strings.View_all_recent_submitted_cases}
          </Text>
        )}
      </View>

      <FlatListView
        key={JSON.stringify(sortedCaseList)}
        viewProps={[
          styles.flatListProp,
          {
            margin: isFromHome ? 0 : scaler(16),
          },
        ]}
        contentContainerStyle={styles.contentContainerStyle}
        data={sortedCaseList}
        renderItem={({item, index}) => (
          <TableRow
            onPress={() => {
              isFromHome
                ? navigate(HOME_DRAWER_ROUTE_NAME.CASES, {
                    screen: SUBMIT_CASES_STACK_ROUTE_NAME.CASE_DETAIL,
                    params: {
                      caseId: item.caseId,
                    },
                  })
                : navigate(SUBMIT_CASES_STACK_ROUTE_NAME.CASE_DETAIL, {
                    caseId: item.caseId,
                  });
            }}
            headersArr={headersArr}
            selectedHeaders={selectedHeaders}
            item={item}
            index={index}
          />
        )}
        ItemSeparatorComponent={Divider}
        ListHeaderComponent={
          sortedCaseList?.length > 0 ? ListHeaderComponent : undefined
        }
        stickyHeaderIndices={[0]}
        ListEmptyComponent={
          <View style={styles.noCaseView}>
            <Feather
              name="help-circle"
              size={60}
              color={colors?.foreground.inactive}
            />

            <Text style={styles.noCaseText}>
              {Strings.no_case_display_text}
            </Text>
          </View>
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  caseSelectionHeaderView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noCaseView: {
    height: scaler(600),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  noCaseText: {
    fontSize: scaler(32),
    fontWeight: 'bold',
    color: colors?.foreground.inactive,
  },
  flatListProp: {
    flex: 1,
    borderRadius: scaler(16),
    overflow: 'hidden',
  },
  contentContainerStyle: {
    borderRadius: scaler(16),
    overflow: 'hidden',
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: scaler(16),
  },
  anchorStyle: {color: colors.foreground.brand, fontSize: scaler(14)},
});
