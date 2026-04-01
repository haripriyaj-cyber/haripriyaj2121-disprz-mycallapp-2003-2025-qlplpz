import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TimeSlotGrid from '../../components/TimeSlotGrid';
import { DarkModeProvider } from '../../contexts/DarkModeContext';

// Mock AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    logout: jest.fn(),
    currentUser: { id: 1, name: 'Test User' }
  })
}));

// Mock appointments data
const mockAppointments = [
  {
    id: 1,
    title: 'Team Meeting',
    startTime: '2023-12-25T10:00:00Z',
    endTime: '2023-12-25T11:00:00Z',
    description: 'Weekly team sync',
    location: 'Conference Room A',
    isAllDay: false,
    userId: 1
  },
  {
    id: 2,
    title: 'Lunch Break',
    startTime: '2023-12-25T12:00:00Z',
    endTime: '2023-12-25T13:00:00Z',
    description: '',
    location: 'Cafeteria',
    isAllDay: false,
    userId: 1
  }
];

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('TimeSlotGrid Component', () => {
  const defaultProps = {
    selectedDate: new Date('2023-12-25T00:00:00Z'),
    appointments: mockAppointments,
    selectedAppointmentId: null,
    onAppointmentSelect: jest.fn(),
    viewMode: 'day',
    onViewModeChange: jest.fn(),
    navigateDay: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Element.prototype.scrollTo = jest.fn();
  });

  test('renders time slots for a day', () => {
    render(
      <BrowserRouter>
        <DarkModeProvider>
          <TimeSlotGrid {...defaultProps} />
        </DarkModeProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('12:00 AM')).toBeInTheDocument();
    expect(screen.getByText('6:00 AM')).toBeInTheDocument();
    expect(screen.getByText('12:00 PM')).toBeInTheDocument();
    expect(screen.getByText('6:00 PM')).toBeInTheDocument();
  });

  test('renders appointments in the correct time slots', () => {
    render(
      <BrowserRouter>
        <DarkModeProvider>
          <TimeSlotGrid {...defaultProps} />
        </DarkModeProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    expect(screen.getByText('Lunch Break')).toBeInTheDocument();
  });

  test('shows appointment details when an appointment is clicked', async () => {
    render(
      <BrowserRouter>
        <DarkModeProvider>
          <TimeSlotGrid {...defaultProps} />
        </DarkModeProvider>
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Team Meeting'));

    await waitFor(() => {
      expect(screen.getByText('Weekly team sync')).toBeInTheDocument();
      expect(screen.getByText(/Conference Room A/)).toBeInTheDocument();
    });

    expect(defaultProps.onAppointmentSelect).toHaveBeenCalledWith(1);
  });

  test('does not allow creating appointments in past time slots', () => {
    jest.spyOn(global.Date, 'now').mockImplementation(() =>
      new Date('2023-12-25T12:30:00Z').valueOf()
    );

    render(
      <BrowserRouter>
        <DarkModeProvider>
          <TimeSlotGrid {...defaultProps} />
        </DarkModeProvider>
      </BrowserRouter>
    );

    const pastSlot = Array.from(document.querySelectorAll('.time-slot-content'))
      .find(slot => slot.classList.contains('past'));

    expect(pastSlot).toBeDefined();
    fireEvent.click(pastSlot);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('closes appointment details when close button is clicked', async () => {
    render(
      <BrowserRouter>
        <DarkModeProvider>
          <TimeSlotGrid {...defaultProps} />
        </DarkModeProvider>
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Team Meeting'));

    await waitFor(() => {
      expect(screen.getByText('Weekly team sync')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /×/i }));

    await waitFor(() => {
      expect(screen.queryByText('Weekly team sync')).not.toBeInTheDocument();
    });
  });

  test('handles appointment selection from props', () => {
    render(
      <BrowserRouter>
        <DarkModeProvider>
          <TimeSlotGrid {...defaultProps} selectedAppointmentId={1} />
        </DarkModeProvider>
      </BrowserRouter>
    );

    const teamMeeting = screen.getAllByText('Team Meeting')
      .find(el => el.closest('.time-slot-appointment'));
    const wrapper = teamMeeting.closest('.time-slot-appointment');

    expect(wrapper).toBeTruthy();
  });

  test('scrolls to the selected appointment', () => {
    render(
      <BrowserRouter>
        <DarkModeProvider>
          <TimeSlotGrid {...defaultProps} selectedAppointmentId={1} />
        </DarkModeProvider>
      </BrowserRouter>
    );

    expect(Element.prototype.scrollTo).toHaveBeenCalled();
  });

  test('handles custom event for highlighting time slot', async () => {
    render(
      <BrowserRouter>
        <DarkModeProvider>
          <TimeSlotGrid {...defaultProps} appointments={mockAppointments} />
        </DarkModeProvider>
      </BrowserRouter>
    );

    document.dispatchEvent(new CustomEvent('highlightTimeSlot', {
      detail: { appointmentId: 1 }
    }));

    await waitFor(() => {
      expect(Element.prototype.scrollTo).toHaveBeenCalled();
    });
  });
});
