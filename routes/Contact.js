const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// POST /api/contact
router.post('/', async (req, res) => {
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

    res.status(201).json({ message: 'Contact request received successfully!' });
  } catch (error) {
    console.error('Error saving contact:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = router;