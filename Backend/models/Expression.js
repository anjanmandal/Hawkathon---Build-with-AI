// server/models/Expression.js
const mongoose = require('mongoose');

const expressionSchema = new mongoose.Schema({
  label: { type: String, required: true },     // e.g. "laughing", "sad", "happy"
  imageUrl: { type: String, required: true },  // link to image (local or remote)
});

module.exports = mongoose.model('Expression', expressionSchema);
