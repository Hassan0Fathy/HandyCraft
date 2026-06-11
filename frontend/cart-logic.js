// Cart Management System - Production Ready
const CART_KEY = 'hc_cart';

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product) {
  try {
    const cart = getCart();
    
    // Ensure product has required fields
    if (!product._id && !product.id) {
      throw new Error('Invalid product: missing ID');
    }
    
    const productId = product._id || product.id;
    const quantity = parseInt(product.quantity) || 1;
    
    const cartItem = {
      id: productId + '_' + Date.now(),
      baseId: productId,
      name: String(product.name || 'Unknown Product'),
      subcategory: String(product.subcategory || '').trim(),
      price: Number(product.price) || 0,
      qty: Math.max(1, quantity),
      image: product.images?.[0] || product.image || '',
      customization: product.customization || {}
    };
    
    cart.push(cartItem);
    saveCart(cart);
    return cartItem;
  } catch (error) {
    console.error('Add to cart error:', error);
    throw error;
  }
}

function updateCartQty(index, delta) {
  try {
    const cart = getCart();
    
    if (index < 0 || index >= cart.length) {
      throw new Error('Invalid cart index');
    }
    
    const newQty = (cart[index].qty || 1) + delta;
    
    if (newQty <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].qty = newQty;
    }
    
    saveCart(cart);
    return cart;
  } catch (error) {
    console.error('Update qty error:', error);
    throw error;
  }
}

function removeFromCart(index) {
  try {
    const cart = getCart();
    
    if (index < 0 || index >= cart.length) {
      throw new Error('Invalid cart index');
    }
    
    cart.splice(index, 1);
    saveCart(cart);
    return cart;
  } catch (error) {
    console.error('Remove from cart error:', error);
    throw error;
  }
}

function clearCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify([]));
    updateCartBadge();
  } catch (error) {
    console.error('Clear cart error:', error);
    throw error;
  }
}

function getCartTotal() {
  const cart = getCart();
  return cart.reduce((sum, item) => {
    const qty = item.qty || 1;
    return sum + (item.price * qty);
  }, 0);
}

function updateCartBadge() {
  try {
    const cart = getCart();
    const badge = document.getElementById('cart-badge-nav');
    
    if (!badge) return;
    
    const count = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  } catch (error) {
    console.error('Update badge error:', error);
  }
}

// Initialize cart badge on page load
document.addEventListener('DOMContentLoaded', updateCartBadge);

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getCart,
    saveCart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    getCartTotal,
    updateCartBadge
  };
}
