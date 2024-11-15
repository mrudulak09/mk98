const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();

// Sign up route
router.post(
  '/signup',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;
    try {
      const user = new User({ username, email, password });
      await user.save();
      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }
      console.error("Error during signup:", error);
      res.status(400).json({ error: error.message });
    }
  }
);

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Simply return a success message instead of a token
    res.json({ message: 'Login successful' });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;




