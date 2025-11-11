import {StyleSheet, View} from 'react-native';
import React, {Dispatch, SetStateAction} from 'react';
import Icons from '@assets/Icons';
import CaseTableFilterMenu from './CaseTableFilterMenu';
import TableTitle from './TableTitle';
import scaler from '@utils/Scaler';
import {theme} from '@styles/Theme';
import {HEADER_ARRAY, SORT_DIRECTION} from '../Types/CommonTypes';

type TableHeaderProps = Readonly<{
  headersArr: HEADER_ARRAY;
  selectedHeaders: Array<number>;
  setSelectedHeaders: Dispatch<SetStateAction<Array<number>>>;
  sortKey?: string;
  setSortKey?: Dispatch<SetStateAction<string>>;
  sortDirection?: SORT_DIRECTION;
  setSortDirection?: Dispatch<SetStateAction<SORT_DIRECTION>>;
}>;

export default function TableHeader(Props: TableHeaderProps) {
  const {
    headersArr,
    selectedHeaders,
    setSelectedHeaders,
    sortKey,
    setSortKey,
    sortDirection,
    setSortDirection,
  } = Props;
  const {colors} = theme;
  const sortedSelectedHeaders = [...selectedHeaders].sort((a, b) => a - b);
  return (
    <View
      style={[styles.tableRow, {backgroundColor: colors.background.primary}]}>
      {sortedSelectedHeaders?.map((item, index) => {
        const headerItem = headersArr[item];
        const headerItemKey = headerItem?.key;
        const getSortIcon = () => {
          if (
            sortKey === headerItemKey &&
            sortDirection === SORT_DIRECTION.ASCENDING
          ) {
            return <Icons.SortAscending />;
          }
          if (
            sortKey === headerItemKey &&
            sortDirection === SORT_DIRECTION.DESCENDING
          ) {
            return <Icons.SortDescending />;
          }
          return <Icons.Sort />;
        };

        const onHeaderItemPress = () => {
          if (sortKey !== headerItemKey) {
            setSortKey?.(headerItemKey);
          }
          if (sortDirection === SORT_DIRECTION.ASCENDING) {
            setSortDirection?.(SORT_DIRECTION.DESCENDING);
          }
          if (sortDirection === SORT_DIRECTION.DESCENDING) {
            setSortDirection?.(SORT_DIRECTION.ASCENDING);
          }
        };

        return (
          <TableTitle
            onPress={onHeaderItemPress}
            key={item}
            title={headerItem?.value}
            rightIcon={
              index !== 0 && !headerItem?.sortableDisable && getSortIcon()
            }
            containerStyle={{
              flex: headerItem?.flex ?? 1,
              justifyContent: headerItem?.position,
            }}
          />
        );
      })}

      <TableTitle
        containerStyle={{
          flex: 0,
          justifyContent: 'center',
        }}>
        <CaseTableFilterMenu
          menuItemArr={headersArr}
          selectedMenuItem={selectedHeaders}
          setSelectedMenuItem={setSelectedHeaders}
        />
      </TableTitle>
    </View>
  );
}

const styles = StyleSheet.create({
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: scaler(64),
    paddingHorizontal: scaler(16),
    gap: scaler(32),
  },
});
