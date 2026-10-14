import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import AdminLogin from './pages/Admin/AdminLogin.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
import OrganizerDashboard from './pages/Organizer/OrganizerDashboard.jsx';
import CreateEvent from './pages/Organizer/CreateEvent.jsx';
import EditEvent from './pages/Organizer/EditEvent.jsx';
import MyBookings from './pages/User/MyBookings.jsx';
import EventDetails from './pages/EventDetailss.jsx';
import Profile from './pages/Profile';
import ContactSupport from './pages/ContactSupport';
import TicketScanner from './pages/Scanner';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check them. If not specified, just allow the logged-in user.
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  // Setup axios interceptor to automatically add token to all requests
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('✅ Token added to request:', config.url);
        } else {
          console.warn('⚠️ No token found in localStorage for request:', config.url);
        }
        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Setup response interceptor to handle 401 errors
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.warn('🔐 Unauthorized response received, clearing token');
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('userId');
          // Optionally redirect to login 
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors on unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* PUBLIC ROUTES (Visible to everyone)*/}
          {/* Change root path to show Home instead of redirecting to Login */}
          <Route path="/" element={<Home />} /> 
          <Route path="/home" element={<Navigate to="/" replace />} /> 
          
          {/* Event Details should be public so users can see what they are buying */}
          <Route path="/event/:id" element={<EventDetails />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contact-support" element={<ContactSupport />} />
          <Route path="/scanner" element={<TicketScanner />} />

          {/* PROTECTED USER ROUTES (Login Required) */}
          <Route 
            path="/my-bookings" 
            element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'organizer']}>
                <MyBookings />
              </ProtectedRoute>
            } 
          />

          {/* PROTECTED ORGANIZER ROUTES */}
          <Route 
            path="/organizer-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <OrganizerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/edit-event/:id" 
            element={
              <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                <EditEvent />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-event" 
            element={
              <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                <CreateEvent />
              </ProtectedRoute>
            } 
          />

          {/* PROTECTED ADMIN ROUTES */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<h1 className="text-center mt-10 text-2xl">404 - Page Not Found</h1>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;