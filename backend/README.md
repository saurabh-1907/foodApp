# Backend Setup for Food Blog App

This document provides instructions for setting up the backend services for the Food Blog App, including necessary third-party service configurations.

## Environment Variables

The backend relies on environment variables for configuration, primarily managed through a `.env` file in the `backend` directory. A `backend/.env.example` file should be created (if one doesn't exist) or this section should detail the required variables.

### MongoDB Connection

-   `MONGO_URI`: Your MongoDB connection string.

### JWT Secret

-   `JWT_SECRET`: A secret key for signing JSON Web Tokens.

### Cloudinary Configuration (for Image Uploads)

Recipe images are stored and managed using Cloudinary. You will need a Cloudinary account to get the following credentials:

1.  **Sign up for Cloudinary:** Go to [cloudinary.com](https://cloudinary.com/) and create a free account.
2.  **Find your credentials:**
    *   Navigate to your Cloudinary Dashboard.
    *   Your **Cloud Name**, **API Key**, and **API Secret** will be displayed there.

3.  **Set Environment Variables:**
    Add the following variables to your `backend/.env` file, replacing the placeholder values with your actual Cloudinary credentials:

    ```
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    ```

    The backend code in `backend/config/cloudinaryConfig.js` uses these environment variables to configure the Cloudinary SDK. Images uploaded via the recipe creation/editing process will be stored in a folder named `food-blog-app` within your Cloudinary account.

## Running the Backend

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start the development server:
    ```bash
    npm run dev
    ```

This will typically start the server on the port defined by the `PORT` environment variable (e.g., `PORT=4000`).
