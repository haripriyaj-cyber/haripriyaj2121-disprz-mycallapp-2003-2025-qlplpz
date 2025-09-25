// src/__tests__/components/Login.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../components/Login';

// Mock useAuth context
const mockLogin = jest.fn();
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin
  })
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form with inputs and button', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account/i)).toBeInTheDocument();
  });

  test('updates input fields correctly', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'mypassword' } });

    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('mypassword');
  });

  test('calls login and navigates on successful submit', async () => {
    mockLogin.mockResolvedValueOnce();

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'user1' }
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'pass1' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user1', 'pass1');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('displays error when login fails', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'wrong' }
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'wrong' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    expect(await screen.findByText(/Invalid credentials/i)).toBeInTheDocument();
  });

  test('disables button and shows loading state while submitting', async () => {
    let resolveLogin;
    mockLogin.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve;
        })
    );

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'user2' }
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'pass2' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    expect(screen.getByRole('button', { name: /Logging in.../i })).toBeDisabled();

    resolveLogin();

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });
});
