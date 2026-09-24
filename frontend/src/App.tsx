import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { OwnerInboxPage } from './pages/OwnerInboxPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { HomePage } from './pages/HomePage';
import { PublicPetScan } from './pages/PublicPetScan';
import { PublicPetChat } from './pages/PublicPetChat';
import { ConfigProvider, theme } from 'antd';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#16a34a',
          colorBgContainer: '#0f172a',
          borderRadius: 10,
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* Unauthenticated Public QR Scan Page */}
              <Route path="/pet/:token" element={<PublicPetScan />} />
              {/* Unauthenticated Two-Way Public Finder Chat Page */}
              <Route path="/pet/:token/chat/:conversationId" element={<PublicPetChat />} />
              {/* Protected Owner Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              {/* Protected Owner Dedicated Chat Inbox Page */}
              <Route
                path="/inbox"
                element={
                  <ProtectedRoute>
                    <OwnerInboxPage />
                  </ProtectedRoute>
                }
              />
              {/* Protected Admin View */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ConfigProvider>
  );
};

export default App;
