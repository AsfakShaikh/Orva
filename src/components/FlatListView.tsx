import {
  FlatList,
  FlatListProps,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import React, {forwardRef} from 'react';
import {globalStyles} from '@styles/GlobalStyles';
import scaler from '@utils/Scaler';
import {ActivityIndicator, useTheme} from 'react-native-paper';

export type FlatListViewProps = {
  isLoading?: boolean;
  viewProps?: StyleProp<ViewStyle>;
  testID?: string;
  itemSeperatorSize?: number;
} & FlatListProps<any>;

function FlatListView(Props: FlatListViewProps, ref: any) {
  const {isLoading, testID, viewProps, itemSeperatorSize, ...rest} = Props;
  const {colors} = useTheme();
  return isLoading ? (
    <View style={globalStyles.fullFlexLoader}>
      <ActivityIndicator
        size={scaler(36)}
        animating={true}
        color={colors.primary}
      />
    </View>
  ) : (
    <View style={viewProps}>
      <FlatList
        ref={ref}
        testID={testID}
        initialNumToRender={10}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => ItemSeperator(itemSeperatorSize)}
        {...rest}
      />
    </View>
  );
}
function ItemSeperator(itemSeperatorSize: number = scaler(10)) {
  return <View style={{width: itemSeperatorSize, height: itemSeperatorSize}} />;
}
export default forwardRef(FlatListView);
