import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import AppointmentList from '../../components/AppointmentList';
import { AuthProvider } from '../../contexts/AuthContext';
import { DarkModeProvider } from '../../contexts/DarkModeContext';

// Mock appointments data
const mockAppointments = [
  {
    id: 1,
    title: 'Team Meeting',
    startTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour in future
    endTime: new Date(Date.now() + 7200000).toISOString(),   // 2 hours in future
    description: 'Weekly team sync',
    location: 'Conference Room A',
    isAllDay: false
  },
  {
    id: 2,
    title: 'Doctor Appointment',
    startTime: new Date(Date.now() - 7200000).toISOString(), // 2 hours in past
    endTime: new Date(Date.now() - 3600000).toISOString(),   // 1 hour in past
    description: 'Annual checkup',
    location: 'Medical Center',
    isAllDay: false
  }
];

describe('AppointmentList Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock fetch API properly
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAppointments)
      })
    );
    
    // Mock window.innerWidth for responsive testing
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024 // Default to desktop view
    });
    
    // Mock console.log to reduce noise in test output
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  test('renders loading state initially', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <DarkModeProvider>
            <AppointmentList />
          </DarkModeProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Loading appointments/i)).toBeInTheDocument();
  });

  test('renders appointments after loading', async () => {
    // Use act to handle async state updates
    await act(async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <DarkModeProvider>
              <AppointmentList />
            </DarkModeProvider>
          </AuthProvider>
        </BrowserRouter>
      );
    });

    // Wait for appointments to load
    await waitFor(() => {
      expect(screen.queryByText(/Loading appointments/i)).not.toBeInTheDocument();
    });

    // Check if appointments are rendered
    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    expect(screen.getByText('Doctor Appointment')).toBeInTheDocument();
  });

  test('filters appointments by status', async () => {
    // Use act to handle async state updates
    await act(async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <DarkModeProvider>
              <AppointmentList />
            </DarkModeProvider>
          </AuthProvider>
        </BrowserRouter>
      );
    });

    // Wait for appointments to load
    await waitFor(() => {
      expect(screen.queryByText(/Loading appointments/i)).not.toBeInTheDocument();
    });

    // Click on "Upcoming" filter
    const upcomingButton = screen.getByRole('button', { name: /Upcoming/i });
    await act(async () => {
      userEvent.click(upcomingButton);
    });

    // Should show only upcoming appointment
    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    expect(screen.queryByText('Doctor Appointment')).not.toBeInTheDocument();

    // Click on "Attended" filter
    const attendedButton = screen.getByRole('button', { name: /Attended/i });
    await act(async () => {
      userEvent.click(attendedButton);
    });

    // Should show only past appointment
    expect(screen.queryByText('Team Meeting')).not.toBeInTheDocument();
    expect(screen.getByText('Doctor Appointment')).toBeInTheDocument();
  });

  test('renders mobile view on small screens', async () => {
    // Set window width to mobile size
    window.innerWidth = 500;
    window.dispatchEvent(new Event('resize'));

    // Use act to handle async state updates
    await act(async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <DarkModeProvider>
              <AppointmentList />
            </DarkModeProvider>
          </AuthProvider>
        </BrowserRouter>
      );
    });

    // Wait for appointments to load
    await waitFor(() => {
      expect(screen.queryByText(/Loading appointments/i)).not.toBeInTheDocument();
    });

    // Check if mobile sections are rendered - use more specific selectors
    expect(screen.getByRole('heading', { name: /Recent Appointments/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Upcoming Appointments/i })).toBeInTheDocument();
    
    // Verify the mobile appointment card is rendered
    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    
    // Check for the location element using a class-based selector
    const locationElement = document.querySelector('.mobile-appointment-location');
    expect(locationElement).not.toBeNull();
    expect(locationElement.textContent).toContain('Conference Room A');
  });
});