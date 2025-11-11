import React, {useMemo, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';
import {theme} from '@styles/Theme';
import scaler from '@utils/Scaler';
import {Strings} from '@locales/Localization';
import {CASE_DETAIL, CASE_STATUS} from '../Types/CommonTypes';
import {toggleManualPatientEntryModal} from './ManualPatientEntryModal';
import Button from '@components/Button';
import formatDateTime, {FORMAT_DATE_TYPE} from '@helpers/formatDateTime';
import {differenceInMinutes} from 'date-fns';
import {toggleCaseDeleteModal} from './CaseDeleteModal';
import useAuthValue from '@modules/AuthModule/Hooks/useAuthValue';
import SideModalDrawer, {
  SideModalDrawerBody,
  SideModalDrawerFooter,
} from '@components/SideModalDrawer';
import Divider from '@components/Divider';
import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';

const {colors} = theme;

const CASE_DETAIL_SIDE_DRAWER_EVENT = 'CASE_DETAIL_SIDE_DRAWER_EVENT';

export const toggleCaseDetailsSideDrawer = (caseDetail?: CASE_DETAIL) => {
  emitEvent(CASE_DETAIL_SIDE_DRAWER_EVENT, caseDetail);
};

const CaseDetailsSideDrawer = () => {
  const {user} = useAuthValue();

  const [visible, setVisible] = useState(false);
  const [caseDetail, setCaseDetail] = useState<CASE_DETAIL | null>(null);

  useEventEmitter(
    CASE_DETAIL_SIDE_DRAWER_EVENT,
    (data: CASE_DETAIL | null = null) => {
      setVisible(prev => !prev);
      setCaseDetail(data);
    },
  );

  const handleClose = () => {
    setVisible(false);
    setCaseDetail(null);
  };

  const {
    patient,
    procedure,
    assignedSurgeon,
    startTime,
    endTime,
    actualStartTime,
    actualEndTime,
    status,
    duration,
  } = caseDetail || {};

  const isSubmitedCases = status === CASE_STATUS.SUBMITTED;
  const isCaseboardUser = user?.role?.toLowerCase() === 'caseboard';

  const scheduleSubtitle = useMemo(() => {
    if (!caseDetail || !isSubmitedCases || !actualStartTime || !actualEndTime) {
      return null;
    }

    const timeDiffs = {
      start:
        startTime && actualStartTime
          ? differenceInMinutes(actualStartTime, startTime)
          : 0,
      end:
        endTime && actualEndTime
          ? differenceInMinutes(actualEndTime, endTime)
          : 0,
    };

    const formattedTimes = {
      start: formatDateTime(actualStartTime),
      end: formatDateTime(actualEndTime),
    };

    const getTimeDiffSign = (diff: number) => (diff > 0 ? '+' : '');
    const timeDiffDisplay =
      timeDiffs.end === 0
        ? ''
        : ` (${getTimeDiffSign(timeDiffs.end)}${timeDiffs.end})`;

    const getTimeDiffStyle = (diff: number) =>
      diff > 5 ? styles.attentionText : styles.progressText;

    return (
      <Text style={styles.progressText}>
        <Text style={getTimeDiffStyle(timeDiffs.start)}>
          {`${formattedTimes.start} - `}
        </Text>
        <Text style={getTimeDiffStyle(timeDiffs.end)}>
          {`${formattedTimes.end}${timeDiffDisplay}`}
        </Text>
      </Text>
    );
  }, [
    caseDetail,
    isSubmitedCases,
    startTime,
    endTime,
    actualStartTime,
    actualEndTime,
  ]);

  if (!caseDetail) {
    return null;
  }

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours === 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }

    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${
      minutes !== 1 ? 's' : ''
    }`;
  };

  return (
    <SideModalDrawer
      title={Strings.Case_Details}
      visible={visible}
      onClose={handleClose}>
      <SideModalDrawerBody>
        {/* Patient Section */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {Strings.Patient}
          </Text>
          <Text style={styles.mainText}>
            {`${patient?.firstName || ''} ${patient?.lastName || ''}`}
          </Text>
          <Text style={styles.subText}>MRN# {patient?.mrn || ''}</Text>
        </View>

        {/* DOB Section */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {Strings.DOB}
          </Text>
          <Text style={styles.mainText}>
            {patient?.dob
              ? formatDateTime(patient.dob, FORMAT_DATE_TYPE.NONE, 'dd/MM/yyyy')
              : ''}
          </Text>
        </View>

        {/* Procedures Section */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {Strings.Procedures}
          </Text>
          <Text style={styles.mainText}>
            {procedure?.cptCode && procedure?.name
              ? `${procedure.cptCode} - ${procedure.name}`
              : procedure?.name}
          </Text>
        </View>

        {/* Surgeon Section */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {Strings.Surgeon}
          </Text>
          <Text style={styles.mainText}>{assignedSurgeon || ''}</Text>
        </View>

        <View style={{flexDirection: 'row'}}>
          {/* Schedule Section */}
          <View style={[styles.section, {flex: 1}]}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {Strings.Schedule}
            </Text>
            <Text style={styles.mainText}>
              {startTime && endTime
                ? `${formatDateTime(
                    startTime,
                    FORMAT_DATE_TYPE.NONE,
                    'HH:mm',
                  )} - ${formatDateTime(
                    endTime,
                    FORMAT_DATE_TYPE.NONE,
                    'HH:mm',
                  )}`
                : ''}
            </Text>
            {scheduleSubtitle && (
              <Text style={styles.adjustedTimeText}>{scheduleSubtitle}</Text>
            )}

            <View style={[styles.section, {flex: 1}]}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {Strings.Duration}
              </Text>
              <Text style={styles.mainText}>
                {duration ? formatDuration(duration) : ''}
              </Text>
            </View>
          </View>

          <View style={[styles.section, {flex: 1}]}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {Strings.Duration}
            </Text>
            <Text style={styles.mainText}>
              {duration ? formatDuration(duration) : ''}
            </Text>
          </View>
        </View>

        {/* Status Section */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {Strings.Status}
          </Text>
          <Text style={styles.mainText}>
            {isSubmitedCases ? 'Submitted' : 'In Progress'}
          </Text>
          {isSubmitedCases && (
            <Text style={styles.subText}>1 Milestones Logged</Text>
          )}
        </View>
      </SideModalDrawerBody>
      <SideModalDrawerFooter>
        <Divider
          style={{
            marginVertical: scaler(16),
          }}
          backgroundColor={colors.outlineVariant}
        />
        <View style={styles.btnContainer}>
          <Button
            onPress={() => {
              handleClose();
              toggleManualPatientEntryModal(caseDetail);
            }}
            disabled={isCaseboardUser}
            contentStyle={{height: scaler(40)}}
            style={styles.editButton}
            mode="contained">
            {Strings.Edit_Details}
          </Button>
          <Button
            onPress={() => {
              handleClose();
              toggleCaseDeleteModal(caseDetail?.id);
            }}
            disabled={isCaseboardUser}
            contentStyle={{height: scaler(40)}}
            style={styles.deleteButton}
            mode="outlined">
            {Strings.Delete}
          </Button>
        </View>
      </SideModalDrawerFooter>
    </SideModalDrawer>
  );
};

export default CaseDetailsSideDrawer;

const styles = StyleSheet.create({
  section: {
    marginBottom: scaler(20),
  },
  sectionTitle: {
    fontWeight: '700',
    color: colors.foreground.primary,
    marginBottom: scaler(8),
    fontSize: scaler(16),
  },
  mainText: {
    color: colors.foreground.primary,
    fontSize: scaler(16),
    marginBottom: scaler(4),
  },
  subText: {
    color: colors.foreground.secondary,
    fontSize: scaler(12),
    marginBottom: scaler(4),
  },
  adjustedTimeText: {
    color: colors.foreground.attention,
    fontSize: scaler(12),
    marginTop: scaler(4),
  },
  btnContainer: {
    flexDirection: 'row',
    margin: scaler(24),
    marginTop: 0,
    gap: scaler(8),
  },
  editButton: {
    flex: 0.8,
  },
  deleteButton: {
    flex: 0.2,
  },
  progressText: {
    color: colors.foreground.progress,
  },
  attentionText: {
    color: colors.foreground.attention,
  },
});
