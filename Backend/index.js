// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const scenarioRoutes=require('./routes/scenarioRoutes')
const therapyRoutes=require('./routes/therapyRoutes')
const expressionQuizRoutes = require('./routes/expressionQuizRoutes');
const expressionRoutes = require('./routes/expressionRoutes');
const aiScenarioRoutes = require('./routes/aiScenarioRoutes');

const app = express();

// 1. Mongoose connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// 2. Middleware
app.use(express.json()); // parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// If running client on a separate port (e.g. 3000) in dev, enable CORS
app.use(cors({
  origin: ['http://localhost:5173'], 
  credentials: true
}));

// 3. Session config (stores sessions in MongoDB)
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

// 4. Passport
require('./config/passport'); // loads passport config
app.use(passport.initialize());
app.use(passport.session());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 5. Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/conversation', conversationRoutes);
app.use('/api/scenario',scenarioRoutes);
app.use('/api/therapy', therapyRoutes);
app.use('/api/expressionQuiz', expressionQuizRoutes);
app.use('/api/expression', expressionRoutes);
app.use('/api/aiScenario', aiScenarioRoutes);
// 6. Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
