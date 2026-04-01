import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DarkModeProvider, useDarkMode } from '../../contexts/DarkModeContext';

// Test component that uses the dark mode context
function TestComponent() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <div>
      <div data-testid="mode-status">{darkMode ? 'Dark Mode' : 'Light Mode'}</div>
      <button data-testid="toggle-btn" onClick={toggleDarkMode}>
        Toggle Mode
      </button>
    </div>
  );
}

describe('DarkModeContext', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: jest.fn(key => store[key] || null),
      setItem: jest.fn((key, value) => {
        store[key] = value.toString();
      }),
      clear: jest.fn(() => {
        store = {};
      }),
    };
  })();

  // Mock document.body.classList
  const classListMock = {
    add: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    // Setup mocks
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    Object.defineProperty(document.body, 'classList', { value: classListMock });
    
    // Clear mocks before each test
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  test('provides initial dark mode state from localStorage (dark mode enabled)', () => {
    // Set localStorage to indicate dark mode is enabled
    localStorageMock.getItem.mockReturnValueOnce('true');

    render(
      <DarkModeProvider>
        <TestComponent />
      </DarkModeProvider>
    );

    // Check that the component shows dark mode is enabled
    expect(screen.getByTestId('mode-status')).toHaveTextContent('Dark Mode');
    
    // Verify localStorage was checked
    expect(localStorageMock.getItem).toHaveBeenCalledWith('darkMode');
    
    // Verify body class was updated
    expect(classListMock.add).toHaveBeenCalledWith('dark-mode');
  });

  test('provides initial dark mode state from localStorage (dark mode disabled)', () => {
    // Set localStorage to indicate dark mode is disabled
    localStorageMock.getItem.mockReturnValueOnce('false');

    render(
      <DarkModeProvider>
        <TestComponent />
      </DarkModeProvider>
    );

    // Check that the component shows light mode is enabled
    expect(screen.getByTestId('mode-status')).toHaveTextContent('Light Mode');
    
    // Verify localStorage was checked
    expect(localStorageMock.getItem).toHaveBeenCalledWith('darkMode');
    
    // Verify body class was not updated
    expect(classListMock.add).not.toHaveBeenCalled();
  });

  test('toggles dark mode when toggle function is called', () => {
    // Start with light mode
    localStorageMock.getItem.mockReturnValueOnce('false');

    render(
      <DarkModeProvider>
        <TestComponent />
      </DarkModeProvider>
    );

    // Initially in light mode
    expect(screen.getByTestId('mode-status')).toHaveTextContent('Light Mode');

    // Toggle to dark mode
    fireEvent.click(screen.getByTestId('toggle-btn'));

    // Now should be in dark mode
    expect(screen.getByTestId('mode-status')).toHaveTextContent('Dark Mode');
    
    // Verify localStorage was updated - using boolean value
    expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', true);
    
    // Verify body class was updated
    expect(classListMock.add).toHaveBeenCalledWith('dark-mode');

    // Toggle back to light mode
    fireEvent.click(screen.getByTestId('toggle-btn'));

    // Now should be in light mode again
    expect(screen.getByTestId('mode-status')).toHaveTextContent('Light Mode');
    
    // Verify localStorage was updated - using boolean value
    expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', false);
    
    // Verify body class was removed
    expect(classListMock.remove).toHaveBeenCalledWith('dark-mode');
  });

  test('updates localStorage and body class when dark mode changes', () => {
    // Start with light mode
    localStorageMock.getItem.mockReturnValueOnce('false');

    render(
      <DarkModeProvider>
        <TestComponent />
      </DarkModeProvider>
    );

    // Toggle to dark mode
    act(() => {
      fireEvent.click(screen.getByTestId('toggle-btn'));
    });

    // Verify localStorage was updated - using boolean value
    expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', true);
    
    // Verify body class was updated
    expect(classListMock.add).toHaveBeenCalledWith('dark-mode');
  });

  test('throws error when useDarkMode is used outside of DarkModeProvider', () => {
    // Suppress console.error for this test
    const originalConsoleError = console.error;
    console.error = jest.fn();

    // Attempt to render a component that uses useDarkMode without a provider
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useDarkMode must be used within a DarkModeProvider');

    // Restore console.error
    console.error = originalConsoleError;
  });

  test('handles default localStorage value when none exists', () => {
    // Ensure localStorage returns null (no stored value)
    localStorageMock.getItem.mockReturnValueOnce(null);

    render(
      <DarkModeProvider>
        <TestComponent />
      </DarkModeProvider>
    );

    // Default should be light mode when no localStorage value exists
    expect(screen.getByTestId('mode-status')).toHaveTextContent('Light Mode');
  });
});
