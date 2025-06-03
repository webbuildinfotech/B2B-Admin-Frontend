import { useId, forwardRef, useEffect } from 'react';

import Box from '@mui/material/Box';
import NoSsr from '@mui/material/NoSsr';
import { useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { logoClasses } from './classes';
import { useFetchData } from 'src/sections/setting/logo/utils/fetch';
import { useSelector } from 'react-redux';

// ----------------------------------------------------------------------

export const Logo = forwardRef(
  ({ disableLink = false, className, href = '/', sx, ...other }, ref) => {
    const theme = useTheme();

    const { fetchData } = useFetchData();
    const logoList = useSelector((state) => state.setting?.logo || []);

    useEffect(() => {
      fetchData();
    }, []);

    const gradientId = useId();

    const PRIMARY_LIGHT = theme.vars.palette.primary.light;
    const PRIMARY_MAIN = theme.vars.palette.primary.main;
    const isDark = theme.palette.mode === 'dark';

    const logo = (
      <img 
        alt="logo" 
        src={isDark ? logoList.logoImage : logoList.logoImage} 
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    );

    return (
      <NoSsr
        fallback={
          <Box
            className={logoClasses.root.concat(className ? ` ${className}` : '')}
            sx={{
              flexShrink: 0,
              display: 'inline-flex',
              verticalAlign: 'middle',
              width: {
                xs: '80px',   // Mobile
                sm: '100px',  // Tablet
                md: '120px',  // Desktop
                lg: '150px',  // Large Desktop
              },
              height: {
                xs: '40px',   // Mobile
                sm: '50px',   // Tablet
                md: '60px',   // Desktop
                lg: '72px',   // Large Desktop
              },
              ...sx,
            }}
          />
        }
      >
        <Box
          ref={ref}
          component={RouterLink}
          href={href}
          className={logoClasses.root.concat(className ? ` ${className}` : '')}
          aria-label="logo"
          sx={{
            flexShrink: 0,
            display: 'inline-flex',
            verticalAlign: 'middle',
            width: {
              xs: '80px',   // Mobile
              sm: '100px',  // Tablet
              md: '120px',  // Desktop
              lg: '150px',  // Large Desktop
            },
            height: {
              xs: '40px',   // Mobile
              sm: '50px',   // Tablet
              md: '60px',   // Desktop
              lg: '72px',   // Large Desktop
            },
            ...(disableLink && { pointerEvents: 'none' }),
            ...sx,
          }}
          {...other}
        >
          {logo}
        </Box>
      </NoSsr>
    );
  }
);
