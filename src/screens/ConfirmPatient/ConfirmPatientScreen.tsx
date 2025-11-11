import { fireSetStausEvent } from '@navigation/DrawerNavigation/HomeDrawerNavigation';
import Button from '@components/Button';
import InputCheckbox from '@components/InputCheckbox';
import formatDateTime, { FORMAT_DATE_TYPE } from '@helpers/formatDateTime';
import useEventEmitter from '@hooks/useEventEmitter';
import { Strings } from '@locales/Localization';
import getCaseStatusDisplayText from '@modules/CaseSelectionModule/Helpers/getCaseStatusDisplayText';
import useCreateCaseMutation from '@modules/CaseSelectionModule/Hooks/useCreateCaseMutation';
import { CASE_STATUS } from '@modules/CaseSelectionModule/Types/CommonTypes';
import { CREATE_CASE_REQUEST } from '@modules/CaseSelectionModule/Types/RequestTypes';
import {
  NAVIGATION_INTENTS_ARRAY,
  VOICE_COMAND_STATUS,
  VOICE_INETENT_EVENT,
  VOICE_INTENT,
} from '@modules/VoiceComandModule/Types/CommonTypes';
import { appLogEventSocketInstance } from '@navigation/Router';
import { ScheduleStackParamList } from '@navigation/Types/CommonTypes';
import {
  CommonActions,
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { globalStyles } from '@styles/GlobalStyles';
import { theme } from '@styles/Theme';
import {
  SCHEDULE_STACK_ROUTE_NAME,
  SOCKET_EVENTS,
  TRACKER_STACK_ROUTE_NAME,
} from '@utils/Constants';
import scaler from '@utils/Scaler';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';
const { colors } = theme;

export default function ConfirmPatientScreen() {
  const { params } =
    useRoute<
      RouteProp<
        ScheduleStackParamList,
        SCHEDULE_STACK_ROUTE_NAME.CONFIRM_PATIENT
      >
    >();
  const { goBack, getParent } =
    useNavigation<
      NavigationProp<
        ScheduleStackParamList,
        SCHEDULE_STACK_ROUTE_NAME.CONFIRM_PATIENT
      >
    >();

  const {
    id,
    patient,
    participants,
    procedure,
    startTime,
    endTime,
    status,
    assignedSurgeon,
    assignedAnaesthelogist,
    otId,
    duration,
  } = params?.caseDetail ?? {};

  const { firstName, lastName, mrn, dob } = patient ?? {};

  const [voiceIntent, setVoiceIntent] = useState<VOICE_INTENT>();

  const { mutate: updateCaseMutate, isPending: isCaseUpdating } =
    useCreateCaseMutation(() => {
      resetForm();
      getParent()?.dispatch(
        CommonActions.navigate(TRACKER_STACK_ROUTE_NAME.CASE_TRACKER),
      );
    }, true);

  const {
    control,
    reset: resetForm,
    handleSubmit,
  } = useForm({
    defaultValues: {
      isLastCase: false,
    },
  });

  const onConfirm = handleSubmit(val => {
    if (
      status === CASE_STATUS.PLANNED ||
      status === CASE_STATUS.SUSPENDED ||
      status === CASE_STATUS.NO_SHOW
    ) {
      if (
        procedure &&
        otId &&
        startTime &&
        endTime &&
        participants &&
        assignedSurgeon &&
        assignedAnaesthelogist &&
        patient
      ) {
        const reqBody: CREATE_CASE_REQUEST = {
          id,
          procedure,
          otId,
          startTime,
          endTime,
          participants,
          assignedSurgeon,
          assignedAnaesthelogist,
          duration: Number(duration ?? 0),
          patient,
          isLastCase: val?.isLastCase,
          status: CASE_STATUS.ACTIVE,
        };
        updateCaseMutate(reqBody);
      }
    }
    if (status === CASE_STATUS.ACTIVE) {
      getParent()?.dispatch(
        CommonActions.navigate(TRACKER_STACK_ROUTE_NAME.CASE_TRACKER),
      );
    }

    if (appLogEventSocketInstance) {
      appLogEventSocketInstance.emit(SOCKET_EVENTS.APP_LOG_EVENTS, {
        eventNamespace: SOCKET_EVENTS.APP_LOG_EVENTS,
        eventType: 'CONFIRM_PATIENT',
        message: 'Patient confirmed.',
        eventName: 'Confirm Patient',
        eventErrorLog: null,
      });
    }
  });

  useEventEmitter(VOICE_INETENT_EVENT, (voiceIntentData: VOICE_INTENT) => {
    setVoiceIntent(voiceIntentData);
  });

  useEffect(() => {
    if (voiceIntent) {
      switch (voiceIntent) {
        case VOICE_INTENT.CONFIRM_PATIENT:
          fireSetStausEvent(VOICE_COMAND_STATUS.POSITIVE);
          onConfirm();
          break;

        case VOICE_INTENT.VOICE_NOTE:
        case VOICE_INTENT.SET_TIMER:
        case VOICE_INTENT.SET_ALARM:
          fireSetStausEvent(VOICE_COMAND_STATUS.NEGATIVE);
          break;

        default:
          if (!NAVIGATION_INTENTS_ARRAY.includes(voiceIntent as VOICE_INTENT)) {
            fireSetStausEvent(VOICE_COMAND_STATUS.NEGATIVE);
          }
          break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceIntent]);

  return (
    <View style={globalStyles.colCenter}>
      <Surface
        style={{
          padding: scaler(16),
          borderRadius: scaler(16),
          width: scaler(400),
          backgroundColor: colors.background.primary,
        }}>
        <Text style={styles.headerText}>
          {params?.heading ?? Strings.Patient_Information}
        </Text>

        <InfoView title="Patient Name" value={`${firstName} ${lastName}`} />
        <InfoView title="MRN" value={mrn} />
        <InfoView
          title="DOB"
          value={
            dob
              ? formatDateTime(
                dob as unknown as Date,
                FORMAT_DATE_TYPE.LOCAL,
                'dd/MM/yyyy',
              )
              : ''
          }
        />
        <InfoView title="Procedure" value={procedure?.name} />
        <InfoView title="Surgeon" value={assignedSurgeon} />
        <InfoView title="Anaesthelogist" value={assignedAnaesthelogist} />
        <InfoView title="Scheduled" value={`${formatDateTime(startTime)}-${formatDateTime(endTime)}`} />
        {status && (
          <InfoView
            title="Case Status"
            value={getCaseStatusDisplayText(status)}
          />
        )}

        <InputCheckbox
          control={control}
          name="isLastCase"
          label={Strings.Last_case_of_the_day}
          style={styles.checkbox}
        />

        <Button
          loading={isCaseUpdating}
          disabled={isCaseUpdating}
          onPress={onConfirm}
          style={{ marginVertical: scaler(8) }}
          icon="account-voice"
          mode="contained">
          {`"${Strings.Confirm_Patient}"`}
        </Button>
        <Button disabled={isCaseUpdating} onPress={goBack} mode="text">
          {Strings.Cancel}
        </Button>
      </Surface>
    </View>
  );
}

function InfoView({
  title,
  value,
}: {
  title: string;
  value?: string | number | null;
}) {
  return value ? (
    <View style={{ flexDirection: 'row', marginBottom: scaler(16) }}>
      <Text style={{ flex: 1.5, fontWeight: '700' }}>{title}</Text>
      <View style={{ width: scaler(8) }} />
      <Text
        numberOfLines={title === 'Patient Name' ? 2 : 1}
        style={{ flex: 2.5, textTransform: 'capitalize' }}>
        {value}
      </Text>
    </View>
  ) : null;
}

const styles = StyleSheet.create({
  headerText: {
    fontSize: scaler(18),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: scaler(24),
  },
  checkbox: {
    marginBottom: scaler(12),
  },
});
