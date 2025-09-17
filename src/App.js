import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppointmentList from './components/AppointmentList';
import AppointmentForm from './components/AppointmentForm';
import UpdateAppointment from './components/UpdateAppointment';
import CalendarView from './components/CalendarView';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <main className="App-main">
          <Routes>
            <Route path="/" element={<CalendarView />} />
            <Route path="/list" element={<AppointmentList />} />
            <Route path="/create" element={<AppointmentForm />} />
            <Route path="/update-appointment/:id" element={<UpdateAppointment />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
