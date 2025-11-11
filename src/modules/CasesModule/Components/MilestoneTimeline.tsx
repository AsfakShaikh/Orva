import React, {FC, useMemo} from 'react';
import {MILESTONE_TIMELINE} from '@modules/CasesModule/Types/CommonTypes';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {globalStyles} from '@styles/GlobalStyles';
import scaler from '@utils/Scaler';
import {theme} from '@styles/Theme';
import formatDateTime, {FORMAT_DATE_TYPE} from '@helpers/formatDateTime';
import {CASE_TIMELINE_ITEM} from '@screens/SubmitedCases/CaseDetailScreen';
import {Icon, Text} from 'react-native-paper';
import {Strings} from '@locales/Localization';
import {toggleEditMilestoneTimeModal} from './EditMilestoneTimeModal';
import getMilestoneDisplayName from '@modules/TrackerModule/Helpers/getMilestoneDisplayName';

const {colors} = theme;

interface MilestoneTimelineProps {
  index?: number;
  item: MILESTONE_TIMELINE;
  hideLine?: boolean;
  isNotLast?: boolean;
  onRevisionPress?: (item: CASE_TIMELINE_ITEM) => void;
  isEditEnabled?: boolean;
}

const MilestoneTimeline: FC<MilestoneTimelineProps> = ({
  index,
  item,
  hideLine = false,
  isNotLast = false,
  onRevisionPress,
  isEditEnabled = false,
}) => {
  const {
    caseId,
    title,
    timestamp,
    loggedBy,
    revision = [],
    milestoneId,
    milestoneUUID,
    isOptionalMilestone,
  } = item;

  const revisionCount = useMemo(() => {
    return revision?.length - 1;
  }, [revision?.length]);

  return (
    <View style={globalStyles.row}>
      {!hideLine && (
        // eslint-disable-next-line react-native/no-inline-styles
        <View style={{alignItems: 'center', marginRight: scaler(16)}}>
          <Icon
            source="radiobox-marked"
            size={scaler(22)}
            color={colors.background.activity}
          />
          {isNotLast && <View style={styles.line} />}
        </View>
      )}
      <View
        style={[
          globalStyles.row,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            flex: 1,
            marginTop: scaler(-3),
            minHeight: scaler(88),
            marginBottom: isNotLast ? scaler(24) : 0,
          },
        ]}>
        <Text
          style={{
            width: scaler(180),
            fontSize: scaler(18),
          }}>
          {getMilestoneDisplayName(title)}
        </Text>

        <View
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            gap: scaler(4),
            flex: 1,
          }}>
          <TouchableOpacity
            disabled={!isEditEnabled}
            onPress={() => {
              toggleEditMilestoneTimeModal({
                caseId,
                milestoneId: milestoneId,
                milestoneName: title,
                timelineItemIndex: index,
                milestoneUUID: milestoneUUID,
                isOptionalMilestone,
                revision,
              });
            }}
            style={[
              styles.borderTextBox,
              isEditEnabled && {
                borderColor: colors.foreground.inactive,
              },
            ]}>
            <Text style={styles.timestampText}>
              {formatDateTime(timestamp, FORMAT_DATE_TYPE.LOCAL, 'hh:mm aaa')}
            </Text>
          </TouchableOpacity>
          <Text
            style={{
              fontSize: scaler(13),
            }}>{`${Strings.Logged_by} ${loggedBy}`}</Text>
          {revisionCount > 0 && (
            <Text
              onPress={() => onRevisionPress?.(item)}
              style={styles.revisionText}>
              {`${revisionCount} ${Strings.revision_logged}`}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  line: {
    width: scaler(4),
    backgroundColor: colors.background.activity,
    flex: 1,
  },
  revisionText: {
    fontSize: scaler(13),
    textDecorationLine: 'underline',
    color: colors.foreground.secondary,
  },
  timestampText: {
    fontWeight: '700',
    fontSize: scaler(16),
  },
  borderTextBox: {
    borderWidth: scaler(1),
    borderRadius: scaler(4),
    borderColor: 'transparent',
    paddingHorizontal: scaler(4),
    alignSelf: 'flex-start',
    marginLeft: scaler(-4),
  },
});

export default MilestoneTimeline;
