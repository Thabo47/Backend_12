const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with improved error handling
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('Could not connect to MongoDB:', err.message);
  process.exit(1); // Exit the process if can't connect
});

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
});

const User = mongoose.model('User', userSchema);

// Routes with better error responses
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users || []); // Ensure always returns an array
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ 
      error: 'Server error',
      details: err.message 
    });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    if (!req.body.name || !req.body.email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    const user = new User({
      name: req.body.name,
      email: req.body.email,
    });

    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(400).json({ 
      error: 'Bad request',
      details: err.message 
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));