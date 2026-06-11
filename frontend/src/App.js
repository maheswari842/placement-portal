import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AptitudeList from './pages/AptitudeList';
import AptitudeTest from './pages/AptitudeTest';
import AptitudeResult from './pages/AptitudeResult';
import CodingList from './pages/CodingList';
import CodingEditor from './pages/CodingEditor';
import Leaderboard from './pages/Leaderboard';
import Progress from './pages/Progress';
import InterviewExp from './pages/InterviewExp';
import Notes from './pages/Notes';
import Profile from './pages/Profile';
import DailyChallenge from './pages/DailyChallenge';
import AdminPanel from './pages/AdminPanel';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner" /></div>;
  return user ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="aptitude" element={<AptitudeList />} />
            <Route path="aptitude/test" element={<AptitudeTest />} />
            <Route path="aptitude/result/:testId" element={<AptitudeResult />} />
            <Route path="coding" element={<CodingList />} />
            <Route path="coding/:id" element={<CodingEditor />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="progress" element={<Progress />} />
            <Route path="interviews" element={<InterviewExp />} />
            <Route path="notes" element={<Notes />} />
            <Route path="profile" element={<Profile />} />
            <Route path="daily-challenge" element={<DailyChallenge />} />
            <Route path="admin" element={<AdminPanel />} />
            
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="dark"
          toastStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
