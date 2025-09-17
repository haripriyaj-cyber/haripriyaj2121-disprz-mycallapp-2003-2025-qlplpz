import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AppointmentList from './Components/AppointmentList';
import AppointmentForm from './Components/AppointmentForm';
import UpdateAppointment from './Components/UpdateAppointment';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Appointment Manager</h1>
          <nav>
            <Link to="/" className="nav-link">View Appointments</Link>
            <Link to="/create" className="nav-link">Create Appointment</Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<AppointmentList />} />
            <Route path="/create" element={<AppointmentForm />} />
            <Route path="/update-appointment/:id" element={<UpdateAppointment />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
