# Food Blog App

A full-stack application for creating, sharing, and discovering recipes.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running Locally](#running-locally)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)

## Project Overview

This project is a food blogging platform where users can sign up, log in, create their own recipes with images, view recipes from others, and interact with the community. The backend is built with Node.js and Express, utilizing MongoDB for data storage and Cloudinary for image management. The frontend is a React application built with Vite.

## Features

- User authentication (signup, login, logout)
- Create, Read, Update, Delete (CRUD) operations for recipes
- Image uploads for recipes (using Cloudinary)
- Browse and search for recipes
- User profiles
- User authentication (signup, login, logout)
- Create, Read, Update, Delete (CRUD) operations for recipes
- Image uploads for recipes (using Cloudinary)
- Browse and search for recipes (search functionality to be confirmed by deeper UI/component check if needed)
- User profiles
- Basic chat functionality (creating rooms, sending/receiving messages)

## Technologies Used

**Backend:**

- Node.js
- Express.js
- MongoDB (with Mongoose)
- JSON Web Tokens (JWT) for authentication
- Cloudinary for image storage
- Multer for handling file uploads

**Frontend:**

- React
- Vite
- React Router DOM for navigation
- Axios for API requests
- React Icons

## Project Structure

```
.
├── backend/                 # Node.js/Express backend
│   ├── config/              # Configuration files (DB, Cloudinary)
│   ├── controllers/         # Request handlers
│   ├── middleware/          # Custom middleware (e.g., auth)
│   ├── models/              # Mongoose schemas
│   ├── public/              # Static assets (e.g., uploaded images locally before Cloudinary)
│   ├── routes/              # API route definitions
│   ├── .env                 # Environment variables (gitignored)
│   ├── package.json
│   └── server.js            # Main server entry point
├── frontend/
│   └── food-blog-app/       # React/Vite frontend
│       ├── public/          # Static assets for frontend
│       ├── src/
│       │   ├── assets/      # Images, fonts, etc.
│       │   ├── components/  # Reusable React components
│       │   ├── pages/       # Page-level components
│       │   ├── App.jsx      # Main App component
│       │   └── main.jsx     # Frontend entry point
│       ├── .env.local       # Frontend environment variables (gitignored)
│       ├── index.html
│       └── package.json
└── README.md                # This file
```

## Installation

### Prerequisites

- Node.js (v18.x or later recommended)
- npm (usually comes with Node.js)
- MongoDB (local instance or a cloud-hosted solution like MongoDB Atlas)
- A Cloudinary account (for image uploads)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-name>
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the `backend` directory by copying the example or creating a new one. Add the following environment variables:

```env
# MongoDB Connection
MONGO_URI=your_mongodb_connection_string # e.g., mongodb://localhost:27017/food-blog

# JWT Secret
JWT_SECRET=your_very_strong_jwt_secret # Choose a long, random string

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Server Port (Optional, defaults to 4000 if not set)
PORT=4000
```

**Note on Cloudinary:**
1. Sign up for a free Cloudinary account at [cloudinary.com](https://cloudinary.com/).
2. Find your **Cloud Name**, **API Key**, and **API Secret** in your Cloudinary Dashboard.
3. The backend is configured to store images in a folder named `food-blog-app` in your Cloudinary account.

### 3. Frontend Setup

Navigate to the frontend directory:

```bash
cd ../frontend/food-blog-app
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file in the `frontend/food-blog-app` directory. This file is used for frontend-specific environment variables, primarily the backend API URL.

VITE_API_URL=http://localhost:4000
# Note: The frontend code in `src/App.jsx` might have a hardcoded API URL.
# For local development, ensure it points to your local backend (e.g., http://localhost:4000)
# or update the frontend code to use this environment variable.
```
Replace `4000` if your backend is running on a different port.

## Running Locally

### 1. Start MongoDB

Ensure your MongoDB instance is running.

### 2. Start the Backend Server

In the `backend` directory:

```bash
npm run dev
```
The backend server should start, typically on `http://localhost:4000` (or the port specified in your `PORT` environment variable).

### 3. Start the Frontend Development Server

In a new terminal, navigate to the `frontend/food-blog-app` directory:

```bash
npm run dev
```
The React development server will start, usually on `http://localhost:5173` (Vite's default). Open this URL in your browser.

## API Endpoints

The backend API routes are defined in `backend/server.js` as follows:

- User routes are mounted under `/`
- Recipe routes are mounted under `/recipe`
- Chat routes are mounted under `/api/chat`

**User Authentication & Management (base path: `/`)**

-   `POST /signUp`
    -   Description: Register a new user.
    -   Request Body: Expects `{ email, password, username }` (Username to be confirmed from controller logic, `user.js` controller uses `userSignUp` which likely expects these).
    -   Response: User object and JWT token on success.
-   `POST /login`
    -   Description: Login an existing user.
    -   Request Body: `{ email, password }`
    -   Response: User object and JWT token on success.
-   `GET /user/:id`
    -   Description: Get user details by ID.
    -   Response: User object.

**Recipes (base path: `/recipe`)**

-   `GET /`
    -   Description: Get all recipes.
    -   Response: Array of recipe objects.
-   `GET /:id`
    -   Description: Get a specific recipe by its ID.
    -   Response: Recipe object.
-   `POST /`
    -   Description: Add a new recipe. Requires authentication (JWT token in header). Handles image file upload.
    -   Middleware: `verifyToken`, `upload.single('file')`
    -   Request: `formData` including recipe details and a `file` for the image.
    -   Response: Created recipe object.
-   `PUT /:id`
    -   Description: Edit an existing recipe by its ID. Handles image file upload if a new image is provided.
    -   Middleware: `upload.single('file')`.
    -   **Note:** This route in `backend/routes/recipe.js` does **not** have `verifyToken` middleware. This is a potential security issue if updates should be restricted to authenticated users/owners.
    -   Request: `formData` including updated recipe details and optionally a new `file`.
    -   Response: Updated recipe object.
-   `DELETE /:id`
    -   Description: Delete a recipe by its ID.
    -   **Note:** This route in `backend/routes/recipe.js` does **not** have `verifyToken` middleware. This is a potential security issue if deletions should be restricted to authenticated users/owners.
    -   Response: Success message or error.

**Chat (base path: `/api/chat`)**

-   `POST /room`
    -   Description: Create a new chat room. Requires authentication.
    -   Middleware: `protect` (likely an alias for `verifyToken`)
    -   Request Body: (e.g., `{ name }` - to be confirmed from `chatController.js`)
    -   Response: Chat room object.
-   `POST /join`
    -   Description: Join an existing chat room. (Authentication status to be confirmed from `chatController.js` - route does not have explicit auth middleware).
    -   Request Body: (e.g., `{ roomId, userId }` - to be confirmed)
    -   Response: Chat room details or status.
-   `GET /messages/:roomId`
    -   Description: Get messages for a specific chat room. Requires authentication.
    -   Middleware: `protect`
    -   Response: Array of message objects.
-   `POST /messages/:roomId`
    -   Description: Post a message to a chat room. Requires authentication.
    -   Middleware: `protect`
    -   Request Body: (e.g., `{ text, senderId }` - to be confirmed)
    -   Response: Saved message object.

**Important Note on Frontend API Calls:**
The frontend `App.jsx` uses a hardcoded base URL `https://foodapp-7hu3.onrender.com/` for some calls (e.g., `axios.get('https://foodapp-7hu3.onrender.com/recipe')`).
When running locally:
- The `VITE_API_URL` in `frontend/food-blog-app/.env.local` should be set to `http://localhost:4000` (or your backend port).
- Frontend code making API calls needs to correctly prefix paths based on the backend route structure. For example:
    - To get all recipes: `GET ${VITE_API_URL}/recipe/`
    - To login: `POST ${VITE_API_URL}/login`
    - To get chat messages: `GET ${VITE_API_URL}/api/chat/messages/:roomId`
- Developers should ensure the frontend API calls align with these backend routes and the `VITE_API_URL`. The hardcoded URL in `App.jsx` should ideally be replaced to use this environment variable for consistency.

## Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

Please ensure your code follows the existing style and that any new features are well-tested.
