import Button from '@components/Button';
import Divider from '@components/Divider';
import InputDate from '@components/InputDate';
import InputText from '@components/InputText';
import {getOnlyNumberValidation} from '@helpers/formValidationRules';
import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';
import {Strings} from '@locales/Localization';
import scaler from '@utils/Scaler';
import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
  FC,
} from 'react';
import {Control, useForm} from 'react-hook-form';
import {View, StyleSheet, Text} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import useCreateCaseMutation from '../Hooks/useCreateCaseMutation';
import {CREATE_CASE_REQUEST} from '../Types/RequestTypes';
import {
  CASE_DETAIL,
  CASE_STATUS,
  CASE_SUBMITTED,
  PROCEDURE,
} from '../Types/CommonTypes';
import useAuthValue from '@modules/AuthModule/Hooks/useAuthValue';
import {
  GENDER_LIST,
  PARTICIPANT_TYPE,
  SCHEDULE_STACK_ROUTE_NAME,
} from '@utils/Constants';
import {ScheduleStackParamList} from '@navigation/Types/CommonTypes';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import useGetProcedureListQuery from '../Hooks/useGetProcedureListQuery';
import {fireSetStausEvent} from '@navigation/DrawerNavigation/HomeDrawerNavigation';
import {
  VOICE_INETENT_EVENT,
  VOICE_INTENT,
  VOICE_COMAND_STATUS,
} from '@modules/VoiceComandModule/Types/CommonTypes';
import SideModalDrawer, {
  SideModalDrawerBody,
  SideModalDrawerFooter,
} from '@components/SideModalDrawer';

import InputCalendar from '@components/InputCalendar';
import DropdownSelect from '@components/DropdownSelect';
import {globalStyles} from '@styles/GlobalStyles';
import {theme} from '@styles/Theme';
import Icons from '@assets/Icons';
import useAddProcedureMutation from '../Hooks/useAddProcedureMutation';
import {
  USER,
  USER_PERMISSIONS,
  USER_ROLES,
} from '@modules/AuthModule/Types/CommonTypes';
import useGetCaseDetailQuery from '@modules/CasesModule/Hooks/useGetCaseDetailQuery';
import {ActivityIndicator} from 'react-native-paper';
import useGetUserListByRoleQuery from '../Hooks/useGetUserListByRoleQuery';
import useAddUserMutation from '../Hooks/useAddUserMutation';
import InputSelect from '@components/InputSelect';

const {colors} = theme;

const MANUAL_PATIENT_ENTRY_MODAL_EVENT = 'MANUAL_PATIENT_ENTRY_MODAL_EVENT';
const ACCEPTED_VOICE_INTENT = VOICE_INTENT.CONFIRM_PATIENT;

export const toggleManualPatientEntryModal = (
  data?: CASE_DETAIL | CASE_SUBMITTED,
) => {
  emitEvent(MANUAL_PATIENT_ENTRY_MODAL_EVENT, data);
};

// Type guard to check if data is CASE_SUBMITTED
const isCaseSubmitted = (data: any): data is CASE_SUBMITTED => {
  return (
    data &&
    typeof data === 'object' &&
    'caseId' in data &&
    'owner' in data &&
    'surgeon' in data &&
    'procedureName' in data
  );
};

