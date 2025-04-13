// client/src/App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import api from './config/apiConfig';
import { CustomThemeProvider } from './theme/CustomThemeProvider';
import { AuthProvider } from './contexts/Authcontext';
import FacialExpressionGame from './pages/FacialExpressionQuiz';

// Existing pages
import Layout from './layout/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ScenariosListPage from './pages/ScenarioListPage';
import ConversationChatPage from './pages/conversationChatPage';
import GeminiEmotionExercise from './pages/FacialExpressionQuiz';
import { TherapyProvider } from './contexts/TherapyContext';
import UploadExpressionPage from './pages/UploadExpressionPage';
import AIScenarioLearning from './pages/AIScenarioLearning';
import ConversationListPage from './pages/ConversationListPage';


// New Virtual Therapist pages
import TherapySessionPage from './pages/TherapySessionPage';
import SkillProgressChart from './pages/SkillProgressChart';
import AssociatedUsersPage from './pages/AssociatedUsersPage';
import SkillProgressChartParent from './pages/SkillProgressChartParent';
import ReportsPage from './pages/ReportsPage';


function PrivateRoute({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setLoading] = useState(true);

  // Check if user is authenticated by fetching profile
  useEffect(() => {
    api.get('/users/profile')
      .then((res) => {
        console.log("Fetched user:", res.data.user);
        setUser(res.data.user);
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <CustomThemeProvider>
        <TherapyProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Private routes */}
          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/scenarios"
            element={
              <PrivateRoute>
                <Layout>
                  <ScenariosListPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/conversation/chat/:scenarioId"
            element={
              <PrivateRoute>
                <Layout>
                  <ConversationChatPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/expression-game"
            element={
              <PrivateRoute>
                <Layout>
                  <GeminiEmotionExercise />
                </Layout>
              </PrivateRoute>
            }
          />
    

          {/* New Virtual Therapist routes */}
          <Route
            path="/therapy"
            element={
              <PrivateRoute>
                <Layout>
                  <TherapySessionPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
              path="/facial-expression-game"
              element={
                <PrivateRoute>
                  <Layout>
                    <FacialExpressionGame />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
  path="/upload-expression"
  element={
    <PrivateRoute>
      <Layout>
        <UploadExpressionPage />
      </Layout>
    </PrivateRoute>
  }
/>
<Route
  path="/ai-scenarios"
  element={
    <PrivateRoute>
      <Layout>
        <AIScenarioLearning />
      </Layout>
    </PrivateRoute>
  }
/>
<Route
  path="/conversations"
  element={
    <PrivateRoute>
      <Layout>
        <ConversationListPage />
      </Layout>
    </PrivateRoute>
  }
/>
<Route
  path="/skill-progress"
  element={
    <PrivateRoute>
      <Layout>
        <SkillProgressChart />
      </Layout>
    </PrivateRoute>
  }
/>
<Route
  path="/associated-users"
  element={
    <PrivateRoute>
      <Layout>
        <AssociatedUsersPage />
      </Layout>
    </PrivateRoute>
  }
/>
<Route 
path="/progress/:userId" 
element={ 
<PrivateRoute>
      <Layout>
        <SkillProgressChartParent />
        </Layout> 
        </PrivateRoute>} 
/>
<Route 
path="/reports/:userId" 
element={
  <PrivateRoute>
      <Layout>
<ReportsPage />
</Layout>
</PrivateRoute>
} 
/>
        </Routes>
        </TherapyProvider>
      </CustomThemeProvider>
    </AuthProvider>
  );
}

export default App;
