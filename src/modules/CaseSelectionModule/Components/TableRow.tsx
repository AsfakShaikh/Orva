import {StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import scaler from '@utils/Scaler';
import {CASE_STATUS, HEADER_ARRAY} from '../Types/CommonTypes';
import CaseMenu from './CaseMenu';
import TableCell from './TableCell';
import {Icon, Text, IconButton} from 'react-native-paper';
import {theme} from '@styles/Theme';
import formatDateTime from '@helpers/formatDateTime';
import {differenceInMinutes} from 'date-fns';

export enum TABLE_ROW_ACTION_ENUM {
  MENU,
  EYE,
}

type TableRowProps = Readonly<{
  item: any;
  index: number;
  headersArr: HEADER_ARRAY;
  selectedHeaders: Array<number>;
  onPress?: () => void;
  actionType?: TABLE_ROW_ACTION_ENUM;
  onViewDetails?: (caseDetail: any) => void;
}>;

export default function TableRow({
  item,
  index,
  headersArr,
  selectedHeaders,
  onPress,
  actionType = TABLE_ROW_ACTION_ENUM.MENU,
  onViewDetails,
}: TableRowProps) {
  const isSubmitedCases = item?.status === CASE_STATUS.SUBMITTED;
  return (
    <TouchableOpacity
      style={[
        styles.tableRow,
        index % 2 === 0 ? styles.evenTableRow : styles.oddTableRow,
        {
          borderBottomColor: isSubmitedCases
            ? colors.foreground.inverted
            : colors.foreground.inactive,
        },
      ]}
      onPress={onPress}>
      {headersArr?.map((headerItem, indx) => {
        const {key, flex, position} = headerItem ?? {};

        if (!selectedHeaders.includes(indx)) {
          return null;
        }

        const renderCellContent = () => {
          let title = item?.[key];
          let subTitle;

          if (typeof item?.[key] === 'object') {
            title = item?.[key]?.title;
            subTitle = item?.[key]?.subTitle;
          }

          if (key === 'missingMandatoryData' && item?.[key]) {
            return (
              <Icon
                source={'alert-circle'}
                size={scaler(16)}
                color={colors.foreground.warning}
              />
            );
          }

          if (key === 'schedule' && item?.status === CASE_STATUS.SUBMITTED) {
            subTitle = renderScheduleSubtitle();
          }

          return (
            <>
              <Text variant="bodyLarge" numberOfLines={1}>
                {title ?? subTitle ?? '--'}
              </Text>
              {title && subTitle && (
                <Text variant="bodySmall" numberOfLines={1}>
                  {subTitle}
                </Text>
              )}
            </>
          );
        };

        const renderScheduleSubtitle = () => {
          const {endTime, startTime, actualStartTime, actualEndTime} =
            item ?? {};

          const timeDiffs = {
            start:
              startTime && actualStartTime
                ? differenceInMinutes(actualStartTime, startTime)
                : 0,
            end:
              endTime && actualEndTime
                ? differenceInMinutes(actualEndTime, endTime)
                : 0,
          };

          const formattedTimes = {
            start: formatDateTime(actualStartTime),
            end: formatDateTime(actualEndTime),
          };

          const timeDiffDisplay = (() => {
            if (timeDiffs.end === 0) {
              return '';
            }
            const sign = timeDiffs.end > 0 ? '+' : '';
            return ` (${sign}${timeDiffs.end})`;
          })();

          const getTimeDiffStyle = (diff: number) => {
            if (diff > 5) {
              return styles.attentionText;
            }
            return styles.progressText;
          };

          return (
            <Text variant="bodySmall" style={styles.progressText}>
              <Text style={getTimeDiffStyle(timeDiffs.start)}>
                {`${formattedTimes.start} - `}
              </Text>
              <Text style={getTimeDiffStyle(timeDiffs.end)}>
                {`${formattedTimes.end}${timeDiffDisplay}`}
              </Text>
            </Text>
          );
        };

        return (
          <TableCell
            key={key}
            containerStyle={{
              alignItems: position,
              flex: flex ?? 1,
            }}>
            {renderCellContent()}
          </TableCell>
        );
      })}
      <TableCell containerStyle={styles.caseMenuCell}>
        {actionType === TABLE_ROW_ACTION_ENUM.EYE ? (
          <IconButton
            onPress={() => onViewDetails?.(item?.caseDetail ?? item)}
            style={{
              borderRadius: scaler(8),
              backgroundColor: colors.background.secondary,
              margin: scaler(0),
            }}
            mode="contained"
            icon="eye"
            size={scaler(16)}
            iconColor={colors.foreground.primary}
          />
        ) : (
          <CaseMenu caseDetail={item?.caseDetail ?? item} />
        )}
      </TableCell>
    </TouchableOpacity>
  );
}

const {colors} = theme;

const styles = StyleSheet.create({
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: scaler(64),
    paddingHorizontal: scaler(16),
    borderBottomWidth: scaler(1),
    gap: scaler(32),
  },

  progressText: {
    color: colors.foreground.progress,
  },
  attentionText: {
    color: colors.foreground.attention,
  },
  evenTableRow: {
    backgroundColor: colors.background.primary,
  },
  oddTableRow: {
    backgroundColor: colors.background.navigation,
  },
  caseMenuCell: {
    flex: 0,
    alignItems: 'center',
  },
});
