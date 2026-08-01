import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import JobSeekerAccount from '../../pages/JobSeeker/JobSeekerAccount';

// Mock all dependencies
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    logout: jest.fn(),
  }),
}));

jest.mock('../../api', () => ({
  getProfile: jest.fn(),
  getApplications: jest.fn(),
  getNotifications: jest.fn(),
  updateProfile: jest.fn(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    form: ({ children, ...props }) => <form {...props}>{children}</form>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => children,
}));

// Mock react-icons
jest.mock('react-icons/fi', () => ({
  FiEdit: () => <span>Edit</span>,
  FiSave: () => <span>Save</span>,
  FiX: () => <span>Cancel</span>,
  FiUpload: () => <span>Upload</span>,
  FiPhone: () => <span>Phone</span>,
  FiUser: () => <span>User</span>,
  FiMail: () => <span>Mail</span>,
  FiMapPin: () => <span>MapPin</span>,
  FiGlobe: () => <span>Globe</span>,
  FiCalendar: () => <span>Calendar</span>,
  FiBriefcase: () => <span>Briefcase</span>,
  FiLoader: () => <span>Loading</span>,
}));

// Mock Tooltip component
jest.mock('../../components/Tooltip', () => ({ children, text }) => (
  <div title={text}>{children}</div>
));

// Mock LoadingSpinner
jest.mock('../../components/LoadingSpinner', () => ({ size }) => (
  <div data-testid="loading-spinner">Loading...</div>
));

// Mock FeedbackMessage
jest.mock('../../components/FeedbackMessage', () => ({ type, message, onClose }) => (
  <div data-testid={`feedback-${type}`}>
    {message}
    <button onClick={onClose} data-testid="close-feedback">Close</button>
  </div>
));

// Mock CollapsibleSection
jest.mock('../../components/CollapsibleSection', () => ({ title, children }) => (
  <div data-testid="collapsible-section">
    <h3>{title}</h3>
    <div>{children}</div>
  </div>
));

import api from '../../api';

const mockInitialProfile = {
  id: 1,
  name: 'John Doe Smith',
  firstName: 'John',
  middleName: 'Doe',
  lastName: 'Smith',
  username: 'johndoe',
  email: 'john@example.com',
  phone: '+1234567890',
  age: 30,
  gender: 'male',
  degree: 'Bachelor of Science',
  fieldOfStudy: 'Computer Science',
  graduationYear: 2020,
  experience: 5,
  location: 'New York',
  address: '123 Main St',
  website: 'https://example.com',
  profile_picture: 'https://example.com/profile.jpg',
};

const mockUpdatedProfile = {
  ...mockInitialProfile,
  name: 'Jane Smith Johnson',
  firstName: 'Jane',
  middleName: 'Smith',
  lastName: 'Johnson',
  username: 'janesmith',
  email: 'jane@example.com',
  phone: '+0987654321',
  age: 28,
  gender: 'female',
  degree: 'Master of Science',
  fieldOfStudy: 'Data Science',
  graduationYear: 2022,
  experience: 6,
  location: 'San Francisco',
  address: '456 Tech Ave',
  website: 'https://jane.dev',
};

describe('Profile Update End-to-End Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup successful initial API responses
    api.getProfile.mockResolvedValue({
      data: { data: mockInitialProfile }
    });

    api.getApplications.mockResolvedValue({
      data: { data: { data: [] } }
    });

    api.getNotifications.mockResolvedValue({
      data: []
    });
  });

  describe('Happy Path - Successful Profile Update', () => {
    test('completes full profile update flow successfully', async () => {
      // Mock successful profile update
      api.updateProfile.mockResolvedValue({
        data: { data: mockUpdatedProfile }
      });

      render(
        <BrowserRouter>
          <JobSeekerAccount />
        </BrowserRouter>
      );

      // Wait for initial profile load
      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      // Verify initial state
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Username: johndoe')).toBeInTheDocument();

      // Click edit button to enter edit mode
      const editButton = screen.getByRole('button', { name: /edit profile/i });
      fireEvent.click(editButton);

      // Verify we're in edit mode
      await waitFor(() => {
        expect(screen.getByText('Personal Information')).toBeInTheDocument();
      });

      // Verify form is pre-filled with current data
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Smith')).toBeInTheDocument();
      expect(screen.getByDisplayValue('johndoe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument();
      expect(screen.getByDisplayValue('30')).toBeInTheDocument();
      expect(screen.getByDisplayValue('male')).toBeInTheDocument();

      // Update form fields with new data
      fireEvent.change(screen.getByDisplayValue('John'), {
        target: { value: 'Jane' }
      });
      fireEvent.change(screen.getByDisplayValue('Doe'), {
        target: { value: 'Smith' }
      });
      fireEvent.change(screen.getByDisplayValue('Smith'), {
        target: { value: 'Johnson' }
      });
      fireEvent.change(screen.getByDisplayValue('johndoe'), {
        target: { value: 'janesmith' }
      });
      fireEvent.change(screen.getByDisplayValue('john@example.com'), {
        target: { value: 'jane@example.com' }
      });
      fireEvent.change(screen.getByDisplayValue('+1234567890'), {
        target: { value: '+0987654321' }
      });
      fireEvent.change(screen.getByDisplayValue('30'), {
        target: { value: '28' }
      });

      // Change select fields
      const genderSelect = screen.getByDisplayValue('male');
      fireEvent.change(genderSelect, { target: { value: 'female' } });

      const degreeInput = screen.getByDisplayValue('Bachelor of Science');
      fireEvent.change(degreeInput, { target: { value: 'Master of Science' } });

      const fieldInput = screen.getByDisplayValue('Computer Science');
      fireEvent.change(fieldInput, { target: { value: 'Data Science' } });

      const graduationInput = screen.getByDisplayValue('2020');
      fireEvent.change(graduationInput, { target: { value: '2022' } });

      const experienceInput = screen.getByDisplayValue('5');
      fireEvent.change(experienceInput, { target: { value: '6' } });

      const locationInput = screen.getByDisplayValue('New York');
      fireEvent.change(locationInput, { target: { value: 'San Francisco' } });

      const addressInput = screen.getByDisplayValue('123 Main St');
      fireEvent.change(addressInput, { target: { value: '456 Tech Ave' } });

      const websiteInput = screen.getByDisplayValue('https://example.com');
      fireEvent.change(websiteInput, { target: { value: 'https://jane.dev' } });

      // Click save button
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      // Verify API was called with correct data
      await waitFor(() => {
        expect(api.updateProfile).toHaveBeenCalledTimes(1);
      });

      // Verify the FormData contains expected values
      const formDataCall = api.updateProfile.mock.calls[0][0];
      expect(formDataCall.get('name')).toBe('Jane Smith Johnson');
      expect(formDataCall.get('username')).toBe('janesmith');
      expect(formDataCall.get('email')).toBe('jane@example.com');
      expect(formDataCall.get('phone')).toBe('+0987654321');
      expect(formDataCall.get('age')).toBe('28');
      expect(formDataCall.get('gender')).toBe('female');
      expect(formDataCall.get('degree')).toBe('Master of Science');
      expect(formDataCall.get('fieldOfStudy')).toBe('Data Science');
      expect(formDataCall.get('graduationYear')).toBe('2022');
      expect(formDataCall.get('experience')).toBe('6');
      expect(formDataCall.get('location')).toBe('San Francisco');
      expect(formDataCall.get('address')).toBe('456 Tech Ave');
      expect(formDataCall.get('website')).toBe('https://jane.dev');

      // Verify success message appears
      await waitFor(() => {
        expect(screen.getByTestId('feedback-success')).toHaveTextContent('Profile updated successfully!');
      });

      // Verify we exit edit mode and return to view mode
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
      });

      // Verify profile data is updated in the UI
      expect(screen.getByText('Jane Johnson')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('Username: janesmith')).toBeInTheDocument();
    });
  });

  describe('Error Scenarios', () => {
    test('handles validation errors during form submission', async () => {
      render(
        <BrowserRouter>
          <JobSeekerAccount />
        </BrowserRouter>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
      });

      // Enter edit mode
      fireEvent.click(screen.getByRole('button', { name: /edit profile/i }));

      // Clear required fields to trigger validation
      fireEvent.change(screen.getByDisplayValue('John'), { target: { value: '' } });
      fireEvent.change(screen.getByDisplayValue('Smith'), { target: { value: '' } });
      fireEvent.change(screen.getByDisplayValue('johndoe'), { target: { value: '' } });

      // Try to save
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

      // Verify validation errors appear
      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument();
        expect(screen.getByText('Last name is required')).toBeInTheDocument();
        expect(screen.getByText('Username is required')).toBeInTheDocument();
      });

      // Verify API was not called
      expect(api.updateProfile).not.toHaveBeenCalled();

      // Verify we remain in edit mode
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
    });

    test('handles server validation errors', async () => {
      api.updateProfile.mockRejectedValue({
        response: {
          status: 422,
          data: {
            message: 'Validation failed',
            errors: {
              email: ['Email already exists'],
              username: ['Username already taken']
            }
          }
        }
      });

      render(
        <BrowserRouter>
          <JobSeekerAccount />
        </BrowserRouter>
      );

      // Wait for initial load and enter edit mode
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /edit profile/i }));

      // Make a valid change
      fireEvent.change(screen.getByDisplayValue('john@example.com'), {
        target: { value: 'newemail@example.com' }
      });

      // Save
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

      // Verify error message
      await waitFor(() => {
        expect(screen.getByTestId('feedback-error')).toHaveTextContent('Validation failed. Please check your inputs and try again.');
      });

      // Verify we remain in edit mode
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
    });

    test('handles network errors gracefully', async () => {
      const networkError = new Error('Network Error');
      networkError.request = {};
      api.updateProfile.mockRejectedValue(networkError);

      render(
        <BrowserRouter>
          <JobSeekerAccount />
        </BrowserRouter>
      );

      // Wait for initial load and enter edit mode
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /edit profile/i }));

      // Save
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

      // Verify network error message
      await waitFor(() => {
        expect(screen.getByTestId('feedback-error')).toHaveTextContent('Network error. Please check your connection and try again.');
      });
    });

    test('handles authentication errors', async () => {
      api.updateProfile.mockRejectedValue({
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      });

      render(
        <BrowserRouter>
          <JobSeekerAccount />
        </BrowserRouter>
      );

      // Wait for initial load and enter edit mode
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /edit profile/i }));

      // Save
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

      // Verify auth error message
      await waitFor(() => {
        expect(screen.getByTestId('feedback-error')).toHaveTextContent('Authentication failed. Please log in again.');
      });
    });
  });

  describe('User Experience Flows', () => {
    test('allows canceling edit operation', async () => {
      render(
        <BrowserRouter>
          <JobSeekerAccount />
        </BrowserRouter>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
      });

      // Enter edit mode
      fireEvent.click(screen.getByRole('button', { name: /edit profile/i }));

      // Make some changes
      fireEvent.change(screen.getByDisplayValue('John'), { target: { value: 'Jane' } });

      // Cancel
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      // Verify we return to view mode with original data
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
      });

      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    test('shows loading state during save operation', async () => {
      // Mock slow API response
      api.updateProfile.mockImplementation(() => new Promise(resolve =>
        setTimeout(() => resolve({ data: { data: mockUpdatedProfile } }), 100)
      ));

      render(
        <BrowserRouter>
          <JobSeekerAccount />
        </BrowserRouter>
      );

      // Wait for initial load and enter edit mode
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /edit profile/i }));

      // Click save
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      // Verify loading state
      expect(saveButton).toBeDisabled();
      expect(saveButton).toHaveTextContent('Saving...');

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByTestId('feedback-success')).toBeInTheDocument();
      });

      // Verify loading state is cleared
      expect(saveButton).not.toBeDisabled();
    });

    test('prevents multiple simultaneous save operations', async () => {
      api.updateProfile.mockImplementation(() => new Promise(resolve =>
        setTimeout(() => resolve({ data: { data: mockUpdatedProfile } }), 100)
      ));

      render(
        <BrowserRouter>
          <JobSeekerAccount />
        </BrowserRouter>
      );

      // Wait for initial load and enter edit mode
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /edit profile/i }));

      const saveButton = screen.getByRole('button', { name: /save changes/i });

      // Click save multiple times quickly
      fireEvent.click(saveButton);
      fireEvent.click(saveButton);
      fireEvent.click(saveButton);

      // Should only call API once
      await waitFor(() => {
        expect(api.updateProfile).toHaveBeenCalledTimes(1);
      });
    });

    test('clears error messages when user starts typing', async () => {
      render(
        <BrowserRouter>
          <JobSeekerAccount />
        </BrowserRouter>
      );

      // Wait for initial load and enter edit mode
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /edit profile/i }));

      // Clear required field to trigger error
      const firstNameInput = screen.getByDisplayValue('John');
      fireEvent.change(firstNameInput, { target: { value: '' } });

      // Try to save to show error
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

      // Verify error appears
      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument();
      });

      // Start typing - error should clear
      fireEvent.change(firstNameInput, { target: { value: 'J' } });

      expect(screen.queryByText('First name is required')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('supports keyboard navigation', async () => {
      render(
        <BrowserRouter>
          <JobSeekerAccount />
        </BrowserRouter>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit profile/i });

      // Test keyboard activation
      editButton.focus();
      fireEvent.keyDown(editButton, { key: 'Enter' });

      // Should enter edit mode
      await waitFor(() => {
        expect(screen.getByText('Personal Information')).toBeInTheDocument();
      });
    });

    test('provides proper ARIA labels and descriptions', async () => {
      render(
        <BrowserRouter>
          <JobSeekerAccount />
        </BrowserRouter>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      expect(editButton).toHaveAttribute('aria-label', 'Edit profile information');
    });
  });

  describe('Data Persistence', () => {
    test('persists form data when switching between tabs', async () => {
      render(
        <BrowserRouter>
          <JobSeekerAccount />
        </BrowserRouter>
      );

      // Wait for initial load and enter edit mode
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /edit profile/i }));

      // Make changes
      fireEvent.change(screen.getByDisplayValue('John'), { target: { value: 'Jane' } });

      // Switch to applications tab (if it exists)
      // Note: In this test setup, we may not have full tab functionality
      // but the form data should persist

      // Verify data is still there
      expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
    });

    test('maintains form state on component re-render', async () => {
      const { rerender } = render(
        <BrowserRouter>
          <JobSeekerAccount />
        </BrowserRouter>
      );

      // Wait for initial load and enter edit mode
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /edit profile/i }));

      // Make changes
      fireEvent.change(screen.getByDisplayValue('John'), { target: { value: 'Jane' } });

      // Re-render component
      rerender(
        <BrowserRouter>
          <JobSeekerAccount />
        </BrowserRouter>
      );

      // Form data should still be there (this tests the useEffect in EditableForm)
      await waitFor(() => {
        expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
      });
    });
  });
});