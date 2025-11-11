import {View, StyleSheet} from 'react-native';
import React, {useMemo} from 'react';
import {MILESTONE} from '@modules/CaseSelectionModule/Types/CommonTypes';
import {theme} from '@styles/Theme';
import formatDateTime, {FORMAT_DATE_TYPE} from '@helpers/formatDateTime';
import {Strings} from '@locales/Localization';
import {IconButton, Text} from 'react-native-paper';
import scaler from '@utils/Scaler';
import {globalStyles} from '@styles/GlobalStyles';
import {toggleRevisedMilestoneTimeModal} from '@modules/CaseSelectionModule/Components/RevisedMilestoneTimeModal';
import getMilestoneDisplayName from '../Helpers/getMilestoneDisplayName';

const {colors} = theme;

type CaseSummaryItemProps = Readonly<{
  mileStone: MILESTONE & {isOptionalMilestone?: boolean};
}>;

export default function CaseSummaryItem(Props: CaseSummaryItemProps) {
  const {mileStone} = Props ?? {};
  const {
    displayName,
    completedTimestamp,
    milestoneId,
    loggedBy,
    skipped,
    id,
    revisions,
    isOptionalMilestone = false,
  } = mileStone;

  const label =
    loggedBy && !skipped
      ? `${Strings.Logged_by} ${loggedBy}`
      : Strings.Awaiting_Completion;

  // Only enable revision for completed milestones (loggedBy), or for optional milestones
  const isRevisionEnabled = useMemo(
    () => (isOptionalMilestone ? true : !!loggedBy),
    [isOptionalMilestone, loggedBy],
  );

  const iconButtonStyle = useMemo(() => {
    if (isOptionalMilestone) {
      return styles.completedIconButton;
    }
    if (loggedBy) {
      return styles.completedIconButton;
    }
    return styles.disableIconButton;
  }, [isOptionalMilestone, loggedBy]);

  const revisionCount = useMemo(() => {
    return revisions?.length - 1;
  }, [revisions?.length]);

  const openRevisionModal = () => {
    toggleRevisedMilestoneTimeModal({
      isOptionalMilestone,
      milestoneId: id,
      milestoneUUID: milestoneId,
      milestoneName: displayName,
      milestoneRevisions: revisions,
      revisionCount: revisionCount,
    });
  };
  const milestoneTimestamp = useMemo(() => {
    if (!completedTimestamp) {
      return '--:--';
    }

    if (skipped && revisionCount === 0) {
      return '--:--';
    }

    return formatDateTime(
      completedTimestamp,
      FORMAT_DATE_TYPE.LOCAL,
      'hh:mm aaa',
    );
  }, [completedTimestamp, revisionCount, skipped]);

  return (
    <View style={styles.container}>
      <Text style={styles.milestoneTitle}>
        {getMilestoneDisplayName(displayName)}
      </Text>
      <View style={[globalStyles.flex1, {marginHorizontal: scaler(10)}]}>
        <Text numberOfLines={1} style={styles.completeTimeTest}>
          {milestoneTimestamp}
        </Text>
        <Text numberOfLines={1}>{label}</Text>
        {revisionCount > 0 && (
          <Text style={styles.revisionLoggedText} onPress={openRevisionModal}>
            {revisionCount} {Strings.revision_logged}
          </Text>
        )}
      </View>
      <IconButton
        onPress={isRevisionEnabled ? openRevisionModal : undefined}
        icon="plus"
        size={scaler(32)}
        mode={isRevisionEnabled ? 'outlined' : 'contained'}
        iconColor={
          isRevisionEnabled ? colors.primary : colors.foreground.inverted
        }
        style={[styles.iconButton, iconButtonStyle]}
        disabled={!isRevisionEnabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  completedIconButton: {borderColor: '#79747E'},
  activeIconButton: {backgroundColor: colors.primary},
  disableIconButton: {backgroundColor: '#1D1B201F'},
  iconButton: {
    borderRadius: scaler(8),
    margin: 0,
  },
  container: {
    flexDirection: 'row',
  },
  milestoneTitle: {fontSize: scaler(18), flex: 0.8},
  completeTimeTest: {
    fontSize: scaler(18),
    fontWeight: '700',
    marginBottom: scaler(4),
  },
  revisionLoggedText: {
    color: colors.foreground.secondary,
    fontSize: scaler(12),
    textDecorationLine: 'underline',
  },
});
