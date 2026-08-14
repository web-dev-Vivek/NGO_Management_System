import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { UserProvider } from './context/UserContext';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/profile/Profile';
import CampaignExplorer from './pages/campaigns/CampaignExplorer';
import TasksPage from './pages/tasks/TasksPage';
import CertificatesPage from './pages/certificates/CertificatesPage';
import UserDirectory from './pages/users/UserDirectory';
import VerifyCertificate from './pages/certificates/VerifyCertificate';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/verify" element={<VerifyCertificate />} />
        <Route path="/verify/:id" element={<VerifyCertificate />} />
        
        <Route path="/login" element={
          <>
            <SignedOut>
              <Login />
            </SignedOut>
            <SignedIn>
              <Navigate to="/dashboard" replace />
            </SignedIn>
          </>
        } />
        
        <Route path="/register" element={
          <>
            <SignedOut>
              <Register />
            </SignedOut>
            <SignedIn>
              <Navigate to="/dashboard" replace />
            </SignedIn>
          </>
        } />

        {/* Protected Application Routes */}
        <Route path="/*" element={
          <>
            <SignedIn>
              <UserProvider>
                <DashboardLayout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/campaigns" element={<CampaignExplorer />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/certificates" element={<CertificatesPage />} />
                    <Route path="/users" element={<UserDirectory />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </UserProvider>
            </SignedIn>
            <SignedOut>
              <Navigate to="/login" replace />
            </SignedOut>
          </>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
