import Button from '@components/Button';
import InputSelect from '@components/InputSelect';
import InputText from '@components/InputText';
import SideModalDrawer, {
  SideModalDrawerBody,
} from '@components/SideModalDrawer';
import Tabs from '@components/Tabs';
import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';
import {Strings} from '@locales/Localization';
import {globalStyles} from '@styles/GlobalStyles';
import scaler from '@utils/Scaler';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useForm} from 'react-hook-form';
import {StyleSheet, View} from 'react-native';
import useFilterUsersToSendSmsMutation from '../Hooks/useFilterUsersToSendSmsMutation';
import {toggleVoiceIntractionPanel} from '@modules/VoiceComandModule/Components/VoiceIntractionPanel';
import {
  DISPLAY_INFO_PANEL_STATUS,
  VOICE_COMAND_STATUS,
  VOICE_INETENT_EVENT,
  VOICE_INTENT,
  VOICE_INTRACTION_PANEL_MODE,
} from '@modules/VoiceComandModule/Types/CommonTypes';
import {
  FILTERED_USERS_TO_SEND_SMS,
  NOTIFICATION_RECIPIENT_TYPE,
  NOTIFICATION_TYPE,
} from '../Types/CommonTypes';
import useSendSmsMutation from '../Hooks/useSendSmsMutation';
import voiceSmsHandler, {getSendSmsData} from '../Helpers/voiceSmsHandler';
import isNotNull from '@helpers/isNotNull';
import useAuthValue from '@modules/AuthModule/Hooks/useAuthValue';
import useGetSendSmsDrawerDetails from '../Hooks/useGetSendSmsDrawerDetails';
import {fireSetStausEvent} from '@navigation/DrawerNavigation/HomeDrawerNavigation';
import {theme} from '@styles/Theme';

const {colors} = theme;

interface SendSmsDrawerProps {
  isVisible?: boolean;
  isConfirmSms?: boolean;
  sendByType?: NOTIFICATION_RECIPIENT_TYPE;
}

type SendSmsData = {
  role?: string | null;
  department?: string | null;
  users?: Array<number> | null;
  message?: string | null;
};

const SEND_SMS_DRAWER_EVENT = 'SEND_SMS_DRAWER_EVENT';
export const SEND_SMS_CAPTURED_EVENT = 'SEND_SMS_CAPTURED_EVENT';

const topTabOptions = [
  {label: Strings.User, value: NOTIFICATION_RECIPIENT_TYPE.USER},
  {label: Strings.Role, value: NOTIFICATION_RECIPIENT_TYPE.ROLE},
  {label: Strings.Department, value: NOTIFICATION_RECIPIENT_TYPE.DEPARTMENT},
];

export const toggleSendSmsDrawer = (
  data?: SendSmsData & SendSmsDrawerProps,
) => {
  emitEvent(SEND_SMS_DRAWER_EVENT, data);
};

export function fireSendSmsCapturedEvent(data?: string) {
  emitEvent(SEND_SMS_CAPTURED_EVENT, data);
}

const ACCEPTED_VOICE_INTENT = new Set([
  VOICE_INTENT.YES,
  VOICE_INTENT.NO,
  VOICE_INTENT.CANCEL,
]);

