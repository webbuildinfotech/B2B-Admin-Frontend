import { useState } from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { paths } from 'src/routes/paths';
import { useTabs } from 'src/hooks/use-tabs';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { ProfileHome } from '../profile-home';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { Chip } from '@mui/material';
import { AdminProfileEditForm } from '../admin-profile-edit-form';
import useUserRole from 'src/layouts/components/user-role';

export function UserProfileView() {
  const { authUser } = useSelector((state) => state.auth);
  const tabs = useTabs('profile');
  const [isEditing, setIsEditing] = useState(false);
  const userRole = useUserRole();
  const isAdmin = userRole === 'Admin';

  return (
    <DashboardContent maxWidth="2xl">
      <CustomBreadcrumbs
        heading="Profile"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'User', href: paths.dashboard.root },
          { name: authUser.name },
        ]}
        sx={{ mb: { xs: 2, md: 4 } }}
      />

      {/* Professional Profile Header */}
      <Card sx={{ 
        mb: { xs: 2, md: 4 }, 
        borderRadius: { xs: 2, md: 3 },
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0'
      }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            height: { xs: 150, sm: 180, md: 200 },
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isAdmin && (
            <Box sx={{ 
              position: 'absolute', 
              top: { xs: 10, md: 20 }, 
              right: { xs: 10, md: 20 } 
            }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => setIsEditing(true)}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  px: { xs: 1.5, sm: 2 },
                  py: { xs: 0.5, sm: 1 },
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.3)',
                  }
                }}
              >
                <Iconify icon="mdi:pencil" sx={{ mr: 0.5, fontSize: { xs: '1rem', sm: '1.2rem' } }} />
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  Edit Profile
                </Box>
              </Button>
            </Box>
          )}
          <Typography variant="h3" sx={{ 
            color: 'white', 
            fontWeight: 700,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' }
          }}>
            Profile
          </Typography>
        </Box>

        <Box sx={{ 
          p: { xs: 2, sm: 3, md: 4 }, 
          pt: 0, 
          mt: { xs: -4, sm: -6, md: -8 } 
        }}>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={{ xs: 2, sm: 3 }} 
            alignItems={{ xs: 'center', sm: 'flex-start' }}
          >
            <Avatar
              alt={authUser.name}
              src={authUser.profile || undefined}
              sx={{
                width: { xs: 80, sm: 100, md: 120 },
                height: { xs: 80, sm: 100, md: 120 },
                border: '4px solid white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                mt: { xs: -2, sm: -3, md: -6 }
              }}
            >
              {authUser.name?.charAt(0).toUpperCase()}
            </Avatar>

            <Box sx={{ 
              flex: 1, 
              mt: { xs: 1, sm: 0 },
              textAlign: { xs: 'center', sm: 'left' }
            }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                color: '#1a1a1a',
                mb: 1,
                mt: { xs: 1, sm: 6, md: 6 },
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' }
              }}>
                {authUser.name}
              </Typography>
              
              <Typography variant="body1" sx={{ 
                color: '#666',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: { xs: 'center', sm: 'flex-start' },
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}>
                <Iconify icon="mdi:account-badge" sx={{ mr: 1, color: '#667eea' }} />
                {authUser.role || 'User'}
              </Typography>

              <Stack 
                direction="row" 
                spacing={1} 
                flexWrap="wrap"
                justifyContent={{ xs: 'center', sm: 'flex-start' }}
              >
                <Chip
                  label="Active"
                  color="success"
                  size="small"
                  icon={<Iconify icon="mdi:check-circle" />}
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                />
                <Chip
                  label="Verified"
                  color="primary"
                  size="small"
                  icon={<Iconify icon="mdi:shield-check" />}
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                />
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Card>

      {/* Professional Content Grid */}
      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid item xs={12} lg={8}>
          {tabs.value === 'profile' && <ProfileHome info={authUser} />}
        </Grid>
        
        <Grid item xs={12} lg={4}>
          {/* Quick Stats Card */}
          <Card sx={{ 
            p: { xs: 2, sm: 3 }, 
            mb: 3,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              mb: 3,
              color: '#1a1a1a',
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}>
              Quick Stats
            </Typography>
            
            <Stack spacing={2}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                p: { xs: 1.5, sm: 2 },
                borderRadius: 1,
                backgroundColor: '#f8f9fa'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Iconify icon="mdi:calendar" sx={{ mr: 1, color: '#667eea', fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                  <Typography variant="body2" sx={{ 
                    color: '#666',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}>
                    Member Since
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}>
                  {new Date().getFullYear()}
                </Typography>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                p: { xs: 1.5, sm: 2 },
                borderRadius: 1,
                backgroundColor: '#f8f9fa'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Iconify icon="mdi:map-marker" sx={{ mr: 1, color: '#667eea', fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                  <Typography variant="body2" sx={{ 
                    color: '#666',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}>
                    Location
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}>
                  {authUser.state || 'N/A'}
                </Typography>
              </Box>
            </Stack>
          </Card>

          {/* Contact Card */}
          <Card sx={{ 
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              mb: 3,
              color: '#1a1a1a',
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}>
              Contact Info
            </Typography>
            
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ 
                  bgcolor: '#e3f2fd', 
                  color: '#1976d2',
                  width: { xs: 28, sm: 32 },
                  height: { xs: 28, sm: 32 },
                  mr: 2
                }}>
                  <Iconify icon="mdi:email" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" sx={{ 
                    color: '#666',
                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                  }}>
                    Email
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    fontWeight: 500,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    wordBreak: 'break-word'
                  }}>
                    {authUser.email || 'N/A'}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ 
                  bgcolor: '#e8f5e8', 
                  color: '#2e7d32',
                  width: { xs: 28, sm: 32 },
                  height: { xs: 28, sm: 32 },
                  mr: 2
                }}>
                  <Iconify icon="mdi:phone" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" sx={{ 
                    color: '#666',
                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                  }}>
                    Phone
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    fontWeight: 500,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}>
                    {authUser.mobile || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Admin Profile Edit Form Dialog */}
      {isAdmin && (
        <AdminProfileEditForm
          open={isEditing}
          onClose={() => setIsEditing(false)}
          adminData={authUser}
          onSuccess={() => {
            // Profile updated - Redux and localStorage already updated
            // Component will re-render automatically with new data from Redux
            setIsEditing(false);
          }}
        />
      )}
    </DashboardContent>
  );
}
