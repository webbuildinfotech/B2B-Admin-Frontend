import React from 'react';
import Box from '@mui/material/Box';

const SplashScreen = ({
  logoComponent = <div>Loading...</div>, // Customizable logo or content
  sx = {},                              // Additional styles for the main container
  containerProps = {},                  // Props for the outer Box
  bgcolor = 'rgba(255, 255, 255, 0.8)', // Background overlay color
  zIndex = 0,                           // Z-index for layering
  ...other
}) => (
  <Box
    sx={{
      position: 'absolute', // Ensures the overlay stays within its parent
      left: 0,
      right: 0,
      zIndex,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...sx,
    }}
    {...containerProps}
    {...other}
  >
    {logoComponent}
  </Box>
);

export default SplashScreen;
