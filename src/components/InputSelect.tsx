/* eslint-disable react-native/no-inline-styles */
import React, {FC, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  HelperText,
  Menu,
  TextInput,
  TextInputProps,
  Icon,
} from 'react-native-paper';
import {Control, Controller, RegisterOptions} from 'react-hook-form';
import {SELECT_OPTIONS} from '@utils/Types';
import {
  Keyboard,
  StyleProp,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native';
import scaler, {screenHeight} from '@utils/Scaler';
import {Strings} from '@locales/Localization';
import {translate} from '@helpers/translate';
import Body from './Body';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';
import mergeRefs from '@helpers/mergeRefs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {theme} from '@styles/Theme';
import InputSearch from './InputSearch';

const {colors, fonts} = theme;

export type InputSelectProps = {
  options: SELECT_OPTIONS;
  control: Control<any>;
  name: string;
  rules?: Omit<RegisterOptions, 'valueAsNumber' | 'valueAsDate' | 'setValueAs'>;
  isError?: boolean;
  isGettingOptions?: boolean;
  label?: string;
  selectedTrailingIcon?: IconSource;
  contentStyle?: StyleProp<ViewProps>;
  isLabelDefaultBehaviour?: boolean;
  isValueDisplay?: boolean;
  menuContainerWidth?: number;
  onSelect?: (val: any) => void;
  multiple?: boolean;
  searchEnabled?: boolean;
  searchPlaceholder?: string;
} & TextInputProps;

export default function InputSelect(Props: InputSelectProps) {
  const {
    control,
    name,
    rules,
    options,
    style,
    isError,
    isGettingOptions,
    label,
    selectedTrailingIcon,
    contentStyle,
    isLabelDefaultBehaviour = true,
    isValueDisplay = false,
    menuContainerWidth,
    onSelect,
    multiple = false,
    searchEnabled = false,
    searchPlaceholder,
    ...rest
  } = Props;

  const {top} = useSafeAreaInsets();
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>();
  const [menuWidth, setMenuWidth] = useState(321);

  const textInputRef = useRef<any>(null);

  const showMenu = () => {
    if (Keyboard.isVisible()) {
      setTimeout(() => setIsVisible(true), 400);
    } else {
      setIsVisible(true);
    }
    textInputRef?.current?.focus();
  };

  return (
    <Controller
      control={control}
      rules={rules}
      name={name}
      render={({field: {value, onChange, ref}, fieldState}) => {
        const errorMessage = fieldState?.error?.message;
        const selectedOption = multiple
          ? options?.filter(opt => value?.includes(opt.value))
          : options?.find(opt => opt.value === value);

        const fieldLabel = (() => {
          if (Array.isArray(selectedOption)) {
            return isValueDisplay
              ? selectedOption?.map(opt => opt.value?.toString()).join(',')
              : selectedOption?.map(opt => opt.key?.toString()).join(',');
          }
          return isValueDisplay
            ? selectedOption?.value?.toString()
            : selectedOption?.key?.toString();
        })();

        const hideLabel =
          !isLabelDefaultBehaviour &&
          !isVisible &&
          fieldLabel &&
          fieldLabel.length > 0;

        return (
          <Menu
            style={{
              width: menuContainerWidth ?? menuWidth,
            }}
            contentStyle={[
              {marginTop: top, paddingVertical: 0, overflow: 'hidden'},
              contentStyle,
            ]}
            visible={isVisible}
            onDismiss={() => {
              setIsVisible(false);
              (!fieldLabel || fieldLabel?.length === 0) &&
                textInputRef?.current?.blur();
            }}
            anchor={
              <TouchableOpacity
                onPressOut={showMenu}
                onLayout={event => {
                  const {width} = event.nativeEvent.layout;
                  setMenuWidth(width);
                }}>
                <View pointerEvents="none">
                  <TextInput
                    ref={mergeRefs(textInputRef, ref)}
                    mode="outlined"
                    value={isVisible && !fieldLabel ? undefined : fieldLabel}
                    error={!!errorMessage || isError}
                    textColor={
                      !!errorMessage || isError
                        ? colors.error
                        : colors.onSurface
                    }
                    style={[
                      {
                        ...fonts.bodyLarge,
                        backgroundColor: 'transparent',
                        height: scaler(56),
                        marginTop: hideLabel ? scaler(6) : 0,
                      },
                      style,
                    ]}
                    editable={true}
                    showSoftInputOnFocus={false}
                    selection={{start: 0, end: 0}}
                    caretHidden={true}
                    right={
                      <TextInput.Icon
                        onPress={showMenu}
                        icon={isVisible ? 'menu-up' : 'menu-down'}
                      />
                    }
                    label={hideLabel ? '' : label}
                    {...rest}
                  />
                </View>

                {!!errorMessage && (
                  <HelperText type="error" visible={!!errorMessage}>
                    {translate(errorMessage)}
                  </HelperText>
                )}
              </TouchableOpacity>
            }
            anchorPosition="bottom">
            <View
              style={{
                maxHeight: screenHeight / 3,
                width: '100%',
              }}>
              {isGettingOptions ? (
                <ActivityIndicator />
              ) : (
                <>
                  {searchEnabled && (
                    <InputSearch
                      onSearch={sq => {
                        setSearchQuery(sq);
                      }}
                      placeholder={searchPlaceholder}
                    />
                  )}
                  <Body showsVerticalScrollIndicator>
                    <MenuItemsList
                      options={options}
                      searchQuery={searchQuery}
                      itemWidth={menuContainerWidth ?? menuWidth}
                      value={value}
                      selectedTrailingIcon={selectedTrailingIcon}
                      multiple={multiple}
                      onItemPress={val => {
                        onChange(val);
                        onSelect?.(val);
                        if (!multiple) {
                          setIsVisible(false);
                        }
                      }}
                    />
                  </Body>
                </>
              )}
            </View>
          </Menu>
        );
      }}
    />
  );
}

interface MenuItemsListProps {
  options: SELECT_OPTIONS;
  itemWidth: number;
  value: string | Array<string>;
  onItemPress?: (val: any) => void;
  selectedTrailingIcon?: IconSource;
  multiple?: boolean;
  searchQuery?: string;
}

const MenuItemsList: FC<MenuItemsListProps> = ({
  options,
  itemWidth,
  value,
  selectedTrailingIcon,
  multiple,
  onItemPress,
  searchQuery,
}) => {
  const finalOptions = useMemo(() => {
    if (searchQuery && searchQuery.length > 0) {
      return options.filter(option =>
        option.key.toString().includes(searchQuery),
      );
    }
    return options;
  }, [options, searchQuery]);

  const checkIsSelected = (itemValue: any) => {
    if (multiple) {
      return Array.isArray(value) ? value.includes(itemValue) : false;
    }
    return value === itemValue;
  };

  const onItemClick = (val: any) => {
    if (multiple && Array.isArray(value)) {
      if (value.includes(val)) {
        onItemPress?.(value.filter((item: any) => item !== val));
      } else {
        onItemPress?.([...value, val]);
      }
    } else {
      onItemPress?.(val);
    }
  };

  const getItemProps = (isSelected: boolean) => {
    let trailingIcon;
    let leadingIcon;
    let backgroundColor = isSelected
      ? colors.background.tertiary
      : 'transparent';
    let titleColor = isSelected
      ? colors.foreground.brand
      : colors.foreground.primary;

    let iconColor = isSelected
      ? colors.foreground.brand
      : colors.foreground.primary;

    if (multiple) {
      leadingIcon = isSelected ? 'checkbox-marked' : 'checkbox-blank-outline';
      backgroundColor = 'transparent';
      titleColor = colors.foreground.primary;
    } else {
      trailingIcon = isSelected ? selectedTrailingIcon : '';
    }

    return {
      titleColor,
      leadingIcon,
      trailingIcon,
      backgroundColor,
      iconColor,
    };
  };

  return finalOptions && finalOptions.length > 0 ? (
    finalOptions?.map(item => {
      const isSelected = checkIsSelected(item?.value);

      const {
        leadingIcon,
        trailingIcon,
        backgroundColor,
        titleColor,
        iconColor,
      } = getItemProps(isSelected);

      return (
        <Menu.Item
          style={{
            width: itemWidth,
            maxWidth: itemWidth,
            backgroundColor,
          }}
          contentStyle={{
            width: '100%',
            maxWidth: '100%',
            flex: 1,
          }}
          titleStyle={{
            color: titleColor,
          }}
          key={item.value}
          onPress={() => onItemClick(item?.value)}
          title={item.key}
          leadingIcon={
            leadingIcon ? () => renderIcon(leadingIcon, iconColor) : ''
          }
          trailingIcon={
            trailingIcon ? () => renderIcon(trailingIcon, iconColor) : ''
          }
        />
      );
    })
  ) : (
    <Menu.Item title={Strings.No_record_found} />
  );
};

const renderIcon = (icon: any, color?: string) => {
  return (
    <Icon
      source={icon}
      size={scaler(24)}
      color={color ?? colors.foreground.brand}
    />
  );
};
