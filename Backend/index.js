// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Import your routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const scenarioRoutes = require('./routes/scenarioRoutes');
const therapyRoutes = require('./routes/therapyRoutes');
const expressionQuizRoutes = require('./routes/expressionQuizRoutes');
const expressionRoutes = require('./routes/expressionRoutes');
const aiScenarioRoutes = require('./routes/aiScenarioRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express(); // 1) Create the Express app

// 2) Create the HTTP server from app
const server = http.createServer(app);

// 3) Set up Socket.IO on that server
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173'], // your frontend origin
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// 4) Mongoose connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// 5) Middleware
app.use(express.json()); // parse JSON bodies
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));

// 6) Session config (stores sessions in MongoDB)
app.use(session({
  secret: process.env.SESSION_SECRET || 'someSuperSecret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// 7) Passport
require('./config/passport'); // loads passport config
app.use(passport.initialize());
app.use(passport.session());

// 8) Serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 9) Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/conversation', conversationRoutes);
app.use('/api/scenario', scenarioRoutes);
app.use('/api/therapy', therapyRoutes);
app.use('/api/expressionQuiz', expressionQuizRoutes);
app.use('/api/expression', expressionRoutes);
app.use('/api/aiScenario', aiScenarioRoutes);
app.use('/api/chat', chatRoutes);

// 10) Socket.IO events
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Example: user joins a chat room
  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined chat room ${chatId}`);
  });

  // Example: user sends a message
  socket.on('sendMessage', async ({ chatId, senderId, text }) => {
    // You can store message in DB if desired:
    // const msg = await Message.create({ chatId, sender: senderId, text });
    // Then broadcast to the chat room:
    io.to(chatId).emit('newMessage', {
      chatId,
      senderId,
      text,
      createdAt: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// 11) Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
