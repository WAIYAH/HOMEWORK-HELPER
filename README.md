# Homework Helper for Busy Parents - Project Setup
This document outlines the initial project structure and setup for the Homework Helper for Busy Parents, built for the Vibe Coding Hackathon 2.0 using the MERN stack. The setup includes pnpm, Vite, and configurations for Clerk, M-Pesa, Cloudinary, MongoDB Atlas, and other required technologies.

# Project Structure
homework-helper/
├── /client/                    # React frontend (Vite)
│   ├── /public/                # Static assets
│   ├── /src/                   # React source code
│   │   ├── /components/        # Reusable React components (Shadcn UI)
│   │   ├── /pages/             # Page components (Home, Dashboard, etc.)
│   │   ├── /hooks/             # Custom React hooks
│   │   ├── /lib/               # Utility functions and API configs
│   │   ├── /assets/            # Images, styles, etc.
│   │   ├── App.jsx             # Main App component with React Router
│   │   ├── main.jsx            # Entry point for Vite
│   │   └── index.css           # Tailwind CSS entry point
│   ├── package.json            # Frontend dependencies
│   ├── vite.config.js          # Vite configuration
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   ├── .eslintrc.js            # ESLint configuration
│   ├── .prettierrc             # Prettier configuration
│   └── vitest.config.js        # Vitest configuration
├── /server/                    # Node.js/Express backend
│   ├── /controllers/           # Request handlers (auth, questions, payments)
│   ├── /models/                # MongoDB schemas (User, Question, Payment)
│   ├── /routes/                # API routes
│   ├── /middleware/            # Custom middleware (auth, error handling)
│   ├── /utils/                 # Utility functions (Tesseract.js, Cloudinary)
│   ├── /sockets/               # Socket.io logic
│   ├── server.js               # Main server entry point
│   ├── package.json            # Backend dependencies
│   ├── .eslintrc.js            # ESLint configuration
│   └── .prettierrc             # Prettier configuration
├── .env.example                # Example environment variables
├── .gitignore                  # Git ignore file
├── package.json                # Root package.json for pnpm workspace
├── pnpm-workspace.yaml         # pnpm workspace configuration
└── README.md                   # Project setup and deployment instructions

## Initial Setup Instructions
# Prerequisites

Node.js (v18 or higher)
pnpm (v8 or higher)
MongoDB Atlas account
Clerk account (for authentication)
Cloudinary account (for image storage)
M-Pesa Daraja API credentials (sandbox for testing)
Vercel account (for deployment)

## Step-by-Step Setup

Initialize Project and pnpm Workspace

Create the project directory: mkdir homework-helper && cd homework-helper
Initialize pnpm workspace:pnpm init


Create pnpm-workspace.yaml:packages:
  - 'client'
  - 'server'

## Set Up Frontend (/client)

Create the frontend directory: mkdir client && cd client
Initialize Vite with React:pnpm create vite . --template react

Install dependencies:pnpm install react-router-dom @clerk/clerk-react socket.io-client axios @tanstack/react-query zod tailwindcss postcss autoprefixer @shadcn/ui socket.io-client eslint prettier vitest husky
Nationalism  - Initialize Tailwind CSS:pnpm tailwindcss init -p
Set up Shadcn UI:pnpm dlx shadcn-ui@latest init


# Set Up Backend (/server)
Create the backend directory: mkdir server && cd server
Initialize Node.js project:pnpm init
Install dependencies:pnpm install express mongoose socket.io @clerk/clerk-sdk-node tesseract.js cloudinary dotenv eslint prettier cors

# Configure Environment Variables
Create .env files in /client and /server based on .env.example (see below).
Store secrets for Clerk, MongoDB Atlas, Cloudinary, and M-Pesa.

# Set Up ESLint, Prettier, and Husky
Configure ESLint and Prettier in both /client and /server.
Set up Husky for pre-commit hooks:pnpm dlx husky-init && pnpm install


# Deploy to Vercel
Push to a GitHub repository.
Connect to Vercel and configure environment variables.
Deploy both /client and /server as separate Vercel projects.


# Key Configuration Files
/client/package.json
{
  "name": "client",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint src --ext js,jsx",
    "format": "prettier --write src"
  },
  "dependencies": {
    "@clerk/cl/clerk-react": "^5.0.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.6.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.16.0",
    "socket.io-client": "^4.7.2",
    "zod": "^3.22.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  },
  "devDependencies": {
    "eslint": "^8.45.0",
    "eslint-plugin-react": "^7.32.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "prettier": "^3.0.0",
    "vite": "^5.0.0",
    "vitest": "^0.34.0",
    "husky": "^8.0.0"
  }
}

