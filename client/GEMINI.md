# AI-Nutrition-Website

## Project Overview

This project is a web-based platform designed for **Personalized Dietary Assessment and AI-Assisted Calorie Tracking**. The platform aims to address obesity and promote healthy lifestyles by providing users with tools for dietary consultation, AI-driven calorie estimation, and access to educational and community resources.

**Key Features:**
*   **Personalized Dietary Consultations:** Users can receive customized diet plans based on their health history and professional supervision from nutritionists.
*   **AI-Assisted Calorie Tracking:** An AI-based food recognition system uses computer vision and deep learning to estimate meal calories from uploaded images.
*   **Content and Community:** Includes sections for blogs, news, healthy recipes, lifestyle insights, and user testimonials to foster engagement and provide valuable information.
*   **Structured Plans:** Offers various subscription and payment systems for dietary plans, including seasonal and limited-period options.

**Technologies Used:**
*   **Frontend:** React (JavaScript/JSX)
*   **Build Tool:** Vite
*   **Linting:** ESLint with React Hooks and React Refresh plugins
*   **Babel Plugin:** `babel-plugin-react-compiler`
*   **Routing:** React Router DOM
*   **API Client:** Axios

## Building and Running

The project uses `npm` as its package manager and `Vite` for development and building.

### Installation

To install the project dependencies, navigate to the project root and run:
```bash
npm install
```

### Development Server

To start the development server, run:
```bash
npm run dev
```
This will typically start the application on `http://localhost:5173`.

### Building for Production

To build the project for production, run:
```bash
npm run build
```
This will generate optimized static assets in the `dist` directory.

### Preview Production Build

To preview the production build locally, run:
```bash
npm run preview
```

### Linting

To run ESLint and check for code quality issues, run:
```bash
npm run lint
```

## Development Conventions

*   **Code Linting:** The project uses ESLint with specific configurations for React, React Hooks, and React Refresh. It enforces a rule to ignore unused variables that start with an uppercase letter and an underscore (e.g., `_UNUSED_VAR`).
*   **React Compiler:** The `babel-plugin-react-compiler` is integrated into the Vite build process, indicating a focus on optimizing React component re-renders.
*   **Global Styling:** Global CSS styles, including basic `body` element resets and `font-family` definitions, are managed in `src/index.css`.
*   **Component-Based Architecture:** The application follows a component-based structure, with `App.jsx` serving as the main entry point for routing and rendering `Header`, `HomePage`, `LoginPage`, and `SignUpPage` components. Individual components have their dedicated CSS files (e.g., `Header.css`, `HomePage.css`).
*   **Routing:** The application uses `react-router-dom` for navigation, with routes defined in `App.jsx`.
*   **API Communication:** `axios` is used for making HTTP requests to backend APIs.
