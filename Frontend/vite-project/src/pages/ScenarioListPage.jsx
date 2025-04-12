import React, { useEffect, useState } from 'react';
import { Box, Typography, Alert, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import api from '../config/apiConfig';

const ScenariosListPage = () => {
  const [rows, setRows] = useState([]);
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // On mount, fetch scenario list and then fetch skill & conversation data for each
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1) get all scenarios
      const scenarioRes = await api.get('/scenario');
      const scenarioList = scenarioRes.data;

      // 2) For each scenario, fetch skill progress + last chat snippet
      const rowDataPromises = scenarioList.map(async (scenario) => {
        const { scenarioId, title, description } = scenario;

        // Fetch skill progress
        let attempts = 0;
        let badges = [];
        try {
          const skillRes = await api.get(`/scenario/${scenarioId}/skill`);
          attempts = skillRes.data.attempts || 0;
          badges = skillRes.data.badges || [];
        } catch (err) {
          console.error(`Error fetching skill progress for ${scenarioId}`, err);
        }

        // Fetch conversation sessions
        // We'll show snippet of the last message from the newest session
        let lastMessage = 'No chat yet';
        try {
          const sessRes = await api.get(`/conversation/sessions?scenarioId=${scenarioId}`);
          const sessions = sessRes.data; // sorted by createdAt: -1 if we coded that
          if (sessions.length > 0) {
            const newestSession = sessions[0];
            const lastMsg = newestSession.messages[newestSession.messages.length - 1];
            if (lastMsg) {
              // show up to 50 chars for brevity
              lastMessage = lastMsg.content.slice(0, 50);
              if (lastMsg.content.length > 50) lastMessage += '...';
            }
          }
        } catch (err) {
          console.error(`Error fetching sessions for ${scenarioId}`, err);
        }

        return {
          id: scenarioId, // DataGrid requires an "id" field
          title,
          description,
          attempts,
          badges: badges.join(', '),  // comma-separate for DataGrid display
          lastMessage,
        };
      });

      // Wait for all parallel fetches
      const finalRowData = await Promise.all(rowDataPromises);
      setRows(finalRowData);
    } catch (err) {
      console.error('Error fetching scenarios:', err);
    }
  };

  // Mark progress when user is done or wants to record progress for a scenario
  const handleMarkComplete = async (scenarioId) => {
    try {
      await api.post(`/scenario/${scenarioId}/skill`, {
        incrementAttempts: true,
        addBadge: 'Beginner Communicator',
      });
      setFeedback(`Scenario ${scenarioId} progress updated!`);
      setTimeout(() => setFeedback(''), 3000);

      // Refresh row data so attempts/badges update
      fetchData();
    } catch (err) {
      console.error(err);
      setFeedback('Error updating skill progress');
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  // Open the conversation for scenario
  const handleOpenScenario = (scenarioId) => {
    navigate(`/conversation/chat/${scenarioId}`);
  };

  const columns = [
    { field: 'title', headerName: 'Title', flex: 1, minWidth: 150 },
    { field: 'description', headerName: 'Description', flex: 2, minWidth: 200 },
    {
      field: 'attempts',
      headerName: 'Attempts',
      flex: 0.5,
      minWidth: 80,
    },
    {
      field: 'badges',
      headerName: 'Badges',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'lastMessage',
      headerName: 'Last Chat',
      flex: 2,
      minWidth: 200,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      disableClickEventBubbling: true,
      flex: 1,
      minWidth: 200,
      renderCell: (params) => {
        return (
          <Box>
            <Button
              variant="outlined"
              size="small"
              sx={{ mr: 1 }}
              onClick={() => handleOpenScenario(params.row.id)}
            >
              Open Chat
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => handleMarkComplete(params.row.id)}
            >
              Mark Complete
            </Button>
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ mt: 4, px: { xs: 2, md: 4 } }}>
      <Typography variant="h4" gutterBottom>
        DB-Based Role-Play Scenarios
      </Typography>

      {feedback && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {feedback}
        </Alert>
      )}

      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          autoHeight
        />
      </Box>
    </Box>
  );
};

export default ScenariosListPage;
