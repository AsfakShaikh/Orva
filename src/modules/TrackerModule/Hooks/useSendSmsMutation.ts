import {fetcher} from '@utils/Axios';
import {SEND_SMS_REQUEST} from '../Types/RequestTypes';
import {useMutation} from '@tanstack/react-query';
import {toggleVoiceIntractionPanel} from '@modules/VoiceComandModule/Components/VoiceIntractionPanel';
import {
  DISPLAY_INFO_PANEL_STATUS,
  VOICE_INTRACTION_PANEL_MODE,
} from '@modules/VoiceComandModule/Types/CommonTypes';
import {Strings} from '@locales/Localization';
import useNotificationLogMutation from './useNotificationLogMutation';
import useTrackerValue from './useTrackerValues';
import useAudioPlayer from '@hooks/useAudioPlayer';
import Audios from '@assets/audio';

async function sendSms(reqBody: SEND_SMS_REQUEST) {
  return fetcher({
    url: 'sms/send',
    method: 'POST',
    data: {
      receiverNumber: reqBody.receiverNumber,
      message: reqBody.message,
    },
  });
}

const useSendSmsMutation = (cb?: () => void) => {
  const {currentActiveCase} = useTrackerValue();
  const {mutate: notificationLogMutate} = useNotificationLogMutation();
  const {playAudio} = useAudioPlayer();
  return useMutation({
    mutationFn: sendSms,
    onSuccess: (_, req) => {
      console.log(
        '-------------- sendSmsMutation onSuccess -------------- ',
        req,
      );
      if (
        currentActiveCase?.id &&
        req?.recipientType &&
        req?.recipientValue &&
        req?.notificationType
      ) {
        notificationLogMutate({
          caseId: currentActiveCase?.id,
          message: req?.actualMessage ?? req?.message,
          recipientType: req?.recipientType,
          recipientValue: req?.recipientValue,
          notificationType: req?.notificationType,
        });
      }
      playAudio(Audios.Affirmative);
      cb?.();
      toggleVoiceIntractionPanel({
        isVisible: true,
        mode: VOICE_INTRACTION_PANEL_MODE.DISPLAY_INFO,
        data: {
          title: `${Strings.SMS_Sent_Message} ${req?.receiverName}`,
          type: DISPLAY_INFO_PANEL_STATUS.SUCCESS,
        },
      });
    },
    onError: () => {
      toggleVoiceIntractionPanel({
        isVisible: true,
        mode: VOICE_INTRACTION_PANEL_MODE.DISPLAY_INFO,
        data: {
          title: Strings.SMS_Send_Error,
          type: DISPLAY_INFO_PANEL_STATUS.ERROR,
        },
      });
      cb?.();
    },
  });
};

export default useSendSmsMutation;
