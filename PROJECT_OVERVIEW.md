# HandyCraft Project Overview

## 1. Project Summary

- **Project name:** HandyCraft / Handy Crafts
- **Project type:** Front-end handmade gifts e-commerce website
- **What the project does:**  
  A browser-based storefront for browsing handmade/custom gift products, customizing selected items, adding them to cart, submitting order/payment details, and saving orders locally in the browser.
- **Main purpose:**  
  To let customers explore custom handmade products, personalize them with messages and uploaded images, place an order, and submit manual payment proof.

## 2. Current Features Implemented

- **Homepage storefront**
  - Hero section with branding and CTA
  - Featured/best-seller products
  - Customer review section
- **Product listing**
  - Dynamic product rendering from `data.js`
  - Category filtering on `products.html`
- **Product details page**
  - Product gallery with thumbnail switching
  - Product description and pricing
  - Required customization fields
- **Customization flow**
  - Love message
  - "How it started" message
  - Proud message
  - Favorite song field
  - Reference image upload
- **Advanced frame customization**
  - Pattern selection
  - Shape selection
  - Upload limit handling for frame products
- **Cart system**
  - Add to cart
  - Quantity increase/decrease
  - Remove items
  - Cart total calculation
  - Cart badge in navigation
- **Buy now flow**
  - Direct add-and-go flow from product details to payment page
- **Checkout/payment flow**
  - Customer contact and delivery form
  - Payment method selection
  - Manual transfer instructions
  - 12-digit transaction reference validation
  - Optional screenshot upload for payment proof
- **Order persistence**
  - Orders saved in browser `localStorage`
  - Order status stored with each order
- **Order confirmation**
  - Success page displays order ID
- **Admin/order management**
  - Admin dashboard page with order cards
  - Status filtering
  - Status updates (`Pending`, `Paid`, `Completed`, `Rejected`)
  - Order detail modal
  - Receipt/reference visibility
- **Responsive UI**
  - Mobile drawer navigation
  - Responsive product grids and cards
  - Mobile-friendly layout across main pages

## 3. Pages & Structure

- **`index.html`**
  - Main landing page
  - Shows branding, featured products, reviews, footer, and entry into shopping flow
- **`products.html`**
  - Main catalog page
  - Displays all products and supports category filtering
- **`product-details.html`**
  - Individual product page
  - Handles customization, image upload, add to cart, and buy now
- **`cart.html`**
  - Displays selected items
  - Supports quantity updates, deletion, total calculation, and checkout button
- **`payment.html`**
  - Main checkout/payment page in the active flow
  - Collects customer details, payment method, transaction reference, and optional screenshot
- **`success.html`**
  - Order confirmation page
  - Displays final order ID after payment submission
- **`admin.html`**
  - Main admin dashboard
  - Shows stored orders and supports status changes and detailed review
- **`orders.html`**
  - Alternate orders/admin-style page
  - Also reads from `hc_orders` and renders stored orders
- **`order.html`**
  - Older/intermediate order details page
  - Builds extra item detail inputs and stores temporary data before payment
- **`order_new.html`**
  - Simplified alternative checkout/details page
  - Appears to be an older or parallel version
- **`category.html`**
  - Older category-specific page
  - Shows one category gallery and add-to-cart shortcut
- **`navbar.html`**
  - Standalone navbar markup/script file
  - Appears to duplicate shared navigation logic used inline in other pages

## 4. User Flow

1. **User enters the site**
   - Lands on `index.html`
   - Sees branding, featured products, and customer reviews

2. **User browses products**
   - Moves to `products.html`
   - Filters by categories such as frames, books, birthday, and baby

3. **User selects a product**
   - Opens `product-details.html?id=...`
   - Reviews images, description, and price

4. **User customizes the product**
   - Fills required message fields
   - Uploads reference images
   - If the product is a frame, also selects pattern and shapes

