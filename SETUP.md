# Green Tracker Setup Guide

## Backend Setup

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Firebase Configuration:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing one
   - Go to Project Settings > Service Accounts
   - Generate a new private key (downloads JSON file)
   - Rename the downloaded file to `serviceAccountKey.json`
   - Place it in the `server/` directory

3. **Start the backend:**
   ```bash
   cd server
   node index.js
   ```

## Frontend Setup

1. **Install dependencies:**
   ```bash
   cd green-tracz
   npm install
   ```

2. **Environment Variables:**
   Create `.env` file in `green-tracz/` directory:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_SOCKET_URL=http://localhost:4000
   ```

3. **Start the frontend:**
   ```bash
   cd green-tracz
   npm run dev
   ```

## Features

- ✅ Live GPS tracking with socket.io
- ✅ Firebase persistence (when configured)
- ✅ Local storage fallback
- ✅ Real-time emissions calculation
- ✅ Animated UI with Framer Motion
- ✅ Theme switching
- ✅ Responsive design

## Troubleshooting

- If Firebase connection fails, the app will work with local storage only
- Check browser console for connection errors
- Ensure both frontend and backend are running
- Verify Firebase service account key is in `server/` directory
