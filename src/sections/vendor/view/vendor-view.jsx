import { useEffect } from 'react';
import { DashboardContent } from 'src/layouts/dashboard';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { vendorGetByList } from 'src/store/action/vendorActions';
import {
  Box,
  Grid,
  Stack,
  Typography,
  Avatar,
  Container,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Chip,
  alpha,
  Divider,
  Paper
} from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { paths } from 'src/routes/paths';

// Professional Info Row Component
const InfoRow = ({ label, value, icon, isMobile, isSmallMobile, isTinyMobile }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: isTinyMobile ? 'column' : 'row',
      alignItems: isTinyMobile ? 'flex-start' : 'flex-start',
      py: 2,
      borderBottom: '1px solid',
      borderColor: 'divider',
      '&:last-child': {
        borderBottom: 'none'
      }
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        minWidth: isTinyMobile ? 'auto' : (isMobile ? '120px' : '140px'),
        mr: isTinyMobile ? 0 : 2,
        mb: isTinyMobile ? 1 : 0
      }}
    >
      <Iconify 
        icon={icon} 
        sx={{ 
          color: 'primary.main', 
          fontSize: isTinyMobile ? '0.875rem' : '1rem',
          mr: 1
        }} 
      />
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          fontWeight: 600,
          fontSize: isTinyMobile ? '0.75rem' : '0.875rem'
        }}
      >
        {label}
      </Typography>
    </Box>
    
    <Box sx={{ flex: 1 }}>
      <Typography
        variant="body1"
        sx={{
          color: 'text.primary',
          fontWeight: 500,
          fontSize: isTinyMobile ? '0.75rem' : '0.875rem',
          wordBreak: 'break-word',
          pl: isTinyMobile ? 2.5 : 0
        }}
      >
        {value || 'N/A'}
      </Typography>
    </Box>
  </Box>
);

// Professional Section Header
const SectionHeader = ({ title, icon, isMobile, isTinyMobile }) => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    mb: 3,
    pb: 1,
    borderBottom: '2px solid',
    borderColor: 'primary.main'
  }}>
    <Iconify 
      icon={icon} 
      sx={{ 
        color: 'primary.main', 
        fontSize: isTinyMobile ? '1.25rem' : (isMobile ? '1.5rem' : '1.5rem'),
        mr: isTinyMobile ? 1 : 1.5
      }} 
    />
    <Typography
      variant="h6"
      sx={{
        fontWeight: 700,
        color: 'text.primary',
        fontSize: isTinyMobile ? '1rem' : (isMobile ? '1.1rem' : '1.25rem')
      }}
    >
      {title}
    </Typography>
  </Box>
);

