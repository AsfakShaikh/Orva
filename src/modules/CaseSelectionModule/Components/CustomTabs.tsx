import scaler from '@utils/Scaler';
import React, { useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

const CustomTabs = ({ tabsArray, data, update, children, u }: any) => {
  const [activeTab, setActiveTab] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const Component: any = useMemo(
    () => tabsArray[activeTab]?.Tab,
    [activeTab, u],
  );
  const handleTabPress = (index: number) => {
    setActiveTab(index);

    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewOffset: 0.5,
    });
  };
  return (
    <>
      <View style={[styles.flatListV]}>
        <FlatList
          ref={flatListRef}
          data={tabsArray}
          nestedScrollEnabled
          renderItem={({ item, index }) => (
            <Pressable
              key={index}
              style={[
                activeTab === index && {
                  borderBottomColor: '#65558F',
                  borderBottomWidth: 2,
                  borderTopRightRadius: 100,
                  borderTopLeftRadius: 100,
                },
                {
                  paddingHorizontal: 20,
                  height: 41,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}
              onPress={() => handleTabPress(index)}>
              <Text
                style={{
                  fontSize: scaler(14),
                  fontWeight: '500',

                  color: index === activeTab ? '#65558F' : '#49454F',
                }}>
                {item?.name || ''}
              </Text>
            </Pressable>
          )}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <Component
        data={data}
        update={update}
        scrollToTop={() => {
          flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
        }}
      />
      {children}
    </>
  );
};

export default CustomTabs;

const styles = StyleSheet.create({
  flatListV: {
    width: '100%',
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
    borderBottomColor: '#E6E0E9',
    borderBottomWidth: 1,
  },
});
