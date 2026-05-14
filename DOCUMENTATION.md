# HandyCraft Project Documentation

## Project Overview
**HandyCraft** is a full-stack e-commerce platform specializing in handmade, customized gifts such as frames, books, and special occasion items. The project is designed with a modern, minimalist aesthetic using a brown and beige color palette to emphasize the "handmade" and "crafted with love" theme.

### Tech Stack
- **Frontend:** HTML5, TailwindCSS (CDN), Vanilla JavaScript.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (via Mongoose).
- **Image Hosting:** Cloudinary (for product and receipt images).
- **Security:** Helmet, Express Rate Limit, JWT (for admin authentication).

---

## Frontend Architecture

### Core Pages
1.  **Home (`index.html`):**
    - Features a hero section with an animated logo.
    - Displays "Best Sellers" dynamically fetched from the backend.
    - Includes a secret admin login access (5 taps on the logo).
2.  **Product Listing (`products.html`):**
    - Displays all products or filters them by category (Frames, Books, Birthday, Baby, Best Seller).
3.  **Product Details (`product-details.html`):**
    - Shows high-quality images, price, and description.
    - **Customization Engine:** Allows users to input text or upload multiple images based on the specific product's requirements.
    - Uses **IndexedDB** to temporarily store large image files to avoid browser `localStorage` limits.
4.  **Cart (`cart.html`):**
    - Manages selected items, quantities, and customizations.
    - Calculated total price.
5.  **Payment (`payment.html`):**
    - Collects customer contact info (Name, Phone, Instagram, Address).
    - Provides payment instructions (InstaPay, Telda, WE Pay).
    - Requires an 11-digit transaction reference number and an optional receipt screenshot.
6.  **Success (`success.html`):**
    - Displays the final Order ID and Transaction ID.
    - Confirms the order has been received for manual review.

### Key Scripts
- `script.js`: Central utility for generating Transaction IDs and managing order logic.
- `cart-logic.js`: Handles all shopping cart operations (add, update, remove, clear) using `localStorage`.
- `data.js`: (Likely legacy or fallback) containing static product data.

---

## Backend API Endpoints

### Authentication (`/api/auth`)
- `POST /login`: Admin login using a password. Returns a JWT token.

### Products (`/api/products`)
- `GET /`: Retrieve all products (sorted by newest).
- `GET /:id`: Retrieve a specific product by ID.
- `POST /`: (Protected) Create a new product.
- `DELETE /:id`: (Protected) Delete a product.

### Orders (`/api/orders`)
- `POST /`: Create a new order (Public, Rate-limited).
- `GET /`: (Protected) Retrieve all orders.
- `GET /:id`: (Protected) Retrieve a single order by ID.
- `PATCH /:id`: (Protected) Update order status (`Pending`, `Paid`, `Completed`, `Rejected`).

### Uploads (`/api/upload`)
- Handles image uploads to Cloudinary.

---

## Database Models

### Product Model
- `name`: String
- `price`: Number
- `category`: String
- `description`: String
- `images`: Array of Strings (Cloudinary URLs)
- `bestSeller`: Boolean
- `customFields`: Array of objects defining customization options:
    - `label`: Name of the field.
    - `type`: `text` or `image`.
    - `required`: Boolean.
    - `minImages`/`maxImages`: Constraints for image uploads.

### Order Model
- `customer`: Object (name, phone, address, instagram)
- `items`: Array of objects containing:
    - `productId`, `name`, `price`, `quantity`.
    - `customization`: Mixed type (stores text and image URLs).
- `totalPrice`: Number
- `payment`: Object (method, transactionReference, receiptImageUrl)
- `orderNumber`: String (Format: `HC-DDMM-XXX`)
- `status`: String (`Pending`, `Paid`, `Completed`, `Rejected`)

---

## Order Flow

1.  **Selection:** Customer browses products on `index.html` or `products.html`.
2.  **Customization:** On `product-details.html`, the customer fills in custom text or uploads photos. Photos are saved to **IndexedDB** to maintain performance.
3.  **Cart:** Item is added to `localStorage` (metadata) and IndexedDB (heavy images).
4.  **Checkout:** Customer enters delivery details and payment reference on `payment.html`.
5.  **Submission:**
    - The frontend sends the order data (customer info + items + payment ref) to `POST /api/orders`.
    - The backend generates a unique `orderNumber` (e.g., `HC-1005-001`).
    - Images are uploaded from IndexedDB/localStorage to Cloudinary via the backend.
6.  **Confirmation:** Customer is redirected to `success.html` with their Order ID.
7.  **Fulfillment:** Admin logs into the dashboard to review the payment and update the status to `Paid` or `Completed`.

---

## Environment Variables
Create a `.env` file in the `backend/` directory with the following:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
ADMIN_PASSWORD=your_secure_admin_password
JWT_SECRET=your_jwt_secret_key
API_BASE_URL=http://localhost:5000/api
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret
ALLOWED_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
```

---

## Deployment
- **Frontend:** Can be hosted on Vercel, Netlify, or GitHub Pages.
- **Backend:** Can be hosted on Render, Railway, or Heroku.
- **Database:** MongoDB Atlas (Cloud).
- **Images:** Cloudinary (Free tier).
