// src/__tests__/components/ProtectedRoute.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';

// Mock the AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('ProtectedRoute Component', () => {
  // Helper function to render the component with different auth states
  const renderProtectedRoute = (isAuthenticated) => {
    // Mock the useAuth hook
    useAuth.mockReturnValue({ isAuthenticated });

    return render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route 
            path="/protected" 
            element={
              <ProtectedRoute>
                <div data-testid="protected-content">Protected Content</div>
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders children when user is authenticated', () => {
    renderProtectedRoute(true);
    
    // Should render the protected content
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    
    // Should not redirect to login
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });

  test('redirects to login page when user is not authenticated', () => {
    renderProtectedRoute(false);
    
    // Should not render the protected content
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    
    // Should redirect to login
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  test('checks authentication status from context', () => {
    renderProtectedRoute(true);
    
    // Verify that useAuth was called
    expect(useAuth).toHaveBeenCalled();
  });

  test('handles null or undefined authentication state', () => {
    // Test with undefined
    useAuth.mockReturnValue({ isAuthenticated: undefined });
    
    const { rerender } = render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route 
            path="/protected" 
            element={
              <ProtectedRoute>
                <div data-testid="protected-content">Protected Content</div>
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
    
    // Should redirect to login since undefined is falsy
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    
    // Test with null
    useAuth.mockReturnValue({ isAuthenticated: null });
    
    rerender(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route 
            path="/protected" 
            element={
              <ProtectedRoute>
                <div data-testid="protected-content">Protected Content</div>
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
    
    // Should redirect to login since null is falsy
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });
});
