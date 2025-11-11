import {CASE_TIMELINE_ITEM} from '@screens/SubmitedCases/CaseDetailScreen';
import React from 'react';
import MilestoneTimeline from './MilestoneTimeline';
import {CASE_TIMELINE_TYPE} from '../Types/CommonTypes';
import {View} from 'react-native';
import {globalStyles} from '@styles/GlobalStyles';
import VoiceNoteTimeline from './VoiceNoteTimeline';
import TimerNoteTimeline from './TimerNoteTimeline';
import NotificationNoteTimeline from './NotificationNoteTimeline';

interface CaseTimelineProps {
  data?: Array<CASE_TIMELINE_ITEM>;
  hideLine?: boolean;
  onRevisionPress?: (item: CASE_TIMELINE_ITEM) => void;
  isEditEnabled?: boolean;
}

const CaseTimeline = ({
  data = [],
  hideLine = false,
  onRevisionPress,
  isEditEnabled = false,
}: CaseTimelineProps) => {
  return (
    <View style={globalStyles.fullWidth}>
      {data.map((item, index) => {
        switch (item.type) {
          case CASE_TIMELINE_TYPE.MILESTONE:
            return (
              <MilestoneTimeline
                index={index}
                key={item.milestoneUUID + index}
                item={item}
                hideLine={hideLine}
                isNotLast={index !== data.length - 1}
                onRevisionPress={onRevisionPress}
                isEditEnabled={isEditEnabled}
              />
            );
          case CASE_TIMELINE_TYPE.VOICE_NOTE:
            return (
              <VoiceNoteTimeline
                index={index}
                key={item.id}
                item={item}
                hideLine={hideLine}
                isNotLast={index !== data.length - 1}
                isEditEnabled={isEditEnabled}
              />
            );
          case CASE_TIMELINE_TYPE.TIMER:
            return (
              <TimerNoteTimeline
                index={index}
                key={item.id}
                item={item}
                hideLine={hideLine}
                isNotLast={index !== data.length - 1}
                isEditEnabled={isEditEnabled}
              />
            );
          case CASE_TIMELINE_TYPE.NOTIFICATION:
            return (
              <NotificationNoteTimeline
                key={item.id}
                item={item}
                hideLine={hideLine}
                isNotLast={index !== data.length - 1}
                isEditEnabled={false}
              />
            );
          default:
            return null;
        }
      })}
    </View>
  );
};

export default CaseTimeline;
