import { parsePhoneNumber } from 'react-phone-number-input';

import { countries } from 'src/assets/data/countries';

// ----------------------------------------------------------------------

export function getCountryCode(inputValue, countryCode) {
  if (inputValue) {
    const phoneNumber = parsePhoneNumber(inputValue);

    if (phoneNumber) {
      return phoneNumber?.country;
    }
  }

  return countryCode ?? 'IN';
}

// India fallback so flag icon always shows when default is IN
const INDIA_FALLBACK = { code: 'IN', label: 'India', phone: '91' };

// ----------------------------------------------------------------------

export function getCountry(countryCode) {
  if (!countryCode) return INDIA_FALLBACK;
  const option = countries.filter((country) => country.code && country.code === countryCode)[0];
  return option || INDIA_FALLBACK;
}

export function applyFilter({ inputData, query }) {
  if (query) {
    return inputData.filter(
      (country) =>
        country.label.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        country.code.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        country.phone.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }

  return inputData;
}
