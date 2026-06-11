/**
 * Sanitize and normalize customer object
 */
function sanitizeCustomer(customer) {
  return {
    name: String(customer.name || '').trim().substring(0, 100),
    phone: String(customer.phone || '').trim().substring(0, 20),
    address: String(customer.address || '').trim().substring(0, 500),
    governorate: String(customer.governorate || '').trim().substring(0, 50),
    instagram: String(customer.instagram || '').trim().substring(0, 50)
  };
}

/**
 * Sanitize and normalize items array
 */
function sanitizeItems(items) {
  return items.map(item => ({
    productId: String(item.productId || '').trim(),
    name: String(item.name || '').trim().substring(0, 200),
    subcategory: String(item.subcategory || '').trim().substring(0, 100),
    price: Number(item.price) || 0,
    quantity: Number(item.quantity || item.qty) || 1,
    customization: sanitizeCustomization(item.customization || {})
  }));
}

/**
 * Sanitize customization object (prevent injection)
 */
function sanitizeCustomization(customization) {
  const result = {};

  // Preserve arbitrary text/primitive fields (for dynamic product custom fields)
  const entries = Object.entries(customization || {});
  for (const [key, value] of entries) {
    if (key === "images" || key === "shapes") continue;
    if (!key) continue;

    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      result[String(key).trim().substring(0, 60)] = String(value).trim().substring(0, 500);
    }
  }

  result.shapes = Array.isArray(customization.shapes)
    ? customization.shapes.map((s) => String(s).trim()).slice(0, 20)
    : [];
  
  // Preserve image objects (file/field) and remove the strict 10-image limit
  // The actual upload and final mapping happens in the controller
  result.images = Array.isArray(customization.images) ? customization.images : [];

  return result;
}

/**
 * Sanitize payment object
 */
function sanitizePayment(payment) {
  return {
    method: String(payment.method || '').trim(),
    gmail: String(payment.gmail || '').trim(),
    transactionReference: String(payment.transactionReference || '').trim(),
    receiptImageUrl: payment.receiptImageUrl ? String(payment.receiptImageUrl || '').trim() : ''
  };
}

module.exports = {
  sanitizeCustomer,
  sanitizeItems,
  sanitizeCustomization,
  sanitizePayment
};
