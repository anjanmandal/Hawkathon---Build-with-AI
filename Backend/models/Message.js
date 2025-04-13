// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: { type: String, required: true },
  // If you want to store read receipts, or message type, attachments, etc. add fields here
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
