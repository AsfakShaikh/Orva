import React, {
  useState,
  useCallback,
  useMemo,
  ReactElement,
  useEffect,
} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  Keyboard,
} from 'react-native';
import {
  TextInput,
  useTheme,
  ActivityIndicator,
  Text,
  HelperText,
} from 'react-native-paper';
import {Control, Controller} from 'react-hook-form';
import scaler, {screenHeight, screenWidth} from '@utils/Scaler';
import useDebounce from '@hooks/useDebounce';
import {Strings} from '@locales/Localization';
import {theme} from '@styles/Theme';
import Modal from './Modal';

type Option = {
  key: string;
  value: string | number;
};

type DropdownSelectProps = Readonly<{
  control: Control<any>;
  name: string;
  label: string;
  options: Option[];
  isLoading?: boolean;
  style?: any;
  searchPlaceholder?: string;
  error?: string;
  rules?: any;
  OptionEmptyComponent?: ReactElement;
  enableDynamicSearch?: boolean;
  onSearch?: (text: string) => void;
  searchValue?: string;
}>;

const {colors} = theme;

export default function DropdownSelect({
  control,
  name,
  label,
  options,
  isLoading = false,
  style,
  searchPlaceholder = 'Search...',
  error,
  rules,
  OptionEmptyComponent,
  enableDynamicSearch = false,
  onSearch,
  searchValue,
}: DropdownSelectProps) {
  const {colors: themeColors} = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSearch = useDebounce(searchQuery, 300);

  const finalOptionsList = useMemo(() => {
    if (enableDynamicSearch) {
      return options;
    }
    if (!debouncedSearch.toString().trim()) {
      return options;
    }
    const query = debouncedSearch.toString().toLowerCase().trim();
    return options.filter(option =>
      option.key.toString().toLowerCase().includes(query),
    );
  }, [enableDynamicSearch, debouncedSearch, options]);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    setIsVisible(false);
    setSearchQuery('');
  }, []);

  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedSearch.toString());
    }
  }, [debouncedSearch, onSearch]);

  useEffect(() => {
    if (searchValue !== undefined) {
      setSearchQuery(searchValue);
    }
  }, [searchValue]);

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({field: {value, onChange}, fieldState}) => {
        const selectedOption = options.find(opt => opt.value === value);
        const errorMessage = fieldState?.error?.message || error;

        return (
          <View style={[styles.container, style]}>
            <TouchableOpacity
              onPress={() => setIsVisible(true)}
              activeOpacity={0.7}>
              <TextInput
                mode="outlined"
                label={label}
                value={selectedOption?.key.toString() || ''}
                editable={false}
                error={!!errorMessage}
                style={styles.input}
                selection={{start: 0, end: 0}}
                right={
                  <TextInput.Icon
                    icon={isVisible ? 'menu-up' : 'menu-down'}
                    onPress={() => setIsVisible(!isVisible)}
                  />
                }
              />
            </TouchableOpacity>

            {!!errorMessage && (
              <HelperText type="error" visible={!!errorMessage}>
                {errorMessage}
              </HelperText>
            )}

            <Modal
              visible={isVisible}
              onBackdropPress={() => {
                setIsVisible(false);
                setSearchQuery('');
              }}>
              <View style={styles.dropdownContainer}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                  mode="outlined"
                  left={<TextInput.Icon icon="magnify" />}
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChangeText={text => {
                    setSearchQuery(text);
                  }}
                  dense
                  style={styles.searchInput}
                  autoFocus
                />

                {isLoading ? (
                  <ActivityIndicator style={styles.loader} />
                ) : (
                  <FlatList
                    data={finalOptionsList}
                    keyExtractor={(item, index) => `${item.value}_${index}`}
                    renderItem={({item}) => (
                      <TouchableOpacity
                        style={[
                          styles.optionItem,
                          value === item.value && styles.selectedItem,
                        ]}
                        onPress={() => {
                          onChange(item.value);
                          handleClose();
                        }}>
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.optionText,
                            value === item.value && {
                              color: themeColors.primary,
                            },
                          ]}>
                          {item.key}
                        </Text>
                      </TouchableOpacity>
                    )}
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                      OptionEmptyComponent ?? (
                        <Text style={styles.emptyText}>
                          {Strings.No_record_found}
                        </Text>
                      )
                    }
                  />
                )}
              </View>
            </Modal>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 1,
  },
  input: {
    backgroundColor: 'transparent',
  },
  dropdownContainer: {
    width: screenWidth * 0.35,
    backgroundColor: colors.background.primary,
    borderRadius: scaler(8),
    padding: scaler(16),
    elevation: 8,
    shadowColor: colors.foreground.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: 'transparent',
    marginBottom: scaler(8),
  },
  list: {
    maxHeight: screenHeight * 0.35,
    minHeight: screenHeight * 0.15,
  },
  listContent: {
    flexGrow: 0,
  },
  optionItem: {
    padding: scaler(12),
    borderRadius: 4,
  },
  selectedItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  optionText: {
    fontSize: 16,
  },
  loader: {
    margin: scaler(16),
  },
  emptyText: {
    marginTop: scaler(32),
    textAlign: 'center',
    color: 'rgba(0, 0, 0, 0.6)',
  },
  label: {
    fontSize: scaler(18),
    fontWeight: '600',
    marginBottom: scaler(6),
    color: colors.onSurface,
  },
});
