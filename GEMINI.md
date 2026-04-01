# AI-Nutrition-Website

## Project Overview

This is a full-stack web application designed for **Personalized Dietary Assessment and AI-Assisted Calorie Tracking**. The project aims to provide users with tools to track meal calories using an AI model, receive personalized dietary assessments, and maintain a healthy lifestyle.

The project is structured as a monorepo with separate `client` and `server` directories.

### Main Technologies

- **Frontend (client):**
  - React (built with Vite)
  - React Router DOM (for navigation)
  - Axios (for API communication)
  - React Hot Toast (for notifications)
  - CSS (for styling)
- **Backend (server):**
  - Node.js & Express
  - MongoDB & Mongoose (for data persistence)
  - JWT (for authentication)
  - Bcrypt (for password hashing)
  - Nodemon (for development)

## Architecture

- **Client (`/client/src`):**
  - `pages/`: Contains main page components (e.g., HomePage, LoginPage, SignUpPage, AboutUsPage).
  - `components/`: Reusable UI components (e.g., Header, Footer).
  - `api/`: Axios instances and API service definitions.
  - `assets/`: Static assets like images.
- **Server (`/server`):**
  - `models/`: Mongoose schemas (e.g., User).
  - `controllers/`: Request handlers and business logic (e.g., userControllers).
  - `routes/`: API endpoint definitions (e.g., userRoutes).
  - `middleware/`: Custom middleware (e.g., authentication, admin checks).
  - `configs/`: Configuration files (e.g., database connection).
  - `server.js`: Entry point for the Node.js application.

## Building and Running

### Client Setup

1.  Navigate to the `client` directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Build for production:
    ```bash
    npm run build
    ```

### Server Setup

1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `server` directory and configure your environment variables (e.g., `PORT`, `MONGO_URI`, `JWT_SECRET`).
4.  Start the server (development):
    ```bash
    npm run server
    ```
5.  Start the server (production):
    ```bash
    npm run start
    ```

## Development Conventions

- **Module System:** Both client and server use ES Modules (`import`/`export`).
- **Styling:** Global styles are in `client/src/index.css`, while component-specific styles are in corresponding `.css` files.
- **API Communication:** `axiosInstance.js` in the client handles common API configurations.
- **Authentication:** JWT is used for securing API routes, with middleware on the server to verify tokens.
- **Linting:** ESLint is used on the client to maintain code quality.
- **AI Integration:** The project proposal mentions AI-based calorie estimation using computer vision, which is integrated as a key feature of the platform.
