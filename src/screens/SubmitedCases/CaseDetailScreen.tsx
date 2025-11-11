import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import CaseDetailHeader from './CaseDetailHeader';
import scaler from '@utils/Scaler';
import {Strings} from '@locales/Localization';
import {RouteProp, useRoute} from '@react-navigation/native';
import {CaseSubmittedStackParamList} from '@navigation/Types/CommonTypes';
import {
  MILESTONE_TRACKER_STEPS,
  SUBMIT_CASES_STACK_ROUTE_NAME,
} from '@utils/Constants';
import useGetCaseDetailQuery from '@modules/CasesModule/Hooks/useGetCaseDetailQuery';
import SubmitedCaseRevisionsModal, {
  toggleSubmitedCaseRevisionsModal,
} from '@modules/CaseSelectionModule/Components/SubmitedCaseRevisionsModal';
import {REVISION} from '@modules/CaseSelectionModule/Types/CommonTypes';
import CaseTimeline from '@modules/CasesModule/Components/CaseTimeline';
import {
  CASE_TIMELINE_TYPE,
  MILESTONE_TIMELINE,
  NOTIFICATION_TIMELINE,
  TIMER_TIMELINE,
  VOICE_NOTE_TIMELINE,
} from '@modules/CasesModule/Types/CommonTypes';
import getTimerTitle from '@modules/TrackerModule/Helpers/getTimerTitle';
import {theme} from '@styles/Theme';
import {globalStyles} from '@styles/GlobalStyles';
import EditMilestoneTimeModal, {
  toggleEditMilestoneTimeModal,
} from '@modules/CasesModule/Components/EditMilestoneTimeModal';
import EditVoiceNoteModal, {
  toggleEditVoiceNoteModal,
} from '@modules/CasesModule/Components/EditVoiceNoteModal';
import EditCaseCommentModal, {
  toggleEditCaseCommentModal,
} from '@modules/CasesModule/Components/EditCaseCommentModal';
import EditTimerLabelModal, {
  toggleEditTimerLabelModal,
} from '@modules/CasesModule/Components/EditTimerLabelModal';
import stringToNumber from '@helpers/stringToNumber';
import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';

import {DATE_TYPE} from '@utils/Types';
import checkIsBeforeDayEnd from '@modules/CasesModule/Helpers/checkIsBeforeDayEnd';
import {ActivityIndicator} from 'react-native-paper';
import {NOTIFICATION_RECIPIENT_TYPE} from '@modules/TrackerModule/Types/CommonTypes';

const {colors} = theme;

const SAVE_AND_MOVE_NEXT_TIMELINE_EVENT = 'SAVE_AND_MOVE_NEXT_TIMELINE_EVENT';

export const fireSaveAndMoveNextTimelineEvent = (
  timelineItemIndex: number,
  isOptionalMilestone?: boolean,
) => {
  emitEvent(
    SAVE_AND_MOVE_NEXT_TIMELINE_EVENT,
    timelineItemIndex,
    isOptionalMilestone,
  );
};

export type CASE_TIMELINE_ITEM =
  | MILESTONE_TIMELINE
  | VOICE_NOTE_TIMELINE
  | TIMER_TIMELINE
  | NOTIFICATION_TIMELINE;

