import { useState, forwardRef } from 'react';
import PhoneNumberInput from 'react-phone-number-input/input';

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { getCountryCode, getCountry } from './utils';
import { CountryListPopover } from './list';
import { FlagIcon } from '../iconify';

// ----------------------------------------------------------------------

const DEFAULT_COUNTRY = 'IN';

export const PhoneInput = forwardRef(
  ({ value, onChange, placeholder, country: inputCountryCode, disableSelect, international: internationalProp, ...other }, ref) => {
    const defaultCountryCode = getCountryCode(value, inputCountryCode ?? DEFAULT_COUNTRY);

    const [selectedCountry, setSelectedCountry] = useState(defaultCountryCode ?? DEFAULT_COUNTRY);

    const countryForIcon = getCountry(selectedCountry);

    // When internationalProp is true, show "+91" etc.; else when country is fixed use national format
    const international = internationalProp !== undefined ? internationalProp : !disableSelect;

    return (
      <PhoneNumberInput
        ref={ref}
        country={selectedCountry}
        international={international}
        inputComponent={CustomInput}
        value={value}
        onChange={onChange}
        placeholder={placeholder ?? 'Enter phone number'}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" sx={{ ml: 1 }}>
              {disableSelect ? (
                <FlagIcon code={countryForIcon?.code} sx={{ width: 22, height: 22, borderRadius: '50%' }} />
              ) : (
                <CountryListPopover
                  countryCode={selectedCountry}
                  onClickCountry={(inputValue) => setSelectedCountry(inputValue)}
                />
              )}
            </InputAdornment>
          ),
        }}
        {...other}
      />
    );
  }
);

// ----------------------------------------------------------------------

const CustomInput = forwardRef(({ ...props }, ref) => <TextField inputRef={ref} {...props} />);
