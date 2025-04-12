import React, { useState, useRef } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';

const VoiceToneAnalyzer = () => {
  const [transcript, setTranscript] = useState('');
  const [toneFeedback, setToneFeedback] = useState('');
  const recognitionRef = useRef(null);

  const startVoiceRecognition = () => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in your browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const resultText = event.results[0][0].transcript;
      setTranscript(resultText);
      analyzeTone(resultText);
    };
    recognition.onerror = (err) => {
      console.error('Speech recognition error:', err);
    };
    recognition.start();
    recognitionRef.current = recognition;
  };

  // Simple keyword-based analysis – replace with a robust model as needed
  const analyzeTone = (text) => {
    const lowerText = text.toLowerCase();
    const anxiousKeywords = ['anxious', 'nervous', 'stressed', 'upset'];
    let foundAnxious = anxiousKeywords.some((word) => lowerText.includes(word));
    if (foundAnxious) {
      setToneFeedback('You sound anxious. Consider taking a deep, slow breath.');
    } else {
      setToneFeedback('Your tone seems calm. Great job!');
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Tone of Voice Analysis
      </Typography>
      <Button variant="contained" onClick={startVoiceRecognition}>
        Start Speaking
      </Button>
      {transcript && (
        <Typography variant="body1" sx={{ mt: 2 }}>
          Recognized Speech: {transcript}
        </Typography>
      )}
      {toneFeedback && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {toneFeedback}
        </Alert>
      )}
    </Box>
  );
};

export default VoiceToneAnalyzer;
