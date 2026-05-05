# HandyCraft Full-Stack Guide

## Goal

We are turning your handmade e-commerce website from:

- `Frontend only`
- `Cart and orders stored in localStorage`

into:

- `Frontend + backend`
- `Orders stored in MongoDB`
- `Images stored in Cloudinary`

We are keeping it simple on purpose.

## Step 1: Project Setup

### What we added

```text
HandyCraft/
├─ backend/
│  ├─ server.js
│  └─ src/
│     ├─ app.js
│     ├─ config/
│     │  └─ db.js
│     ├─ controllers/
│     │  └─ orderController.js
│     ├─ models/
│     │  └─ Order.js
│     ├─ routes/
│     │  └─ orderRoutes.js
│     └─ utils/
│        └─ cloudinary.js
├─ .env.example
├─ package.json
├─ payment.html
├─ admin.html
└─ other frontend files...
```

### Why this structure is good

- `backend/server.js`
  - Starts the server
  - Connects to MongoDB
- `backend/src/app.js`
  - Creates the Express app
  - Adds middleware like `cors()` and `express.json()`
  - Registers routes
- `backend/src/config/db.js`
  - Handles MongoDB connection
- `backend/src/models/Order.js`
  - Defines how an order looks in the database
- `backend/src/controllers/orderController.js`
  - Contains the logic for create, get, get one, and update status
- `backend/src/routes/orderRoutes.js`
  - Connects URLs to controller functions
- `backend/src/utils/cloudinary.js`
  - Uploads images to Cloudinary
- `.env.example`
  - Shows which environment variables you need
- `package.json`
  - Lists dependencies and scripts

### Dependencies we used

- `express`
  - For building the server
- `mongoose`
  - For MongoDB + models
- `cors`
  - So frontend can talk to backend
- `dotenv`
  - To load secrets from `.env`
- `cloudinary`
  - To upload images

### Why we did not add more

You said:

- no authentication
- no advanced architecture
- no overcomplication

So we did not add:

- `nodemon`
- `multer`
- `jwt`
- `passport`
- `redux`
- advanced folders

## Step 2: Database Design

### Order model

We created one simple `Order` model.

### Field-by-field explanation

- `customer.name`
  - Customer full name
- `customer.phone`
  - Customer phone number
- `customer.address`
  - Delivery address
- `customer.instagram`
  - Optional Instagram username

- `items`
  - Array of ordered products
  - One order can contain one or more items

- `items[].productId`
  - The product ID from your frontend
- `items[].name`
  - Product name
- `items[].price`
  - Product price
- `items[].quantity`
  - How many pieces the customer wants

- `items[].customization.love`
  - Custom love message
- `items[].customization.story`
  - “How it started” text
- `items[].customization.proud`
  - Proud message
- `items[].customization.song`
  - Favorite song
- `items[].customization.pattern`
  - Pattern for frame products
- `items[].customization.shapes`
  - Selected shapes for frame products
- `items[].customization.images`
  - Array of uploaded image URLs

- `totalPrice`
  - Final order total

- `payment.method`
  - Example: `InstaPay`, `Telda`, `WE Pay`
- `payment.transactionReference`
  - Must be exactly 12 digits
- `payment.receiptImageUrl`
  - Optional screenshot URL
  - I kept this because your current frontend already has screenshot upload

- `status`
  - One of:
  - `Pending`
  - `Paid`
  - `Completed`
  - `Rejected`

- `createdAt`
  - Automatically added by Mongoose
  - Tells you when the order was created

## Step 3: Basic APIs

### What is a request?

A request is what the frontend sends to the backend.

Example:

- “Create this order”
- “Give me all orders”
- “Change this order status to Paid”

### What is a response?

A response is what the backend sends back.

Example:

- success message
- error message
- order data

## API 1: `POST /api/orders`

### What it does

- Creates a new order
- Validates the 12-digit transaction reference
- Uploads images to Cloudinary
- Saves the final order in MongoDB

### Example request body

```json
{
  "customer": {
    "name": "Sara",
    "phone": "01012345678",
    "address": "Cairo, Egypt",
    "instagram": "@sara"
  },
  "items": [
    {
      "productId": "frame-1",
      "name": "Custom Photo Frame",
      "price": 350,
      "quantity": 1,
      "customization": {
        "love": "I love you",
        "story": "We met in college",
        "proud": "I am proud of you",
        "song": "Perfect",
        "pattern": "pat1",
        "shapes": ["shp1", "shp2"],
        "images": ["data:image/png;base64,..."]
      }
    }
  ],
  "totalPrice": 350,
  "payment": {
    "method": "InstaPay",
    "transactionReference": "123456789012",
    "receiptImage": "data:image/png;base64,..."
  }
}
```

