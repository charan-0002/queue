# DocQueue - Real-Time Hospital Queue Management

DocQueue is a full-stack web application designed to solve hospital overcrowding in India by providing real-time OPD queue tracking, remote check-in via SMS/WhatsApp, and live hospital congestion heatmaps.

## Features

- **Patient Check-in:** Remotely check into hospital queues and get an instant token number and position.
- **Real-Time Tracking:** Live updates via Socket.io when queue position changes.
- **Congestion Heatmap:** Interactive map showing crowded vs. less crowded hospitals across India.
- **Admin Dashboard:** Hospital staff can manage the queue, call patients in, and mark appointments as completed.

## Tech Stack

- **Frontend:** React, Vite, React Router, Leaflet Maps
- **Backend:** Node.js, Express.js, Socket.io
- **Database:** MongoDB, Mongoose
- **Integrations:** Twilio (for SMS)

## Setup Instructions

### 1. Prerequisites
- Node.js (v16+)
- MongoDB (running locally on port 27017 or use a cloud URI)

### 2. Backend Setup
1. Open terminal and navigate to `backend` directory:
   ```bash
   cd backend
   npm install
   ```
2. Update `.env` file in the `backend` folder with your MongoDB URI and Twilio credentials (if using SMS).
3. Seed the database with initial mock hospitals and an admin account:
   ```bash
   node seed.js
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5000`

### 3. Frontend Setup
1. Open a new terminal and navigate to `frontend` directory:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Vite dev server:
   ```bash
   npm run dev
   ```
3. Open your browser to the local URL provided by Vite (usually `http://localhost:5173`).

### 4. Usage Guide
- **Patient Flow:** Go to the home page, click "Check In", fill out the form, and track your queue status.
- **Heatmap:** Go to the Heatmap page to view congestion levels across hospitals.
- **Admin Flow:** Go to the Admin Login page. 
  - Default Admin Username: `admin_aiims`
  - Default Admin Password: `admin123`
  - From the dashboard, you can advance the queue to see real-time updates on the patient's dashboard.
