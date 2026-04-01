import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';

// Test component that uses the auth context
function TestComponent() {
  const { currentUser, login, logout, register, error, isAuthenticated } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>
      <div data-testid="user-info">{currentUser ? JSON.stringify(currentUser) : 'No user'}</div>
      <div data-testid="error-message">{error || ''}</div>

      <button 
        data-testid="login-btn" 
        onClick={async () => {
          try {
            await login('testuser', 'password123');
          } catch (err) {
            // Catch error to prevent test from crashing
          }
        }}
      >
        Login
      </button>
      <button
        data-testid="register-btn"
        onClick={async () => {
          try {
            await register({
              username: 'newuser',
              password: 'newpassword',
              email: 'new@example.com',
            });
          } catch (err) {
            // Catch error to prevent test from crashing
          }
        }}
      >
        Register
      </button>
      <button data-testid="logout-btn" onClick={() => logout()}>Logout</button>
    </div>
  );
}

// Mock fetch responses
const mockFetchSuccess = (data) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data),
    })
  );
};

const mockFetchFailure = (errorMessage) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: false,
      status: 401,
      json: () => Promise.resolve(errorMessage),
    })
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test('provides initial authentication state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
    expect(screen.getByTestId('user-info')).toHaveTextContent('No user');
    expect(screen.getByTestId('error-message')).toHaveTextContent('');
  });

  test('loads user from localStorage on mount', async () => {
    const testUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    localStorage.setItem('user', JSON.stringify(testUser));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-info')).toHaveTextContent(JSON.stringify(testUser));
    });
  });

  test('handles login success', async () => {
    const testUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    mockFetchSuccess(testUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('login-btn'));
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'testuser', password: 'password123' }),
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-info')).toHaveTextContent(JSON.stringify(testUser));
      expect(localStorage.getItem('user')).toBe(JSON.stringify(testUser));
    });
  });

  test('handles login failure', async () => {
    const errorMessage = 'Invalid username or password';
    mockFetchFailure(errorMessage);
    
    // Mock console.error to prevent test output noise
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    let loginError;
    
    // Create a mock function that will be called with the error
    const handleLoginError = jest.fn(error => {
      loginError = error;
    });
    
    // Create a component that will catch the error
    function TestLoginComponent() {
      const { login } = useAuth();
      
      return (
        <button 
          data-testid="login-btn" 
          onClick={async () => {
            try {
              await login('testuser', 'password123');
            } catch (error) {
              handleLoginError(error);
            }
          }}
        >
          Login
        </button>
      );
    }
    
    render(
      <AuthProvider>
        <TestLoginComponent />
      </AuthProvider>
    );
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('login-btn'));
    });
    
    // Verify the login function was called and threw an error
    expect(handleLoginError).toHaveBeenCalled();
    expect(loginError.message).toContain(errorMessage);
    
    // Restore console.error
    console.error = originalConsoleError;
  });

  test('handles register success', async () => {
    const newUser = { id: 2, username: 'newuser', email: 'new@example.com' };
    mockFetchSuccess(newUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('register-btn'));
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'newuser', password: 'newpassword', email: 'new@example.com' }),
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-info')).toHaveTextContent(JSON.stringify(newUser));
      expect(localStorage.getItem('user')).toBe(JSON.stringify(newUser));
    });
  });

  test('handles register failure', async () => {
    const errorMessage = 'Username already exists';
    mockFetchFailure(errorMessage);
    
    // Mock console.error to prevent test output noise
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    let registerError;
    
    // Create a mock function that will be called with the error
    const handleRegisterError = jest.fn(error => {
      registerError = error;
    });
    
    // Create a component that will catch the error
    function TestRegisterComponent() {
      const { register } = useAuth();
      
      return (
        <button 
          data-testid="register-btn" 
          onClick={async () => {
            try {
              await register({
                username: 'newuser',
                password: 'newpassword',
                email: 'new@example.com',
              });
            } catch (error) {
              handleRegisterError(error);
            }
          }}
        >
          Register
        </button>
      );
    }
    
    render(
      <AuthProvider>
        <TestRegisterComponent />
      </AuthProvider>
    );
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('register-btn'));
    });
    
    // Verify the register function was called and threw an error
    expect(handleRegisterError).toHaveBeenCalled();
    expect(registerError.message).toContain(errorMessage);
    
    // Restore console.error
    console.error = originalConsoleError;
  });

  test('handles logout', async () => {
    const testUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    localStorage.setItem('user', JSON.stringify(testUser));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated'));

    fireEvent.click(screen.getByTestId('logout-btn'));

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
    expect(screen.getByTestId('user-info')).toHaveTextContent('No user');
    expect(localStorage.getItem('user')).toBeNull();
  });

  test('handles corrupted localStorage data', async () => {
    localStorage.setItem('user', 'not-valid-json');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
      expect(screen.getByTestId('user-info')).toHaveTextContent('No user');
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  test('throws error when useAuth is used outside of AuthProvider', () => {
    // Mock the useContext hook to return null, simulating no provider
    jest.spyOn(React, 'useContext').mockReturnValueOnce(null);
    
    // Now directly call useAuth, which should throw
    expect(() => useAuth()).toThrow();
    
    // Restore the original implementation
    React.useContext.mockRestore();
  });
});