### Example response

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "..."
  }
}
```

## API 2: `GET /api/orders`

### What it does

- Returns all orders
- Used by `admin.html`

### Example response

```json
{
  "success": true,
  "count": 3,
  "data": []
}
```

## API 3: `GET /api/orders/:id`

### What it does

- Returns one order only
- Useful if later you want an order details page

## API 4: `PATCH /api/orders/:id`

### What it does

- Updates order status only
- Does not edit the whole order

### Example request body

```json
{
  "status": "Paid"
}
```

## Step 4: Frontend Connection

We updated two frontend files:

- `payment.html`
- `admin.html`

### `payment.html`

Old behavior:

- Create order in browser
- Save order to `localStorage`

New behavior:

- Build JSON payload
- Send it to `POST /api/orders`
- Backend saves it in MongoDB

### `admin.html`

Old behavior:

- Read orders from `localStorage`

New behavior:

- Load orders from `GET /api/orders`
- Update statuses using `PATCH /api/orders/:id`

## Simple explanation of `fetch()`

`fetch()` is how JavaScript talks to the backend.

Example:

```js
const response = await fetch("http://localhost:5000/api/orders");
const result = await response.json();
```

### What is JSON?

JSON is just a text format for data.

It looks like JavaScript objects:

```json
{
  "name": "Sara",
  "phone": "01012345678"
}
```

### What is `async/await`?

It lets us wait for things like:

- API requests
- file reading
- database work

Without `await`, JavaScript would continue before the result is ready.

### Error handling

We used `try/catch`.

Why:

- If server fails
- If network fails
- If validation fails

then we can show a friendly error instead of crashing.

## Step 5: Image Upload with Cloudinary

### Simple idea

Your frontend already reads images as Base64.

So instead of making uploads complicated, we kept it simple:

1. Frontend reads image
2. Frontend sends Base64 string inside JSON
3. Backend uploads that string to Cloudinary
4. Cloudinary returns a real image URL
5. Backend stores that URL in MongoDB

### Why this is beginner-friendly

It avoids:

- multipart form setup
- multer
- file disk storage
- extra upload routes

### Where upload happens

- `backend/src/utils/cloudinary.js`
- `backend/src/controllers/orderController.js`

### What gets stored in DB

Not the raw image itself.

We store:

- `https://res.cloudinary.com/...`

That is much better than storing big Base64 strings in MongoDB.

## Step 6: Run and Test

### 1. Create `.env`

Make a new file named `.env` in the project root.

Use:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 2. Install dependencies

Because PowerShell blocks `npm.ps1` on your machine, use:

```powershell
npm.cmd install
```

### 3. Start the server

Development mode:

```powershell
npm.cmd run dev
```

Normal mode:

```powershell
npm.cmd start
```

### 4. MongoDB Atlas connection

In Atlas:

1. Create a cluster
2. Create a database user
3. Allow your IP address
4. Copy connection string
5. Paste it into `MONGODB_URI`

Example:

```env
MONGODB_URI=mongodb+srv://username:password@cluster-name.mongodb.net/handycraft?retryWrites=true&w=majority
```

## Step 7: Testing with Postman

### Test 1: Health check

`GET http://localhost:5000/api/health`

You should get:

```json
{
  "success": true,
  "message": "API is healthy"
}
```

### Test 2: Create order

`POST http://localhost:5000/api/orders`

Body type:

- `raw`
- `JSON`

Use the sample order JSON from above.

### Test 3: Get all orders

`GET http://localhost:5000/api/orders`

### Test 4: Get one order

`GET http://localhost:5000/api/orders/<orderId>`

### Test 5: Update status

`PATCH http://localhost:5000/api/orders/<orderId>`

Body:

```json
{
  "status": "Paid"
}
```

## What changed in your frontend

### `payment.html`

- Keeps using `localStorage` only for cart
- Sends final order to backend
- Clears cart after successful API response

### `admin.html`

- Loads orders from MongoDB through backend
- Updates status using API
- Reads customer/payment/customization from real database shape

## Important beginner note

Right now:

- cart is still localStorage
- products are still in `data.js`
- orders are real database records

That is okay.

This is a good transition step because we are not trying to rebuild everything at once.

## Files you should look at first

If you want to understand the backend in the easiest order, read these files in this order:

1. `package.json`
2. `backend/server.js`
3. `backend/src/app.js`
4. `backend/src/models/Order.js`
5. `backend/src/routes/orderRoutes.js`
6. `backend/src/controllers/orderController.js`
7. `backend/src/config/db.js`
8. `backend/src/utils/cloudinary.js`

## Current limitations

These are intentionally not included yet:

- authentication
- real payment gateway
- dashboard login
- advanced validation library
- advanced architecture
- product database

That is exactly the right level for now.

## Next safe step after this

Once this works, the next clean beginner step would be:

1. move products from `data.js` into MongoDB
2. create `GET /api/products`
3. update `products.html` to load products from API

But for now, your backend is already useful because orders are real and admin is real.
