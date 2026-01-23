/**
 * Calculate GST percentages from GST amounts and base amount
 * @param {Object} params - Parameters for GST calculation
 * @param {number} params.cgst - CGST amount
 * @param {number} params.sgst - SGST amount
 * @param {number} params.igst - IGST amount
 * @param {number} params.baseAmount - Base amount (subtotal after item discounts, before order discount)
 * @returns {Object} Object containing cgstPercentage, sgstPercentage, igstPercentage
 */
export function calculateGSTPercentages({ cgst = 0, sgst = 0, igst = 0, baseAmount = 0 }) {
  // Calculate CGST percentage (CGST is half of total GST rate)
  // CGST = (base * gstRate) / 200, so CGST rate = (CGST / base) * 200
  const cgstPercentage = cgst > 0 && baseAmount > 0 
    ? Math.round(((cgst / baseAmount) * 200) * 100) / 100 
    : 0;
  
  // Calculate SGST percentage (SGST is half of total GST rate)
  const sgstPercentage = sgst > 0 && baseAmount > 0 
    ? Math.round(((sgst / baseAmount) * 200) * 100) / 100 
    : 0;
  
  // Calculate IGST percentage (IGST is full GST rate)
  // IGST = (base * gstRate) / 100, so IGST rate = (IGST / base) * 100
  const igstPercentage = igst > 0 && baseAmount > 0 
    ? Math.round(((igst / baseAmount) * 100) * 100) / 100 
    : 0;

  return {
    cgstPercentage,
    sgstPercentage,
    igstPercentage,
  };
}

/**
 * Calculate base amount for GST from order items
 * Base amount = subtotal after item discounts (before order discount)
 * @param {Array} items - Array of order items with product, quantity, and discount
 * @param {number} fallbackAmount - Fallback amount if items are not available
 * @returns {number} Base amount for GST calculation
 */
export function calculateBaseAmountForGST(items = [], fallbackAmount = 0) {
  if (items && items.length > 0) {
    // Calculate subtotal after item discounts
    return items.reduce((sum, item) => {
      const itemTotal = (item.product?.sellingPrice || item.price || 0) * (item.quantity || 0);
      const itemDiscount = item.discount || 0;
      return sum + (itemTotal - itemDiscount);
    }, 0);
  }
  return fallbackAmount;
}