5. **User adds product to cart or buys now**
   - Item is stored in browser cart
   - User can continue shopping or move toward checkout

6. **User reviews cart**
   - Opens `cart.html`
   - Adjusts quantities or removes items

7. **User proceeds to payment**
   - Opens `payment.html`
   - Enters name, phone, Instagram username, address
   - Chooses payment method
   - Enters 12-digit transaction reference
   - Optionally uploads receipt screenshot

8. **Order is submitted**
   - Cart data and customer/payment data are assembled into an order object
   - Order is saved into `localStorage`

9. **User sees confirmation**
   - Redirected to `success.html`
   - Order ID is shown

10. **Admin can review order**
    - `admin.html` reads saved orders from browser storage
    - Admin can inspect details and update order status

## 5. UI/UX Notes (Observation Only)

- **Design style**
  - Soft, elegant, feminine/premium handmade-shop presentation
  - Strong use of beige, brown, cream, and muted warm tones
  - Decorative serif headings paired with cleaner body typography
- **Visual consistency**
  - Main active pages share a consistent visual language
  - Repeated navigation, colors, spacing, rounded cards, and soft shadows
- **Interaction style**
  - Subtle animations, hover transitions, image switching, and staggered reveals
  - Product cards and buttons feel polished and intentionally styled
- **Responsiveness**
  - Mobile-first layout is evident
  - Drawer menu, stacked layouts, responsive grids, and scrollable mobile elements are present
- **Observational note on structure**
  - The repo contains both newer polished pages and older/parallel pages with different styling patterns, especially `category.html`, `order.html`, `order_new.html`, and `orders.html`

## 6. Data Handling

- **Products storage**
  - Products are stored in `data.js`
  - Product objects include `id`, `name`, `description`, `price`, and `images`
- **Cart storage**
  - Cart is stored in browser `localStorage` under the key:
    - `hc_cart`
  - Cart items may include:
    - Product identity
    - Price
    - Quantity
    - Custom messages
    - Uploaded reference images
    - Frame customization selections
- **Order storage**
  - Orders are stored in browser `localStorage` under the key:
    - `hc_orders`
  - Orders include:
    - Order ID
    - Customer info
    - Cart items
    - Total
    - Status
    - Transaction reference
    - Payment method
    - Optional receipt screenshot
    - Item details/customization
- **Temporary checkout storage**
  - Temporary order detail data is stored under:
    - `hc_order_temp`
  - Used by `order.html`
- **Session storage**
  - `script.js` uses `sessionStorage` key:
    - `hc_last_transaction_id`
  - This supports transaction tracking utilities
- **Order management logic**
  - `script.js` provides utility functions for:
    - Generating order IDs
    - Saving orders
    - Reading all orders
    - Finding orders
    - Updating order status

## 7. What Is Already Complete

- **Customer-facing storefront is built**
- **Product catalog is implemented**
- **Product detail and customization flow is implemented**
- **Reference image upload is implemented**
- **Frame-specific customization logic is implemented**
- **Cart functionality is implemented**
- **Checkout/payment form is implemented**
- **Manual payment reference validation is implemented**
- **Optional receipt screenshot upload is implemented**
- **Order saving to browser storage is implemented**
- **Success/confirmation page is implemented**
- **Admin order dashboard is implemented**
- **Order status update flow is implemented**
- **Responsive styling is implemented across the main flow**
- **Static reviews/customer proof section is implemented**

## 8. What Might Still Be Missing (Only If Obvious)

- **Backend/database integration**
  - Orders are stored only in the browser, not on a server
- **Real payment gateway integration**
  - Payment is manual and proof-based, not processed through a live gateway
- **Real authentication/admin protection**
  - Admin pages appear directly accessible as front-end pages
- **Server-side order synchronization**
  - Orders seem tied to the browser/device where they were created or viewed
- **Live transaction verification**
  - Transaction reference is format-validated, but not externally verified against a payment provider
