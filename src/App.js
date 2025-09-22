import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppointmentList from './components/AppointmentList';
import AppointmentForm from './components/AppointmentForm';
import UpdateAppointment from './components/UpdateAppointment';
import CalendarView from './components/CalendarView';
import Login from './components/Login';
import Register from './components/Register';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <DarkModeProvider>
        <Router>
          <div className="App">
            <Navigation />
            <main className="App-main">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes */}
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <CalendarView />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/list" 
                  element={
                    <ProtectedRoute>
                      <AppointmentList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/create" 
                  element={
                    <ProtectedRoute>
                      <AppointmentForm />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/update-appointment/:id" 
                  element={
                    <ProtectedRoute>
                      <UpdateAppointment />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Redirect any unknown routes to home or login */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </Router>
      </DarkModeProvider>
    </AuthProvider>
  );
}

export default App;
