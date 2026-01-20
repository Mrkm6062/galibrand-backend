const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// POST /api/contact
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, plan } = req.body;

    // Basic validation
    if (!name || !phone || !email) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    const newContact = new Contact({
      name,
      phone,
      email,
      plan
    });

    await newContact.save();

    res.status(201).json({ message: 'Contact request received successfully!' });
  } catch (error) {
    console.error('Error saving contact:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = router;