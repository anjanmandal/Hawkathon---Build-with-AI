// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middlewares/authMiddleware');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

// Create a one-to-one chat
router.post('/createOneToOne', ensureAuth, async (req, res) => {
  try {
    const { participantId } = req.body; // user to chat with
    // The current user
    const userId = req.user._id;

    // Check if there's already a one-to-one chat between them
    let existingChat = await Chat.findOne({
      isGroup: false,
      participants: { $all: [userId, participantId] }
    });
    if (existingChat) {
      return res.json({ chat: existingChat, message: 'Chat already exists' });
    }

    // Otherwise create a new chat
    const chat = await Chat.create({
      participants: [userId, participantId],
      isGroup: false
    });

    return res.json({ chat });
  } catch (err) {
    console.error('Error creating one-to-one chat:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a group chat
router.post('/createGroup', ensureAuth, async (req, res) => {
  try {
    const { participantIds, groupName } = req.body;
    // The current user is also a participant
    const userId = req.user._id;

    // Create the group chat
    const chat = await Chat.create({
      participants: [userId, ...participantIds],
      isGroup: true,
      groupName
    });

    return res.json({ chat });
  } catch (err) {
    console.error('Error creating group chat:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Post a message to a chat
router.post('/:chatId/message', ensureAuth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    // Optionally verify the user is in chat.participants
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ message: 'You are not a participant in this chat' });
    }

    const message = await Message.create({
      chatId,
      sender: userId,
      text
    });
    return res.json({ message });
  } catch (err) {
    console.error('Error posting message:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get messages in a chat
router.get('/:chatId/messages', ensureAuth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    // Check user is in chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ message: 'You are not a participant in this chat' });
    }

    const messages = await Message.find({ chatId })
    .populate('sender', 'firstName lastName')
    .sort({ createdAt: 1 });
    return res.json({ messages });
  } catch (err) {
    console.error('Error fetching messages:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// (Optionally) Get all chats for the user
// chatRoutes.js
router.get('/myChats', ensureAuth, async (req, res) => {
    try {
      const userId = req.user._id;
      // This query finds all chats where userId is a participant
      // then populates the 'participants' field to get firstName, lastName, avatarUrl
      const chats = await Chat.find({ participants: userId })
        .populate('participants', 'firstName lastName')
        .sort({ updatedAt: -1 }); // newest first
  
      return res.json({ chats });
    } catch (err) {
      console.error('Error getting my chats:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  

module.exports = router;
