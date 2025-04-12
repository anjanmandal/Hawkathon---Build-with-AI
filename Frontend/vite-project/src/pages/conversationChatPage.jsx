import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Paper, TextField, Button, Chip, Stack, Switch, FormControlLabel } from '@mui/material';
import { useParams } from 'react-router-dom';
import api from '../config/apiConfig';

const ConversationChatPage = () => {
  const { scenarioId } = useParams();

  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [skillProgress, setSkillProgress] = useState({ attempts: 0, badges: [] });

  // NEW: talkMode toggles the audio-based approach
  const [talkMode, setTalkMode] = useState(false);

  // For speech recognition
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Attempt to get or create the scenario session
    const fetchSession = async () => {
      try {
        const res = await api.get(`/conversation/scenarioSession/${scenarioId}`);
        setSessionId(res.data._id);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error('Error fetching scenario session:', err);
      }
    };
    fetchSession();

    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false; // stop after one phrase
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        // Put the recognized text into userMessage
        setUserMessage(transcript);
      };

      recognition.onend = () => {
        // Optionally auto-send
        if (talkMode && userMessage.trim()) {
          handleSend();
        }
      };

      recognitionRef.current = recognition;
    } else if ('SpeechRecognition' in window) {
      // Some browsers may support SpeechRecognition instead of webkitSpeechRecognition
      const recognition = new window.SpeechRecognition();
      // set the same config...
      recognitionRef.current = recognition;
    }
  }, [scenarioId, talkMode, userMessage]);

  // Use TTS to speak AI's reply
  const speakAIResponse = (text) => {
    if (!talkMode) return;
    if (!('speechSynthesis' in window)) {
      console.warn('Text-to-Speech not supported in this browser.');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  // handleSend - same logic, but calls TTS if talkMode is on
  const handleSend = async () => {
    if (!userMessage.trim()) return;
    try {
      const res = await api.post('/conversation/chat', {
        scenarioId,
        userMessage,
        sessionId,
      });
      const { sessionId: newSessionId, reply, skillProgress: updatedProgress } = res.data;

      if (!sessionId) setSessionId(newSessionId);

      // Update chat
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: reply },
      ]);
      setUserMessage('');

      if (updatedProgress) {
        setSkillProgress(updatedProgress);
      }

      // speak the reply if talkMode
      if (talkMode) {
        speakAIResponse(reply);
      }
    } catch (err) {
      console.error('Error in chat:', err);
      alert('Error sending message');
    }
  };

  // Start speech recognition
  const handleStartTalking = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition not supported in this browser!');
      return;
    }
    recognitionRef.current.start();
  };

  // Reset Chat
  const handleReset = async () => {
    try {
      await api.delete(`/conversation/scenarioSession/${scenarioId}`);
      setSessionId(null);
      setMessages([]);
      setUserMessage('');
      setSkillProgress({ attempts: 0, badges: [] });
    } catch (err) {
      console.error('Error resetting chat:', err);
      alert('Error resetting chat');
    }
  };

  return (
    <Box sx={{ ml: 30, p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Scenario: {scenarioId}
      </Typography>

      {/* Real-time skill progress display */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1">
          <strong>Attempts:</strong> {skillProgress.attempts}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          {skillProgress.badges.map((badge, idx) => (
            <Chip key={idx} label={badge} color="secondary" />
          ))}
        </Stack>
      </Box>

      {/* Toggle talk mode */}
      <FormControlLabel
        control={
          <Switch
            checked={talkMode}
            onChange={(e) => setTalkMode(e.target.checked)}
          />
        }
        label="Talk Mode (Audio Input/Output)"
        sx={{ mb: 2 }}
      />

      {/* Chat Messages */}
      <Paper variant="outlined" sx={{ p: 2, height: 300, overflowY: 'auto', mb: 2 }}>
        {messages.map((msg, idx) => (
          <Box
            key={idx}
            sx={{
              textAlign: msg.role === 'user' ? 'right' : 'left',
              mb: 1,
            }}
          >
            <Typography variant="body2" fontWeight="bold">
              {msg.role === 'user' ? 'You' : 'AI'}:
            </Typography>
            <Typography variant="body1">{msg.content}</Typography>
          </Box>
        ))}
      </Paper>

      {/* Text input or speech input */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          label="Your message"
          disabled={talkMode} // optional: disable manual typing if in talk mode
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
        />
        <Button variant="contained" onClick={handleSend}>
          Send
        </Button>
      </Box>

      {/* Start Talking button (to initiate speech recognition) */}
      {talkMode && (
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={handleStartTalking}>
            Start Talking
          </Button>
        </Box>
      )}

      {/* Reset Chat Button */}
      <Box sx={{ mt: 2 }}>
        <Button variant="outlined" color="warning" onClick={handleReset}>
          Reset Chat
        </Button>
      </Box>
    </Box>
  );
};

export default ConversationChatPage;
