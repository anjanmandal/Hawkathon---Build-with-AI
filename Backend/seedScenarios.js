// seedScenarios.js

require('dotenv').config();
const mongoose = require('mongoose');
const Scenario = require('./models/Scenario'); // Adjust path if needed

// 1) Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected for seeding'))
  .catch((err) => console.error('MongoDB connection error:', err));

async function seedScenarios() {
  try {
    // 2) (Optional) Clear out existing scenarios
    await Scenario.deleteMany({});
    console.log('Cleared old scenarios');

    // 3) Define some sample scenarios
    const scenariosData = [
      {
        scenarioId: 'child_greeting',
        title: 'Child Greeting',
        description: 'Practice basic greetings and friendly conversation for children.',
        initialSystemPrompt: `
          You are a friendly chatbot for a child with autism. 
          Use simple, literal language. Encourage them to say "Hello" or "How are you?"
        `,
        difficultyStages: [
          {
            stageNumber: 1,
            stageDescription: 'Simple Hello',
            systemPromptAddon: 'Focus on short greetings like "Hello!"',
          },
          {
            stageNumber: 2,
            stageDescription: 'Asking About Feelings',
            systemPromptAddon: 'Encourage using phrases like "How are you?" or "I am fine."',
          },
        ],
      },
      {
        scenarioId: 'making_friends',
        title: 'Making Friends',
        description: 'Simulate a casual setting (school or party) to practice starting conversations.',
        initialSystemPrompt: `
          You are simulating a friendly peer at school.
          Prompt the user to introduce themselves or ask about interests.
          Use short, literal language and positive reinforcement.
        `,
        difficultyStages: [
          {
            stageNumber: 1,
            stageDescription: 'Starting Conversation',
            systemPromptAddon: 'Teach how to say "Hi" and ask about hobbies or interests.',
          },
          {
            stageNumber: 2,
            stageDescription: 'Follow-Up & Sharing',
            systemPromptAddon: 'Encourage follow-up questions and sharing personal interests.',
          },
        ],
      },
      {
        scenarioId: 'ordering_food',
        title: 'Ordering Food',
        description: 'Practice ordering a meal in a polite, structured way.',
        initialSystemPrompt: `
          You are a polite restaurant server. 
          Prompt the user to choose items from a menu. 
          Encourage them to say "Please" and "Thank you."
        `,
        difficultyStages: [
          {
            stageNumber: 1,
            stageDescription: 'Basic Order',
            systemPromptAddon: 'Focus on naming a dish and saying "please" or "thank you."',
          },
          {
            stageNumber: 2,
            stageDescription: 'Customization & Questions',
            systemPromptAddon: 'Encourage the user to ask about ingredients or request changes.',
          },
        ],
      },
      {
        scenarioId: 'doctor_visit',
        title: 'Doctor’s Appointment',
        description: 'Practice explaining symptoms and asking about treatments.',
        initialSystemPrompt: `
          You are simulating a doctor’s visit. 
          Ask the user about their symptoms and concerns. 
          Use friendly and clear language.
        `,
        difficultyStages: [
          {
            stageNumber: 1,
            stageDescription: 'Symptom Description',
            systemPromptAddon: 'Focus on describing basic symptoms: headache, fever, etc.',
          },
          {
            stageNumber: 2,
            stageDescription: 'Follow-Up & Treatment',
            systemPromptAddon: 'Encourage the user to ask about medication, side effects, follow-ups.',
          },
        ],
      },
      {
        scenarioId: 'job_interview',
        title: 'Job Interview',
        description: 'A mock interview scenario to practice professional Q&A.',
        initialSystemPrompt: `
          You are an interviewer for a job. 
          Ask typical interview questions and give polite feedback. 
          Encourage concise answers and highlight key social cues.
        `,
        difficultyStages: [
          {
            stageNumber: 1,
            stageDescription: 'Basic Introductions',
            systemPromptAddon: 'Focus on introducing yourself and stating your strengths briefly.',
          },
          {
            stageNumber: 2,
            stageDescription: 'Detailed Discussion',
            systemPromptAddon: 'Prompt follow-up questions about teamwork, conflict resolution, etc.',
          },
        ],
      },
      {
        scenarioId: 'conflict_resolution',
        title: 'Conflict Resolution',
        description: 'Learn to handle disagreements calmly and politely.',
        initialSystemPrompt: `
          You are a friendly friend or coworker who disagrees about something. 
          The user will practice responding calmly, listening, and suggesting compromises.
        `,
        difficultyStages: [
          {
            stageNumber: 1,
            stageDescription: 'Mild Disagreement',
            systemPromptAddon: 'Encourage the user to express their view politely and listen to others.',
          },
          {
            stageNumber: 2,
            stageDescription: 'Finding Common Ground',
            systemPromptAddon: 'Focus on compromise and clarifying misunderstandings politely.',
          },
        ],
      },
      {
        scenarioId: 'talking_to_teacher',
        title: 'Talking to a Teacher',
        description: 'Practice asking questions or discussing issues with a teacher at school.',
        initialSystemPrompt: `
          You are a teacher. Prompt the user to ask a question about homework or class.
          Encourage polite greetings, eye contact (figurative), and direct questions.
        `,
        difficultyStages: [
          {
            stageNumber: 1,
            stageDescription: 'Basic Question',
            systemPromptAddon: 'Teach how to say "Excuse me, could you help me with my assignment?"',
          },
          {
            stageNumber: 2,
            stageDescription: 'Follow-up & Clarification',
            systemPromptAddon: 'Encourage the user to ask clarifying questions about the lesson.',
          },
        ],
      },
      {
        scenarioId: 'public_speaking_intro',
        title: 'Public Speaking: Intro',
        description: 'Practice a simple introduction or short speech to a small audience.',
        initialSystemPrompt: `
          You are simulating a small group setting. 
          Help the user practice giving a short introduction (name, interests, etc.). 
          Provide feedback on clarity and confidence.
        `,
        difficultyStages: [
          {
            stageNumber: 1,
            stageDescription: 'Simple Intro',
            systemPromptAddon: 'Focus on saying name and one interest: "I like drawing."',
          },
          {
            stageNumber: 2,
            stageDescription: 'Expanding Details',
            systemPromptAddon: 'Encourage the user to add more detail or an anecdote to engage listeners.',
          },
        ],
      },
    ];

    // 4) Insert sample data
    await Scenario.insertMany(scenariosData);
    console.log('Seeded scenarios successfully!');

  } catch (err) {
    console.error('Error seeding scenarios:', err);
  } finally {
    // 5) Close the DB connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Execute seeding
seedScenarios();
