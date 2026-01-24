import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { fCurrency } from 'src/utils/format-number';
import { calculateGSTPercentages, calculateBaseAmountForGST } from 'src/utils/calculate-gst-percentage';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { DUMMY_IMAGE } from 'src/components/constants';

// ----------------------------------------------------------------------

export function OrderDetailsItems({
  items = [],
  totalAmount,
  discount,
  finalAmount,
  cgst = 0,
  sgst = 0,
  igst = 0,
  totalGst = 0,
}) {
  // Calculate discount amount (discount is percentage stored in database)
  // Round discount percentage to avoid floating point precision issues
  const roundedDiscountPercentage = discount ? Math.round(Number(discount) * 100) / 100 : 0;
  const discountAmount = discount && totalAmount ? (totalAmount * discount) / 100 : 0;
  
  // Determine if same state (CGST/SGST exists) or different state (IGST exists)
  const isSameState = (cgst > 0 || sgst > 0);
  
  // Calculate base amount for GST (subtotal after item discounts AND order discount)
  // GST is calculated on the amount AFTER order discount, so we need to use that as base
  const subtotalAfterItemDiscount = calculateBaseAmountForGST(items, totalAmount);
  const orderLevelDiscount = discount && subtotalAfterItemDiscount ? (subtotalAfterItemDiscount * discount) / 100 : 0;
  const baseAmountForGST = subtotalAfterItemDiscount - orderLevelDiscount;
  
  // Calculate GST percentages using utility function
  const { cgstPercentage, sgstPercentage, igstPercentage } = calculateGSTPercentages({
    cgst,
    sgst,
    igst,
    baseAmount: baseAmountForGST,
  });

  const renderTotal = (
    <Stack spacing={2} alignItems="flex-end" sx={{ p: 3, textAlign: 'right', typography: 'body2' }}>
      <Stack direction="row">
        <Box sx={{ color: 'text.secondary',fontWeight: 'bold' }}>Subtotal</Box>
        <Box sx={{ width: 160 }}>{fCurrency(totalAmount) || '-'}</Box>
      </Stack>

      {discountAmount > 0 && (
        <Stack direction="row">
          <Box sx={{ color: 'text.secondary',fontWeight: 'bold' }}>
            Discount @{Math.round(roundedDiscountPercentage)}%
          </Box>
          <Box sx={{ width: 160, color: 'error.main' }}>
            - {fCurrency(discountAmount)}
          </Box>
        </Stack>
      )}

      {/* Display GST based on saved values from order table */}
      {isSameState ? (
        <>
          {cgst > 0 && (
            <Stack direction="row">
              <Box sx={{ color: 'text.secondary',fontWeight: 'bold' }}>
                CGST @{Math.round(cgstPercentage)}%
              </Box>
              <Box sx={{ width: 160 }}>{fCurrency(cgst)}</Box>
            </Stack>
          )}
          {sgst > 0 && (
            <Stack direction="row">
              <Box sx={{ color: 'text.secondary',fontWeight: 'bold' }}>
                SGST @{Math.round(sgstPercentage)}%
              </Box>
              <Box sx={{ width: 160 }}>{fCurrency(sgst)}</Box>
            </Stack>
          )}
        </>
      ) : (
        igst > 0 && (
          <Stack direction="row">
            <Box sx={{ color: 'text.secondary',fontWeight: 'bold' }}>
              IGST @{Math.round(igstPercentage)}%
            </Box>
            <Box sx={{ width: 160 }}>{fCurrency(igst)}</Box>
          </Stack>
        )
      )}

      <Stack direction="row">
        <Box sx={{ color: 'text.secondary',fontWeight: 'bold' }}>Shipping</Box>
        <Box sx={{ width: 160}}>
         Free
        </Box>
      </Stack>

      <Box sx={{ width: '100%', alignSelf: 'stretch' }}>
        <Divider sx={{ borderStyle: 'dashed' }} />
      </Box>

      <Stack direction="row" sx={{ typography: 'subtitle1' }}>
        <div style={{fontWeight: 'bold'}}>Total</div>
        <Box sx={{ width: 160 }}>{fCurrency(finalAmount) || '-'}</Box>
      </Stack>
    </Stack>
  );


  return (
    <Card>
      <CardHeader
        title="Order Info"

      />

      <Scrollbar>
        {items.map((item) => (
          <Stack
            key={item.id}
            direction="row"
            alignItems="center"
            sx={{
              p: 3,
              minWidth: 640,
              borderBottom: (theme) => `dashed 2px ${theme.vars.palette.background.neutral}`,
            }}
          >
            <Avatar 
              src={item.product?.productImages?.[0] || DUMMY_IMAGE} 
              variant="rounded" 
              sx={{ width: 48, height: 48, mr: 2, flexShrink: 0 }} 
            />

            <ListItemText
              primary={item.product?.itemName}
              secondary={item.product?.alias}
              primaryTypographyProps={{ 
                typography: 'body2',
                noWrap: true,
                sx: { maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }
              }}
              secondaryTypographyProps={{
                component: 'span',
                color: 'text.disabled',
                mt: 0.5,
                sx: { 
                  display: 'block',
                  maxWidth: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }
              }}
              sx={{ flex: '1 1 auto', minWidth: 0, mr: 2 }}
            />

            <Box sx={{ width: 100, textAlign: 'right', mr: 2, flexShrink: 0 }}>
              <Typography variant="body2" color="text.primary" noWrap>
                Price: {fCurrency(item?.product?.sellingPrice)}
              </Typography>
            </Box>

            <Box sx={{ width: 50, textAlign: 'center', mr: 2, flexShrink: 0 }}>
              <Typography variant="body2">
                x {item.quantity}
              </Typography>
            </Box>

            {item.discount > 0 ? (() => {
              const itemTotal = (item?.product?.sellingPrice || 0) * (item.quantity || 0);
              const discountPercentage = itemTotal > 0 
                ? Math.round((item.discount / itemTotal) * 100) 
                : 0;
              return (
                <Box sx={{ width: 120, textAlign: 'right', mr: 2, flexShrink: 0 }}>
                  <Typography variant="body2" color="error.main" noWrap>
                    Discount @{discountPercentage}%
                  </Typography>
                </Box>
              );
            })() : (
              <Box sx={{ width: 120, mr: 2, flexShrink: 0 }} />
            )}

            <Box sx={{ width: 130, textAlign: 'right', flexShrink: 0 }}>
              <Typography variant="body2" color="text.primary" fontWeight="bold" noWrap>
                {fCurrency(((item?.product?.sellingPrice || 0) * (item.quantity || 0)) - (item.discount || 0))}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Scrollbar>

      {renderTotal}
    </Card>
  );
}
