import { forwardRef, useEffect } from 'react';

import Box from '@mui/material/Box';
import NoSsr from '@mui/material/NoSsr';

import { RouterLink } from 'src/routes/components';

import { logoClasses } from './classes';
import { useFetchData } from 'src/sections/setting/logo/utils/fetch';
import { useSelector } from 'react-redux';
import { CONFIG } from 'src/config-global';

/** Default logo from public/logo.png when API logo missing/broken */
export const DEFAULT_LOGO = `${CONFIG.site.basePath || ''}/logo.png`;

const resolveLogoSrc = (logoState) => {
  if (!logoState || typeof logoState !== 'object') return DEFAULT_LOGO;
  const url = logoState.logoImage;
  if (typeof url !== 'string' || !url.trim()) return DEFAULT_LOGO;
  return url.trim();
};

// Global flag to prevent multiple logo fetches
let isLogoFetched = false;
let isFetching = false;

// ----------------------------------------------------------------------

export const Logo = forwardRef(
  ({ disableLink = false, className, href = '/', sx, ...other }, ref) => {
    const { fetchData } = useFetchData();
    const logoState = useSelector((state) => state.setting?.logo);

    useEffect(() => {
      if (!isLogoFetched && !isFetching) {
        isFetching = true;
        fetchData().finally(() => {
          isLogoFetched = true;
          isFetching = false;
        });
      }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const logoSrc = resolveLogoSrc(logoState);

    const handleLogoError = (event) => {
      if (event.currentTarget.dataset.fallbackApplied === '1') return;
      event.currentTarget.dataset.fallbackApplied = '1';
      event.currentTarget.src = DEFAULT_LOGO;
    };

    const logoImg = (
      <img
        alt="logo"
        src={logoSrc}
        onError={handleLogoError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    );

    const sizeSx = {
      flexShrink: 0,
      display: 'inline-flex',
      verticalAlign: 'middle',
      width: {
        xs: '80px',
        sm: '100px',
        md: '120px',
        lg: '150px',
      },
      height: {
        xs: '40px',
        sm: '50px',
        md: '60px',
        lg: '72px',
      },
      ...sx,
    };

    return (
      <NoSsr
        fallback={
          <Box className={logoClasses.root.concat(className ? ` ${className}` : '')} sx={sizeSx}>
            <img
              alt="logo"
              src={DEFAULT_LOGO}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </Box>
        }
      >
        <Box
          ref={ref}
          component={RouterLink}
          href={href}
          className={logoClasses.root.concat(className ? ` ${className}` : '')}
          aria-label="logo"
          sx={{
            ...sizeSx,
            ...(disableLink && { pointerEvents: 'none' }),
          }}
          {...other}
        >
          {logoImg}
        </Box>
      </NoSsr>
    );
  }
);
