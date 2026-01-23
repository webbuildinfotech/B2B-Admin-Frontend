import { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import { useBoolean } from 'src/hooks/use-boolean';
import { Iconify } from 'src/components/iconify';
import { useCheckoutContext } from './context';
import { CheckoutSummary } from './checkout-summary';
import { AddressItem, AddressNewForm } from 'src/sections/vendor-sections/address';
import { useDispatch, useSelector } from 'react-redux';
import useCart from './components/useCart';
import { addressList, createAddress, deleteAddress, updateAddress } from 'src/store/action/addressActions';
import { getAdminState } from 'src/store/action/userActions';
import { CheckoutPayment } from './checkout-payment';
import { LoadingButton } from '@mui/lab';
import { Typography, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Alert } from '@mui/material';
import { createOrder, createOrderItem } from 'src/store/action/orderActions';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const DELIVERY_OPTIONS = [
  { id: 'Transportation', value: 0, label: 'Transportation', description: '3-5 days delivery' },
  { id: 'Self Pickup', value: 0, label: 'Self Pickup', description: '2-3 days delivery' },
]

export function CheckoutBillingAddress() {

  const [discountData, setDiscountData] = useState(0); // State for discount value
  const [selectedDelivery, setSelectedDelivery] = useState(null); // Track selected delivery option
  const checkout = useCheckoutContext();
  const dispatch = useDispatch();
  const mappedData = useCart();

  const noOfPackages = mappedData.reduce((acc, item) => acc + item.noOfPkg, 0);
  const stdPackages = mappedData.reduce((acc, item) => acc + item.stdPkg, 0);

  // Subtotal is already calculated in useCart with discounts applied
  // totalAmount in mappedData is already (price * stdPkg * noOfPkg) - discount
  const subtotal = mappedData.reduce((acc, item) => acc + item.totalAmount, 0);
  
  // Calculate totalQuantity as sum of (stdPkg * noOfPkg) for each item
  const quantity = mappedData.reduce((acc, item) => acc + (item.stdPkg * item.noOfPkg), 0);

  // Round discount percentage to 2 decimal places to avoid floating point precision issues
  const discountPercentage = subtotal > 0 ? Math.round(((discountData / subtotal) * 100) * 100) / 100 : 0;
  
  // Calculate GST breakdown for final amount (same logic as checkout-summary)
  const [adminState, setAdminState] = useState(null);
  const [vendorState, setVendorState] = useState(null);
  const [isStateMatch, setIsStateMatch] = useState(false);
  
  // Get admin state from Redux store
  const adminStateFromStore = useSelector((state) => state.user?.adminState);
  
  // Fetch admin state and get vendor state from localStorage
  useEffect(() => {
    const fetchStates = async () => {
      try {
        // Get admin state from Redux store (fetch if not available)
        let adminStateValue = adminStateFromStore;
        if (!adminStateValue) {
          adminStateValue = await dispatch(getAdminState());
        }
        setAdminState(adminStateValue);
        
        // Get vendor state from localStorage (userData)
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const vendorStateValue = userData?.user?.state || null;
        setVendorState(vendorStateValue);
        
        const match = !!(adminStateValue && vendorStateValue && adminStateValue === vendorStateValue);
        setIsStateMatch(match);
      } catch (error) {
        console.error('Failed to fetch states:', error);
      }
    };
    fetchStates();
  }, [dispatch, adminStateFromStore]);
  
  // Calculate GST breakdown - GST should be calculated AFTER order-level discount
  const calculateGSTBreakdown = () => {
    if (!mappedData || mappedData.length === 0) {
      return { totalGST: 0, cgst: 0, sgst: 0, igst: 0, isSameState: false };
    }
    
    const isSameState = isStateMatch;
    
    // Calculate total before order-level discount
    const totalBeforeOrderDiscount = mappedData.reduce((sum, item) => {
      const itemTotal = item.price * item.stdPkg * item.noOfPkg;
      const itemDiscount = item.discount || 0;
      return sum + (itemTotal - itemDiscount);
    }, 0);
    
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    
    mappedData.forEach((item) => {
      const itemTotal = item.price * item.stdPkg * item.noOfPkg;
      const itemDiscount = item.discount || 0;
      const priceAfterItemDiscount = itemTotal - itemDiscount;
      
      // Calculate proportion of this item in the total
      const itemProportion = totalBeforeOrderDiscount > 0 ? priceAfterItemDiscount / totalBeforeOrderDiscount : 0;
      
      // Apply order-level discount proportionally to this item
      const itemPriceAfterOrderDiscount = priceAfterItemDiscount - (discountData * itemProportion);
      
      const gstRate = item.gstRate || 0;
      
      if (gstRate > 0) {
        if (isSameState) {
          // Calculate GST on the amount after order-level discount
          const cgst = (itemPriceAfterOrderDiscount * gstRate) / 200;
          const sgst = (itemPriceAfterOrderDiscount * gstRate) / 200;
          totalCGST += cgst;
          totalSGST += sgst;
        } else {
          // Calculate GST on the amount after order-level discount
          const igst = (itemPriceAfterOrderDiscount * gstRate) / 100;
          totalIGST += igst;
        }
      }
    });
    
    return {
      cgst: totalCGST,
      sgst: totalSGST,
      igst: totalIGST,
      totalGST: totalCGST + totalSGST + totalIGST,
      isSameState,
    };
  };
  
  const gstBreakdown = calculateGSTBreakdown();
  const subtotalAfterDiscount = subtotal - discountData;
  const finalTotalWithGST = subtotalAfterDiscount + gstBreakdown.totalGST;
  
  // For display in CheckoutSummary
  const total = finalTotalWithGST;

  const addressForm = useBoolean();
  const userAddress = useSelector((state) => state.address?.address || []);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState(null); // State for address being edited
  const [confirmDelete, setConfirmDelete] = useState(null); // State for delete confirmation


  const defaultValues = { delivery: checkout.shipping };
  const methods = useForm({ defaultValues });

  // Watch delivery selection to update GST display in real-time
  const deliveryValue = methods.watch('delivery');
  
  useEffect(() => {
    setSelectedDelivery(deliveryValue);
  }, [deliveryValue]);


  useEffect(() => {
    console.log("hi")
    // Retrieve discount value from sessionStorage on component mount
    const storedDiscount = sessionStorage.getItem('discountValue');
    if (storedDiscount) {
      setDiscountData(storedDiscount);
    } else {
      // If no discount value, initialize with 0
      sessionStorage.setItem('discountValue', 0);
    }
    return () => {
      // Clear discountValue when leaving the billing address page
      sessionStorage.removeItem('discountValue');
    };
  }, []);

  useEffect(() => {
    dispatch(addressList());
  }, [dispatch]);

  const handleSelectAddress = (id) => {
    setSelectedAddressId(id);
  };

  const handleAddAddress = async (data) => {
    try {
      await dispatch(createAddress(data));
      dispatch(addressList());
      addressForm.onFalse();
    } catch (error) {
      console.error('Failed to add address:', error);
    }
  };

  const handleEditAddress = async (id, data) => {
    try {
      await dispatch(updateAddress(id, data));
      dispatch(addressList());
      setAddressToEdit(null); // Clear edit mode after updating
      addressForm.onFalse(); // Close the form
    } catch (error) {
      console.error('Failed to update address:', error);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      if (confirmDelete) {
        await dispatch(deleteAddress(confirmDelete)); // Delete address with ID
        dispatch(addressList());
        setConfirmDelete(null); // Close the confirmation dialog
      }
    } catch (error) {
      console.error('Failed to delete address:', error);
    }
  };

  const toggleShowAllAddresses = () => {
    setShowAllAddresses((prev) => !prev);
  };

  const handleSubmit = async () => {
    // Validate selected address has mobile and address
    const selectedAddress = userAddress.find(addr => addr.id === selectedAddressId);
    
    if (!selectedAddress) {
      toast.error('Please select an address');
      return;
    }

    // Check if mobile number is missing, null, empty, or invalid
    const { mobile, street_address: streetAddress } = selectedAddress;
    const isValidMobile = mobile && 
                          mobile !== null && 
                          mobile !== undefined && 
                          mobile !== 'N/A' && 
                          mobile !== 'Not Available' && 
                          typeof mobile === 'string' && 
                          mobile.trim() !== '';
    
    if (!isValidMobile) {
      toast.error('Mobile number is required. Please update the selected address with a valid mobile number.');
      return;
    }

    // Check if street address is missing, null, empty, or invalid
    const isValidAddress = streetAddress && 
                          streetAddress !== null && 
                          streetAddress !== undefined && 
                          streetAddress !== 'N/A' && 
                          streetAddress !== 'Not Available' && 
                          typeof streetAddress === 'string' && 
                          streetAddress.trim() !== '';
    
    if (!isValidAddress) {
      toast.error('Address is required. Please update the selected address with a valid street address.');
      return;
    }

    setIsSubmitting(true);

    const selectedDeliveryId = methods.getValues('delivery'); // Get selected delivery ID
    const selectedDeliveryOption = DELIVERY_OPTIONS.find(option => option.id === selectedDeliveryId);

    try {
      const orderData = {
        noOfPkgs : noOfPackages,
        stdPkgs : stdPackages,
        totalPrice: subtotal,
        totalQuantity: quantity,
        addressId: selectedAddressId,
        delivery: selectedDeliveryOption.id,
        discount: discountPercentage,
        finalAmount: finalTotalWithGST,
        cgst: gstBreakdown.cgst,
        sgst: gstBreakdown.sgst,
        igst: gstBreakdown.igst,
        totalGst: gstBreakdown.totalGST
      };

      const orderResponse = await dispatch(createOrder(orderData));

      if (orderResponse) {
        const itemData = {
          orderId: orderResponse.data?.id,
          products: mappedData.map((item) => ({
            productId: item.productID,
            // Send actual quantity (stdPkg * noOfPkg) to Tally, not just noOfPkg
            quantity: item.stdPkg * item.noOfPkg,
            // Include per-item discount
            discount: item.discount || 0,
          })),
        };

        const itemResponse = await dispatch(createOrderItem(itemData));

        if (itemResponse) {
          checkout.onNextStep();
          checkout.onReset();
        } else {
          console.error('Failed to create items for the order:', itemResponse);
        }
      } else {
        console.error('Failed to create order:', orderResponse);
      }
    } catch (error) {
      console.error('Order submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <Card sx={{ mb: 1 }}>
            <CheckoutPayment deliveryOptions={DELIVERY_OPTIONS} methods={methods} /> {/* Pass delivery options and form methods */}
            <CardContent>
              <Stack direction="row" justifyContent="space-between">
                <Button
                  size="small"
                  color="primary"
                  onClick={() => {
                    setAddressToEdit(null); // Clear edit mode
                    addressForm.onTrue(); // Open form for new address
                  }}
                  startIcon={<Iconify icon="mingcute:add-line" />}
                >
                  New Address
                </Button>
              </Stack>

              <Box sx={{ mt: 1 }}>
                {userAddress.length > 0 ? (
                  <div>
                    {(showAllAddresses ? userAddress : userAddress.slice(0, 2)).map((address,index) => (
                      <Box key={address.id} sx={{ position: 'relative', mb: 3 }}>
                        <AddressItem
                          address={address}
                          index={index}
                          onClick={() => handleSelectAddress(address.id)}
                          sx={{
                            p: 3,
                            borderRadius: 1,
                            boxShadow: (theme) => theme.customShadows.card,
                            cursor: 'pointer',
                            border: selectedAddressId === address.id ? '2px solid black' : '1px solid grey',
                            backgroundColor: selectedAddressId === address.id ? '#e3f2fd' : 'transparent', // Light background for selected address

                          }}
                        />
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Button
                            size="small"
                            color="primary"
                            onClick={() => {
                              setAddressToEdit(address); // Set address to edit
                              addressForm.onTrue(); // Open form with edit mode
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => setConfirmDelete(address.id)} // Open confirm dialog
                          >
                            Delete
                          </Button>
                        </Stack>
                      </Box>
                    ))}
                    {userAddress.length > 2 && (
                      <Button onClick={toggleShowAllAddresses} fullWidth>
                        {showAllAddresses ? 'Show Less' : 'Show More'}
                      </Button>
                    )}
                  </div>
                ) : (
                  <Typography>No address available</Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          <Button
            sx={{ m: 1 }}
            size="small"
            color="inherit"
            onClick={checkout.onBackStep}
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          >
            Back
          </Button>
        </Grid>

        <Grid xs={12} md={4}>
          <CheckoutSummary
            total={total}
            subtotal={subtotal}
            shipping={checkout.shipping}
            discount={discountData}
            cartItems={mappedData}
            selectedAddressState={
              selectedAddressId && selectedDelivery 
                ? userAddress.find(addr => addr.id === selectedAddressId)?.state 
                : null
            }
          />

          {subtotal > 0 && (
            <>
              {!selectedAddressId && !isSubmitting && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  Please select an address
                </Alert>
              )}

              {selectedAddressId && (() => {
                const selectedAddress = userAddress.find(addr => addr.id === selectedAddressId);
                if (!selectedAddress) return null;
                
                const { mobile, street_address: streetAddress } = selectedAddress;
                const hasMobile = mobile && 
                                mobile !== null && 
                                mobile !== undefined && 
                                mobile !== 'N/A' && 
                                mobile !== 'Not Available' && 
                                typeof mobile === 'string' && 
                                mobile.trim() !== '';
                const hasAddress = streetAddress && 
                                  streetAddress !== null && 
                                  streetAddress !== undefined && 
                                  streetAddress !== 'N/A' && 
                                  streetAddress !== 'Not Available' && 
                                  typeof streetAddress === 'string' && 
                                  streetAddress.trim() !== '';
                
                if (!hasMobile || !hasAddress) {
                  return (
                    <Alert severity="warning" sx={{ mb: 1 }}>
                      {!hasMobile && !hasAddress 
                        ? 'Mobile number and address are required. Please update the selected address.'
                        : !hasMobile 
                        ? 'Mobile number is required. Please update the selected address.'
                        : 'Address is required. Please update the selected address.'}
                    </Alert>
                  );
                }
                return null;
              })()}

              <LoadingButton
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                disabled={!selectedAddressId || isSubmitting || (() => {
                  const selectedAddress = userAddress.find(addr => addr.id === selectedAddressId);
                  if (!selectedAddress) return true;
                  
                  const { mobile, street_address: streetAddress } = selectedAddress;
                  const hasMobile = mobile && 
                                  mobile !== null && 
                                  mobile !== undefined && 
                                  mobile !== 'N/A' && 
                                  mobile !== 'Not Available' && 
                                  typeof mobile === 'string' && 
                                  mobile.trim() !== '';
                  
                  const hasAddress = streetAddress && 
                                    streetAddress !== null && 
                                    streetAddress !== undefined && 
                                    streetAddress !== 'N/A' && 
                                    streetAddress !== 'Not Available' && 
                                    typeof streetAddress === 'string' && 
                                    streetAddress.trim() !== '';
                  
                  return !hasMobile || !hasAddress;
                })()}
                loading={isSubmitting}
                onClick={handleSubmit}
                sx={{
                  backgroundColor: 'var(--primary-color-2)',
                  color: '#fff',
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                }}
              >
                Complete order
              </LoadingButton>
            </>
          )}
        </Grid>
      </Grid>

      <AddressNewForm
        open={addressForm.value}
        onClose={() => {
          addressForm.onFalse();
          setAddressToEdit(null); // Clear edit data when form closes
        }}
        onCreate={handleAddAddress}
        onEdit={handleEditAddress}
        editData={addressToEdit} // Pass address data for editing
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title="Delete Address?"
        content={
          <Box>
            <Typography gutterBottom>Are you sure you want to delete this Address?</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              This action cannot be undone.
            </Typography>
          </Box>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteAddress}

          >
            Delete
          </Button>
        }
      />


    </>
  );
}
