// src/__tests__/components/MobileHeader.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MobileHeader from '../../components/MobileHeader';

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('MobileHeader Component', () => {
  const setup = (props = {}) => {
    const defaultProps = {
      title: 'Test Title',
      onNavigatePrevious: jest.fn(),
      onNavigateNext: jest.fn(),
      navigationType: 'day'
    };

    return {
      ...render(
        <MemoryRouter>
          <MobileHeader {...defaultProps} {...props} />
        </MemoryRouter>
      ),
      mockProps: { ...defaultProps, ...props }
    };
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('renders the title correctly', () => {
    setup({ title: 'My Calendar' });
    expect(screen.getByText('My Calendar')).toBeInTheDocument();
  });

  test('calls onNavigatePrevious when previous button is clicked', () => {
    const onNavigatePrevious = jest.fn();
    setup({ onNavigatePrevious });
    
    // Find and click the previous button
    const prevButton = screen.getByLabelText('Previous');
    fireEvent.click(prevButton);
    
    expect(onNavigatePrevious).toHaveBeenCalledTimes(1);
  });

  test('calls onNavigateNext when next button is clicked', () => {
    const onNavigateNext = jest.fn();
    setup({ onNavigateNext });
    
    // Find and click the next button
    const nextButton = screen.getByLabelText('Next');
    fireEvent.click(nextButton);
    
    expect(onNavigateNext).toHaveBeenCalledTimes(1);
  });

  test('navigates to create appointment page when add button is clicked', () => {
    setup();
    
    // Find and click the add button
    const addButton = screen.getByLabelText('Add new appointment');
    fireEvent.click(addButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/create');
  });

  test('applies correct navigation type class', () => {
    // Test with day navigation type
    const { container, unmount } = setup({ navigationType: 'day' });
    expect(container.querySelector('.mobile-day-navigation')).toBeInTheDocument();
    unmount();
    
    // Test with week navigation type
    const { container: weekContainer } = setup({ navigationType: 'week' });
    expect(weekContainer.querySelector('.mobile-week-navigation')).toBeInTheDocument();
    
    // Test with month navigation type
    const { container: monthContainer, unmount: unmountMonth } = setup({ navigationType: 'month' });
    expect(monthContainer.querySelector('.mobile-month-navigation')).toBeInTheDocument();
    unmountMonth();
    
    // Test with default navigation type (should fall back to day)
    const { container: defaultContainer } = setup({ navigationType: undefined });
    expect(defaultContainer.querySelector('.mobile-day-navigation')).toBeInTheDocument();
  });

  test('renders with correct button accessibility attributes', () => {
    setup();
    
    // Check that buttons have proper aria-labels
    expect(screen.getByLabelText('Previous')).toBeInTheDocument();
    expect(screen.getByLabelText('Next')).toBeInTheDocument();
    expect(screen.getByLabelText('Add new appointment')).toBeInTheDocument();
  });

  test('renders FontAwesome icons correctly', () => {
    const { container } = setup();
    
    // Check that FontAwesome icons are rendered
    expect(container.querySelector('.fa-chevron-left')).toBeInTheDocument();
    expect(container.querySelector('.fa-chevron-right')).toBeInTheDocument();
    expect(container.querySelector('.fa-plus')).toBeInTheDocument();
  });

  test('has correct mobile styling classes', () => {
    const { container } = setup();
    
    // Check for mobile-specific classes
    expect(container.firstChild).toHaveClass('mobile-header');
    expect(container.querySelector('.mobile-title')).toBeInTheDocument();
    expect(container.querySelector('.mobile-controls')).toBeInTheDocument();
    expect(container.querySelector('.mobile-nav-btn')).toBeInTheDocument();
    expect(container.querySelector('.mobile-add-btn')).toBeInTheDocument();
  });
});
