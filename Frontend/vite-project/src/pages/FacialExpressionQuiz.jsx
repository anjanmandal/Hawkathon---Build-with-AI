import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';
import api from '../config/apiConfig'; // your axios instance

// optional: define possibleEmotions or fetch them dynamically
const possibleEmotions = ['laughing', 'happy', 'sad', 'angry', 'surprised'];

function FacialExpressionQuiz() {
  const [sessionId, setSessionId] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedGuess, setSelectedGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [points, setPoints] = useState(0);
  const [done, setDone] = useState(false);
  const [showCloseSummary, setShowCloseSummary] = useState('');
  const [totalExpressions, setTotalExpressions] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Start session on mount
  useEffect(() => {
    startNewSession();
  }, []);

  const startNewSession = async () => {
    try {
      const res = await api.post('/expressionQuiz/start', {
        numberOfExpressions: 3
      });
      setSessionId(res.data.sessionId);
      setPoints(0);
      setDone(false);
      setFeedback('');
      setShowCloseSummary('');

      // Now load the first expression
      getCurrentExpression(res.data.sessionId);
    } catch (err) {
      console.error(err);
    }
  };

  const getCurrentExpression = async (sId) => {
    try {
      const res = await api.get(`/expressionQuiz/current/${sId}`);
      if (res.data.done) {
        setDone(true);
        setImageUrl('');
        setFeedback('All expressions completed!');
      } else {
        // The DB only gives us "/uploads/xxxxx.png" 
        const rawImagePath = res.data.imageUrl; 
        // Prepend the base URL from Vite environment:
        const fullUrl = `${import.meta.env.VITE_APP_Base_URL}${rawImagePath}`;

        setImageUrl(fullUrl);
        setTotalExpressions(res.data.totalExpressions);
        setCurrentIndex(res.data.currentIndex);
      }
      setSelectedGuess('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleGuess = async () => {
    if (!selectedGuess || !sessionId) return;
    try {
      const res = await api.post('/expressionQuiz/guess', {
        sessionId,
        userGuess: selectedGuess,
      });
      setFeedback(res.data.feedback);
      setPoints(res.data.points);
      setDone(res.data.done);

      if (res.data.done) {
        setImageUrl('');
      } else {
        // If guess was correct, it advanced currentIndex. Fetch next:
        if (res.data.correct) {
          getCurrentExpression(sessionId);
        }
        // If incorrect, we just let them guess again
      }
      setCurrentIndex(res.data.currentIndex);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseSession = async () => {
    if (!sessionId) return;
    try {
      const res = await api.post('/expressionQuiz/close', { sessionId });
      setShowCloseSummary(res.data.finalSummary);
      setPoints(res.data.points);
      setDone(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Facial Expression Quiz
      </Typography>

      <Typography variant="subtitle1">Points: {points}</Typography>
      <Typography variant="subtitle2">
        Expression {currentIndex + 1} / {totalExpressions}
      </Typography>

      {imageUrl && (
        <Card sx={{ maxWidth: 300, margin: '0 auto', mt: 2 }}>
          <CardMedia
            component="img"
            height="300"
            image={imageUrl} // use the full URL we constructed
            alt="expression"
          />
          <CardContent>
            <RadioGroup
              value={selectedGuess}
              onChange={(e) => setSelectedGuess(e.target.value)}
            >
              {possibleEmotions.map((emo) => (
                <FormControlLabel
                  key={emo}
                  value={emo}
                  control={<Radio />}
                  label={emo}
                />
              ))}
            </RadioGroup>
            <Button
              variant="contained"
              onClick={handleGuess}
              disabled={done || !selectedGuess}
            >
              Submit Guess
            </Button>
          </CardContent>
        </Card>
      )}

      {feedback && (
        <Typography variant="body1" sx={{ mt: 2 }}>
          {feedback}
        </Typography>
      )}

      <Box sx={{ mt: 3 }}>
        {!done && (
          <Button variant="outlined" color="secondary" onClick={handleCloseSession}>
            Close Session
          </Button>
        )}
        {done && (
          <Button variant="contained" sx={{ ml: 2 }} onClick={startNewSession}>
            Start New Session
          </Button>
        )}
      </Box>

      {showCloseSummary && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5">Final Summary</Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {showCloseSummary}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default FacialExpressionQuiz;
