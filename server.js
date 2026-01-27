require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();

// Trust the reverse proxy (Nginx) to correctly identify client IP addresses
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3010;

// Middleware
app.use(cors({
  origin: [
    "https://galibrand.cloud",
    "https://www.galibrand.cloud"
  ],
  methods: ["POST"],
  credentials: false
}));
app.use(express.json());

// Serve Static Files (Frontend)
const frontendPath = path.join(__dirname, '../GaliBrand Frontend');
console.log('Serving static files from:', frontendPath);
app.use(express.static(frontendPath));

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

// Email Transporter Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// --- MODEL DEFINITION ---
const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  plan: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Contact = mongoose.model('Contact', contactSchema);

// Routes
const contactRouter = express.Router();

// Restrict to POST only
contactRouter.use((req, res, next) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }
  next();
});

// POST Contact
contactRouter.post('/', async (req, res) => {
  try {
    const { name, phone, email, plan, location } = req.body;

    // Basic validation
    if (!name || !phone || !email) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    const newContact = new Contact({
      name,
      phone,
      email,
      plan,
      location
    });

    await newContact.save();

    // Send Email Alert
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'galibrand@99gmail.com',
      subject: 'New Contact Form Submission',
      text: `You have received a new contact request:

Name: ${name}
Phone: ${phone}
Email: ${email}
Plan: ${plan}
Location: ${location}`
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.error('Error sending email alert:', err);
      else console.log('Email alert sent:', info.response);
    });

    res.status(201).json({ message: 'Contact request received successfully!' });
  } catch (error) {
    console.error('Error saving contact:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

app.use(['/api/contact', '/galibrand/api/contact'], limiter, contactRouter);

// Handle 404 - Page Not Found (Must be the last route)
app.use((req, res) => {
  res.status(404).send('<h1>404 - Page Not Found</h1><p>The requested file could not be found on the server. Please check the URL or file path.</p>');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});