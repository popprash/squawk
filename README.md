# Squawk 🦜

A beautiful, premium, real-time chat application powered by React, Express, MongoDB, Socket.io, and Clerk.

🔗 **Live URL:** [squawk-nzjb.onrender.com](https://squawk-nzjb.onrender.com/)

---

## Features

- **Real-Time Messaging**: Built on Socket.io for instantaneous communication.
- **Secure Authentication**: Power-packed identity flows powered by Clerk.
- **Rich Media**: Integrated ImageKit support for lightning-fast image delivery.
- **Dynamic Themes**: Preset pickers with responsive light and dark interfaces.
- **Responsive Layout**: Designed to look stunning on mobile, tablet, and desktop screens.

---

## Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **UI Components**: HeroUI
- **Icons**: Lucide React
- **State Management**: Zustand
- **Real-Time Client**: Socket.io Client
- **Authentication**: Clerk React SDK

### Backend
- **Framework**: Express 5 (Node.js)
- **Database**: MongoDB (via Mongoose)
- **Real-Time Server**: Socket.io
- **Media CDN**: ImageKit Node.js SDK
- **Authentication**: Clerk Express SDK

---

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone this repository.
2. Install dependencies for both the frontend and the backend.

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Environment Variables

Configure `.env` files in both components.

#### Backend (`/backend/.env`)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

#### Frontend (`/frontend/.env`)
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:5000
```

---

## Running Locally

To run the application locally, start both the backend server and frontend development server.

### 1. Start the Backend
```bash
cd backend
npm run dev
```

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```