export function VendorView() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const vendors = useSelector((state) => state.vendor.getByVendor);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTinyMobile = useMediaQuery('(max-width:400px)');

  useEffect(() => {
    if (id) {
      dispatch(vendorGetByList(id));
    }
  }, [id, dispatch]);

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Vendor Details"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Vendors', href: paths?.vendors?.root },
          { name: vendors?.name || 'Vendor' },
        ]}
        sx={{ mb: 4 }}
      />

      <Container maxWidth="xl" sx={{ px: isTinyMobile ? 1 : (isMobile ? 2 : 3) }}>
        {/* Professional Header Section */}
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            p: isTinyMobile ? 2 : 3,
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            flexDirection: isTinyMobile ? 'column' : 'row',
            textAlign: isTinyMobile ? 'center' : 'left'
          }}>
            <Avatar
              sx={{
                width: isTinyMobile ? 60 : 80,
                height: isTinyMobile ? 60 : 80,
                mr: isTinyMobile ? 0 : 3,
                mb: isTinyMobile ? 2 : 0,
                bgcolor: 'primary.main',
                fontSize: isTinyMobile ? '1.5rem' : '2rem',
                fontWeight: 'bold'
              }}
            >
              {vendors?.name?.charAt(0)?.toUpperCase() || 'V'}
            </Avatar>

            <Box sx={{ 
              flex: 1, 
              minWidth: 0,
              textAlign: isTinyMobile ? 'center' : 'left'
            }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  mb: 1,
                  fontSize: isTinyMobile ? '1.25rem' : (isMobile ? '1.5rem' : '2rem')
                }}
              >
                {vendors?.name || 'Vendor Name'}
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  fontSize: isTinyMobile ? '0.75rem' : '0.875rem'
                }}
              >
                Vendor ID: {vendors?.slNo || 'N/A'}
              </Typography>
            </Box>

            <Box sx={{ 
              ml: isTinyMobile ? 'auto' : 'auto', 
              display: 'flex', 
              gap: 1,
              mt: isTinyMobile ? 2 : 0
            }}>
              <Chip
                label="Active"
                color="success"
                size="small"
                sx={{ 
                  fontWeight: 600,
                  fontSize: isTinyMobile ? '0.7rem' : 'inherit'
                }}
              />
            </Box>
          </Box>
        </Paper>

        {/* Professional Information Grid */}
        <Grid container spacing={isTinyMobile ? 2 : 3}>
          {/* Basic Information */}
          <Grid item xs={12} lg={6}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2
              }}
            >
              <CardContent sx={{ p: isTinyMobile ? 2 : 3 }}>
                <SectionHeader 
                  title="Basic Information" 
                  icon="mdi:account-details"
                  isMobile={isMobile}
                  isTinyMobile={isTinyMobile}
                />
                
                <Stack spacing={0}>
                  <InfoRow 
                    icon="mdi:numeric" 
                    label="SL Number" 
                    value={vendors?.slNo}
                    isMobile={isMobile}
                    isSmallMobile={isSmallMobile}
                    isTinyMobile={isTinyMobile}
                  />
                  <InfoRow 
                    icon="mdi:account" 
                    label="Vendor Name" 
                    value={vendors?.name}
                    isMobile={isMobile}
                    isSmallMobile={isSmallMobile}
                    isTinyMobile={isTinyMobile}
                  />
                  <InfoRow 
                    icon="mdi:label" 
                    label="Alias" 
                    value={vendors?.alias}
                    isMobile={isMobile}
                    isSmallMobile={isSmallMobile}
                    isTinyMobile={isTinyMobile}
                  />
                  <InfoRow 
                    icon="mdi:account-group" 
                    label="Parent" 
                    value={vendors?.parent}
                    isMobile={isMobile}
                    isSmallMobile={isSmallMobile}
                    isTinyMobile={isTinyMobile}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Tax Information */}
          <Grid item xs={12} lg={6}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2
              }}
            >
              <CardContent sx={{ p: isTinyMobile ? 2 : 3 }}>
                <SectionHeader 
                  title="Tax Information" 
                  icon="mdi:file-document"
                  isMobile={isMobile}
                  isTinyMobile={isTinyMobile}
                />
                
                <Stack spacing={0}>
                  <InfoRow 
                    icon="mdi:credit-card" 
                    label="PAN Number" 
                    value={vendors?.pan}
                    isMobile={isMobile}
                    isSmallMobile={isSmallMobile}
                    isTinyMobile={isTinyMobile}
                  />
                  <InfoRow 
                    icon="mdi:tag" 
                    label="GST Type" 
                    value={vendors?.gstType}
                    isMobile={isMobile}
                    isSmallMobile={isSmallMobile}
                    isTinyMobile={isTinyMobile}
                  />
                  <InfoRow 
                    icon="mdi:barcode" 
                    label="GST Number" 
                    value={vendors?.gstNo}
                    isMobile={isMobile}
                    isSmallMobile={isSmallMobile}
                    isTinyMobile={isTinyMobile}
                  />
                  <InfoRow 
                    icon="mdi:clipboard-text" 
                    label="GST Details" 
                    value={vendors?.gstDetails}
                    isMobile={isMobile}
                    isSmallMobile={isSmallMobile}
                    isTinyMobile={isTinyMobile}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2
              }}
            >
              <CardContent sx={{ p: isTinyMobile ? 2 : 3 }}>
                <SectionHeader 
                  title="Contact Information" 
                  icon="mdi:card-account-phone"
                  isMobile={isMobile}
                  isTinyMobile={isTinyMobile}
                />
                
                <Grid container spacing={0}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={0}>
                      <InfoRow 
                        icon="mdi:account" 
                        label="Contact Person" 
                        value={vendors?.contactPerson}
                        isMobile={isMobile}
                        isSmallMobile={isSmallMobile}
                        isTinyMobile={isTinyMobile}
                      />
                      <InfoRow 
                        icon="mdi:phone" 
                        label="Phone Number" 
                        value={vendors?.mobile}
                        isMobile={isMobile}
                        isSmallMobile={isSmallMobile}
                        isTinyMobile={isTinyMobile}
                      />
                      <InfoRow 
                        icon="mdi:email" 
                        label="Email Address" 
                        value={vendors?.email}
                        isMobile={isMobile}
                        isSmallMobile={isSmallMobile}
                        isTinyMobile={isTinyMobile}
                      />
                    </Stack>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Stack spacing={0}>
                      <InfoRow 
                        icon="mdi:map-marker" 
                        label="Pincode" 
                        value={vendors?.pincode}
                        isMobile={isMobile}
                        isSmallMobile={isSmallMobile}
                        isTinyMobile={isTinyMobile}
                      />
                      <InfoRow 
                        icon="mdi:home" 
                        label="Address" 
                        value={vendors?.address}
                        isMobile={isMobile}
                        isSmallMobile={isSmallMobile}
                        isTinyMobile={isTinyMobile}
                      />
                      <InfoRow 
                        icon="mdi:map" 
                        label="State" 
                        value={vendors?.state}
                        isMobile={isMobile}
                        isSmallMobile={isSmallMobile}
                        isTinyMobile={isTinyMobile}
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Additional Details */}
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2
              }}
            >
              <CardContent sx={{ p: isTinyMobile ? 2 : 3 }}>
                <SectionHeader 
                  title="Additional Details" 
                  icon="mdi:information"
                  isMobile={isMobile}
                  isTinyMobile={isTinyMobile}
                />
                
                <Grid container spacing={0}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Stack spacing={0}>
                      <InfoRow 
                        icon="mdi:flag" 
                        label="Country" 
                        value={vendors?.country}
                        isMobile={isMobile}
                        isSmallMobile={isSmallMobile}
                        isTinyMobile={isTinyMobile}
                      />
                    </Stack>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Stack spacing={0}>
                      <InfoRow 
                        icon="mdi:account-check" 
                        label="Status" 
                        value="Active"
                        isMobile={isMobile}
                        isSmallMobile={isSmallMobile}
                        isTinyMobile={isTinyMobile}
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
                    <Stack spacing={0}>
                      <InfoRow 
                        icon="mdi:calendar" 
                        label="Created Date" 
                        value={vendors?.createdAt}
                        isMobile={isMobile}
                        isSmallMobile={isSmallMobile}
                        isTinyMobile={isTinyMobile}
                      />
                    </Stack>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Stack spacing={0}>
                      <InfoRow 
                        icon="mdi:update" 
                        label="Updated Date" 
                        value={vendors?.updatedAt}
                        isMobile={isMobile}
                        isSmallMobile={isSmallMobile}
                        isTinyMobile={isTinyMobile}
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </DashboardContent>
  );
}
