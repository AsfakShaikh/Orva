// ExpandableList.tsx
import Button from '@components/Button';
import InputCheckbox from '@components/InputCheckbox';
import scaler from '@utils/Scaler';
import React, {useState} from 'react';
import {Control, useWatch} from 'react-hook-form';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {toggleDeleteDocumentationModal} from './DeleteDocumentationModal';
import {toggleViewTranscriptModal} from './ViewTranscriptModal';
import {Strings} from '@locales/Localization';
import {theme} from '@styles/Theme';

const {colors} = theme;

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface ItemProps {
  title: string;
  status?: string;
  entries?: number;
  expandData?: Array<{}>;
  control: Control<any>;
  index: number;
}

const ExpandableRow: React.FC<ItemProps> = ({
  title,
  status,
  entries,
  expandData,
  control,
  index,
}) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const watchedItems = useWatch({
    control,
    name: `items.${index}.data`,
  });

  const renderBadge = () => {
    if (entries) {
      return (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{entries}</Text>
        </View>
      );
    }
    if (status) {
      return (
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View
      style={[
        styles.container,
        expanded ? {paddingTop: scaler(10)} : {paddingVertical: scaler(10)},
      ]}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpand}
        activeOpacity={0.8}>
        <View style={styles.leftSection}>
          <Text style={styles.title}>{title}</Text>
        </View>

        <View style={styles.rightSection}>
          <View style={styles.columnText}>{renderBadge()}</View>
          <Text style={styles.columnText}>{Strings.Entry}</Text>
          <Text style={styles.columnText}>{Strings.Timestamp}</Text>
          <Text style={styles.columnText}>{Strings.Confidence}</Text>
          <Text style={styles.columnText}>{Strings.Actions}</Text>
        </View>

        <Icon
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={scaler(22)}
          color={colors.foreground.secondary}
          style={{marginLeft: scaler(6), paddingHorizontal: scaler(12)}}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedContainer}>
          <View style={styles.dividerLine} />
          {expandData && expandData?.length > 0 ? (
            expandData?.map((item: any, i: number) => {
              const isChecked = watchedItems?.[i]?.checked;
              return (
                <View
                  key={item?.id}
                  style={[
                    styles.dataRow,
                    {
                      backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F7F7F7',
                      borderBottomWidth: scaler(1),
                      borderBottomColor: '#EEEEEE',
                      borderBottomRightRadius:
                        expandData?.length == i + 1 ? scaler(10) : 0,
                      borderBottomLeftRadius:
                        expandData?.length == i + 1 ? scaler(10) : 0,
                    },
                  ]}>
                  <View style={{flex: 1.5}}>
                    <Text style={styles.rowLabel}>{item.label}</Text>
                  </View>
                  <View style={{flex: 1.5}}></View>

                  <View style={{flex: 1, alignItems: 'center'}}>
                    <InputCheckbox
                      control={control}
                      name={`items.${index}.data.${i}.checked`}
                      label=""
                    />
                  </View>

                  <View style={{flex: 1.5, alignItems: 'center'}}>
                    {item.timestamp ? (
                      <View
                        style={{
                          alignItems: 'flex-start',
                          marginLeft: scaler(18),
                        }}>
                        <Text style={styles.timestamp}>{item.timestamp}</Text>
                        <Text style={styles.subTimestamp}>{item.user}</Text>
                      </View>
                    ) : (
                      <Text style={styles.emptyText}>-</Text>
                    )}
                  </View>

                  <View style={{flex: 1, alignItems: 'center'}}>
                    <Text
                      style={[
                        styles.confidence,
                        {color: item.confidenceColor || '#000'},
                      ]}>
                      {item.confidence || '-'}
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 2.2,
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}>
                    <Button
                      disabled={!isChecked}
                      loading={false}
                      mode="outlined"
                      onPress={() =>
                        toggleViewTranscriptModal({text: item?.text})
                      }
                      style={{
                        marginHorizontal: scaler(16),
                        height: scaler(36),
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      {Strings.View_Transcript}
                    </Button>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      disabled={!isChecked}
                      key={`${item?.id}`}
                      onPress={() =>
                        toggleDeleteDocumentationModal({
                          documentationId: item?.id,
                        })
                      }>
                      <Icon
                        name="close-circle-outline"
                        size={36}
                        color="#B3261E"
                        style={{opacity: isChecked ? 1 : 0.4}}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : (
            <Text
              style={[
                styles.dataRow,
                {
                  borderBottomLeftRadius: 10,
                  borderBottomRightRadius: 10,
                  marginBottom: 10,
                },
              ]}>
              {Strings.No_Documentation_Data}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: scaler(10),
    marginVertical: scaler(6),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: scaler(16),
    fontWeight: '600',
    color: '#222',
  },
  countBadge: {
    backgroundColor: '#f2f0ff',
    borderRadius: scaler(12),
    paddingHorizontal: scaler(6),
    paddingVertical: scaler(2),
    marginLeft: scaler(6),
    alignSelf: 'flex-start',
    minWidth: scaler(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: '#7a5af8',
    fontWeight: '600',
    fontSize: scaler(12),
  },
  statusBadge: {
    backgroundColor: '#f0eaff',
    borderRadius: scaler(10),
    paddingHorizontal: scaler(10),
    marginLeft: scaler(8),
    alignSelf: 'flex-start',
    minWidth: scaler(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: '#7a5af8',
    fontSize: scaler(12),
  },
  content: {
    marginTop: scaler(10),
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  rowContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subText: {
    color: colors.foreground.secondary,
    fontSize: scaler(13),
    flex: 1,
    textAlign: 'center',
  },
  leftSection: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaler(12),
  },
  rightSection: {
    flex: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  columnText: {
    flex: 1,
    textAlign: 'left',
    color: colors.foreground.secondary,
    fontWeight: '500',
    fontSize: scaler(13),
  },
  expandedContainer: {
    paddingTop: scaler(6),
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaler(4),
    paddingHorizontal: scaler(12),
  },
  rowLabel: {
    fontSize: scaler(14),
    color: '#222',
  },
  timestamp: {
    fontSize: scaler(16),
    color: colors.foreground.primary,
  },
  subTimestamp: {
    fontSize: scaler(11),
    color: colors.foreground.primary,
  },
  emptyText: {
    color: '#aaa',
    fontSize: scaler(13),
  },
  confidence: {
    fontSize: scaler(13),
    fontWeight: '500',
  },
  actionText: {
    color: '#7a5af8',
    fontSize: scaler(12),
    fontWeight: '500',
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dividerLine: {
    height: scaler(2),
    backgroundColor: '#EEEEEE',
    marginVertical: scaler(6),
  },
});

export default ExpandableRow;
