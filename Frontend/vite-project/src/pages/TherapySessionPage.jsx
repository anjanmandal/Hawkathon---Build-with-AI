import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { TherapyContext } from '../contexts/TherapyContext';
import api from '../config/apiConfig';

const TherapySessionPage = () => {
  const {
    sessionId,
    messages,
    feedback,
    report,
    setFeedback,
    startSession,
    sendMessage,
    closeSession,
    resetSession,
  } = useContext(TherapyContext);

  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // NEW: States for viewing past sessions
  const [showReports, setShowReports] = useState(false);
  const [reportsList, setReportsList] = useState([]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setFeedback('Speech recognition is not supported in your browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('Transcript recognized:', transcript);
      // Send user message & get the AI reply
      const aiReply = await sendMessage(transcript);
      // If there is a reply, speak it
      if (aiReply) speakText(aiReply);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event);
      if (event.error === 'no-speech') {
        setFeedback('No speech detected. Please try speaking again.');
      } else {
        setFeedback(`Speech recognition error: ${event.error}`);
      }
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
  }, [sendMessage, setFeedback]);

  // Simple TTS function
  const speakText = (text) => {
    if (!text) return;
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStartSession = async () => {
    const result = await startSession();
    // If your startSession returns something like { success: true, initialMessage: "..." }, you can speak it here
    // Or rely on the context storing that initial message in messages.
  };

  const startListening = () => {
    if (!sessionId) {
      setFeedback('Please start a session first.');
      return;
    }
    if (recognitionRef.current) {
      setListening(true);
      recognitionRef.current.start();
    }
  };

  const handleCloseSession = async () => {
    const closeResult = await closeSession();
    if (closeResult?.report) {
      speakText(
        closeResult.report +
          ' Thank you for visiting the virtual therapist. We hope it was helpful.'
      );
    }
  };

  // NEW: Fetch all past sessions from the server
  const handleViewReports = async () => {
    try {
      const res = await api.get('/therapy/reports');
      setReportsList(res.data); // array of closed sessions
      setShowReports(true);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setFeedback('Failed to fetch session reports');
    }
  };

  const handleCloseReports = () => {
    setShowReports(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" mb={2}>
        Virtual Therapist (Audio Mode)
      </Typography>

      {feedback && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {feedback}
        </Alert>
      )}

      {/* Extra button to view past sessions */}
      <Box sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={handleViewReports}>
          View Past Sessions
        </Button>
      </Box>

      {/* If no session & no report, show button to start session */}
      {!sessionId && !report && (
        <Button variant="contained" onClick={handleStartSession}>
          Start Session
        </Button>
      )}

      {sessionId && !report && (
        <>
          <Paper variant="outlined" sx={{ p: 2, height: 300, overflowY: 'auto', mb: 2 }}>
            {messages.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  mb: 1,
                  textAlign: msg.role === 'user' ? 'right' : 'left',
                }}
              >
                <Typography variant="body2" fontWeight="bold">
                  {msg.role === 'user' ? 'You' : 'Therapist'}:
                </Typography>
                <Typography variant="body1">{msg.content}</Typography>
              </Box>
            ))}
          </Paper>

          <Button
            variant="contained"
            onClick={startListening}
            disabled={listening}
            sx={{ mr: 2 }}
          >
            {listening ? 'Listening...' : 'Start Speaking'}
          </Button>

          <Button variant="outlined" color="warning" onClick={handleCloseSession}>
            Close Session
          </Button>
        </>
      )}

      {report && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Session Report</Typography>
          <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
            <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
              {report}
            </Typography>
          </Paper>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Thank you for visiting the virtual therapist.
          </Typography>
          <Button
            variant="outlined"
            color="error"
            onClick={resetSession}
            sx={{ mt: 2 }}
          >
            Reset Session
          </Button>
        </Box>
      )}

      {/* 
        MUI Dialog to show past sessions 
        Each "session" doc might have fields: sessionId, closedAt, report, ...
      */}
      <Dialog open={showReports} onClose={handleCloseReports} fullWidth maxWidth="md">
        <DialogTitle>Past Therapy Sessions</DialogTitle>
        <DialogContent dividers>
          {reportsList.length === 0 ? (
            <Typography variant="body1">No past sessions found.</Typography>
          ) : (
            <List>
              {reportsList.map((session) => (
                <ListItem key={session._id} sx={{ display: 'block', mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Session ID: {session.sessionId}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Closed At: {session.closedAt ? new Date(session.closedAt).toLocaleString() : ''}
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
                    Report: {session.report}
                  </Typography>
                  <hr />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReports}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TherapySessionPage;
