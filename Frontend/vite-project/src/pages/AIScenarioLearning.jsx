import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  LinearProgress,
  
} from '@mui/material';
import api from '../config/apiConfig';

// Web Speech API check
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

function AISimpleScenario() {
  const [sessionId, setSessionId] = useState(null);
  const [scenarioDescription, setScenarioDescription] = useState('');
  const [userResponse, setUserResponse] = useState('');
  const [feedback, setFeedback] = useState('');
  const [points, setPoints] = useState(0);
  const [done, setDone] = useState(false);
  const [totalScenarios, setTotalScenarios] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [finalSummary, setFinalSummary] = useState('');

  // Indicators
  const [isSpeaking, setIsSpeaking] = useState(false);   // AI TTS in progress
  const [isRecording, setIsRecording] = useState(false); // STT in progress

  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!SpeechRecognition) {
      alert('Your browser does not support Speech Recognition.');
    } else {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      // Called when speech is recognized (final result)
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserResponse(transcript);

        // Immediately send to server (if we have an active session)
        if (sessionId && !done && transcript) {
          handleSubmitSpeech(transcript);
        }
      };

      // Called when user stops speaking
      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [sessionId, done]); 
  // We watch sessionId + done. If you do something with userResponse in here, be mindful of how React state updates.

  // TTS
  const speak = (text) => {
    if (!text) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  // Start session
  const startSession = async () => {
    try {
      const res = await api.post('/aiScenario/start', { numberOfScenarios: 3 });
      setSessionId(res.data.sessionId);
      setPoints(0);
      setDone(false);
      setFeedback('');
      setFinalSummary('');
      fetchCurrentScenario(res.data.sessionId);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch current scenario
  const fetchCurrentScenario = async (sid) => {
    try {
      const res = await api.get(`/aiScenario/current/${sid}`);
      if (res.data.done) {
        setDone(true);
        setScenarioDescription(res.data.message || 'All scenarios completed!');
        speak('All scenarios completed!');
      } else {
        setScenarioDescription(res.data.scenarioDescription);
        setTotalScenarios(res.data.totalScenarios);
        setCurrentIndex(res.data.currentIndex);

        // TTS for scenario
        const scenarioText = `
          Scenario ${res.data.currentIndex + 1} of ${res.data.totalScenarios}.
          ${res.data.scenarioDescription}.
          Please speak your response now.
        `;
        speak(scenarioText);
      }
      setUserResponse('');
      setFeedback('');
    } catch (err) {
      console.error(err);
    }
  };

  // Start microphone
  const startListening = () => {
    if (recognitionRef.current && !done) {
      setIsRecording(true);
      setUserResponse(''); // clear old transcript
      recognitionRef.current.start();
    }
  };

  // Called automatically from onresult => auto-submits
  const handleSubmitSpeech = async (transcript) => {
    try {
      const res = await api.post('/aiScenario/respond', {
        sessionId,
        userResponse: transcript
      });

      setFeedback(res.data.feedback);
      setPoints(res.data.points);
      setDone(res.data.done);

      speak(res.data.feedback);
      setCurrentIndex(res.data.currentIndex);
    } catch (err) {
      console.error(err);
    }
  };

  // After feedback, user can go next scenario
  const handleNextScenario = () => {
    if (!sessionId) return;
    if (!done) {
      fetchCurrentScenario(sessionId);
    }
  };

  // End session
  const closeSession = async () => {
    if (!sessionId) return;
    try {
      const res = await api.post('/aiScenario/close', { sessionId });
      setFinalSummary(res.data.finalSummary);
      setPoints(res.data.points);
      setDone(true);

      speak(res.data.finalSummary);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ maxWidth: 700, margin: 'auto', mt: 4 }}>
        <Card variant='outlined'>
      {/* Top bar with End Session */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">AI Scenario-Based Learning (Sound to Sound)</Typography>
        <Button variant="outlined" color="error" onClick={closeSession} disabled={!sessionId || done}>
          End Session
        </Button>
      </Box>

      {/* Start Session if no session or if done */}
      {!sessionId || done ? (
        <Box sx={{ mb: 3 }}>
          <Button variant="contained" onClick={startSession}>
            Start Session
          </Button>
        </Box>
      ) : null}

      {/* Indicators for TTS / STT */}
      {isSpeaking && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <Typography variant="body2">AI is speaking...</Typography>
        </Box>
      )}
      {isRecording && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CircularProgress color="secondary" size={20} sx={{ mr: 1 }} />
          <Typography variant="body2">Recording your voice...</Typography>
        </Box>
      )}

      {/* Points & scenario progress */}
      {sessionId && !done && (
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">Points: {points}</Typography>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Scenario {currentIndex + 1} / {totalScenarios}
            </Typography>
            {totalScenarios > 0 && (
              <LinearProgress
                variant="determinate"
                value={(currentIndex / totalScenarios) * 100}
                sx={{ height: 8, borderRadius: 1 }}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Current scenario card */}
      {sessionId && !done && scenarioDescription && (
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {scenarioDescription}
            </Typography>

            <Typography variant="body2" sx={{ mb: 1 }}>
              Your recognized response:
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, border: '1px solid #ccc', p: 1, minHeight: 40 }}>
              {userResponse || '...'}
            </Typography>

            {/* Just "Start Recording" button. 
                We auto-submit on speech recognition result. */}
            <Button variant="outlined" onClick={startListening}>
              Start Recording
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Show feedback and a "Next Scenario" button */}
      {feedback && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" color="primary" sx={{ mb: 1 }}>
            {feedback}
          </Typography>
          {!done && (
            <Button variant="contained" onClick={handleNextScenario}>
              Next Scenario
            </Button>
          )}
        </Box>
      )}

      {/* If done but no summary => all scenarios done */}
      {done && !finalSummary && scenarioDescription && (
        <Typography variant="body1" sx={{ mt: 2 }}>
          {scenarioDescription}
        </Typography>
      )}

      {/* Final summary */}
      {finalSummary && (
        <Card variant="outlined" sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Final Summary
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {finalSummary}
            </Typography>
          </CardContent>
        </Card>
      )}
      </Card>
    </Box>
  );
}

export default AISimpleScenario;
