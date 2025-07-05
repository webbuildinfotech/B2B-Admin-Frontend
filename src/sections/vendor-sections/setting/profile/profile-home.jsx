import { useRef } from 'react';

import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import InputBase from '@mui/material/InputBase';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';

import { fNumber } from 'src/utils/format-number';

import { _socials } from 'src/_mock';
import { varAlpha } from 'src/theme/styles';

import { Iconify, SocialIcon } from 'src/components/iconify';

import { ProfilePostItem } from './profile-post-item';

// ----------------------------------------------------------------------

export function ProfileHome({ info }) {

  const renderAbout = (
    <Card sx={{ 
      borderRadius: 2,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        p: { xs: 2, sm: 3 }, 
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 600,
          color: '#1a1a1a',
          display: 'flex',
          alignItems: 'center',
          fontSize: { xs: '1rem', sm: '1.25rem' }
        }}>
          <Iconify icon="mdi:account-details" sx={{ mr: 1, color: '#667eea' }} />
          Personal Information
        </Typography>
      </Box>

      <Stack spacing={0} sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          p: { xs: 1.5, sm: 2 },
          borderRadius: 1,
          '&:hover': {
            backgroundColor: '#f8f9fa'
          }
        }}>
          <Avatar sx={{ 
            bgcolor: '#e3f2fd', 
            color: '#1976d2',
            width: { xs: 32, sm: 40 },
            height: { xs: 32, sm: 40 },
            mr: 2
          }}>
            <Iconify icon="mdi:phone" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={{ 
              color: '#666', 
              display: 'block',
              fontSize: { xs: '0.7rem', sm: '0.75rem' }
            }}>
              Mobile Number
            </Typography>
            <Typography variant="body1" sx={{ 
              fontWeight: 500,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              wordBreak: 'break-word'
            }}>
              {info.mobile || 'N/A'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          p: { xs: 1.5, sm: 2 },
          borderRadius: 1,
          '&:hover': {
            backgroundColor: '#f8f9fa'
          }
        }}>
          <Avatar sx={{ 
            bgcolor: '#fff3e0', 
            color: '#f57c00',
            width: { xs: 32, sm: 40 },
            height: { xs: 32, sm: 40 },
            mr: 2
          }}>
            <Iconify icon="mdi:email" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={{ 
              color: '#666', 
              display: 'block',
              fontSize: { xs: '0.7rem', sm: '0.75rem' }
            }}>
              Email Address
            </Typography>
            <Typography variant="body1" sx={{ 
              fontWeight: 500,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              wordBreak: 'break-word'
            }}>
              {info.email || 'N/A'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          p: { xs: 1.5, sm: 2 },
          borderRadius: 1,
          '&:hover': {
            backgroundColor: '#f8f9fa'
          }
        }}>
          <Avatar sx={{ 
            bgcolor: '#e8f5e8', 
            color: '#2e7d32',
            width: { xs: 32, sm: 40 },
            height: { xs: 32, sm: 40 },
            mr: 2
          }}>
            <Iconify icon="mdi:home-map-marker" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={{ 
              color: '#666', 
              display: 'block',
              fontSize: { xs: '0.7rem', sm: '0.75rem' }
            }}>
              Address
            </Typography>
            <Typography variant="body1" sx={{ 
              fontWeight: 500,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              wordBreak: 'break-word'
            }}>
              {info.address || 'N/A'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          p: { xs: 1.5, sm: 2 },
          borderRadius: 1,
          '&:hover': {
            backgroundColor: '#f8f9fa'
          }
        }}>
          <Avatar sx={{ 
            bgcolor: '#fce4ec', 
            color: '#c2185b',
            width: { xs: 32, sm: 40 },
            height: { xs: 32, sm: 40 },
            mr: 2
          }}>
            <Iconify icon="mdi:map-marker" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={{ 
              color: '#666', 
              display: 'block',
              fontSize: { xs: '0.7rem', sm: '0.75rem' }
            }}>
              Location
            </Typography>
            <Typography variant="body1" sx={{ 
              fontWeight: 500,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              wordBreak: 'break-word'
            }}>
              {info.state}, {info.country} - {info.pincode}
            </Typography>
          </Box>
        </Box>
      </Stack>
    </Card>
  );





  return (
    <Grid container spacing={{ xs: 2, md: 3 }}>
      <Grid xs={12}>
        <Stack spacing={{ xs: 2, md: 3 }}>
          {renderAbout}
        </Stack>
      </Grid>
    </Grid>
  );
}
