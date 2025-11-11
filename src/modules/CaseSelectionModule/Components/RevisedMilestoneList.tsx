import {View} from 'react-native';
import React, {useMemo} from 'react';
import scaler from '@utils/Scaler';
import {Strings} from '@locales/Localization';
import {Text} from 'react-native-paper';
import {theme} from '@styles/Theme';
import formatDateTime, {FORMAT_DATE_TYPE} from '@helpers/formatDateTime';
import {OPTIONAL_REVISION, REVISION} from '../Types/CommonTypes';
import FlatListView from '@components/FlatListView';

type RevisedMilestoneListProps = Readonly<{
  currentMilestoneRevisons?: Array<REVISION | OPTIONAL_REVISION>;
}>;

const {colors} = theme;

export default function RevisedMilestoneList(Props: RevisedMilestoneListProps) {
  const {currentMilestoneRevisons = []} = Props;

  const revision = useMemo(() => {
    return currentMilestoneRevisons?.slice(1);
  }, [currentMilestoneRevisons]);

  return (
    <View style={{marginVertical: scaler(24)}}>
      <FlatListView
        data={revision}
        renderItem={({item}) => {
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
              key={item?.milestoneUUID}
              style={{
                fontSize: scaler(13),
                color: colors?.foreground.secondary,
              }}>
              <Text
                style={{
                  fontSize: scaler(16),
                  color: colors?.foreground.primary,
                }}>
                {formatDateTime(time, FORMAT_DATE_TYPE.LOCAL, 'HH:mm')}
              </Text>
              {`    ${Strings.Revised_by} ${name} ${
                Strings.at
              } ${formatDateTime(
                item.createdAt,
                FORMAT_DATE_TYPE.LOCAL,
                'hh:mm aaa',
              )}`}
            </Text>
          );
        }}
        ListEmptyComponent={
          <Text
            style={{color: colors?.foreground.inactive, fontSize: scaler(16)}}>
            {Strings.No_revisions_yet}
          </Text>
        }
        itemSeperatorSize={scaler(14)}
      />
    </View>
  );
}
