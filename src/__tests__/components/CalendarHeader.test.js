// src/__tests__/components/CalendarHeader.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CalendarHeader from '../../components/CalendarHeader';
import { MemoryRouter } from 'react-router-dom';

// Mock DarkModeContext
const mockToggleDarkMode = jest.fn();
jest.mock('../../contexts/DarkModeContext', () => ({
  useDarkMode: () => ({
    darkMode: false,
    toggleDarkMode: mockToggleDarkMode,
  }),
}));

// Mock AuthContext
const mockLogout = jest.fn();
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    logout: mockLogout,
    currentUser: { username: 'testuser', email: 'test@example.com' },
  }),
}));

describe('CalendarHeader Component', () => {
  const defaultProps = {
    title: 'September 21 - 27, 2025',
    viewMode: 'week',
    onViewModeChange: jest.fn(),
    onNavigatePrevious: jest.fn(),
    onNavigateNext: jest.fn(),
    navigationType: 'week',
  };

  test('renders header title', () => {
    render(
      <MemoryRouter>
        <CalendarHeader {...defaultProps} />
      </MemoryRouter>
    );
    expect(screen.getByText(/September 21 - 27, 2025/i)).toBeInTheDocument();
  });

  test('toggles dark mode when button clicked', () => {
    render(
      <MemoryRouter>
        <CalendarHeader {...defaultProps} />
      </MemoryRouter>
    );
    const button = screen.getByRole('button', { name: /switch to dark mode/i });
    fireEvent.click(button);
    expect(mockToggleDarkMode).toHaveBeenCalled();
  });

  test('calls navigation callbacks', () => {
    render(
      <MemoryRouter>
        <CalendarHeader {...defaultProps} />
      </MemoryRouter>
    );
    const prevBtn = screen.getAllByRole('button')[1]; // first button is dark mode toggle
    const nextBtn = screen.getAllByRole('button')[2];

    fireEvent.click(prevBtn);
    fireEvent.click(nextBtn);

    expect(defaultProps.onNavigatePrevious).toHaveBeenCalled();
    expect(defaultProps.onNavigateNext).toHaveBeenCalled();
  });

  test('displays user dropdown and logout', () => {
    render(
      <MemoryRouter>
        <CalendarHeader {...defaultProps} />
      </MemoryRouter>
    );

    const profileBtn = screen.getByRole('button', { name: /user profile/i });
    fireEvent.click(profileBtn);

    expect(screen.getByText(/testuser/i)).toBeInTheDocument();

    const logoutBtn = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutBtn);

    expect(mockLogout).toHaveBeenCalled();
  });
});
