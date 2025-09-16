import React from 'react';
import './App.css';
import AppointmentForm from './Components/AppointmentForm';
import AppointmentList from './Components/AppointmentList';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Appointment Calendar</h1>
      </header>
      <main>
        <AppointmentForm />
        <AppointmentList />
      </main>
    </div>
  );
}

export default App;
