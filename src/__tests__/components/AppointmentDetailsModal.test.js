import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppointmentDetailsModal from '../../components/AppointmentDetailsModal';
import DeleteAppointment from '../../components/DeleteAppointment';

// Mock DeleteAppointment component to simplify testing
jest.mock('../../components/DeleteAppointment', () => {
  return ({ onAppointmentDeleted }) => (
    <button onClick={() => onAppointmentDeleted(1)}>Delete</button>
  );
});

describe('AppointmentDetailsModal Component', () => {
  const onClose = jest.fn();
  const onAppointmentDeleted = jest.fn();

  const futureAppointment = {
    id: 1,
    title: 'Future Meeting',
    startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour ahead
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours ahead
    location: 'Conference Room',
    description: 'Discuss project'
  };

  const pastAppointment = {
    id: 2,
    title: 'Past Meeting',
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    endTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    location: 'Old Room',
    description: 'Already happened'
  };

  test('renders modal with appointment details', () => {
    render(
      <MemoryRouter>
        <AppointmentDetailsModal 
          appointment={futureAppointment} 
          onClose={onClose} 
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Future Meeting')).toBeInTheDocument();
    expect(screen.getByText('Conference Room')).toBeInTheDocument();
    expect(screen.getByText('Discuss project')).toBeInTheDocument();
  });

  test('renders disabled edit and delete for past appointments', () => {
    render(
      <MemoryRouter>
        <AppointmentDetailsModal 
          appointment={pastAppointment} 
          onClose={onClose} 
        />
      </MemoryRouter>
    );

    const editButton = screen.getByText('Edit');
    const deleteButton = document.querySelector('.delete-icon-btn.disabled');

    expect(editButton).toHaveClass('disabled');
    expect(deleteButton).toBeDisabled();
  });

  test('calls onClose when close button is clicked', () => {
    render(
      <MemoryRouter>
        <AppointmentDetailsModal 
          appointment={futureAppointment} 
          onClose={onClose} 
        />
      </MemoryRouter>
    );

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('calls onAppointmentDeleted and onClose after deletion', () => {
    render(
      <MemoryRouter>
        <AppointmentDetailsModal 
          appointment={futureAppointment} 
          onClose={onClose} 
          onAppointmentDeleted={onAppointmentDeleted}
        />
      </MemoryRouter>
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(onAppointmentDeleted).toHaveBeenCalledWith(1);
    expect(onClose).toHaveBeenCalled();
  });

  test('renders correctly in mobile mode', () => {
    render(
      <MemoryRouter>
        <AppointmentDetailsModal 
          appointment={futureAppointment} 
          onClose={onClose} 
          isMobile={true}
        />
      </MemoryRouter>
    );

    const modal = screen.getByText('Future Meeting').closest('.appointment-details-modal');
    expect(modal).toHaveClass('mobile');
  });

  test('returns null if no appointment provided', () => {
    const { container } = render(
      <MemoryRouter>
        <AppointmentDetailsModal 
          appointment={null} 
          onClose={onClose} 
        />
      </MemoryRouter>
    );

    expect(container.firstChild).toBeNull();
  });
});
