import React, {useState} from 'react';
import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';
import {View, StyleSheet} from 'react-native';
import {IconButton, Portal, Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useForm} from 'react-hook-form';
import {globalStyles} from '@styles/GlobalStyles';
import scaler from '@utils/Scaler';
import {theme} from '@styles/Theme';
import formatDateTime, {FORMAT_DATE_TYPE} from '@helpers/formatDateTime';
import {REVISION} from '../Types/CommonTypes';
import {Strings} from '@locales/Localization';
import getMilestoneDisplayName from '@modules/TrackerModule/Helpers/getMilestoneDisplayName';
const SUBMITTED_CASE_REVISIONS_EVENT = 'SUBMITTED_CASE_REVISIONS_EVENT';

export const toggleSubmitedCaseRevisionsModal = (data?: caseDetailRevision) => {
  emitEvent(SUBMITTED_CASE_REVISIONS_EVENT, data);
};
type caseDetailRevision = {
  revisions: Array<REVISION>;
  milestoneId: string;
  milestoneName: string;
};

export default function SubmitedCaseRevisionsModal() {
  const {colors} = theme;
  const {top} = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);

  const [caseDetail, setCaseDetail] = useState<caseDetailRevision>({
    revisions: [],
    milestoneId: '',
    milestoneName: '',
  });

  const {reset} = useForm({
    defaultValues: {
      revisedMilestoneTime: '',
    },
  });

  // Listen for SUBMITTED_CASE_REVISIONS_EVENT and update caseId
  useEventEmitter(SUBMITTED_CASE_REVISIONS_EVENT, data => {
    setVisible(prev => !prev);
    if (data) {
      setCaseDetail(data); // Update the caseId dynamically
    }
  });

  if (!visible) {
    return null;
  }

  return (
    <Portal>
      <View
        style={[
          globalStyles.blurView,
          {backgroundColor: colors.backdrop, marginTop: top},
        ]}>
        <View style={styles.container}>
          <View style={styles.subContainer}>
            <View>
              <View style={styles.header}>
                <Text variant="titleLarge" style={globalStyles.flex1}>
                  {`${
                    Strings.Milestone_Revisions_for
                  } ${getMilestoneDisplayName(caseDetail.milestoneName)}`}
                </Text>
                <IconButton
                  icon="close"
                  size={scaler(24)}
                  hitSlop={scaler(8)}
                  style={{
                    margin: scaler(0),
                    width: scaler(24),
                    height: scaler(28),
                  }}
                  onPress={() => {
                    reset();
                    setVisible(false);
                  }}
                />
              </View>
              {caseDetail.revisions?.map(item => {
                const isRoomCleanStart = item?.action === 'start';
                const isRoomCleanEnd = item?.action === 'end';
                const time = (() => {
                  if (isRoomCleanStart || isRoomCleanEnd) {
                    return item?.milestoneStartTime;
                  }
                  return item?.milestoneEndTime;
                })();

                const name = (() => {
                  if (isRoomCleanStart) {
                    return item?.startTimeLoggedBy;
                  }
                  if (isRoomCleanEnd) {
                    return item?.endTimeLoggedBy;
                  }
                  return item?.milestoneRevisedByUserName;
                })();
                return (
                  <Text
                    key={item?.id}
                    style={{
                      fontSize: scaler(13),
                      color: colors?.foreground.secondary,
                      marginBottom: scaler(14),
                    }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: scaler(16),
                        color: colors?.foreground.primary,
                      }}>
                      {formatDateTime(time, FORMAT_DATE_TYPE.LOCAL, 'HH:mm')}
                    </Text>
                    {`     Revised by ${name} at ${formatDateTime(
                      item?.createdAt,
                      FORMAT_DATE_TYPE.LOCAL,
                      'hh:mm aaa',
                    )}`}
                  </Text>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginVertical: scaler(24),
  },
  container: {
    backgroundColor: 'rgba(247, 242, 250, 1)',
    alignSelf: 'flex-end',
    width: scaler(486),
    flex: 1,
    borderRadius: scaler(16),
    paddingHorizontal: scaler(24),
  },
  subContainer: {
    flex: 1,
  },
});
