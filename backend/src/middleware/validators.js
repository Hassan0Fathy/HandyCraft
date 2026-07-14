const validator = require('validator');

/**
 * Validate customer information
 */
function validateCustomerData(customer) {
  const errors = [];

  if (!customer.name || !validator.isLength(customer.name, { min: 2, max: 100 })) {
    errors.push('Name must be between 2 and 100 characters');
  }

  if (!customer.phone || !validator.matches(customer.phone, /^[0-9+\-\s()]{7,20}$/)) {
    errors.push('Phone must be a valid phone number (7-20 characters)');
  }

  if (!customer.address || !validator.isLength(customer.address, { min: 5, max: 500 })) {
    errors.push('Address must be between 5 and 500 characters');
  }

  if (!customer.governorate) {
    errors.push('Governorate is required');
  }

  // Instagram is optional, but if provided, validate it
  if (customer.instagram && !validator.isLength(customer.instagram, { max: 50 })) {
    errors.push('Instagram handle must be max 50 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate order items
 */
function validateOrderItems(items) {
  const errors = [];

  if (!Array.isArray(items) || items.length === 0) {
    return {
      isValid: false,
      errors: ['Items must be a non-empty array']
    };
  }

  items.forEach((item, idx) => {
    if (!item.productId || !item.name) {
      errors.push(`Item ${idx + 1}: Product ID and name are required`);
    }
    if (!Number.isFinite(item.price) || item.price < 0) {
      errors.push(`Item ${idx + 1}: Price must be a non-negative number`);
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      errors.push(`Item ${idx + 1}: Quantity must be a positive integer`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate payment information
 */
function validatePaymentData(payment) {
  const errors = [];
  const validMethods = ['InstaPay', 'Telda', 'WE Pay'];

  if (!payment.method || !validMethods.includes(payment.method)) {
    errors.push('Payment method must be one of: InstaPay, Telda, WE Pay');
  }

  if (!payment.gmail || !validator.isEmail(payment.gmail)) {
    errors.push('A valid Gmail address is required');
  }

  // Payment screenshot is now REQUIRED
  if (!payment.receiptImageUrl && !payment.receiptImage) {
    errors.push('Payment screenshot is required');
  }

  // transactionReference is now optional for backward compatibility
  if (payment.transactionReference && !validator.isLength(payment.transactionReference, { max: 100 })) {
    errors.push('Transaction reference is too long');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate total price
 */
function validateTotalPrice(totalPrice, items, customer) {
  if (!Number.isFinite(totalPrice) || totalPrice < 0) {
    return {
      isValid: false,
      errors: ['Total price must be a non-negative number']
    };
  }

  // Shipping logic:
  // 1. Graduation > Frames: Cairo/Giza = 200 EGP, Others = Not Allowed
  // 2. All other products: Cairo/Giza = 75 EGP, Others = 95 EGP

  const governorate = (customer?.governorate || '').toLowerCase();
  const isCairoGiza = governorate === 'cairo' || governorate === 'giza';

  const hasGraduationFrames = items.some(item =>
    (item.category || '').toLowerCase() === 'graduation products' &&
    (item.subcategory || '').toLowerCase() === 'frames'
  );

  if (hasGraduationFrames && !isCairoGiza) {
    return {
      isValid: false,
      errors: ['Graduation Frames are currently available only for delivery in Cairo and Giza.']
    };
  }

  let shipping = 0;
  if (hasGraduationFrames) {
    shipping = 200;
  } else if (isCairoGiza) {
    shipping = 75;
  } else {
    shipping = 90;
  }

  const itemsTotal = items.reduce((sum, item) => {
    const q = item.qty || item.quantity || 0;
    return sum + (item.price * q);
  }, 0);

  const expectedTotal = itemsTotal + shipping;
  const tolerance = 1; // 1 EGP tolerance for rounding

  if (Math.abs(totalPrice - expectedTotal) > tolerance) {
    return {
      isValid: false,
      errors: [`Total price does not match item prices (Expected: ${expectedTotal}, Got: ${totalPrice})`]
    };
  }

  return {
    isValid: true,
    errors: []
  };
}

module.exports = {
  validateCustomerData,
  validateOrderItems,
  validatePaymentData,
  validateTotalPrice
};
