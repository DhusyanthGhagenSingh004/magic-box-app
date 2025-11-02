const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`
  });
  console.log('Firebase Admin SDK initialized');
} catch (error) {
  console.warn('Firebase Admin SDK not configured:', error.message);
  console.warn('To enable Firebase persistence, add serviceAccountKey.json to server/');
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for simplicity
  },
});

io.on('connection', (socket) => {
  console.log('a user connected');

  let trackingInterval = null;

  socket.on('start-tracking', (options) => {
    console.log('start-tracking', options);

    // Stop any existing tracking
    if (trackingInterval) {
      clearInterval(trackingInterval);
    }

    // Simulate sending GPS data every 2 seconds
    trackingInterval = setInterval(() => {
      // Mock GPS data - replace with real data if available
      const mockData = {
        latitude: 34.0522 + (Math.random() - 0.5) * 0.01,
        longitude: -118.2437 + (Math.random() - 0.5) * 0.01,
        speed: 10 + Math.random() * 5, // m/s
      };
      socket.emit('gps-data', mockData);
    }, 2000);
  });

  socket.on('stop-tracking', () => {
    console.log('stop-tracking');
    if (trackingInterval) {
      clearInterval(trackingInterval);
      trackingInterval = null;
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    if (trackingInterval) {
      clearInterval(trackingInterval);
      trackingInterval = null;
    }
  });

  // Live updates from client (browser)
  socket.on('live:update', (payload) => {
    // You can broadcast to other subscribers, or log/save
    // For now, just echo back an ack with latest distance
    socket.emit('live:update:ack', { ok: true, total: payload?.totalDistanceMeters ?? 0 });
  });

  socket.on('live:stop', async (snapshot) => {
    try {
      let docId = Date.now().toString();
      
      // Try to save to Firebase if configured
      if (admin.apps.length > 0) {
        const db = admin.firestore();
        const doc = {
          ...snapshot,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          userId: snapshot.userId || null
        };
        const docRef = await db.collection('snapshots').add(doc);
        docId = docRef.id;
        console.log('Saved snapshot to Firebase:', docId);
      } else {
        console.log('Firebase not configured, saving locally only');
      }
      
      socket.emit('live:stop:ack', { ok: true, id: docId });
    } catch (e) {
      console.error('Error saving snapshot:', e);
      socket.emit('live:stop:ack', { ok: false, error: e?.message || 'failed' });
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
