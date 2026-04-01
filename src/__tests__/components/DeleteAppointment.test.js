import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DeleteAppointment from '../../components/DeleteAppointment';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';

describe('DeleteAppointment Component', () => {
  const mockOnAppointmentDeleted = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset fetch mock before each test
    global.fetch = jest.fn();
  });

  test('renders delete button', () => {
    render(
      <DeleteAppointment 
        appointmentId={1} 
        onAppointmentDeleted={mockOnAppointmentDeleted}
      />
    );
    
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  test('renders icon button when useIcon is true', () => {
    render(
      <DeleteAppointment 
        appointmentId={1} 
        onAppointmentDeleted={mockOnAppointmentDeleted}
        useIcon={true}
        icon={faTrashAlt}
      />
    );
    
    // Check if the button with the trash icon class exists
    const iconButton = screen.getByRole('button', { name: /delete appointment/i });
    expect(iconButton).toBeInTheDocument();
    expect(iconButton).toHaveClass('delete-icon-btn');
  });

  test('shows confirmation dialog when delete is clicked', () => {
    render(
      <DeleteAppointment 
        appointmentId={1} 
        onAppointmentDeleted={mockOnAppointmentDeleted}
      />
    );
    
    // Click the delete button
    fireEvent.click(screen.getByText('Delete'));
    
    // Check if confirmation dialog appears
    expect(screen.getByText('Are you sure you want to delete this appointment?')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Yes, Delete')).toBeInTheDocument();
  });

  test('cancels deletion when cancel is clicked', () => {
    render(
      <DeleteAppointment 
        appointmentId={1} 
        onAppointmentDeleted={mockOnAppointmentDeleted}
      />
    );
    
    // Click the delete button to show confirmation
    fireEvent.click(screen.getByText('Delete'));
    
    // Click cancel
    fireEvent.click(screen.getByText('Cancel'));
    
    // Check if we're back to the delete button
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.queryByText('Are you sure you want to delete this appointment?')).not.toBeInTheDocument();
  });

  test('deletes appointment when confirmed', async () => {
    // Mock successful deletion
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({})
    });
    
    render(
      <DeleteAppointment 
        appointmentId={1} 
        onAppointmentDeleted={mockOnAppointmentDeleted}
      />
    );
    
    // Click the delete button to show confirmation
    fireEvent.click(screen.getByText('Delete'));
    
    // Click confirm delete
    fireEvent.click(screen.getByText('Yes, Delete'));
    
    // Wait for the deletion to complete
    await waitFor(() => {
      // Check if fetch was called with the correct URL and method
      expect(global.fetch).toHaveBeenCalledWith('/api/appointments/1', {
        method: 'DELETE'
      });
      
      // Check if the callback was called with the appointment ID
      expect(mockOnAppointmentDeleted).toHaveBeenCalledWith(1);
    });
  });

  test('shows error when deletion fails', async () => {
    // Mock failed deletion
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: 'Failed to delete' })
    });
    
    render(
      <DeleteAppointment 
        appointmentId={1} 
        onAppointmentDeleted={mockOnAppointmentDeleted}
      />
    );
    
    // Click the delete button to show confirmation
    fireEvent.click(screen.getByText('Delete'));
    
    // Click confirm delete
    fireEvent.click(screen.getByText('Yes, Delete'));
    
    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
    
    // Check that the callback was not called
    expect(mockOnAppointmentDeleted).not.toHaveBeenCalled();
  });
});