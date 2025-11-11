import useAuthValue from '@modules/AuthModule/Hooks/useAuthValue';
import useGetOtsListQuery from '@modules/CaseSelectionModule/Hooks/useGetOtsListQuery';
import scaler from '@utils/Scaler';
import React, {useMemo, useState} from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';
import CaseboardOtCard from './CaseboardOtCard';
import FlatListView from '@components/FlatListView';
import useIdentifyCaseboardTimers from '../Hooks/useIdentityCaseboardTimers';
import useTrackerValue from '@modules/TrackerModule/Hooks/useTrackerValues';
import {globalStyles} from '@styles/GlobalStyles';

const OT_PER_PAGE = 6;
const ITEM_SEPERATOR_SIZE = scaler(16);

const CaseBoardCard = () => {
  const {hospitalId} = useAuthValue();
  const {isIdentifyingCaseboard} = useIdentifyCaseboardTimers();
  const {caseboardCurrentActiveCases} = useTrackerValue();
  const {data: otsListData, isLoading: isGettingOtsList} =
    useGetOtsListQuery(hospitalId);

  const [activePage, setActivePage] = useState(0);
  const [cardContainerWidth, setCardContainerWidth] = useState(0);

  const totalPages = useMemo(
    () =>
      otsListData?.length ? Math.ceil(otsListData?.length / OT_PER_PAGE) : 0,
    [otsListData?.length],
  );

  const OT_CARD_WIDTH =
    (cardContainerWidth - scaler(32)) / OT_PER_PAGE - scaler(16);
  const TOTAL_OT_CARD_WIDTH = OT_CARD_WIDTH + ITEM_SEPERATOR_SIZE;

  const PAGE_WIDTH = TOTAL_OT_CARD_WIDTH * OT_PER_PAGE;

  const handleSwipe = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const swippedOffSet = e.nativeEvent.contentOffset.x;
    const page = Math.ceil(swippedOffSet / PAGE_WIDTH);
    setActivePage(page);
  };

  const renderPaginationDots = () => {
    return (
      <View style={styles.paginationContainer}>
        {Array.from({length: totalPages}).map((_, i) => (
          <View
            key={`dot_page_${i + 1}`}
            style={[
              styles.paginationDot,
              activePage === i ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View
      onLayout={event => {
        setCardContainerWidth(event.nativeEvent.layout.width);
      }}
      style={[
        globalStyles.flex1,
        {
          marginTop: scaler(16),
        },
      ]}>
      <FlatListView
        viewProps={{paddingLeft: scaler(16), flex: 1}}
        isLoading={isGettingOtsList || isIdentifyingCaseboard}
        data={caseboardCurrentActiveCases}
        itemSeperatorSize={ITEM_SEPERATOR_SIZE}
        renderItem={({item}) => (
          <CaseboardOtCard otCaseDetail={item} otCardWidth={OT_CARD_WIDTH} />
        )}
        horizontal
        pagingEnabled
        getItemLayout={(_, index) => ({
          length: TOTAL_OT_CARD_WIDTH,
          offset: TOTAL_OT_CARD_WIDTH * index,
          index,
        })}
        snapToInterval={PAGE_WIDTH}
        ListFooterComponent={<View style={{width: scaler(16)}} />}
        initialScrollIndex={activePage}
        onMomentumScrollEnd={handleSwipe}
        scrollEventThrottle={0}
      />

      {!isGettingOtsList && totalPages > 1 && renderPaginationDots()}
    </View>
  );
};

export default CaseBoardCard;

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: scaler(8),
  },
  paginationDot: {
    height: scaler(8),
    width: scaler(8),
    borderRadius: scaler(4),
    marginHorizontal: scaler(4),
  },
  activeDot: {
    backgroundColor: 'black',
  },
  inactiveDot: {
    backgroundColor: 'lightgray',
  },
});
