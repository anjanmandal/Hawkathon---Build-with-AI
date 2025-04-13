// src/pages/ReportsPage.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useParams } from 'react-router-dom';
import api from '../config/apiConfig';

const ReportsPage = () => {
  const { userId } = useParams();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get(`/therapy/reports/${userId}`);
        setReports(res.data);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    if (userId) {
      fetchReports();
    }
  }, [userId]);

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!reports.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No reports found for this user.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Therapy Session Reports
      </Typography>
      {reports.map((session, index) => (
        <Card variant="outlined" sx={{ mb: 2 }} key={session._id}>
          <CardContent>
            <Typography variant="h6">
              Session {index + 1} - Closed at {new Date(session.closedAt).toLocaleString()}
            </Typography>
            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>View Session Report</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{session.report || 'No report text available.'}</Typography>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default ReportsPage;
