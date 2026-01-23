// useCart.js
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { cartList } from 'src/store/action/cartActions';

const useCart = () => {
  const dispatch = useDispatch();
  
  const addToCartData = useSelector((state) => state.cart?.cart || []);

 
  useEffect(() => {
    dispatch(cartList());
  }, [dispatch]);

  // Sort by createdAt to maintain insertion order (same as backend)
  const sortedCartData = [...(addToCartData || [])].sort((a, b) => {
    if (!a.createdAt && !b.createdAt) return 0;
    if (!a.createdAt) return 1;
    if (!b.createdAt) return -1;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  const mappedData = sortedCartData.map((item) => {
    const itemTotal = item.product.sellingPrice * item.product.stdPkg * item.noOfPkg;
    const itemDiscount = item.discount || 0;
    // Calculate totalAmount after discount: (price * stdPkg * noOfPkg) - discount
    const totalAmount = itemTotal - itemDiscount;
    
    return {
      id: item.id,
      quantity: item.quantity,
      stockQuantity: item.stockQuantity,
      userId: item.userId,
      price: item.product.sellingPrice,
      stdPkg: item.product.stdPkg,
      noOfPkg: item.noOfPkg,
      discount: itemDiscount,
      gstRate: item.product.gstRate || 0,
      description: item.product.description,
      totalAmount, // Total after cart discount
      name: item.product.itemName,
      productID: item.product.id,
      dimensionalFiles: item.product.dimensionalFiles,
      createdAt: item.createdAt, // Preserve createdAt for sorting
    };
  });

  return mappedData;
};

export default useCart;
