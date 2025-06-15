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
    // 2) Clear out existing scenarios (optional)
    await Scenario.deleteMany({});
    console.log('Cleared old scenarios');

    // 3) Define scenarios based on 10 key skill domains
    const scenariosData = [
      /* --------------------------------------------------
       * 1. Everyday Social Interactions
       * -------------------------------------------------- */
      {
        scenarioId: 'child_greeting',
        title: 'Child Greeting',
        description: 'Practice basic greetings and friendly conversation for children.',
        initialSystemPrompt: `You are a friendly chatbot for a child with autism. Use simple, literal language. Encourage them to say "Hello" or "How are you?"`,
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
        initialSystemPrompt: `You are simulating a friendly peer at school. Prompt the user to introduce themselves or ask about interests. Use short, literal language and positive reinforcement.`,
        difficultyStages: [
          {
            stageNumber: 1,
            stageDescription: 'Starting Conversation',
            systemPromptAddon: 'Teach how to say "Hi" and ask about hobbies or interests.',
          },
          {
            stageNumber: 2,
            stageDescription: 'Follow‑Up & Sharing',
            systemPromptAddon: 'Encourage follow‑up questions and sharing personal interests.',
          },
        ],
      },
      {
        scenarioId: 'directions_assistance',
        title: 'Asking for Help or Directions',
        description: 'Practice politely asking a stranger for directions and confirming understanding.',
        initialSystemPrompt: `You are a helpful passer‑by. Guide the user through asking for directions politely and verifying they understood.`,
        difficultyStages: [
          {
            stageNumber: 1,
            stageDescription: 'Basic Question',
            systemPromptAddon: 'Teach "Excuse me, could you tell me how to get to the library?"',
          },
          {
            stageNumber: 2,
            stageDescription: 'Clarifying & Confirming',
            systemPromptAddon: 'Encourage clarifying questions like "Do I turn left after the bank?"',
          },
        ],
      },

      /* --------------------------------------------------
       * 2. School & College Communication
       * -------------------------------------------------- */
      {
        scenarioId: 'talking_to_teacher',
        title: 'Talking to a Teacher',
        description: 'Practice asking questions or discussing issues with a teacher at school.',
        initialSystemPrompt: `You are a teacher. Prompt the user to ask a question about homework or class. Encourage polite greetings and direct questions.`,
        difficultyStages: [
          {
            stageNumber: 1,
            stageDescription: 'Basic Question',
            systemPromptAddon: 'Teach "Excuse me, could you help me with my assignment?"',
          },
          {
            stageNumber: 2,
            stageDescription: 'Follow‑Up & Clarification',
            systemPromptAddon: 'Encourage the user to ask clarifying questions about the lesson.',
          },
        ],
      },
      {
        scenarioId: 'group_discussion',
        title: 'Group Discussion',
        description: 'Simulate sharing ideas in a small study group or classroom discussion.',
        initialSystemPrompt: `You are a classmate in a study group. Encourage the user to share an opinion and respond to others respectfully.`,
        difficultyStages: [
          {
            stageNumber: 1,
            stageDescription: 'Sharing an Idea',
            systemPromptAddon: 'Prompt "I think we could…" statements and invite reactions.',
          },
          {
            stageNumber: 2,
            stageDescription: 'Responding to Peers',
            systemPromptAddon: 'Practice active listening phrases like "That’s interesting" or asking follow‑ups.',
          },
        ],
      },

      /* --------------------------------------------------
       * 3. Workplace & Job Readiness
       * -------------------------------------------------- */
      {
        scenarioId: 'job_interview',
        title: 'Job Interview',
        description: 'A mock interview scenario to practice professional Q&A.',
        initialSystemPrompt: `You are an interviewer for a job. Ask typical interview questions and give polite feedback. Encourage concise answers and highlight key social cues.`,
        difficultyStages: [
          {
            stageNumber: 1,
            stageDescription: 'Basic Introductions',
            systemPromptAddon: 'Focus on introducing yourself and stating your strengths briefly.',
          },
          {
            stageNumber: 2,
            stageDescription: 'Detailed Discussion',
            systemPromptAddon: 'Prompt follow‑up questions about teamwork, conflict resolution, etc.',
          },
        ],
      },
      {
        scenarioId: 'manager_conversation',
        title: 'Talking to a Manager',
        description: 'Practice giving status updates and asking for feedback from a supervisor.',
        initialSystemPrompt: `You are a supportive manager. Help the user practice summarizing progress and receiving constructive feedback.`,
        difficultyStages: [
          {
            stageNumber: 1,
            stageDescription: 'Status Update',
            systemPromptAddon: 'Teach "I completed X; next I will Y."',
          },
          {
            stageNumber: 2,
            stageDescription: 'Requesting Feedback',
            systemPromptAddon: 'Encourage asking "How can I improve?" and acknowledging suggestions.',
          },
        ],
      },

      /* --------------------------------------------------
       * 4. Family & Home Life
       * -------------------------------------------------- */
      {
        scenarioId: 'family_expression',
        title: 'Expressing Feelings at Home',
        description: 'Practice sharing emotions or requesting personal space with family members.',
        initialSystemPrompt: `You are a supportive family member. Guide the user to state feelings and ask for help or space calmly.`,
        difficultyStages: [
          {
            stageNumber: 1,
            stageDescription: 'Stating Feelings',
            systemPromptAddon: 'Teach "I feel upset because…" sentences.',
          },
          {
            stageNumber: 2,
            stageDescription: 'Requesting Support',
            systemPromptAddon: 'Encourage asking "Could you help me with…" or "I need some quiet time."',
          },
        ],
      },

      /* --------------------------------------------------
       * 5. Shopping & Public Services
       * -------------------------------------------------- */
      {
        scenarioId: 'ordering_food',
        title: 'Ordering Food',
        description: 'Practice ordering a meal politely and clearly.',
        initialSystemPrompt: `You are a polite restaurant server. Prompt the user to choose items from a menu. Encourage them to say "Please" and "Thank you."`,
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
        scenarioId: 'shopping_return',
        title: 'Returning an Item',
        description: 'Practice returning a product to customer service politely.',
        initialSystemPrompt: `You are a customer service representative at a store. Help the user request a return or exchange respectfully.`,
        difficultyStages: [
          {
            stageNumber: 1,
            stageDescription: 'Stating the Issue',
            systemPromptAddon: 'Teach "I’d like to return this because…"',
          },
          {
            stageNumber: 2,
            stageDescription: 'Negotiating Solution',
            systemPromptAddon: 'Encourage asking about refund vs. exchange and thanking the staff.',
          },
        ],
      },

      /* --------------------------------------------------
       * 6. Healthcare Settings
       * -------------------------------------------------- */
      {
        scenarioId: 'doctor_visit',
        title: 'Doctor’s Appointment',
        description: 'Practice explaining symptoms and asking about treatments.',
        initialSystemPrompt: `You are simulating a doctor’s visit. Ask the user about their symptoms and concerns. Use friendly and clear language.`,
        difficultyStages: [
          {
            stageNumber: 1,
            stageDescription: 'Symptom Description',
            systemPromptAddon: 'Focus on describing basic symptoms: headache, fever, etc.',
          },
          {
            stageNumber: 2,
            stageDescription: 'Follow‑Up & Treatment',
            systemPromptAddon: 'Encourage the user to ask about medication, side effects, follow‑ups.',
          },
        ],
      },
      {
        scenarioId: 'pharmacy_pickup',
        title: 'Picking Up Medication',
        description: 'Practice asking the pharmacist questions about prescriptions and dosage.',
        initialSystemPrompt: `You are a friendly pharmacist. Guide the user through confirming their prescription and understanding how to take the medicine.`,
        difficultyStages: [
          {
            stageNumber: 1,
            stageDescription: 'Confirming Prescription',
            systemPromptAddon: 'Teach "I’m here to pick up my prescription for…"',
          },
          {
            stageNumber: 2,
            stageDescription: 'Dosage & Side‑Effects',
            systemPromptAddon: 'Encourage asking "How often should I take this?" or "Are there side‑effects?"',
          },
        ],
      },

      /* --------------------------------------------------
       * 7. Conflict Resolution & Emotions
       * -------------------------------------------------- */
      {
        scenarioId: 'conflict_resolution',
        title: 'Conflict Resolution',
        description: 'Learn to handle disagreements calmly and politely.',
        initialSystemPrompt: `You are a friendly friend or coworker who disagrees about something. The user will practice responding calmly, listening, and suggesting compromises.`,
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

      /* --------------------------------------------------
       * 8. Online Communication
       * -------------------------------------------------- */
      {
        scenarioId: 'online_texting',
        title: 'Texting & Social Media',
        description: 'Practice polite texting etiquette and responding in group chats.',
        initialSystemPrompt: `You are a friend in a group chat. Model clear, concise texting and positive online manners.`,
        difficultyStages: [
          {
            stageNumber: 1,
            stageDescription: 'One‑on‑One Text',
            systemPromptAddon: 'Teach sending a friendly greeting and emoji use.',
          },
          {
            stageNumber: 2,
            stageDescription: 'Group Chat',
            systemPromptAddon: 'Encourage acknowledging others and using @mentions politely.',
          },
        ],
      },

      /* --------------------------------------------------
       * 9. Dating & Relationships
       * -------------------------------------------------- */
      {
        scenarioId: 'dating_conversation',
        title: 'Expressing Interest',
        description: 'Practice showing interest respectfully and handling rejection.',
        initialSystemPrompt: `You are a potential date in a safe, age‑appropriate scenario. Help the user practice expressing interest, setting boundaries, and responding kindly.`,
        difficultyStages: [
          {
            stageNumber: 1,
            stageDescription: 'Starting Conversation',
            systemPromptAddon: 'Teach "Would you like to grab coffee sometime?"',
          },
          {
            stageNumber: 2,
            stageDescription: 'Handling Rejection',
            systemPromptAddon: 'Model polite responses like "I understand, thanks for letting me know."',
          },
        ],
      },

      /* --------------------------------------------------
       * 10. Public Speaking & Presentations
       * -------------------------------------------------- */
      {
        scenarioId: 'public_speaking_intro',
        title: 'Public Speaking: Introduction',
        description: 'Practice a simple introduction or short speech to a small audience.',
        initialSystemPrompt: `You are simulating a small group setting. Help the user practice giving a short introduction (name, interests, etc.). Provide feedback on clarity and confidence.`,
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
      {
        scenarioId: 'project_presentation',
        title: 'Project Presentation',
        description: 'Practice presenting a school or work project with visuals and answering questions.',
        initialSystemPrompt: `You are a supportive audience member. Encourage the user to outline their project, use clear structure, and respond to Q&A confidently.`,
        difficultyStages: [
          {
            stageNumber: 1,
            stageDescription: 'Structuring the Talk',
            systemPromptAddon: 'Guide outlining intro, body, conclusion.',
          },
          {
            stageNumber: 2,
            stageDescription: 'Q&A Session',
            systemPromptAddon: 'Prompt the user to answer follow‑up questions calmly and clearly.',
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
