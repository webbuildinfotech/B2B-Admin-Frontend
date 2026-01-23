import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { OrderCompleteIllustration } from 'src/assets/illustrations';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

export function CheckoutOrderComplete({ open, onReset }) {
  const navigate = useNavigate();
  const redirectTimeoutRef = useRef(null);

  // Prevent user from going back with browser back button
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = ''; // This triggers a confirmation dialog
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Auto-redirect to orders page after 5 seconds
  useEffect(() => {
    if (open) {
      // Clear any existing timeout
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }

      // Set new timeout for 5 seconds
      redirectTimeoutRef.current = setTimeout(() => {
        navigate(paths.orders.root);
        onReset(); // Reset checkout state
      }, 5000);
    }

    // Cleanup timeout on unmount or when dialog closes
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [open, navigate, onReset]);

  return (
    <Dialog
      fullWidth
      fullScreen
      open={open}
      PaperProps={{
        sx: {
          width: { md: `calc(100% - 48px)` },
          height: { md: `calc(100% - 48px)` },
        },
      }}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
          onReset();
        }
      }}
    >
      <Box
        gap={5}
        display="flex"
        alignItems="center"
        flexDirection="column"
        sx={{
          py: 5,
          m: 'auto',
          maxWidth: 480,
          textAlign: 'center',
          px: { xs: 2, sm: 0 },
        }}
      >
        <Typography variant="h4">Thank you for your purchase!</Typography>

        <OrderCompleteIllustration />

        <Typography>
          Thanks for placing your order
          <br />
          <br />
          We will send you a notification within 5 days when it ships.
          <br /> If you have any questions, feel free to contact us. <br />
          All the best,
        </Typography>

        <Divider sx={{ width: 1, borderStyle: 'dashed' }} />

        <Box gap={2} display="flex" flexWrap="wrap" justifyContent="center">
          <Button
            size="large"
            color="inherit"
            variant="outlined"
            onClick={onReset}
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
            component={RouterLink}
            href={paths.items.root}
          >
            Continue shopping
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
