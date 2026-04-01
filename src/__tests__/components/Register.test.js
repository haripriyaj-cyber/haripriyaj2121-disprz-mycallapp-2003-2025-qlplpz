// src/__tests__/components/Register.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from '../../components/Register';

// Mock useAuth
const mockRegister = jest.fn();
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    register: mockRegister,
  }),
}));

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Register Component', () => {
  beforeEach(() => {
    mockRegister.mockClear();
    mockNavigate.mockClear();
  });

  test('renders registration form', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    
    // Check for specific form fields by their label text
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('validates form inputs', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    
    // Submit without filling in fields
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Use getAllByText since there are multiple elements with this text
    await waitFor(() => {
      const passwordRequirements = screen.getAllByText(/password must be at least 6 characters/i);
      expect(passwordRequirements.length).toBeGreaterThan(0);
    });
  });

  test('submits form with valid data', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    
    // Fill in form fields with the actual field names from the component
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test User' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Check if register function was called with correct data
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User'
      });
    });
    
    // Check if navigation occurred after successful registration
    // Update to match the actual navigation path (/ instead of /login)
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('shows error when registration fails', async () => {
    // Mock register to reject with an error
    mockRegister.mockRejectedValueOnce(new Error('Registration failed'));
    
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    
    // Fill in form fields
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test User' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
    });
    
    // Verify navigation did not occur
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
