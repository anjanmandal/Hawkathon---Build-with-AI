// client/src/contexts/TherapyContext.jsx
import React, { createContext, useState, useCallback } from 'react';
import api from '../config/apiConfig';

export const TherapyContext = createContext(null);

export const TherapyProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [report, setReport] = useState('');

  // Start session
  const startSession = useCallback(async () => {
    try {
      const res = await api.post('/therapy/start');
      setSessionId(res.data.sessionId);
      setFeedback(res.data.message || 'Session started');

      // Show initial message in local messages
      const initialMessage = 'I am your virtual therapist. How can I help you today?';
      setMessages([{ role: 'assistant', content: initialMessage }]);
      return { success: true, initialMessage };
    } catch (err) {
      console.error('Error starting session:', err);
      setFeedback('Failed to start session');
      return { success: false };
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (userMsg) => {
    if (!sessionId) {
      setFeedback('No active session. Please start a session first.');
      return null;
    }
    try {
      const res = await api.post('/therapy/message', {
        sessionId,
        userMessage: userMsg,
      });
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: userMsg },
        { role: 'assistant', content: res.data.reply },
      ]);
      return res.data.reply; 
    } catch (err) {
      console.error('Error sending message:', err);
      setFeedback('Failed to send message');
      return null;
    }
  }, [sessionId]);

  // Close session
  const closeSession = useCallback(async () => {
    if (!sessionId) {
      setFeedback('No active session. Please start a session first.');
      return null;
    }
    try {
      const res = await api.post('/therapy/close', { sessionId });
      setReport(res.data.report);
      setFeedback('Session closed');
      // We return the final data so the component can do TTS or other actions
      return res.data; 
    } catch (err) {
      console.error('Error closing session:', err);
      setFeedback('Failed to close session');
      return null;
    }
  }, [sessionId]);

  // Reset local state
  const resetSession = useCallback(() => {
    setSessionId(null);
    setMessages([]);
    setFeedback('');
    setReport('');
  }, []);

  const value = {
    sessionId,
    messages,
    feedback,
    report,
    setFeedback,
    setReport,
    startSession,
    sendMessage,
    closeSession,
    resetSession,
  };

  return (
    <TherapyContext.Provider value={value}>
      {children}
    </TherapyContext.Provider>
  );
};
