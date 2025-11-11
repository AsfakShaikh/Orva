import scaler from '@utils/Scaler';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  FlatList,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {theme} from '@styles/Theme';
import {IconButton} from 'react-native-paper';
import {Strings} from '@locales/Localization';
import FlatListView from '@components/FlatListView';
import SuggestedNote from './SuggestedNote';
import useGetVoiceNotesListQuery from '../Hooks/useGetVoiceNotesListQuery';
import useTrackerValue from '../Hooks/useTrackerValues';
import {SUGGESTED_NOTE} from '../Types/CommonTypes';
import SyncDocumentationIconButton from './SyncDocumentationIconButton';

const {colors} = theme;

const suggestionsList: Array<SUGGESTED_NOTE> = [
  {
    title: 'Anesthesia, Temperature and Position',
    description:
      'Patient in supine, pressure points padded, warm blanket in place',
    options: [
      {
        id: '',
        label: 'Anesthesia Type',
      },
      {
        id: '',
        label: 'Temperature Control',
      },
      {
        id: '',
        label: 'Patient Position',
      },
    ],
  },
  {
    title: 'Head, Eye, Arm',
    description:
      'Pillow under head, right eye taped and right arm across chest',
    options: [
      {
        id: '',
        label: 'Head Support',
      },
      {
        id: '',
        label: 'Eye',
      },
      {
        id: '',
        label: 'Arm Position',
      },
    ],
  },
  {
    title: 'Pressure Relief and DVT',
    description:
      'Pressure relief was gel mattress DVT prevention both legs thigh length with  SCO device right 40 mmHg setting',
    options: [
      {
        id: '',
        label: 'Pressure Relief',
      },
      {
        id: '',
        label: 'DVT Prevention',
      },
    ],
  },
  {
    title: 'Tourniquet, Energy Device and Catherisation',
    description:
      'Tourniquet applied on left calf at 12:20 with bipolar used and foley size 6',
    options: [
      {
        id: '',
        label: 'Tourniquet',
      },
      {
        id: '',
        label: 'Energy Device',
      },
      {
        id: '',
        label: 'Catheterization',
      },
    ],
  },
  {
    title: 'X-Ray, Wound and Skin Preperation',
    description:
      'C-Arm Xray used with contrast, wounds were clean and 0.9% saline used',
    options: [
      {
        id: '',
        label: 'X-Ray & Image',
      },
      {
        id: '',
        label: 'Wound Classification',
      },
      {
        id: '',
        label: 'Skin Preparation',
      },
    ],
  },
];

const SuggestedNotesList = () => {
  const {currentActiveCase} = useTrackerValue();

  const flatListRef = useRef<FlatList>(null);
  const [itemWidth, setItemWidth] = useState(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  const isFirst = currentItemIndex === 0;
  const isLast = currentItemIndex === suggestionsList.length - 1;

  const {data: voiceNotesListData} = useGetVoiceNotesListQuery(
    currentActiveCase?.id,
  );

  const voiceNotesList = useMemo(
    () =>
      voiceNotesListData
        ? voiceNotesListData?.filter(voiceNote => voiceNote?.active)
        : [],
    [voiceNotesListData],
  );

  const completedSuggestedNotes = useMemo(() => {
    return voiceNotesList?.reduce((acc: string[], voiceNote) => {
      voiceNote?.classifications?.forEach((classification: any) => {
        if (classification?.isEnabled && !acc.includes(classification.type)) {
          acc.push(classification.type);
        }
      });
      return acc;
    }, []);
  }, [voiceNotesList]);

  const onLayout = (event: LayoutChangeEvent) => {
    setItemWidth(event.nativeEvent.layout.width - scaler(32));
  };

  const handleScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / itemWidth);
    setCurrentItemIndex(index);
  };

  const scrollToNext = () => {
    flatListRef.current?.scrollToIndex({
      index: currentItemIndex + 1,
      animated: true,
    });
    setCurrentItemIndex(currentItemIndex + 1);
  };
  const scrollToPrevious = () => {
    flatListRef.current?.scrollToIndex({
      index: currentItemIndex - 1,
      animated: true,
    });
    setCurrentItemIndex(currentItemIndex - 1);
  };

  const handleAutoScroll = () => {
    const isAllCompleted = suggestionsList[currentItemIndex]?.options?.every(
      (option: any) => {
        return completedSuggestedNotes.includes(option?.label);
      },
    );
    if (isAllCompleted) {
      scrollToNext();
    }
  };

  useEffect(() => {
    handleAutoScroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedSuggestedNotes]);

  return (
    <View style={styles.container} onLayout={onLayout}>
      <View style={styles.header}>
        <Text style={styles.heading}>{Strings.Suggested_Voice_Notes}</Text>
        <SyncDocumentationIconButton />
        <IconButton
          disabled={isFirst}
          onPress={scrollToPrevious}
          icon="chevron-left"
          iconColor={colors.foreground.brand}
          size={scaler(28)}
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            marginHorizontal: 0,
            marginVertical: 0,
          }}
        />
        <IconButton
          disabled={isLast}
          onPress={scrollToNext}
          icon="chevron-right"
          iconColor={colors.foreground.brand}
          size={scaler(28)}
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            marginVertical: 0,
          }}
        />
      </View>
      <FlatListView
        ref={flatListRef}
        contentContainerStyle={{
          marginBottom: scaler(12),
        }}
        data={suggestionsList}
        horizontal={true}
        pagingEnabled
        renderItem={({item}) => {
          return (
            <SuggestedNote
              key={item?.title}
              width={itemWidth}
              item={item}
              completedSuggestedNotes={completedSuggestedNotes}
            />
          );
        }}
        itemSeperatorSize={0}
        onMomentumScrollEnd={handleScrollEnd}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 11,
    backgroundColor: 'rgba(254, 247, 255, 1)',
    borderRadius: scaler(16),
    padding: scaler(16),
    paddingTop: scaler(4),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: -scaler(16),
  },
  heading: {
    flex: 1,
    fontSize: scaler(18),
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: colors?.foreground.primary,
  },
});

export default SuggestedNotesList;
