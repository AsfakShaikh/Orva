import React, {FC, useCallback, useEffect, useState} from 'react';
import {FlagType, getAllCountries} from 'react-native-country-picker-modal';
import InputSelect, {InputSelectProps} from './InputSelect';

type CountryCodeSelectInputProps = Omit<InputSelectProps, 'options'>;

const topCountries = [
  {
    key: 'United Arab Emirates (+971)',
    value: '+971',
  },
  {
    key: 'United States (+1)',
    value: '+1',
  },
];

const CountryCodeSelectInput: FC<CountryCodeSelectInputProps> = ({
  ...props
}) => {
  const [isGettingOptions, setIsGettingOptions] = useState(false);
  const [options, setOptions] = useState<Array<any>>([]);

  const getCallingCodes = useCallback(async () => {
    setIsGettingOptions(true);

    const countries = await getAllCountries(FlagType.FLAT);

    const selectInputData = countries.reduce(
      (x: Array<any>, {cca2, name, callingCode}) => {
        if (cca2 !== 'AE' && cca2 !== 'US') {
          x.push({
            key: `${name} (+${callingCode[0]})`,
            value: `+${callingCode[0]}`,
          });
        }
        return x;
      },
      [],
    );
    setOptions([...topCountries, ...selectInputData]);
    setIsGettingOptions(false);
  }, []);

  useEffect(() => {
    getCallingCodes();
  }, [getCallingCodes]);

  return (
    <InputSelect
      options={options}
      isGettingOptions={isGettingOptions}
      isValueDisplay
      {...props}
    />
  );
};

export default CountryCodeSelectInput;
