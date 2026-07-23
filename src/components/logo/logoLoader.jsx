import { forwardRef } from 'react';

import Box from '@mui/material/Box';
import NoSsr from '@mui/material/NoSsr';

import { RouterLink } from 'src/routes/components';

import { logoClasses } from './classes';
import { DEFAULT_LOGO } from './logo';

// ----------------------------------------------------------------------

export const LogoLoader = forwardRef(
  ({ width = 72, height = 72, disableLink = false, className, href = '/', sx, ...other }, ref) => {
    const logo = (
      <img
        alt="logo"
        src={DEFAULT_LOGO}
        width={width}
        height={height}
        style={{ objectFit: 'contain' }}
        onError={(event) => {
          if (event.currentTarget.dataset.fallbackApplied === '1') return;
          event.currentTarget.dataset.fallbackApplied = '1';
          event.currentTarget.src = DEFAULT_LOGO;
        }}
      />
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
          >
            <img alt="logo" src={DEFAULT_LOGO} width={width} height={height} style={{ objectFit: 'contain' }} />
          </Box>
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