export default function ManualPatientEntryModal() {
  const {navigate, isFocused} =
    useNavigation<
      NavigationProp<
        ScheduleStackParamList,
        SCHEDULE_STACK_ROUTE_NAME.CASE_SCHEDULE
      >
    >();
  const {hospitalId, selectedOt} = useAuthValue();
  const [visible, setVisible] = useState(false);
  const [voiceIntent, setVoiceIntent] = useState<VOICE_INTENT | null>(null);
  const [submittedCaseDetail, setSubmittedCaseDetail] =
    useState<CASE_SUBMITTED>();
  const [caseDetail, setCaseDetail] = useState<CASE_DETAIL>();
  const firstNameInputRef = useRef<any>(null);
  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);

  const isEdit = !!caseDetail;

  // Constants
  const SCROLL_DELAY = 100;
  const FOCUS_DELAY = 300;

  const {data: caseDetailData, isLoading: isGettingCaseDetail} =
    useGetCaseDetailQuery(submittedCaseDetail?.caseId);

  const {data: surgeonsListData} = useGetUserListByRoleQuery([
    USER_ROLES.SURGEON,
  ]);
  const {data: anaesthelogistListData} = useGetUserListByRoleQuery([
    USER_ROLES.ANESTHELOGIST,
  ]);

  const {data: procedureListData} = useGetProcedureListQuery();

  const {mutate: createCaseMutate, isPending: isCreatingCase} =
    useCreateCaseMutation();

  const {control, watch, reset, handleSubmit} = useForm();

  const setFormValues = (data?: CASE_DETAIL) => {
    const {
      startTime,
      endTime,
      procedure,
      otId,
      participants,
      patient,
      duration = '',
      anesthesiaType,
      remarks,
    } = data ?? {};

    const [firstName, ...restName] = patient?.name?.split(' ') ?? [];

    const assignedSurgeon = participants?.find(
      p => p?.participantType === PARTICIPANT_TYPE.SURGEON,
    )?.participantId;
    const assignedAnaesthelogist = participants?.find(
      p => p?.participantType === PARTICIPANT_TYPE.ANESTHESIOLOGIST,
    )?.participantId;

    const formDefaultValues = {
      startTime: String(startTime ?? ''),
      endTime: String(endTime ?? ''),
      procedureDate: String(startTime ?? new Date()),
      procedure: procedure?.cptCode ? procedure?.cptCode : procedure?.name,
      otId: otId ?? selectedOt?.uuid,
      assignedSurgeon: assignedSurgeon ? Number(assignedSurgeon) : null,
      assignedAnaesthelogist: assignedAnaesthelogist
        ? Number(assignedAnaesthelogist)
        : null,
      anesthesiaType: anesthesiaType ?? '',
      remarks: remarks ?? '',
      patient: {
        firstName: patient?.firstName ?? firstName,
        lastName:
          patient?.lastName ??
          (restName && restName.length > 0 ? restName.join(' ') : ''),
        mrn: patient?.mrn,
        dob: patient?.dob,
        gender: patient?.gender,
      },
      duration: duration,
    };

    reset(formDefaultValues);
  };

  useEventEmitter(
    MANUAL_PATIENT_ENTRY_MODAL_EVENT,
    (data?: CASE_DETAIL | CASE_SUBMITTED) => {
      setVisible(prev => !prev);
      setVoiceIntent(null);
      if (isCaseSubmitted(data)) {
        setSubmittedCaseDetail(data);
      } else {
        setCaseDetail(data);
        setFormValues(data);
      }
    },
  );

  useEffect(() => {
    if (caseDetailData) {
      setCaseDetail(caseDetailData);
      setFormValues(caseDetailData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseDetailData]);

  const isSaveButtonEnable =
    !isGettingCaseDetail &&
    watch('startTime') &&
    watch('endTime') &&
    watch('procedure') &&
    watch('assignedSurgeon') &&
    watch('assignedAnaesthelogist') &&
    watch('patient.mrn') &&
    watch('patient.firstName') &&
    watch('patient.lastName');

  const isConfirmButtonEnable = isSaveButtonEnable && watch('patient.dob');

  const handleConfirmSubmit = (req: CREATE_CASE_REQUEST) => {
    reset();
    setVisible(false);
    navigate(SCHEDULE_STACK_ROUTE_NAME.CONFIRM_PATIENT, {
      caseDetail: req,
    });
  };

  const cleanParticipant = (
    participantType: PARTICIPANT_TYPE,
    participant?: USER,
  ) => {
    if (!participant) {
      return null;
    }

    return {
      emrName: participant.emrDetail?.emrName ?? '',
      emrId: participant.emrDetail?.emrId ?? '',
      emrResourceType: participant.emrDetail?.emrResourceType ?? '',
      participantPrimaryColor: participant.primaryColor,
      participantSecondaryColor: participant.secondaryColor,
      participantType: participantType,
      participantId: participant?.id,
      participantFirstName: participant?.firstName,
      participantLastName: participant?.lastName,
      participantPhone: participant?.notificationConfig?.phoneNumber ?? '',
      participantEmail: participant?.email ?? '',
    };
  };

  const onSubmitSuccess = (isAddOther: boolean) => {
    reset();
    if (!isAddOther || isEdit) {
      setVisible(false);
    } else {
      const scrollToTop = () => {
        if (scrollViewRef.current) {
          const scrollView = (
            scrollViewRef.current as any
          ).getScrollResponder?.();
          if (scrollView?.scrollTo) {
            scrollView.scrollTo({x: 0, y: 0, animated: true});
          }
        }
      };
      const focusFirstField = () => {
        setTimeout(() => {
          firstNameInputRef.current?.focus();
        }, FOCUS_DELAY);
      };

      // Scroll to top and focus first field when "Save and Add Another" is clicked
      setTimeout(() => {
        scrollToTop();
        focusFirstField();
      }, SCROLL_DELAY);
    }
  };

  const handleFormSubmit = (val: any, isAddOther: boolean = false) => {
    const {
      procedureDate,
      startTime: caseStartTime,
      endTime: caseEndTime,
      otId,
      ...restVal
    } = val;

    const newStartTime = new Date(procedureDate);
    const startTimeDate = new Date(caseStartTime);
    newStartTime.setHours(
      startTimeDate.getHours(),
      startTimeDate.getMinutes(),
      0,
      0,
    );

    const newEndTime = new Date(procedureDate);
    const endTimeDate = new Date(caseEndTime);
    newEndTime.setHours(endTimeDate.getHours(), endTimeDate.getMinutes(), 0, 0);

    const selectedProcedure = procedureListData?.find(
      p =>
        p?.cptCode === val?.procedure ||
        p?.name === val?.procedure ||
        `${p?.cptCode} - ${p?.name}` === val?.procedure,
    );
    const selectedSurgeon = cleanParticipant(
      PARTICIPANT_TYPE.SURGEON,
      surgeonsListData?.find(s => s?.id === val?.assignedSurgeon),
    );
    const selectedAnaesthelogist = cleanParticipant(
      PARTICIPANT_TYPE.ANESTHESIOLOGIST,
      anaesthelogistListData?.find(s => s?.id === val?.assignedAnaesthelogist),
    );
    const procedurePayload = {
      cptCode: selectedProcedure?.cptCode,
      name: selectedProcedure?.name,
      description: selectedProcedure?.name,
    };

    const start = new Date(caseStartTime);
    const end = new Date(caseEndTime);

    let diffMs = end.getTime() - start.getTime();

    if (diffMs < 0) {
      diffMs += 24 * 60 * 60 * 1000;
    }

    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;

    // Format with leading zeros
    const caseDuration = hours * 60 + minutes;

    const payload = {
      status: CASE_STATUS?.PLANNED,
      otId,
      ...restVal,
      startTime: newStartTime,
      endTime: newEndTime,
      duration: Number(caseDuration),
      procedure: procedurePayload,
      participants: [selectedSurgeon, selectedAnaesthelogist],
      assignedSurgeon: `${selectedSurgeon?.participantFirstName} ${selectedSurgeon?.participantLastName}`,
      assignedAnaesthelogist: `${selectedAnaesthelogist?.participantFirstName} ${selectedAnaesthelogist?.participantLastName}`,
    };

    const reqBody = isEdit
      ? {
          id: caseDetail?.id,
          ...payload,
          status: caseDetail?.status,
          otId: caseDetail?.otId,
        }
      : payload;

    if (isAddOther || isEdit) {
      createCaseMutate(reqBody, {
        onSuccess: () => onSubmitSuccess(isAddOther),
      });
    } else {
      handleConfirmSubmit(reqBody);
    }
  };

  const onConfirmSubmit = handleSubmit(val => handleFormSubmit(val, false));
  const onAddAnother = handleSubmit(val => handleFormSubmit(val, true));

  useEventEmitter(VOICE_INETENT_EVENT, (voiceIntentData: VOICE_INTENT) => {
    if (voiceIntentData === ACCEPTED_VOICE_INTENT) {
      setVoiceIntent(voiceIntentData);
    }
  });

  useEffect(() => {
    if (!(voiceIntent && isFocused())) {
      return;
    }
    if (
      visible &&
      voiceIntent === VOICE_INTENT.CONFIRM_PATIENT &&
      !(!isConfirmButtonEnable || isCreatingCase)
    ) {
      fireSetStausEvent(VOICE_COMAND_STATUS.POSITIVE);
      onConfirmSubmit();
    } else {
      fireSetStausEvent(VOICE_COMAND_STATUS.NEGATIVE);
    }
    setVoiceIntent(null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceIntent, visible, isFocused]);

  return (
    <SideModalDrawer
      title={Strings.Add_Case_Information}
      subTitle={
        isEdit ? Strings.Update_missing_case_information_to_start_case : null
      }
      visible={visible}
      scrollViewRef={scrollViewRef}
      onClose={() => {
        reset();
        setVisible(false);
      }}>
      {isGettingCaseDetail ? (
        <View style={globalStyles.colCenter}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <SideModalDrawerBody>
          <InputText
            ref={firstNameInputRef}
            maxLength={80}
            control={control}
            name="patient.firstName"
            label={Strings.Patient_First_Name_Label}
            showLength
            rules={{
              maxLength: {
                value: 80,
                message: Strings.Name_Min_Length,
              },
            }}
          />
          <InputText
            maxLength={80}
            control={control}
            name="patient.lastName"
            label={Strings.Patient_Last_Name_Label}
            showLength
            rules={{
              maxLength: {
                value: 80,
                message: Strings.Name_Min_Length,
              },
            }}
          />
          <InputText
            control={control}
            maxLength={80}
            name="patient.mrn"
            showLength
            label={Strings.MRN_Label}
            keyboardType="numeric"
            rules={{
              ...getOnlyNumberValidation('MRN'),
              maxLength: {
                value: 80,
                message: Strings.MRN_Min_Length,
              },
            }}
          />
          <InputCalendar
            control={control}
            name="patient.dob"
            label={Strings.DOB}
            disableFutureDates={true}
          />
          <InputSelect
            control={control}
            name="patient.gender"
            label={Strings.Gender_Label}
            options={GENDER_LIST}
            style={styles.formInput}
          />
          <InputCalendar
            control={control}
            name="procedureDate"
            label={Strings.Procedure_Date_Label}
            style={styles.formInput}
          />
          <ProcedureDropdown
            key={`procedure-${visible ? 'open' : 'closed'}`}
            control={control}
            name="procedure"
            hospitalId={hospitalId}
          />
          <SurgeonDropdown control={control} name="assignedSurgeon" />
          <AnaesthelogistDropdown
            control={control}
            name="assignedAnaesthelogist"
          />
          <InputSelect
            control={control}
            name="anesthesiaType"
            label={Strings.Anesthesia_Type_Label}
            options={[]}
            style={styles.formInput}
          />
          <InputDate
            control={control}
            name="startTime"
            label={Strings.Schedule_Start_Time_Label}
            style={styles.formInput}
          />
          <InputDate
            control={control}
            name="endTime"
            label={Strings.Schedule_End_Time_Label}
            style={styles.formInput}
          />
          <InputText
            control={control}
            name="remarks"
            label={Strings.Remarks_Label}
            style={styles.formInput}
          />
        </SideModalDrawerBody>
      )}
      <SideModalDrawerFooter>
        <Divider
          style={{
            marginVertical: scaler(16),
          }}
          backgroundColor={colors.outlineVariant}
        />
        <View style={styles.btnContainer}>
          <Button
            onPress={onConfirmSubmit}
            disabled={!isConfirmButtonEnable || isCreatingCase}
            icon="account-voice"
            contentStyle={{height: scaler(40)}}
            mode="contained">
            {`"${Strings.Confirm_Patient}"`}
          </Button>
          <Button
            onPress={onAddAnother}
            disabled={
              (isEdit ? !isConfirmButtonEnable : !isSaveButtonEnable) ||
              isCreatingCase
            }
            // eslint-disable-next-line react-native/no-inline-styles
            style={{marginLeft: scaler(8), flexShrink: 1}}
            contentStyle={{height: scaler(40)}}
            mode="outlined">
            {isEdit ? Strings.Update_Case : Strings.Save_and_Add_Another}
          </Button>
        </View>
      </SideModalDrawerFooter>
    </SideModalDrawer>
  );
}

const validateName = (name: string) => {
  // Check if name contains only alphabets and spaces
  const nameRegex = /^[A-Za-z0-9\s]+$/;
  return nameRegex.test(name);
};

const validateProcedureName = (name: string) => {
  // Check if name contains only alphabets and spaces
  const nameRegex = /^\d+\s-\s[a-zA-Z0-9\s]+$/;
  return nameRegex.test(name);
};

interface AnaesthelogistDropdownProps {
  control: Control<any>;
  name: string;
}

const AnaesthelogistDropdown: FC<AnaesthelogistDropdownProps> = ({
  control,
  name,
}) => {
  const [isValidationError, setIsValidationError] = useState(false);
  const [anaesthelogistName, setAnaesthelogistName] = useState('');
  const [firstName, lastName] = anaesthelogistName.split(/ (.+)/);
  const [isNameExists, setIsNameExists] = useState(false);

  const {data: anaesthelogistListData, isLoading: isGettingAnaesthelogistList} =
    useGetUserListByRoleQuery([USER_ROLES.ANESTHELOGIST]);

  useEffect(() => {
    if (anaesthelogistName && anaesthelogistListData) {
      const nameExists = anaesthelogistListData.some(
        anaesthelogist =>
          `${anaesthelogist.firstName} ${anaesthelogist.lastName}`.toLowerCase() ===
          anaesthelogistName.toLowerCase(),
      );
      setIsNameExists(nameExists);
    } else {
      setIsNameExists(false);
    }
  }, [anaesthelogistName, anaesthelogistListData]);
  const anaesthelogistList = useMemo(() => {
    if (!anaesthelogistListData) {
      return [];
    }
    return anaesthelogistListData
      ?.map(anaesthelogist => ({
        key: anaesthelogist?.firstName + ' ' + anaesthelogist?.lastName,
        value: anaesthelogist.id,
      }))
      ?.sort((a, b) =>
        a.key.localeCompare(b.key, undefined, {sensitivity: 'base'}),
      );
  }, [anaesthelogistListData]);

  const {
    mutate: addAnaesthesiologistMutate,
    isPending: isAddingAnaesthesiologist,
    isSuccess: isAddAnaesthesiologistSuccess,
    isError: isAddAnaesthesiologistError,
    reset: resetAddAnaesthesiologist,
  } = useAddUserMutation();

  const optionEmptyTitle = (() => {
    let title = Strings.No_results_found;
    if (isNameExists) {
      title = `${anaesthelogistName} ${Strings.already_exists_in_list}`;
    }
    if (isAddAnaesthesiologistSuccess) {
      title = `${anaesthelogistName} ${Strings.added_as_Anesthesiologist}`;
    }
    if (isAddAnaesthesiologistError || isValidationError) {
      title = `${Strings.Failed_to_add} ${anaesthelogistName}`;
    }
    return title;
  })();

  const optionEmptySubTitle = (() => {
    let subTitle = '';
    if (isAddAnaesthesiologistSuccess) {
      subTitle = Strings.Admin_notified_to_update_profile;
    } else if (isAddAnaesthesiologistError || isValidationError) {
      subTitle = isValidationError
        ? Strings.Please_enter_a_full_name_using_letters_only
        : Strings.Try_again_or_contact_admin_for_support;
    } else {
      subTitle = Strings.Please_enter_full_name_to_add_user;
    }
    return subTitle;
  })();

  useEffect(() => {
    if (isAddAnaesthesiologistSuccess || isAddAnaesthesiologistError) {
      resetAddAnaesthesiologist();
    }
    if (isValidationError) {
      setIsValidationError(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anaesthelogistName]);

  const renderOptionEmptyIcon = () => {
    if (isAddAnaesthesiologistError || isValidationError) {
      return (
        <Icons.InfoAlert
          width={scaler(32)}
          height={scaler(32)}
          stroke={colors.foreground.attention}
          style={{marginTop: scaler(16)}}
        />
      );
    }
    if (isAddAnaesthesiologistSuccess) {
      return (
        <Icons.SuccessAlert
          width={scaler(32)}
          height={scaler(32)}
          stroke={colors.foreground.progress}
          style={{marginTop: scaler(16)}}
        />
      );
    }
    return null;
  };

  // handler for adding anaesthesiologists
  const handleAddAnaesthesiologist = () => {
    if (!anaesthelogistName) {
      return;
    }

    if (!validateName(anaesthelogistName)) {
      setIsValidationError(true);
    } else {
      addAnaesthesiologistMutate(
        {
          firstName: firstName,
          lastName: lastName,
          role: USER_ROLES.ANESTHELOGIST,
          permission: [USER_PERMISSIONS.ANESTHELOGIST],
        },
        {
          onSettled: () => {
            setTimeout(() => {
              resetAddAnaesthesiologist();
            }, 4000);
          },
        },
      );
    }
  };

  return (
    <DropdownSelect
      control={control}
      name={name}
      label={Strings.Anesthelogist_Name_Label}
      options={anaesthelogistList}
      onSearch={setAnaesthelogistName}
      OptionEmptyComponent={
        <View style={globalStyles.colCenter}>
          {renderOptionEmptyIcon()}
          <Text
            style={[
              styles.optionEmptyTitle,
              isNameExists && {color: colors.foreground.attention},
            ]}>
            {optionEmptyTitle}
          </Text>
          <Text style={styles.optionEmptySubTitle}>{optionEmptySubTitle}</Text>
          {!isAddAnaesthesiologistSuccess &&
            !isAddAnaesthesiologistError &&
            !isValidationError && (
              <Button
                loading={isAddingAnaesthesiologist}
                disabled={!firstName || !lastName || isAddingAnaesthesiologist}
                mode="outlined"
                onPress={handleAddAnaesthesiologist}
                icon="plus"
                contentStyle={{height: scaler(40)}}
                style={{marginBottom: scaler(8)}}>
                {Strings.Add_User}
              </Button>
            )}
        </View>
      }
      isLoading={isGettingAnaesthelogistList}
      searchPlaceholder="Search..."
      rules={{required: 'This field is required'}}
      style={styles.formInput}
    />
  );
};

interface SurgeonDropdownProps extends AnaesthelogistDropdownProps {}

const SurgeonDropdown: FC<SurgeonDropdownProps> = ({control, name}) => {
  const [isValidationError, setIsValidationError] = useState(false);
  const [surgeonName, setSurgeonName] = useState('');
  const [firstName, lastName] = surgeonName.split(/ (.+)/);
  const [isNameExists, setIsNameExists] = useState(false);

  const {data: surgeonsListData, isLoading: isGettingSurgeonsList} =
    useGetUserListByRoleQuery([USER_ROLES.SURGEON]);

  useEffect(() => {
    if (surgeonName && surgeonsListData) {
      const nameExists = surgeonsListData.some(
        surgeon =>
          `${surgeon.firstName} ${surgeon.lastName}`.toLowerCase() ===
          surgeonName.toLowerCase(),
      );
      setIsNameExists(nameExists);
    } else {
      setIsNameExists(false);
    }
  }, [surgeonName, surgeonsListData]);

  const surgeonsList = useMemo(() => {
    if (!surgeonsListData) {
      return [];
    }
    return surgeonsListData
      ?.map(surgeon => ({
        key: `${surgeon?.firstName} ${surgeon?.lastName}`,
        value: surgeon.id,
      }))
      ?.sort((a, b) =>
        a.key.localeCompare(b.key, undefined, {sensitivity: 'base'}),
      );
  }, [surgeonsListData]);

  const {
    mutate: addSurgeonMutate,
    isPending: isAddingSurgeon,
    isSuccess: isAddSurgeonSuccess,
    isError: isAddSurgeonError,
    reset: resetAddSurgeon,
  } = useAddUserMutation();

  const optionEmptyTitle = (() => {
    let title = Strings.No_results_found;
    if (isNameExists) {
      title = `${surgeonName} ${Strings.already_exists_in_list}`;
    }
    if (isAddSurgeonSuccess) {
      title = `${surgeonName} ${Strings.added_as_Surgeon}`;
    }
    if (isAddSurgeonError || isValidationError) {
      title = `${Strings.Failed_to_add} ${surgeonName}`;
    }
    return title;
  })();

  const optionEmptySubTitle = (() => {
    let subTitle = '';
    if (isAddSurgeonSuccess) {
      subTitle = Strings.Admin_notified_to_update_profile;
    } else if (isAddSurgeonError || isValidationError) {
      subTitle = isValidationError
        ? Strings.Please_enter_a_full_name_using_letters_only
        : Strings.Try_again_or_contact_admin_for_support;
    } else {
      subTitle = Strings.Please_enter_full_name_to_add_user;
    }
    return subTitle;
  })();

  useEffect(() => {
    if (isAddSurgeonSuccess || isAddSurgeonError) {
      resetAddSurgeon();
    }
    if (isValidationError) {
      setIsValidationError(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surgeonName]);

  const renderOptionEmptyIcon = () => {
    if (isAddSurgeonError || isValidationError) {
      return (
        <Icons.InfoAlert
          width={scaler(32)}
          height={scaler(32)}
          stroke={colors.foreground.attention}
          style={{marginTop: scaler(16)}}
        />
      );
    }
    if (isAddSurgeonSuccess) {
      return (
        <Icons.SuccessAlert
          width={scaler(32)}
          height={scaler(32)}
          stroke={colors.foreground.progress}
          style={{marginTop: scaler(16)}}
        />
      );
    }
    return null;
  };

  // handler for adding surgeons
  const handleAddSurgeon = () => {
    if (!surgeonName) {
      return;
    }

    if (!validateName(surgeonName)) {
      setIsValidationError(true);
    } else {
      addSurgeonMutate(
        {
          firstName: firstName,
          lastName: lastName,
          role: USER_ROLES.SURGEON,
          permission: [USER_PERMISSIONS.SURGEON],
        },
        {
          onSettled: () => {
            setTimeout(() => {
              resetAddSurgeon();
            }, 4000);
          },
        },
      );
    }
  };

  return (
    <DropdownSelect
      control={control}
      name={name}
      label={Strings.Primary_Surgeon_Name_Label}
      options={surgeonsList}
      onSearch={setSurgeonName}
      OptionEmptyComponent={
        <View style={globalStyles.colCenter}>
          {renderOptionEmptyIcon()}
          <Text
            style={[
              styles.optionEmptyTitle,
              isNameExists && {color: colors.foreground.attention},
            ]}>
            {optionEmptyTitle}
          </Text>
          <Text style={styles.optionEmptySubTitle}>{optionEmptySubTitle}</Text>
          {!isAddSurgeonSuccess && !isAddSurgeonError && !isValidationError && (
            <Button
              loading={isAddingSurgeon}
              disabled={!firstName || !lastName || isAddingSurgeon}
              mode="outlined"
              onPress={handleAddSurgeon}
              icon="plus"
              contentStyle={{height: scaler(40)}}
              style={{marginBottom: scaler(8)}}>
              {Strings.Add_User}
            </Button>
          )}
        </View>
      }
      isLoading={isGettingSurgeonsList}
      searchPlaceholder="Search..."
      rules={{required: 'This field is required'}}
      style={styles.formInput}
    />
  );
};

interface ProcedureDropdownProps {
  control: any;
  name: string;
  hospitalId?: string;
}

const ProcedureDropdown: FC<ProcedureDropdownProps> = ({
  control,
  name,
  hospitalId,
}) => {
  const [isValidationError, setIsValidationError] = useState(false);
  const [procedureName, setProcedureName] = useState('');
  const [isNameExists, setIsNameExists] = useState(false);
  const [addedProcedure, setAddedProcedure] = useState<PROCEDURE | null>(null);
  const {user} = useAuthValue();

  // Computed values
  const isNurseOrOTUser =
    user?.permission?.includes(USER_PERMISSIONS.NURSE) ||
    user?.permission?.includes(USER_PERMISSIONS.OT_MANAGER);

  const PROCEDURE_SEPARATOR = ' - ';

  const validateProcedureFormat = useCallback(
    (input: string): boolean => {
      if (!input?.includes(PROCEDURE_SEPARATOR)) {
        return false;
      }

      const parts = input.split(PROCEDURE_SEPARATOR, 2);
      if (parts.length !== 2) {
        return false;
      }

      const [code, description] = parts;
      return code.trim().length > 0 && description.trim().length > 0;
    },
    [PROCEDURE_SEPARATOR],
  );

  // Fetch all procedures once, search happens on frontend
  const {data: procedureListData = [], isLoading: isGettingProcedureList} =
    useGetProcedureListQuery(procedureName);

  useEffect(() => {
    if (procedureName && procedureListData) {
      const exists = procedureListData.some(proc => {
        // Create label with conditional separator (same logic as procedureList)
        const hasCptCode = !!proc?.cptCode?.trim();
        const hasName = !!proc?.name?.trim();

        let label = '';
        if (hasCptCode && hasName) {
          label = `${proc?.cptCode} - ${proc.name}`;
        } else if (hasCptCode) {
          label = proc?.cptCode || '';
        } else if (hasName) {
          label = proc?.name;
        }

        return label.toLowerCase() === procedureName.toLowerCase();
      });
      setIsNameExists(exists);
    } else {
      setIsNameExists(false);
    }
  }, [procedureName, procedureListData]);

  const procedureList = useMemo(() => {
    if (procedureListData?.length <= 0) {
      return null;
    }
    return procedureListData?.map((pr: PROCEDURE) => ({
      value: pr.cptCode || pr.name,
      key: `${pr?.cptCode ? pr?.cptCode + ' - ' : ''}${pr?.name}`,
    }));
  }, [procedureListData]);

  const searchedProcedureList = useMemo(() => {
    if (!procedureList && addedProcedure && procedureName) {
      const cptCode = addedProcedure?.cptCode?.trim();
      const procName = addedProcedure?.name?.trim();

      const isSearched =
        procedureName?.includes(procName) ||
        (cptCode && procedureName?.includes(cptCode));

      return isSearched
        ? [
            {
              value: cptCode || procName,
              key: `${cptCode ? cptCode + ' - ' : ''}${procName}`,
            },
          ]
        : [];
    }
    return [];
  }, [addedProcedure, procedureList, procedureName]);

  const {
    mutate: addProcedureMutate,
    isPending: isAddingProcedure,
    isSuccess: isAddProcedureSuccess,
    isError: isAddProcedureError,
    reset: resetAddProcedure,
  } = useAddProcedureMutation(setAddedProcedure);

  useEffect(() => {
    if (isAddProcedureSuccess || isAddProcedureError) {
      resetAddProcedure();
    }
    if (isValidationError) {
      setIsValidationError(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [procedureName]);

  const optionEmptyTitle = useMemo(() => {
    let title = Strings.No_results_found;
    if (isNameExists) {
      title = `${procedureName} ${Strings.already_exists_in_list}`;
    }
    if (isAddProcedureSuccess) {
      title = `${procedureName} ${Strings.added_as_Procedure}`;
    }
    if (isAddProcedureError) {
      title = `${Strings.Failed_to_add} ${procedureName}`;
    }
    if (isValidationError && !isNurseOrOTUser) {
      title = `${Strings.Failed_to_add} ${procedureName}`;
    }
    return title;
  }, [
    procedureName,
    isAddProcedureSuccess,
    isAddProcedureError,
    isValidationError,
    isNurseOrOTUser,
    isNameExists,
  ]);

  const optionEmptySubTitle = useMemo(() => {
    if (isAddProcedureSuccess) {
      return Strings.Admin_notified_to_update_profile;
    }
    if (isAddProcedureError || isValidationError) {
      return isValidationError
        ? Strings.Please_enter_procedure_name_for
        : Strings.Try_again_or_contact_admin_for_support;
    }
    if (isNurseOrOTUser) {
      return Strings.Please_enter_procedure_name_for;
    }
    return Strings.Please_enter_procedure_name_for;
  }, [
    isAddProcedureSuccess,
    isAddProcedureError,
    isValidationError,
    isNurseOrOTUser,
  ]);

  const isAddButtonDisabled = useMemo(() => {
    if (isNurseOrOTUser) {
      return !procedureName || isAddingProcedure || !hospitalId;
    }
    return (
      !procedureName ||
      isAddingProcedure ||
      !hospitalId ||
      !validateProcedureFormat(procedureName)
    );
  }, [
    procedureName,
    isAddingProcedure,
    hospitalId,
    isNurseOrOTUser,
    validateProcedureFormat,
  ]);

  const shouldShowAddButton = useMemo(() => {
    if (isNurseOrOTUser) {
      return !isAddProcedureSuccess && !isAddProcedureError;
    }
    return !isAddProcedureSuccess && !isAddProcedureError && !isValidationError;
  }, [
    isAddProcedureSuccess,
    isAddProcedureError,
    isValidationError,
    isNurseOrOTUser,
  ]);

  const renderOptionEmptyIcon = () => {
    if (isAddProcedureError || isValidationError) {
      return (
        <Icons.InfoAlert
          width={scaler(32)}
          height={scaler(32)}
          stroke={colors.foreground.attention}
          style={{marginTop: scaler(16)}}
        />
      );
    }

    if (isAddProcedureSuccess) {
      return (
        <Icons.SuccessAlert
          width={scaler(32)}
          height={scaler(32)}
          stroke={colors.foreground.progress}
          style={{marginTop: scaler(16)}}
        />
      );
    }

    return null;
  };

  // handler for adding procedures
  const handleAddProcedure = () => {
    if (!procedureName || !hospitalId) {
      return;
    }

    if (
      isNurseOrOTUser &&
      !validateName(procedureName) &&
      !validateProcedureName(procedureName)
    ) {
      setIsValidationError(true);
      return;
    }
    if (!isNurseOrOTUser && !validateProcedureName(procedureName)) {
      setIsValidationError(true);
      return;
    }

    const isProcedureWithCode = procedureName.includes(PROCEDURE_SEPARATOR);
    const [code, procedure] = procedureName.split(PROCEDURE_SEPARATOR, 2);

    addProcedureMutate(
      {
        cptCode: isProcedureWithCode ? code : null,
        name: isProcedureWithCode ? procedure : procedureName,
        hospitalId,
      },
      {
        onSettled: () => {
          setTimeout(resetAddProcedure, 4000);
        },
      },
    );
  };

  return (
    <DropdownSelect
      control={control}
      name={name}
      label={Strings.Select_Procedure_Label}
      options={procedureList ?? searchedProcedureList}
      onSearch={setProcedureName}
      searchValue={procedureName}
      enableDynamicSearch
      OptionEmptyComponent={
        <View style={globalStyles.colCenter}>
          {renderOptionEmptyIcon()}
          <Text
            style={[
              styles.optionEmptyTitle,
              isNameExists && {color: colors.foreground.attention},
            ]}>
            {optionEmptyTitle}
          </Text>
          <Text style={styles.optionEmptySubTitle}>{optionEmptySubTitle}</Text>
          <Text style={styles.selectProcedureExample}>
            {Strings.Select_Procedure_Example}
          </Text>
          {shouldShowAddButton && (
            <Button
              loading={isAddingProcedure}
              disabled={isAddButtonDisabled}
              mode="outlined"
              onPress={handleAddProcedure}
              icon="plus"
              contentStyle={{height: scaler(40)}}
              style={{marginBottom: scaler(8)}}>
              {Strings.Add_Procedure}
            </Button>
          )}
        </View>
      }
      isLoading={isGettingProcedureList}
      searchPlaceholder="Search..."
      rules={{required: 'This field is required'}}
      style={styles.formInput}
    />
  );
};

const styles = StyleSheet.create({
  formInput: {
    marginTop: scaler(18),
  },
  btnContainer: {
    flexDirection: 'row',
    margin: scaler(24),
    marginTop: 0,
  },

  optionEmptyTitle: {
    color: colors.foreground.primary,
    fontSize: scaler(16),
    marginTop: scaler(8),
  },
  optionEmptySubTitle: {
    color: colors.foreground.primary,
    fontSize: scaler(13),
    marginBottom: scaler(16),
  },
  selectProcedureExample: {
    marginTop: -scaler(16),
    color: colors.foreground.primary,
    fontSize: scaler(13),
    marginBottom: scaler(16),
  },
});
