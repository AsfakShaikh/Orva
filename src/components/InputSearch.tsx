import useDebounce from '@hooks/useDebounce';
import scaler from '@utils/Scaler';
import React, {FC, useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {TextInput, TextInputProps} from 'react-native-paper';
import {theme} from '@styles/Theme';

const {colors} = theme;

export type InputSearchProps = Partial<TextInputProps> & {
  onSearch?: (searchQuery: string) => void;
};

const InputSearch: FC<InputSearchProps> = ({
  onSearch,
  placeholder = 'Search...',
  ...props
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery);

  useEffect(() => {
    onSearch?.(debouncedSearch.toString());
  }, [debouncedSearch, onSearch]);

  return (
    <TextInput
      mode="outlined"
      value={searchQuery}
      onChangeText={text => {
        setSearchQuery(text);
      }}
      left={<TextInput.Icon icon="magnify" />}
      {...props}
      placeholder={placeholder}
      style={[styles.input, props.style]}
      outlineStyle={[styles.outlineStyle, props.outlineStyle]}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    marginVertical: scaler(8),
    marginHorizontal: scaler(12),
    height: scaler(40),
    borderRadius: scaler(80),
    backgroundColor: colors.background.secondary,
  },
  outlineStyle: {
    borderRadius: scaler(8),
    borderColor: colors.border.subtle,
  },
});

export default InputSearch;
