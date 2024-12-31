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
  ({ width = 72, height = 72, disableLink = false, className, href = '/', sx, ...other }, ref) => {
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

    /*
     * OR using local (public folder)
     * const logo = ( <Box alt="logo" component="img" src={`${CONFIG.site.basePath}/logo/logo-single.svg`} width={width} height={height} /> );
     */
    const logo = (
      <img alt="logo" src={isDark ? logoList.logoImage : logoList.logoImage} width={width} height={height} />
    );

    return (
      <NoSsr
        fallback={
          <Box
            width={width}
            height={height}
            className={logoClasses.root.concat(className ? ` ${className}` : '')}
            sx={{
              flexShrink: 0,
              display: 'inline-flex',
              verticalAlign: 'middle',
              ...sx,
            }}
          />
        }
      >
        <Box
          ref={ref}
          component={RouterLink}
          href={href}
          width={width}
          height={height}
          className={logoClasses.root.concat(className ? ` ${className}` : '')}
          aria-label="logo"
          sx={{
            flexShrink: 0,
            display: 'inline-flex',
            verticalAlign: 'middle',
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
