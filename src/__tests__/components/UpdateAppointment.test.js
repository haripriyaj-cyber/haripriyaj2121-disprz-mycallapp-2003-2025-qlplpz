import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UpdateAppointment from '../../components/UpdateAppointment';
import { AuthProvider } from '../../contexts/AuthContext';
import { DarkModeProvider } from '../../contexts/DarkModeContext';

// Mock appointment data
const mockAppointment = {
  id: 1,
  title: 'Existing Appointment',
  startTime: '2023-12-25T10:00:00Z',
  endTime: '2023-12-25T11:00:00Z',
  description: 'Test description',
  location: 'Test location',
  isAllDay: false,
  userId: 1
};

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: '1' })
}));

describe('UpdateAppointment Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock fetch for initial appointment data
    global.fetch = jest.fn((url) => {
      if (url === '/api/appointments/1') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAppointment)
        });
      } else if (url === '/api/appointments' || url.includes('/api/appointments/user/')) {
        // Mock for checking time slot availability
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])  // Return empty array for no conflicts
        });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  test('loads and displays appointment data', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <DarkModeProvider>
              <UpdateAppointment />
            </DarkModeProvider>
          </AuthProvider>
        </BrowserRouter>
      );
    });

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/Loading appointment details/i)).not.toBeInTheDocument();
    });

    // Check if form is populated with appointment data
    await waitFor(() => {
      const titleInput = screen.getByLabelText(/Title/i);
      expect(titleInput.value).toBe('Existing Appointment');
    });
    
    // Use getByRole to specifically target the heading
    expect(screen.getByRole('heading', { name: /Update Appointment/i })).toBeInTheDocument();
  });

  test('updates appointment when form is submitted', async () => {
    // Mock successful update
    global.fetch = jest.fn((url) => {
      if (url === '/api/appointments/1' && global.fetch.mock.calls.length === 1) {
        // First call - get appointment
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAppointment)
        });
      } else if (url.includes('/api/appointments/user/') || url === '/api/appointments') {
        // Call to check availability
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])  // No conflicts
        });
      } else if (url === '/api/appointments/1' && global.fetch.mock.calls.length > 1) {
        // Second call - update appointment
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ...mockAppointment, title: 'Updated Appointment' })
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    await act(async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <DarkModeProvider>
              <UpdateAppointment />
            </DarkModeProvider>
          </AuthProvider>
        </BrowserRouter>
      );
    });

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/Loading appointment details/i)).not.toBeInTheDocument();
    });

    // Update form fields
    await act(async () => {
      const titleInput = screen.getByLabelText(/Title/i);
      fireEvent.change(titleInput, { target: { value: 'Updated Appointment' } });
    });

    // Submit the form
    await act(async () => {
      const submitButton = screen.getByRole('button', { name: /Update Appointment/i });
      fireEvent.click(submitButton);
    });

    // Check if update request was made with PUT method
    await waitFor(() => {
      const updateCall = global.fetch.mock.calls.find(
        call => call[0] === '/api/appointments/1' && call[1]?.method === 'PUT'
      );
      expect(updateCall).toBeTruthy();
    });

    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/Appointment updated successfully/i)).toBeInTheDocument();
    });
  });

  test('shows error when update fails', async () => {
    // Mock failed update
    global.fetch = jest.fn((url) => {
      if (url === '/api/appointments/1' && global.fetch.mock.calls.length === 1) {
        // First call - get appointment
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAppointment)
        });
      } else if (url.includes('/api/appointments/user/') || url === '/api/appointments') {
        // Call to check availability
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])  // No conflicts
        });
      } else if (url === '/api/appointments/1' && global.fetch.mock.calls.length > 1) {
        // Second call - update appointment (fails)
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ detail: 'Update failed' })
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    await act(async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <DarkModeProvider>
              <UpdateAppointment />
            </DarkModeProvider>
          </AuthProvider>
        </BrowserRouter>
      );
    });

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/Loading appointment details/i)).not.toBeInTheDocument();
    });

    // Submit the form without changes
    await act(async () => {
      const submitButton = screen.getByRole('button', { name: /Update Appointment/i });
      fireEvent.click(submitButton);
    });

    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Error: Update failed/i)).toBeInTheDocument();
    });
  });
});