export default function CaseDetailScreen() {
  const {params} =
    useRoute<
      RouteProp<
        CaseSubmittedStackParamList,
        SUBMIT_CASES_STACK_ROUTE_NAME.CASE_DETAIL
      >
    >();
  const {caseId, isEdit} = params ?? {};

  const [isEditEnabled, setIsEditEnabled] = useState(false);
  const [timelineItemDetails, setTimelineItemDetails] = useState<{
    timelineItemIndex: number;
    isOptionalMilestone?: boolean;
  } | null>(null);

  const {data: caseDetail, isLoading: isCaseDetailLoading} =
    useGetCaseDetailQuery(caseId);
  const {
    patient,
    procedure,
    assignedSurgeon,
    comments,
    caseNotes,
    timers,
    actualEndTime,
    notifications,
  } = caseDetail ?? {};

  const milestonesList: Array<MILESTONE_TIMELINE> =
    procedure?.milestones.flatMap(milestone => {
      const revisions = milestone?.revisions;

      const createMilestoneObject = (data?: {
        title?: string;
        revision?: Array<REVISION>;
        timestamp?: DATE_TYPE;
        loggedBy?: string | null;
        createdAt?: DATE_TYPE;
      }) => ({
        type: CASE_TIMELINE_TYPE.MILESTONE as const,
        title: data?.title ?? milestone.displayName,
        revision: data?.revision ?? revisions,
        timestamp: data?.timestamp ?? milestone.completedTimestamp,
        loggedBy: data?.loggedBy ?? milestone.loggedBy,
        milestoneId: milestone.id,
        milestoneUUID: milestone.milestoneId,
        isOptionalMilestone: false,
        caseId,
        createdAt:
          data?.createdAt ??
          revisions[0]?.createdAt ??
          milestone.completedTimestamp,
      });

      // Handling for Room Clean milestone
      if (
        milestone.displayName === MILESTONE_TRACKER_STEPS.ROOM_CLEAN &&
        revisions.length > 0
      ) {
        const roomCleanMilestones = [];

        // Filter revisions with unique milestoneStartTime
        const roomCleanStartRevision = revisions.filter(
          revision => revision.action === 'start',
        );

        // Filter revisions with unique milestoneEndTime
        const roomCleanEndRevision = revisions.filter(
          revision => revision.action === 'end',
        );

        const latestRoomCleanStartRevision = roomCleanStartRevision?.at(-1);
        const latestRoomCleanEndRevision = roomCleanEndRevision?.at(-1);
        if (latestRoomCleanStartRevision) {
          // Revision for Room Clean Start
          roomCleanMilestones.push(
            createMilestoneObject({
              title: Strings.Room_Clean_Start,
              revision: roomCleanStartRevision,
              timestamp: latestRoomCleanStartRevision.milestoneStartTime,
              loggedBy:
                latestRoomCleanStartRevision.startTimeLoggedBy ||
                milestone.loggedBy,
              createdAt:
                roomCleanStartRevision[0]?.createdAt ??
                latestRoomCleanStartRevision.milestoneStartTime,
            }),
          );
        }
        if (latestRoomCleanEndRevision) {
          // Revision for Room Clean ENd
          roomCleanMilestones.push(
            createMilestoneObject({
              title: Strings.Room_Clean_End,
              revision: roomCleanEndRevision,
              timestamp: latestRoomCleanEndRevision.milestoneEndTime,
              loggedBy:
                latestRoomCleanEndRevision.endTimeLoggedBy ||
                milestone.loggedBy,
              createdAt:
                roomCleanEndRevision[0]?.createdAt ??
                latestRoomCleanEndRevision.milestoneEndTime,
            }),
          );
        }

        return roomCleanMilestones.length > 0
          ? roomCleanMilestones
          : createMilestoneObject();
      }

      return createMilestoneObject();
    }) ?? [];

  const voiceNotesList: Array<VOICE_NOTE_TIMELINE> =
    caseNotes?.map(caseNote => ({
      type: CASE_TIMELINE_TYPE.VOICE_NOTE,
      id: caseNote?.id,
      note: caseNote.note,
      timestamp: caseNote.timestamp,
      updatedAt: caseNote.updatedAt,
      loggedBy: caseNote.loggedBy,
      classifications: caseNote?.classifications,
      caseId,
      createdAt: caseNote.timestamp,
    })) ?? [];

  const timerNotesList: Array<TIMER_TIMELINE> =
    timers?.flatMap(({timerlogs, description, duration, createdAt}) =>
      timerlogs?.map(log => {
        const {userName, timestamp, id, newStatus, metaData, timerId} =
          log ?? {};

        return {
          type: CASE_TIMELINE_TYPE.TIMER,
          id,
          timerId,
          timerCreatedAt: createdAt,
          title: getTimerTitle(newStatus, metaData?.action),
          timestamp,
          loggedBy: userName,
          desc: description,
          duration: stringToNumber(duration),
          caseId,
          action: metaData?.action,
          createdAt: timestamp,
        };
      }),
    ) ?? [];

  const notificationNotesList: Array<NOTIFICATION_TIMELINE> =
    notifications?.map(
      ({
        id,
        recipientType,
        recipients,
        createdAt,
        message,
        loggedBy,
        recipientValue,
      }) => {
        let sendTo: string;
        if (recipientType === NOTIFICATION_RECIPIENT_TYPE.USER) {
          const userName = recipients[0]?.userName || '';
          const additionalRecipients =
            recipients.length > 1 ? ` and ${recipients.length - 1} more.` : '';
          sendTo = userName + additionalRecipients;
        } else {
          sendTo = recipientValue;
        }
        return {
          type: CASE_TIMELINE_TYPE.NOTIFICATION,
          id,
          sendTo,
          createdAt,
          message,
          loggedBy,
        };
      },
    ) ?? [];

  const optionalMileStonesList: Array<MILESTONE_TIMELINE> = useMemo(() => {
    return (
      procedure?.optionalMilestones
        ?.map(milestone => {
          return {
            type: CASE_TIMELINE_TYPE.MILESTONE as const,
            title: milestone.displayName,
            revision: milestone.revisions,
            timestamp: milestone.completedTimestamp,
            loggedBy: milestone.loggedBy,
            milestoneId: milestone.id,
            milestoneUUID: milestone.milestoneId,
            isOptionalMilestone: true,
            caseId,
            createdAt:
              milestone.revisions[0]?.createdAt ?? milestone.completedTimestamp,
            order: milestone.order,
          };
        })
        ?.sort((a, b) => {
          if (!a.order || !b.order) {
            return 0;
          }
          return a.order - b.order;
        }) ?? []
    );
  }, [procedure?.optionalMilestones, caseId]);

  const caseTimelineData = [
    ...milestonesList,
    ...voiceNotesList,
    ...timerNotesList,
    ...notificationNotesList,
  ].sort((a, b) => {
    const getTimestamp = (item: CASE_TIMELINE_ITEM) =>
      new Date(item.createdAt).getTime();

    return getTimestamp(a) - getTimestamp(b);
  });

  useEventEmitter(
    SAVE_AND_MOVE_NEXT_TIMELINE_EVENT,
    (indx: number, isOptMilestone?: boolean) => {
      setTimelineItemDetails({
        timelineItemIndex: indx,
        isOptionalMilestone: isOptMilestone,
      });
    },
  );

  const openCaseRevisions = (item: CASE_TIMELINE_ITEM) => {
    if (item?.type === CASE_TIMELINE_TYPE.MILESTONE) {
      toggleSubmitedCaseRevisionsModal({
        revisions: item?.revision ?? [],
        milestoneId: item?.milestoneUUID,
        milestoneName: item.title,
      });
    }
  };

  const onDetailHeaderBtnPress = () => {
    if (isEditEnabled) {
      setIsEditEnabled(false);
    } else {
      setIsEditEnabled(true);
    }
  };

  // used to handle the save and move next timeline event
  const handleSaveAndMoveNext = useCallback(
    (currentTimelineItemDetail: {
      timelineItemIndex: number;
      isOptionalMilestone?: boolean;
    }) => {
      const {timelineItemIndex, isOptionalMilestone} =
        currentTimelineItemDetail;

      const nextTimelineIndex = timelineItemIndex + 1;

      if (isOptionalMilestone) {
        const nextTimelineItem = optionalMileStonesList[nextTimelineIndex];
        if (nextTimelineItem) {
          toggleEditMilestoneTimeModal({
            isVisible: true,
            caseId,
            milestoneId: nextTimelineItem?.milestoneId,
            milestoneName: nextTimelineItem?.title,
            milestoneUUID: nextTimelineItem?.milestoneUUID,
            timelineItemIndex: nextTimelineIndex,
            isOptionalMilestone: nextTimelineItem?.isOptionalMilestone,
            revision: nextTimelineItem?.revision,
          });
        }
        return;
      }

      if (nextTimelineIndex < caseTimelineData.length) {
        const nextTimelineItem = caseTimelineData[nextTimelineIndex];
        switch (nextTimelineItem?.type) {
          case CASE_TIMELINE_TYPE.MILESTONE:
            toggleEditMilestoneTimeModal({
              isVisible: true,
              caseId,
              milestoneId: nextTimelineItem?.milestoneId,
              milestoneName: nextTimelineItem?.title,
              milestoneUUID: nextTimelineItem?.milestoneUUID,
              timelineItemIndex: nextTimelineIndex,
              isOptionalMilestone: nextTimelineItem?.isOptionalMilestone,
              revision: nextTimelineItem?.revision,
            });
            break;
          case CASE_TIMELINE_TYPE.VOICE_NOTE:
            toggleEditVoiceNoteModal({
              isVisible: true,
              caseId,
              voiceNote: nextTimelineItem,
              timelineItemIndex: nextTimelineIndex,
            });
            break;
          case CASE_TIMELINE_TYPE.TIMER:
            toggleEditTimerLabelModal({
              isVisible: true,
              caseId,
              timerId: nextTimelineItem?.timerId,
              description: nextTimelineItem?.desc,
              timerDuration: nextTimelineItem?.duration,
              timerCreatedAt: nextTimelineItem?.timerCreatedAt,
              timelineItemIndex: nextTimelineIndex,
            });
            break;
          default:
            break;
        }
        return;
      }

      if (nextTimelineIndex === caseTimelineData.length) {
        toggleEditCaseCommentModal({
          isVisible: true,
          caseId,
          comments,
          timelineItemIndex: nextTimelineIndex,
        });
      }

      setTimelineItemDetails(null);
    },
    [caseTimelineData, caseId, comments, optionalMileStonesList],
  );

  useEffect(() => {
    if (timelineItemDetails !== null) {
      handleSaveAndMoveNext(timelineItemDetails);
    }
  }, [timelineItemDetails, handleSaveAndMoveNext]);

  const isBeforeDayEnd: boolean = useMemo(() => {
    return !!(actualEndTime && checkIsBeforeDayEnd(actualEndTime));
  }, [actualEndTime]);

  useEffect(() => {
    if (isEdit && isBeforeDayEnd) {
      setIsEditEnabled(true);
    }
  }, [isBeforeDayEnd, isEdit]);

  return isCaseDetailLoading ? (
    <View style={globalStyles.colCenter}>
      <ActivityIndicator size="large" />
    </View>
  ) : (
    <View style={styles.container}>
      <CaseDetailHeader
        mrn={patient?.mrn}
        surgeon={assignedSurgeon}
        procedureName={procedure?.name}
        onBtnPress={onDetailHeaderBtnPress}
        isEditEnabled={isEditEnabled}
        isBeforeDayEnd={isBeforeDayEnd}
      />
      <ScrollView contentContainerStyle={styles.rowContainer}>
        {/* Left Block */}
        <View style={styles.box}>
          {/* Milestones */}
          <Text style={styles.title}>{Strings.milestones}</Text>
          <CaseTimeline
            data={caseTimelineData}
            onRevisionPress={openCaseRevisions}
            isEditEnabled={isEditEnabled}
          />
        </View>
        {/* Right Block */}
        <View style={globalStyles.flex1}>
          {/* Comments */}
          <Text style={styles.title}>{Strings.comments}</Text>
          <TouchableOpacity
            disabled={!isEditEnabled}
            onPress={() => {
              toggleEditCaseCommentModal({
                caseId,
                comments,
                timelineItemIndex: caseTimelineData.length,
              });
            }}
            style={[
              styles.borderTextBox,
              isEditEnabled && {
                borderColor: colors.foreground.inactive,
              },
            ]}>
            <Text style={styles.commentText}>{comments}</Text>
          </TouchableOpacity>
          {/* Additional Milestones */}
          <View style={styles.box}>
            <Text style={styles.title}>{Strings.Additional_Milestones}</Text>
            <CaseTimeline
              data={optionalMileStonesList}
              onRevisionPress={openCaseRevisions}
              hideLine
              isEditEnabled={isEditEnabled}
            />
          </View>
        </View>
      </ScrollView>
      <SubmitedCaseRevisionsModal />
      <EditMilestoneTimeModal />
      <EditVoiceNoteModal />
      <EditCaseCommentModal />
      <EditTimerLabelModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    paddingHorizontal: scaler(16),
    borderBottomColor: 'gray',
    flex: 1,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: scaler(12),
    paddingHorizontal: scaler(10),
    paddingVertical: scaler(32),
    flexGrow: 1,
  },
  box: {
    flex: 1,
    marginHorizontal: scaler(5),
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  title: {
    color: '#000',
    fontSize: scaler(18),
    fontWeight: 'bold',
    marginBottom: scaler(24),
  },
  commentText: {
    color: '#000',
  },
  borderTextBox: {
    borderWidth: scaler(1),
    borderRadius: scaler(4),
    borderColor: 'transparent',
    paddingVertical: scaler(4),
    paddingHorizontal: scaler(8),
    minHeight: scaler(80),
    marginLeft: scaler(-8),
    marginTop: scaler(-4),
    marginBottom: scaler(12),
    marginRight: scaler(88),
  },
});
