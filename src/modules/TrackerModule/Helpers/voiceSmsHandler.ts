import {AxiosResponse} from 'axios';
import {FILTER_USERS_TO_SEND_SMS_RESPONSE} from '../Types/ResponseTypes';
import {SEND_SMS_REQUEST} from '../Types/RequestTypes';
import {
  FILTERED_USERS_TO_SEND_SMS,
  NOTIFICATION_RECIPIENT_TYPE,
} from '../Types/CommonTypes';
import {toggleVoiceIntractionPanel} from '@modules/VoiceComandModule/Components/VoiceIntractionPanel';
import {Strings} from '@locales/Localization';
import {
  DISPLAY_INFO_PANEL_STATUS,
  VOICE_INTRACTION_PANEL_MODE,
} from '@modules/VoiceComandModule/Types/CommonTypes';
import {toggleSendSmsDrawer} from '../Components/SendSmsDrawer';
import {setWWDetected} from '@nativeModules/SpeechDetection';
import {Dispatch, SetStateAction} from 'react';

export default function voiceSmsHandler(
  res: AxiosResponse<FILTER_USERS_TO_SEND_SMS_RESPONSE>,
  cb?: (data: SEND_SMS_REQUEST) => void,
  setSavedFilteredUsersRes?: Dispatch<
    SetStateAction<FILTERED_USERS_TO_SEND_SMS | null>
  >,
) {
  const resData = res?.data?.response;
  const recipients = resData?.recipients;
  const extractionDetails = resData?.status?.extraction_details;
  const recipientCount = resData?.recipient_count;
  const actualMessage = resData?.parameters?.message;

  const {sendByType, receiverName} = getSendSmsData(resData);

  if (!actualMessage || actualMessage.trim().length === 0) {
    toggleVoiceIntractionPanel({
      mode: VOICE_INTRACTION_PANEL_MODE.DISPLAY_INFO,
      data: {
        title: Strings.No_SMS_Message_Found_Message,
        type: DISPLAY_INFO_PANEL_STATUS.ERROR,
      },
    });
    setTimeout(() => {
      toggleSendSmsDrawer({
        users: recipients?.map(recipient => recipient.id),
        role: extractionDetails?.role_specified,
        department: extractionDetails?.department_specified,
        sendByType,
      });
    }, 3500);
    return;
  }

  if (recipientCount === 1) {
    setSavedFilteredUsersRes?.(resData);
    toggleVoiceIntractionPanel({
      isVisible: true,
      mode: VOICE_INTRACTION_PANEL_MODE.DISPLAY_INFO,
      data: {
        title: `To confirm, you want to send the message ${actualMessage} to ${receiverName}. Do you want to send it?`,
        type: DISPLAY_INFO_PANEL_STATUS.DEFAULT,
      },
    });
    setTimeout(() => {
      setWWDetected(true);
    }, 3500);
    return;
  }
  if (recipientCount === 0) {
    toggleVoiceIntractionPanel({
      mode: VOICE_INTRACTION_PANEL_MODE.DISPLAY_INFO,
      data: {
        title: Strings.No_Recipient_Found_Message,
        type: DISPLAY_INFO_PANEL_STATUS.ERROR,
      },
    });
    setTimeout(() => {
      toggleSendSmsDrawer({
        sendByType,
        message: resData?.parameters?.message,
        role: extractionDetails?.role_specified,
        department: extractionDetails?.department_specified,
      });
    }, 3500);
    return;
  }
  if (recipientCount > 1) {
    toggleVoiceIntractionPanel({
      mode: VOICE_INTRACTION_PANEL_MODE.DISPLAY_INFO,
      data: {
        title: Strings.Multiple_Recipients_Found_Message,
        type: DISPLAY_INFO_PANEL_STATUS.ERROR,
      },
    });
    setTimeout(() => {
      toggleSendSmsDrawer({
        role: extractionDetails?.role_specified,
        department: extractionDetails?.department_specified,
        users: recipients?.map(recipient => recipient.id),
        message: resData?.parameters?.message,
        sendByType,
      });
    }, 3500);
  }
}

export function getSendSmsData(res: FILTERED_USERS_TO_SEND_SMS) {
  let sendByType = NOTIFICATION_RECIPIENT_TYPE.USER;
  let receiverName = '';
  let recipientValue = '';

  const recipients = res?.recipients;
  const extractionDetails = res?.status?.extraction_details;

  if (extractionDetails?.role_specified) {
    sendByType = NOTIFICATION_RECIPIENT_TYPE.ROLE;
    receiverName = extractionDetails?.role_specified;
    recipientValue = extractionDetails?.role_specified;
  }
  if (extractionDetails?.department_specified) {
    sendByType = NOTIFICATION_RECIPIENT_TYPE.DEPARTMENT;
    receiverName = extractionDetails?.department_specified;
    recipientValue = extractionDetails?.department_specified;
  }
  if (
    !(
      extractionDetails?.department_specified &&
      extractionDetails?.role_specified
    )
  ) {
    receiverName = recipients
      ?.map(recipient => `${recipient.first_name} ${recipient.last_name}`)
      .join(', ');
    recipientValue = recipients?.map(recipient => recipient.id).join(', ');
  }

  return {sendByType, receiverName, recipientValue};
}
