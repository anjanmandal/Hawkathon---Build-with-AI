// models/Chat.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isGroup: { type: Boolean, default: false },
  groupName: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