const SendSmsDrawer = () => {
  const {selectedOt} = useAuthValue();
  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState<SendSmsDrawerProps>();
  const [voiceTranscription, setVoiceTranscription] = useState<string>();
  const [triggerSendSms, setTriggerSendSms] = useState(false);
  const [savedFilteredUsersRes, setSavedFilteredUsersRes] =
    useState<FILTERED_USERS_TO_SEND_SMS | null>(null);
  const [voiceIntent, setVoiceIntent] = useState<VOICE_INTENT | null>();

  const [activeTab, setActiveTab] = useState<NOTIFICATION_RECIPIENT_TYPE>(
    NOTIFICATION_RECIPIENT_TYPE.USER,
  );

  const {control, handleSubmit, reset, watch, setValue} = useForm();

  const setFormValues = (data?: SendSmsData) => {
    const formDefaultValues = {
      role: data?.role ?? '',
      department: data?.department ?? '',
      users: data?.users ?? [],
      message: data?.message ?? '',
    };
    reset(formDefaultValues);
  };

  const selectedRole = watch('role');
  const selectedDepartment = watch('department');

  const onClose = () => {
    setVoiceTranscription(undefined);
    setTriggerSendSms(false);
    setVisible(false);
    reset();
    setDetail(undefined);
    setActiveTab(NOTIFICATION_RECIPIENT_TYPE.USER);
  };

  const {
    usersOptionsList,
    rolesOptionsList,
    departmentOptionsList,
    isLoadingRolesList,
    isLoadingUsersList,
    isLoadingDepartmentList,
  } = useGetSendSmsDrawerDetails({
    activeTab,
    selectedRole,
    selectedDepartment,
  });

  const {mutate: filterUsersToSendSmsMutate} =
    useFilterUsersToSendSmsMutation();
  const {mutate: sendSmsMutate, isPending: isSendingSms} =
    useSendSmsMutation(onClose);

  useEventEmitter(
    SEND_SMS_DRAWER_EVENT,
    (data?: SendSmsData & SendSmsDrawerProps) => {
      const {
        isVisible: isVisibleDrawer,
        isConfirmSms: isConfirmSmsData,
        sendByType: sendByTypeData,
        ...rest
      } = data ?? {};
      setVisible(prev =>
        isNotNull(isVisibleDrawer) ? isVisibleDrawer : !prev,
      );
      setFormValues(rest);
      setDetail({
        isConfirmSms: isConfirmSmsData ?? false,
      });

      setActiveTab(sendByTypeData ?? NOTIFICATION_RECIPIENT_TYPE.USER);
    },
  );

  useEventEmitter(SEND_SMS_CAPTURED_EVENT, (transcription?: string) => {
    setVoiceTranscription(transcription);
    setTriggerSendSms(true);
  });

  useEventEmitter(VOICE_INETENT_EVENT, (intent?: VOICE_INTENT) => {
    if (intent && ACCEPTED_VOICE_INTENT.has(intent)) {
      setVoiceIntent(intent);
    }
  });

  const isSendSmsDisabled = useMemo(() => {
    return isSendingSms || !watch('message') || watch('users')?.length === 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSendingSms, watch('message'), watch('users')]);

  const handleSendSms = handleSubmit(val => {
    const {userNames, userNumbers} = usersOptionsList.reduce(
      (acc, user) => {
        if (val.users?.includes(user.id)) {
          acc.userNames.push(user.first_name + ' ' + user.last_name);
          acc.userNumbers.push(user.phoneNumber);
        }
        return acc;
      },
      {userNames: [] as Array<string>, userNumbers: [] as Array<string>},
    );

    const receiverName = (() => {
      if (val.role) {
        return val.role;
      }
      if (val.department) {
        return val.department;
      }
      return userNames?.join(', ');
    })();

    const recipientValue = (() => {
      if (val.role) {
        return val.role;
      }
      if (val.department) {
        return val.department;
      }
      return val.users?.join(', ');
    })();

    sendSmsMutate({
      recipientValue,
      receiverName,
      receiverNumber: userNumbers?.join(','),
      message: `Orva Alert: From ${selectedOt?.name} - ${val.message}`,
      actualMessage: val.message,
      recipientType: activeTab,
      notificationType: NOTIFICATION_TYPE.SMS,
    });
  });

  const onVoiceIntent = useCallback(
    (intent?: VOICE_INTENT | null) => {
      if (!intent) {
        return;
      }
      if (intent === VOICE_INTENT.CANCEL) {
        toggleVoiceIntractionPanel({
          isVisible: false,
        });
        onClose();
        return;
      }
      if (savedFilteredUsersRes) {
        const recipients = savedFilteredUsersRes?.recipients;
        const {sendByType, receiverName, recipientValue} = getSendSmsData(
          savedFilteredUsersRes,
        );

        if (intent === VOICE_INTENT.YES) {
          const actualMessage = savedFilteredUsersRes?.parameters?.message;
          sendSmsMutate({
            recipientValue,
            receiverName: receiverName ?? '',
            receiverNumber: recipients?.[0]?.phoneNumber ?? '',
            message: `Orva Alert: From ${selectedOt?.name} - ${actualMessage}`,
            actualMessage: actualMessage,
            recipientType: sendByType,
            notificationType: NOTIFICATION_TYPE.SMS,
          });
        }
        if (intent === VOICE_INTENT.NO) {
          const extractionDetails =
            savedFilteredUsersRes?.status?.extraction_details;
          toggleVoiceIntractionPanel({
            isVisible: false,
          });
          toggleSendSmsDrawer({
            isVisible: true,
            role: extractionDetails?.role_specified,
            department: extractionDetails?.department_specified,
            users: recipients?.map(recipient => recipient.id),
            message: savedFilteredUsersRes?.parameters?.message,
            sendByType,
          });
        }

        setSavedFilteredUsersRes(null);
        setVoiceIntent(null);
      } else {
        setVoiceIntent(null);
        fireSetStausEvent(VOICE_COMAND_STATUS.NEGATIVE);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [savedFilteredUsersRes, selectedOt?.name, sendSmsMutate],
  );

  // Effect is used to record the voice note
  useEffect(() => {
    if (voiceTranscription && !visible && !triggerSendSms) {
      filterUsersToSendSmsMutate(
        {
          personnel_database: usersOptionsList,
          user_query: voiceTranscription,
        },
        {
          onSuccess: res =>
            voiceSmsHandler(res, sendSmsMutate, setSavedFilteredUsersRes),
          onError: () => {
            toggleVoiceIntractionPanel({
              mode: VOICE_INTRACTION_PANEL_MODE.DISPLAY_INFO,
              data: {
                title: Strings.Filter_Users_To_Send_SMS_Error,
                type: DISPLAY_INFO_PANEL_STATUS.ERROR,
              },
            });
          },
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filterUsersToSendSmsMutate,
    usersOptionsList,
    voiceTranscription,
    visible,
    triggerSendSms,
  ]);

  // Effect is used to set the users options list when the active tab is changed and the users options list is not empty
  useEffect(() => {
    if (
      activeTab !== NOTIFICATION_RECIPIENT_TYPE.USER &&
      usersOptionsList?.length > 0 &&
      (isNotNull(selectedRole) || isNotNull(selectedDepartment))
    ) {
      setValue('users', usersOptionsList?.map(user => user.id) ?? []);
    }
  }, [usersOptionsList, setValue, activeTab, selectedRole, selectedDepartment]);

  // Effect is used to trigger the send sms when the trigger send sms is true
  useEffect(() => {
    if (triggerSendSms && visible) {
      if (!isSendSmsDisabled) {
        handleSendSms();
      } else {
        fireSetStausEvent(VOICE_COMAND_STATUS.NEGATIVE);
      }
    }
    setTriggerSendSms(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerSendSms, visible, isSendSmsDisabled]);

  // Effect is used to trigger the send sms when the voice intent is yes or no
  useEffect(() => {
    onVoiceIntent(voiceIntent);
  }, [voiceIntent, onVoiceIntent]);

  return (
    <SideModalDrawer
      title={detail?.isConfirmSms ? Strings.Confirm_SMS : Strings.Send_SMS}
      subTitle={detail?.isConfirmSms ? Strings.Confirm_SMS_Subheading : null}
      visible={visible}
      onClose={onClose}>
      <SideModalDrawerBody>
        <Tabs
          options={topTabOptions}
          setActiveTab={setActiveTab}
          activeTab={activeTab}
          containerStyle={styles.topTabsContainer}
          textStyle={styles.topTabsText}
        />
        {activeTab === NOTIFICATION_RECIPIENT_TYPE.ROLE && (
          <InputSelect
            control={control}
            name="role"
            label={Strings.Select_SMS_Role_Label}
            isGettingOptions={isLoadingRolesList}
            options={rolesOptionsList}
            searchEnabled
            searchPlaceholder={Strings.search_sms_role_placeholder}
            contentStyle={styles.inputSelectContentStyle}
          />
        )}
        {activeTab === NOTIFICATION_RECIPIENT_TYPE.DEPARTMENT && (
          <InputSelect
            control={control}
            name="department"
            label={Strings.Select_SMS_Department_Label}
            options={departmentOptionsList}
            isGettingOptions={isLoadingDepartmentList}
            searchEnabled
            searchPlaceholder={Strings.search_sms_department_placeholder}
            contentStyle={styles.inputSelectContentStyle}
          />
        )}
        <InputSelect
          multiple
          control={control}
          isGettingOptions={isLoadingUsersList}
          name="users"
          label={Strings.Select_SMS_Recipients_Label}
          placeholder={Strings.Select_SMS_Recipients_Placeholder}
          options={usersOptionsList}
          style={
            activeTab !== NOTIFICATION_RECIPIENT_TYPE.USER && styles.formInput
          }
          contentStyle={styles.inputSelectContentStyle}
          searchEnabled
          searchPlaceholder={Strings.search_sms_users_placeholder}
        />
        <InputText
          control={control}
          name="message"
          label={Strings.Message}
          multiline
          contentStyle={globalStyles.multilineInput}
          style={styles.formInput}
        />
        <View style={styles.btnContainer}>
          <Button
            disabled={isSendingSms}
            onPress={() => toggleSendSmsDrawer()}
            style={globalStyles.flex1}
            contentStyle={{height: scaler(40)}}
            icon="account-voice"
            mode="outlined">
            {Strings.Cancel}
          </Button>
          <Button
            disabled={isSendSmsDisabled}
            loading={isSendingSms}
            onPress={handleSendSms}
            style={globalStyles.flex1}
            contentStyle={{height: scaler(40)}}
            icon="account-voice"
            mode="contained">
            {`"${Strings.Send_Alert}"`}
          </Button>
        </View>
      </SideModalDrawerBody>
    </SideModalDrawer>
  );
};

const styles = StyleSheet.create({
  formInput: {
    marginTop: scaler(18),
  },
  btnContainer: {
    flexDirection: 'row',
    marginVertical: scaler(36),
    gap: scaler(16),
  },
  topTabsContainer: {
    marginBottom: scaler(24),
    borderBottomWidth: 0,
  },
  topTabsText: {
    fontSize: scaler(18),
    paddingBottom: scaler(2),
  },
  inputSelectContentStyle: {
    backgroundColor: colors.background.primary,
  },
});

export default SendSmsDrawer;
