require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const contactRoutes = require('./routes/contact');
const rateLimit = require('express-rate-limit');

const app = express();

// Trust the reverse proxy (Nginx) to correctly identify client IP addresses
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3010;

// Middleware
const corsOptions = {
  // Allow requests from your frontend URL, local dev, and cloud domain
  origin: ['http://localhost:3010', 'https://samriddhishop.info', 'https://galibrand.cloud', 'http://127.0.0.1:5500', 'http://localhost:5500'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use(['/api/contact', '/galibrand/api/contact'], limiter, contactRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('Galibrand API is running');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});