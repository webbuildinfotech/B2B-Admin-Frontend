import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function AddressItem({ address, action, sx, index, ...other }) {

  const getAddressTypeConfig = (type) => {
    switch (type) {
      case 'Primary':
        return {
          label: 'Primary',
          color: 'primary',
          icon: 'eva:star-fill',
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          borderColor: (theme) => theme.palette.primary.main,
        };
      case 'Secondary':
        return {
          label: 'Secondary',
          color: 'secondary',
          icon: 'eva:home-fill',
          bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.08),
          borderColor: (theme) => theme.palette.secondary.main,
        };
      case 'Default':
      default:
        return {
          label: 'Default',
          color: 'default',
          icon: 'eva:pin-fill',
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
          borderColor: (theme) => theme.palette.grey[300],
        };
    }
  };

  const typeConfig = getAddressTypeConfig(address.addressType);

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        gap: 2,
        display: 'flex',
        position: 'relative',
        alignItems: { md: 'flex-start' },
        flexDirection: { xs: 'column', md: 'row' },
        borderRadius: 2,
        border: '1px solid',
        borderColor: typeConfig.borderColor,
        bgcolor: typeConfig.bgcolor,
        ...sx,
      }}
      {...other}
    >
      {/* Address Type Badge */}
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <Chip
          label={typeConfig.label}
          color={typeConfig.color}
          size="small"
          icon={<Iconify icon={typeConfig.icon} width={16} />}
          sx={{
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 24,
          }}
        />
      </Box>

      <Stack flexGrow={1} spacing={2}>
        {/* Address Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: typeConfig.borderColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify icon="eva:pin-fill" width={20} sx={{ color: 'white' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Address ({index + 1})
          </Typography>
        </Box>

        {/* Address Information Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 2,
            mt: 1,
          }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                mb: 0.5,
                display: 'block',
              }}
            >
              Street Address
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                fontWeight: 500,
                lineHeight: 1.4,
              }}
            >
              {address.street_address || 'Not Available'}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                mb: 0.5,
                display: 'block',
              }}
            >
              State
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                fontWeight: 500,
              }}
            >
              {address.state || 'Not Available'}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                mb: 0.5,
                display: 'block',
              }}
            >
              Mobile Number
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="eva:phone-fill" width={16} sx={{ color: 'primary.main' }} />
              <Typography
                variant="body2"
                sx={{
                  color: 'text.primary',
                  fontWeight: 500,
                }}
              >
                {address.mobile || 'Not Available'}
              </Typography>
            </Box>
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                mb: 0.5,
                display: 'block',
              }}
            >
              Country
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="eva:globe-fill" width={16} sx={{ color: 'secondary.main' }} />
              <Typography
                variant="body2"
                sx={{
                  color: 'text.primary',
                  fontWeight: 500,
                }}
              >
                {address.country || 'Not Available'}
              </Typography>
            </Box>
          </Box>

          {/* Additional fields if available */}
          {address.city && (
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  mb: 0.5,
                  display: 'block',
                }}
              >
                City
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.primary',
                  fontWeight: 500,
                }}
              >
                {address.city}
              </Typography>
            </Box>
          )}

          {address.pincode && (
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  mb: 0.5,
                  display: 'block',
                }}
              >
                Pincode
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.primary',
                  fontWeight: 500,
                }}
              >
                {address.pincode}
              </Typography>
            </Box>
          )}
        </Box>
      </Stack>

      {/* Action Buttons */}
      {action && (
        <Box
          sx={{
            mt: { xs: 2, md: 0 },
            ml: { md: 2 },
            display: 'flex',
            flexDirection: { xs: 'row', md: 'column' },
            gap: 1,
            justifyContent: { xs: 'flex-end', md: 'flex-start' },
            alignItems: { xs: 'center', md: 'flex-end' },
          }}
        >
          {action}
        </Box>
      )}
    </Paper>
  );
}