/server/package.json
{
  "name": "server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "lint": "eslint . --ext js",
    "format": "prettier --write ."
  },
  "dependencies": {
    "@clerk/clerk-sdk-node": "^5.0.0",
    "cloudinary": "^1.37.0",
    "cors": "^2.8.5",
    "dotenv":алеко

System: Let's initialize the project structure and key configuration files for the Homework Helper for Busy Parents. 
Below are the artifacts for the initial setup, including the project structure, package.json files, and a README with setup instructions. This is the first step in building the MERN stack application, focusing on setting up pnpm, Vite, and the required technologies (Clerk, Socket.io, Tailwind, Shadcn, etc.).

<xaiArtifact artifact_id="4869d6c2-ad7d-4fe6-af5e-2ed7096b26ea" artifact_version_id="f29c9574-fe36-4844-ace9-7e8b061056c5" title="README.md" contentType="text/markdown">

# Homework Helper for Busy Parents
A mobile-friendly web application built with the MERN stack for the Vibe Coding Hackathon 2.0. Parents can upload homework questions (text or photo), receive AI-generated kid-friendly explanations, and pay via M-Pesa (KES 5–10 per question or KES 200/month subscription). Features real-time updates, a user dashboard, and gamified badges.

## Project Structure
homework-helper/
├── /client/  # React frontend (Vite)│   
├── /public/                # Static assets│   
├── /src/                   # React source code│   
│   ├── /components/        # Reusable React components (Shadcn UI)│   
│   ├── /pages/             # Page components (Home, Dashboard, etc.)│   
│   ├── /hooks/             # Custom React hooks│   
│   ├── /lib/               # Utility functions and API configs│   
│   ├── /assets/            # Images, styles, etc.│   
│   ├── App.jsx             # Main App component with React Router│   
│   ├── main.jsx            # Entry point for Vite│   
│   └── index.css           # Tailwind CSS entry point│   
├── package.json            # Frontend dependencies│   
├── vite.config.js          # Vite configuration│   
├── tailwind.config.js      # Tailwind CSS configuration│   
├── .eslintrc.js            # ESLint configuration│   
├── .prettierrc             # Prettier configuration│   
└── vitest.config.js        # Vitest configuration├── /server/                  

  # Node.js/Express backend│   
  ├── /controllers/           # Request handlers (auth, questions, payments)│   
  ├── /models/                # MongoDB schemas (User, Question, Payment)│   
  ├── /routes/                # API routes│   
  ├── /middleware/            # Custom middleware (auth, error handling)│   
  ├── /utils/                 # Utility functions (Tesseract.js, Cloudinary)│   
  ├── /sockets/               # Socket.io logic│   
  ├── server.js               # Main server entry point│   
  ├── package.json            # Backend dependencies│   
  ├── .eslintrc.js            # ESLint configuration│   
  └── .prettierrc             # Prettier configuration
  ├── .env.example                # Example environment variables
  ├── .gitignore                  # Git ignore file
  ├── package.json                # Root package.json for pnpm workspace
  ├── pnpm-workspace.yaml         # pnpm workspace configuration
  └── README.md                   # Project setup and deployment instructions

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- pnpm (v8 or higher)
- MongoDB Atlas account
- Clerk account (for authentication)
- Cloudinary account (for image storage)
- M-Pesa Daraja API credentials (sandbox for testing)
- Vercel account (for deployment)

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd homework-helper


## Install root dependencies:pnpm install

## Set up the frontend:cd client
pnpm install
pnpm create vite . --template react
pnpm install react-router-dom @clerk/clerk-react socket.io-client axios @tanstack/react-query zod tailwindcss postcss autoprefixer @shadcn/ui eslint prettier vitest husky
pnpm tailwindcss init -p
pnpm dlx shadcn-ui@latest init


## Set up the backend:cd ../server
pnpm init
pnpm install express mongoose socket.io @clerk/clerk-sdk-node tesseract.js cloudinary dotenv eslint prettier cors

Create .env files in /client and /server using .env.example as a template.
Set up Husky for pre-commit hooks:cd ..
pnpm dlx husky-init && pnpm install


## Environment Variables
Create .env files in /client and /server with the following variables (use sandbox credentials for M-Pesa testing):
/client/.env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:5000
VITE_SOCKET_IO_URL=http://localhost:5000

/server/.env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
CLERK_SECRET_KEY=your_clerk_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_SHORTCODE=your_mpesa_shortcode

# Running Locally
Start the backend:cd server
pnpm dev

Start the frontend:cd client
pnpm dev

## Deployment
Push to GitHub:git push origin main
Connect to Vercel via the Vercel CLI or dashboard.
Configure environment variables in Vercel for both /client and /server.
Deploy both projects as separate Vercel apps.

## Testing
Run unit tests:cd client
pnpm test

Lint and format code:pnpm lint
pnpm format


# Demo Script
Sign Up: User signs up via Clerk (email or Google OAuth) on the Login/Sign-up page.
Upload Question: User navigates to the Question Submission page, enters a math problem (e.g., “Solve 2x + 3 = 7”) or uploads a photo, validated by Zod.
Payment: User pays KES 5 via M-Pesa Daraja API (sandbox mode).
Receive Answer: AI (e.g., Grok via xAI API) generates a kid-friendly explanation (e.g., “Subtract 3 from both sides: 2x = 4. Divide by 2: x = 2.”), delivered in real-time via Socket.io.
Dashboard: User views question history and payment status in the Dashboard, with gamified badges (e.g., “Math Master” for 10 questions).

# Sample AI Prompts
Math Prompt: "Explain how to solve the equation [user_input] in a simple, step-by-step way suitable for a child in [grade_level]. Use clear language and avoid complex terms."
General Prompt: "Provide a concise, kid-friendly explanation for [user_input] suitable for a [grade_level] student. Use simple words and examples."

# Notes
Use M-Pesa sandbox for testing payments.
Test AI prompts to ensure responses are concise and kid-friendly.
Use Shadcn components for rapid UI development.
Cache AI responses with React Query to optimize performance.
Ensure accessibility (alt text, keyboard navigation).
Keep code modular for scalability.

# Potential Issues
M-Pesa API: Sandbox credentials may have rate limits; test thoroughly.
Tesseract.js: OCR accuracy depends on image quality; validate extracted text.
Clerk: Ensure correct API keys and webhook setup for authentication.
Vercel: Split /client and /server into separate projects for deployment.
Socket.io: Test real-time connections locally before deployment.
