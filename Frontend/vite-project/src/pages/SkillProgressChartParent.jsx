// src/pages/SkillProgressChart.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useParams } from 'react-router-dom';
import api from '../config/apiConfig';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function SkillProgressChartParent() {
  const { userId } = useParams(); // Retrieve userId from URL
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all scenario progress for that user
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/scenario/user/${userId}/progress`);
        const progressData = res.data; // array of {title, scenarioId, attempts}

        if (!progressData.length) {
          setError('No scenarios found or no progress data.');
          setLoading(false);
          return;
        }

        // Build Chart.js data
        const labels = progressData.map((item) => item.title);
        const scores = progressData.map((item) => item.attempts);

        const data = {
          labels,
          datasets: [
            {
              label: 'Attempts',
              data: scores,
              backgroundColor: 'rgba(75,192,192,0.6)',
              borderColor: 'rgba(75,192,192,1)',
              borderWidth: 1,
            },
          ],
        };

        setChartData(data);
      } catch (err) {
        console.error('Error fetching user scenario progress:', err);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Scenario Skill Progress
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography variant="body1" color="error" align="center">
          {error}
        </Typography>
      ) : (
        <Card variant="outlined">
          <CardContent>
            <Bar
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Skill Progress by Scenario',
                  },
                },
              }}
            />
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default SkillProgressChartParent;
