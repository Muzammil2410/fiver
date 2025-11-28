const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());

// Increase body size limit for JSON and URL-encoded data
app.use(express.json({ limit: '100mb', parameterLimit: 50000 }));
app.use(express.urlencoded({ extended: true, limit: '100mb', parameterLimit: 50000 }));

// Add middleware to log request size (for debugging)
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    const contentLength = req.get('content-length');
    if (contentLength) {
      const sizeInMB = parseInt(contentLength) / (1024 * 1024);
      console.log(`📦 Request size: ${sizeInMB.toFixed(2)} MB`);
    }
  }
  next();
});

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error('Error: MONGO_URI is not defined in .env file');
  process.exit(1);
}

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    status: 'connected',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/gigs', require('./routes/gigRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment-details', require('./routes/paymentDetailRoutes'));

// Server port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

