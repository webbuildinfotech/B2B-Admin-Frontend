import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAdminState } from 'src/store/action/userActions';

import { fCurrency } from 'src/utils/format-number';
import { calculateGSTPercentages } from 'src/utils/calculate-gst-percentage';

import { Iconify } from 'src/components/iconify';
import { toast } from 'sonner';

// ----------------------------------------------------------------------

export function CheckoutSummary({ 
  total, 
  onEdit, 
  discount, 
  subtotal, 
  shipping, 
  onApplyDiscount,
  cartItems = [],
  selectedAddressState = null,
}) {
  const [discountCode, setDiscountCode] = useState(''); // State to store input value
  const [vendorState, setVendorState] = useState(null);
  const [isStateMatch, setIsStateMatch] = useState(false);
  const dispatch = useDispatch();
  
  // Get admin state from Redux store
  const adminState = useSelector((state) => state.user?.adminState);

  const displayShipping = shipping !== null ? 'Free' : '-';

  // Fetch admin state and get vendor state from localStorage
  useEffect(() => {
    const fetchStates = async () => {
      try {
        // Step 1: Get admin state from Redux store (fetch if not available)
        let adminStateValue = adminState;
        if (!adminStateValue) {
          adminStateValue = await dispatch(getAdminState());
        }
        
        // Step 2: Get vendor state from localStorage (userData) - no API call needed
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const vendorStateValue = userData?.user?.state || null;
        setVendorState(vendorStateValue);
        
        // Step 3: Compare states
        const match = !!(adminStateValue && vendorStateValue && adminStateValue === vendorStateValue);
        setIsStateMatch(match);
      } catch (error) {
        console.error('Failed to fetch states:', error);
      }
    };
    fetchStates();
  }, [dispatch, adminState]);

  // Calculate GST breakdown
  const calculateGSTBreakdown = () => {
    // Subtotal passed here is already after cart discounts (per-item discounts)
    const subtotalAfterItemDiscount = subtotal;
    const orderLevelDiscount = discount || 0;
    
    // Calculate subtotal after order-level discount
    const subtotalAfterOrderDiscount = subtotalAfterItemDiscount - orderLevelDiscount;

    if (!cartItems || cartItems.length === 0) {
      return {
        subtotalAfterItemDiscount,
        subtotalAfterOrderDiscount,
        cgst: 0,
        sgst: 0,
        igst: 0,
        totalGST: 0,
        isSameState: false,
      };
    }

    // Use state match from admin and vendor profile states (not address state)
    // isStateMatch is calculated in useEffect from admin API and localStorage vendor state
    const isSameState = isStateMatch;

    // Calculate GST on subtotal AFTER order-level discount is applied
    // First, calculate the proportion of each item in the total
    const totalBeforeOrderDiscount = cartItems.reduce((sum, item) => {
      const itemTotal = item.price * item.stdPkg * item.noOfPkg;
      const itemDiscount = item.discount || 0;
      return sum + (itemTotal - itemDiscount);
    }, 0);

    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;

    cartItems.forEach((item) => {
      const itemTotal = item.price * item.stdPkg * item.noOfPkg;
      const itemDiscount = item.discount || 0; // This is discount amount, not percentage
      const priceAfterItemDiscount = itemTotal - itemDiscount;
      
      // Calculate proportion of this item in the total
      const itemProportion = totalBeforeOrderDiscount > 0 ? priceAfterItemDiscount / totalBeforeOrderDiscount : 0;
      
      // Apply order-level discount proportionally to this item
      const itemPriceAfterOrderDiscount = priceAfterItemDiscount - (orderLevelDiscount * itemProportion);
      
      const gstRate = item.gstRate || 0;

      if (gstRate > 0) {
        if (isSameState) {
          // CGST and SGST are half of total GST rate each
          // Calculate GST on the amount after order-level discount
          const cgst = (itemPriceAfterOrderDiscount * gstRate) / 200;
          const sgst = (itemPriceAfterOrderDiscount * gstRate) / 200;
          totalCGST += cgst;
          totalSGST += sgst;
        } else {
          // IGST is full GST rate
          // Calculate GST on the amount after order-level discount
          const igst = (itemPriceAfterOrderDiscount * gstRate) / 100;
          totalIGST += igst;
        }
      }
    });

    return {
      subtotalAfterItemDiscount,
      subtotalAfterOrderDiscount,
      cgst: totalCGST,
      sgst: totalSGST,
      igst: totalIGST,
      totalGST: totalCGST + totalSGST + totalIGST,
      isSameState,
    };
  };

  const gstBreakdown = calculateGSTBreakdown();
  const orderLevelDiscount = discount || 0;
  
  // Calculate GST percentages using utility function
  // Use subtotalAfterOrderDiscount as base amount since GST is calculated after discount
  const { cgstPercentage, sgstPercentage, igstPercentage } = calculateGSTPercentages({
    cgst: gstBreakdown.cgst,
    sgst: gstBreakdown.sgst,
    igst: gstBreakdown.igst,
    baseAmount: gstBreakdown.subtotalAfterOrderDiscount,
  });
  
  // Calculate final total based on whether address is selected (billing address page)
  // GST is now calculated on the amount AFTER order-level discount
  // Before checkout (cart): Subtotal - Discount + Shipping (NO GST)
  // After address selection (billing): (Subtotal - Discount) + GST + Shipping
  let finalTotal;
  if (selectedAddressState) {
    // After address selection on billing page: Subtotal - Discount, then add GST calculated on discounted amount
    finalTotal = gstBreakdown.subtotalAfterOrderDiscount + gstBreakdown.totalGST + (shipping || 0);
  } else {
    // Before checkout: Subtotal - Discount + Shipping (NO GST)
    finalTotal = gstBreakdown.subtotalAfterOrderDiscount + (shipping || 0);
  }

  const handleInputChange = (event) => {
    setDiscountCode(event.target.value); // Update the state as the user types
  };

  const handleApply = () => {
    const percentage = parseFloat(discountCode);
    if (Number.isNaN(percentage) || percentage <= 0 || percentage > 100) {
      toast.error('Enter a valid percentage between 1 and 100');
      return;
    }
  
    // Discount is always applied on subtotal only, NOT on GST
    // Calculate discount on subtotal only (same for both before and after checkout)
    // Round to 2 decimal places to avoid floating point precision issues
    const discountValue = Math.round(((gstBreakdown.subtotalAfterItemDiscount * percentage) / 100) * 100) / 100;
    
    onApplyDiscount(discountValue); // Trigger parent function
    setDiscountCode(''); // Clear the input field immediately after applying
  };


  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader
        title="Order summary"
        action={
          onEdit && (
            <Button size="small" onClick={onEdit} startIcon={<Iconify icon="solar:pen-bold" />}>
              Edit
            </Button>
          )
        }
      />

      <Stack spacing={2} sx={{ p: 3 }}>
        <Box display="flex">
          <Typography
            component="span"
            variant="body2"
            sx={{ flexGrow: 1, color: 'text.secondary' }}
          >
            Sub total
          </Typography>
          <Typography component="span" variant="subtitle2">
            {fCurrency(gstBreakdown.subtotalAfterItemDiscount)}
          </Typography>
        </Box>

        {discount > 0 && (() => {
          // Round discount percentage to avoid floating point precision issues
          const discountPercentage = gstBreakdown.subtotalAfterItemDiscount > 0 
            ? Math.round(((discount / gstBreakdown.subtotalAfterItemDiscount) * 100) * 100) / 100
            : 0;
          
          return (
            <Box display="flex">
              <Typography
                component="span"
                variant="body2"
                sx={{ flexGrow: 1, color: 'text.secondary' }}
              >
                Discount @{Math.round(discountPercentage)}%
              </Typography>
              <Typography component="span" variant="subtitle2">
                {fCurrency(-discount)}
              </Typography>
            </Box>
          );
        })()}

        {/* Show GST only if address is selected (billing address page) */}
        {selectedAddressState && (
          <>
            {gstBreakdown.isSameState ? (
              <>
                {gstBreakdown.cgst > 0 && (
                  <Box display="flex">
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ flexGrow: 1, color: 'text.secondary' }}
                    >
                      CGST @{Math.round(cgstPercentage)}%
                    </Typography>
                    <Typography component="span" variant="subtitle2">
                      {fCurrency(gstBreakdown.cgst)}
                    </Typography>
                  </Box>
                )}
                {gstBreakdown.sgst > 0 && (
                  <Box display="flex">
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ flexGrow: 1, color: 'text.secondary' }}
                    >
                      SGST @{Math.round(sgstPercentage)}%
                    </Typography>
                    <Typography component="span" variant="subtitle2">
                      {fCurrency(gstBreakdown.sgst)}
                    </Typography>
                  </Box>
                )}
              </>
            ) : (
              gstBreakdown.igst > 0 && (
                <Box display="flex">
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ flexGrow: 1, color: 'text.secondary' }}
                  >
                    IGST @{Math.round(igstPercentage)}%
                  </Typography>
                  <Typography component="span" variant="subtitle2">
                    {fCurrency(gstBreakdown.igst)}
                  </Typography>
                </Box>
              )
            )}
          </>
        )}

        <Box display="flex">
          <Typography
            component="span"
            variant="body2"
            sx={{ flexGrow: 1, color: 'text.secondary' }}
          >
            Shipping
          </Typography>
          <Typography component="span" variant="subtitle2">
            {shipping ? fCurrency(shipping) : displayShipping}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box display="flex">
          <Typography component="span" variant="subtitle1" sx={{ flexGrow: 1 }}>
            Total
          </Typography>

          <Box sx={{ textAlign: 'right' }}>
            <Typography
              component="span"
              variant="subtitle1"
              sx={{ display: 'block', color: 'error.main' }}
            >
              {fCurrency(finalTotal)}
            </Typography>
           
          </Box>
        </Box>

        {onApplyDiscount && (
          <TextField
            fullWidth
            placeholder="Enter discount percentage (e.g., 10 for 10%)"
            value={discountCode} // Bind input to state
            onChange={handleInputChange} // Update state on input change
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button color="primary" onClick={handleApply} sx={{ mr: -0.5 }}>
                    Apply
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        )}
      </Stack>
    </Card>
  );
}
