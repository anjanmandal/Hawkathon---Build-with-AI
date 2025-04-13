import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, CircularProgress } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../config/apiConfig';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function SkillProgressChart() {
  // State to hold chart data and loading indicator
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all scenarios and progress when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch all scenarios
        const scenarioRes = await api.get('/scenario');
        const scenarios = scenarioRes.data;
        if (!scenarios.length) {
          setError('No scenarios found.');
          setLoading(false);
          return;
        }

        // 2. For each scenario, fetch user's skill progress
        // Run requests in parallel using Promise.all
        const progressPromises = scenarios.map(async (scenario) => {
          const progressRes = await api.get(`/scenario/${scenario.scenarioId}/skill`);
          console.log(progressRes.data);
          // Return an object using "score" for consistency
          return { title: scenario.title, score: progressRes.data.attempts };
        });

        const progressData = await Promise.all(progressPromises);

        // 3. Build Chart.js data object
        const labels = progressData.map((data) => data.title);
        // Use data.score instead of data.attempts
        const scores = progressData.map((data) => data.score);

        const data = {
          labels,
          datasets: [
            {
              label: 'Points',
              data: scores,
              backgroundColor: 'rgba(75,192,192,0.6)',
              borderColor: 'rgba(75,192,192,1)',
              borderWidth: 1,
            },
          ],
        };

        setChartData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching skill progress data:', err);
        setError('Failed to load data.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

export default SkillProgressChart;
