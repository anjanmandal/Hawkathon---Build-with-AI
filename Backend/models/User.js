// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'parent', 'healthcareProvider'],
    default: 'user'
  },

  // New fields:
  firstName: { type: String },
  lastName: { type: String },
  bio: { type: String },
  
  // If this user is a 'parent' or 'healthcareProvider', they can relate to multiple other users
  relatedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
