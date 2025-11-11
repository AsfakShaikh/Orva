import {OptionalLocaleString} from '@locales/Localization';
import trim from './trim';
//@ts-ignore
import {PhoneNumberUtil} from 'google-libphonenumber';

export const getRequiredRules = (
  label: OptionalLocaleString,
  requiredMessage?: string,
) => {
  const message = requiredMessage ?? `${label}_is_required`;
  const validate = (value: string) => {
    if (value?.trim()) {
      return true;
    }
    return message;
  };

  return {
    validate,
  };
};

export const getEmailValidationRules = (
  required: boolean = true,
  label?: OptionalLocaleString,
) => {
  const validateEmail = (value?: string) => {
    if (!trim(value) && required) {
      return label ? `${label}_is_required` : 'Email_address_is_required';
    }
    return true;
  };
  return {
    validate: validateEmail,
    pattern: {
      value: /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/g,
      message: label ? `${label}_is_invalid` : 'Email_address_is_invalid',
    },
  };
};

export const getConfirmPasswordValidationRules = (
  password: string,
  label?: OptionalLocaleString,
) => {
  const validate = (value: string) => {
    if (value !== password) {
      return (label as string) ?? 'Password_does_not_match';
    }
    return true;
  };
  return {
    validate,
  };
};
export const getPasswordValidationRules = (label?: OptionalLocaleString) => {
  return {
    pattern: {
      value:
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/g,
      message: label ? `${label}_is_invalid` : 'Password_requrements_error',
    },
  };
};

export const getOnlyNumberValidation = (
  label?: OptionalLocaleString,
  requiredMessage?: string,
) => {
  const message = requiredMessage ?? `Invalid_${label}`;
  return {
    pattern: {
      value: /^\d+$/,
      message,
    },
  };
};

const phoneUtil = PhoneNumberUtil.getInstance();

export const isValidNumber = (phoneNumber: string) => {
  try {
    if (phoneNumber.indexOf('.') !== -1) {
      return false;
    }
    const phone = phoneUtil.parse(phoneNumber);
    return phoneUtil.isValidNumber(phone);
  } catch (error) {
    return false;
  }
};

export const getPhoneNumberValidationRules = (
  countryCode: string,
  requiredMessage?: string,
) => {
  const validatePhone = (value?: string) => {
    if (trim(value)) {
      const countryCodePrefix = countryCode ? '+' : '';
      if (isValidNumber(`${countryCodePrefix}${countryCode}${value}`)) {
        return true;
      }
      return requiredMessage ?? 'Invalid_Mobile_Number';
    }
    return true;
  };
  return {
    validate: validatePhone,
  };
};
