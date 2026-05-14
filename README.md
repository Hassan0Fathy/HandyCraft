# HandyCraft Deployment Guide

This guide will help you prepare and deploy the HandyCraft project to production using **Render** (for the backend) and **Netlify** (for the frontend).

## 📋 Prerequisites

Before you begin, ensure you have:
- A [GitHub](https://github.com/) account.
- A [Render](https://render.com/) account.
- A [Netlify](https://www.netlify.com/) account.
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) database.
- A [Cloudinary](https://cloudinary.com/) account for image storage.

---

## 💻 Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/HandyCraft.git
   cd HandyCraft
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Create .env file based on .env.example and fill in your details
   cp .env.example .env
   npm start
   ```

3. **Frontend Setup:**
   Open `frontend/index.html` using a local server (like Live Server in VS Code) or simply open the file in your browser.

---

## 🚀 Deploy Backend to Render

1. **Create a Web Service on Render:**
   - Connect your GitHub repository.
   - Select the `backend` directory as the **Root Directory**.
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js` (Render will also detect the `Procfile`).

2. **Configure Environment Variables:**
   Add the following variables in the Render dashboard:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `ADMIN_PASSWORD`: A strong password for your admin dashboard.
   - `JWT_SECRET`: A long, random string (min 32 chars).
   - `CLOUDINARY_CLOUD_NAME`: From your Cloudinary dashboard.
   - `CLOUDINARY_API_KEY`: From your Cloudinary dashboard.
   - `CLOUDINARY_SECRET`: From your Cloudinary dashboard.
   - `ALLOWED_ORIGINS`: Your Netlify URL (e.g., `https://your-app.netlify.app`).

3. **Note your Render URL:**
   Once deployed, Render will provide a URL like `https://handycraft-backend.onrender.com`.

---

## 🌐 Deploy Frontend to Netlify

1. **Update API URL:**
   - Open `frontend/config.js`.
   - Replace `https://YOUR_RENDER_APP.onrender.com/api` with your actual Render backend URL followed by `/api`.

2. **Create a Site on Netlify:**
   - Connect your GitHub repository.
   - **Base directory:** `frontend`
   - **Build command:** (Leave empty, it's a static site)
   - **Publish directory:** `.` (which refers to the `frontend` folder if base directory is set)
   - Netlify will use the `netlify.toml` file for routing.

3. **Deploy!**

---

## 🔑 Environment Variables Table

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Backend port | `5000` |
| `NODE_ENV` | Environment mode | `production` |
| `MONGODB_URI` | MongoDB Connection String | `mongodb+srv://...` |
| `ADMIN_PASSWORD` | Admin login password | `my_secret_pwd` |
| `JWT_SECRET` | Secret key for tokens | `a_very_long_random_string` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary name | `dxy123abc` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `1234567890` |
| `CLOUDINARY_SECRET` | Cloudinary Secret | `abc_123_xyz` |
| `ALLOWED_ORIGINS` | Permitted frontend URLs | `https://your-app.netlify.app` |

---

## 🔄 How to update API_BASE_URL after deployment

If your backend URL changes, you don't need to touch every HTML file. Simply:

1. Open `frontend/config.js`.
2. Update the `API_BASE_URL` value:
   ```javascript
   window.RUNTIME_CONFIG = {
     API_BASE_URL: "https://NEW_URL.onrender.com/api"
   };
   ```
3. Commit and push the change to GitHub. Netlify will automatically redeploy your frontend with the new configuration.

---

*Made with love by HandyCraft Team*
