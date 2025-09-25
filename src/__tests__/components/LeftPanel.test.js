import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LeftPanel from '../../components/LeftPanel';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';

describe('LeftPanel Component', () => {
  const mockNavigateDay = jest.fn();
  const mockHandleDateChange = jest.fn();
  const mockHandleUpcomingClick = jest.fn();
  const mockOnAppointmentSelect = jest.fn();
  const formatDateTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date) => new Date(date).toLocaleDateString();

  const today = new Date();

  const appointments = [
    {
      id: 1,
      title: 'Upcoming Meeting',
      startTime: new Date(today.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour ahead
      endTime: new Date(today.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      description: 'Discuss project',
      location: 'Conference Room',
    },
    {
      id: 2,
      title: 'Recent Meeting',
      startTime: new Date(today.getTime() - 30 * 60 * 1000).toISOString(), // 30 min ago
      endTime: new Date(today.getTime() + 30 * 60 * 1000).toISOString(),
      description: 'Quick sync',
      location: 'Zoom',
    },
    {
      id: 3,
      title: 'Past Meeting',
      startTime: new Date(today.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      endTime: new Date(today.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      description: 'Completed task',
      location: 'Old Room',
    }
  ];

  test('renders LeftPanel with appointments', () => {
    render(
      <LeftPanel 
        appointments={appointments}
        selectedDate={today}
        isLoading={false}
        error={null}
        navigateDay={mockNavigateDay}
        handleDateChange={mockHandleDateChange}
        handleUpcomingClick={mockHandleUpcomingClick}
        formatDateTime={formatDateTime}
        formatDate={formatDate}
        selectedAppointmentId={null}
        onAppointmentSelect={mockOnAppointmentSelect}
        darkMode={false}
      />
    );

    expect(screen.getByText('Appointments')).toBeInTheDocument();
    expect(screen.getByText('Upcoming Meeting')).toBeInTheDocument();
    expect(screen.getByText('Recent Meeting')).toBeInTheDocument();
    expect(screen.queryByText('Past Meeting')).not.toBeInTheDocument(); // filtered out
  });

  test('calls navigateDay when arrows are clicked', () => {
    render(
      <LeftPanel 
        appointments={appointments}
        selectedDate={today}
        isLoading={false}
        error={null}
        navigateDay={mockNavigateDay}
        handleDateChange={mockHandleDateChange}
        handleUpcomingClick={mockHandleUpcomingClick}
        formatDateTime={formatDateTime}
        formatDate={formatDate}
        selectedAppointmentId={null}
        onAppointmentSelect={mockOnAppointmentSelect}
        darkMode={false}
      />
    );

    const arrows = screen.getAllByRole('button');
    // left arrow first button
    fireEvent.click(arrows[0]);
    expect(mockNavigateDay).toHaveBeenCalledWith(-1);
    // right arrow second button
    fireEvent.click(arrows[1]);
    expect(mockNavigateDay).toHaveBeenCalledWith(1);
  });

  test('calls handleUpcomingClick when status button is clicked', () => {
    render(
      <LeftPanel 
        appointments={appointments}
        selectedDate={today}
        isLoading={false}
        error={null}
        navigateDay={mockNavigateDay}
        handleDateChange={mockHandleDateChange}
        handleUpcomingClick={mockHandleUpcomingClick}
        formatDateTime={formatDateTime}
        formatDate={formatDate}
        selectedAppointmentId={null}
        onAppointmentSelect={mockOnAppointmentSelect}
        darkMode={false}
      />
    );

    const statusButtons = screen.getAllByText(/Upcoming|Recent/);
    fireEvent.click(statusButtons[0]);
    expect(mockHandleUpcomingClick).toHaveBeenCalledWith(1, expect.any(Object));
  });

  test('calls onAppointmentSelect and dispatches custom event when appointment card clicked', () => {
    render(
      <LeftPanel 
        appointments={appointments}
        selectedDate={today}
        isLoading={false}
        error={null}
        navigateDay={mockNavigateDay}
        handleDateChange={mockHandleDateChange}
        handleUpcomingClick={mockHandleUpcomingClick}
        formatDateTime={formatDateTime}
        formatDate={formatDate}
        selectedAppointmentId={null}
        onAppointmentSelect={mockOnAppointmentSelect}
        darkMode={false}
      />
    );

    const appointmentCard = screen.getByText('Upcoming Meeting').closest('.appointment-card');

    const customEventListener = jest.fn();
    document.addEventListener('highlightTimeSlot', customEventListener);

    fireEvent.click(appointmentCard);

    expect(mockOnAppointmentSelect).toHaveBeenCalledWith(1);
    expect(customEventListener).toHaveBeenCalled();
    document.removeEventListener('highlightTimeSlot', customEventListener);
  });

  test('renders loading and error states', () => {
    const { rerender } = render(
      <LeftPanel 
        appointments={appointments}
        selectedDate={today}
        isLoading={true}
        error={null}
        navigateDay={mockNavigateDay}
        handleDateChange={mockHandleDateChange}
        handleUpcomingClick={mockHandleUpcomingClick}
        formatDateTime={formatDateTime}
        formatDate={formatDate}
        selectedAppointmentId={null}
        onAppointmentSelect={mockOnAppointmentSelect}
        darkMode={false}
      />
    );

    expect(screen.getByText('Loading appointments...')).toBeInTheDocument();

    rerender(
      <LeftPanel 
        appointments={appointments}
        selectedDate={today}
        isLoading={false}
        error={'Network error'}
        navigateDay={mockNavigateDay}
        handleDateChange={mockHandleDateChange}
        handleUpcomingClick={mockHandleUpcomingClick}
        formatDateTime={formatDateTime}
        formatDate={formatDate}
        selectedAppointmentId={null}
        onAppointmentSelect={mockOnAppointmentSelect}
        darkMode={false}
      />
    );

    expect(screen.getByText('Error: Network error')).toBeInTheDocument();
  });

  test('applies dark mode classes', () => {
    render(
      <LeftPanel 
        appointments={appointments}
        selectedDate={today}
        isLoading={false}
        error={null}
        navigateDay={mockNavigateDay}
        handleDateChange={mockHandleDateChange}
        handleUpcomingClick={mockHandleUpcomingClick}
        formatDateTime={formatDateTime}
        formatDate={formatDate}
        selectedAppointmentId={null}
        onAppointmentSelect={mockOnAppointmentSelect}
        darkMode={true}
      />
    );

    expect(screen.getByText('Appointments').closest('.scheduler-left-panel')).toHaveClass('dark-mode');
  });
});
