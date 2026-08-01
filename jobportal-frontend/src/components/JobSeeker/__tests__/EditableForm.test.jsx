import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditableForm from '../EditableForm';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    form: ({ children, ...props }) => <form {...props}>{children}</form>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
}));

// Mock react-icons
jest.mock('react-icons/fi', () => ({
  FiSave: () => <span data-testid="save-icon">Save</span>,
  FiX: () => <span data-testid="cancel-icon">Cancel</span>,
  FiUpload: () => <span data-testid="upload-icon">Upload</span>,
  FiPhone: () => <span>Phone</span>,
  FiUser: () => <span>User</span>,
  FiMail: () => <span>Mail</span>,
  FiMapPin: () => <span>MapPin</span>,
  FiGlobe: () => <span>Globe</span>,
  FiCalendar: () => <span>Calendar</span>,
  FiBriefcase: () => <span>Briefcase</span>,
}));

// Mock the Tooltip component
jest.mock('../Tooltip', () => ({ children, text }) => (
  <div data-testid="tooltip" title={text}>
    {children}
  </div>
));

const mockProfile = {
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
  profilePic: 'https://example.com/profile.jpg',
};

const mockOnSave = jest.fn();
const mockOnCancel = jest.fn();

describe('EditableForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    test('renders form with all profile data pre-filled', () => {
      render(
        <EditableForm
          profile={mockProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Smith')).toBeInTheDocument();
      expect(screen.getByDisplayValue('johndoe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument();
      expect(screen.getByDisplayValue('30')).toBeInTheDocument();
      expect(screen.getByDisplayValue('male')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bachelor of Science')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Computer Science')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2020')).toBeInTheDocument();
      expect(screen.getByDisplayValue('5')).toBeInTheDocument();
      expect(screen.getByDisplayValue('New York')).toBeInTheDocument();
      expect(screen.getByDisplayValue('123 Main St')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument();
    });

    test('renders all form sections', () => {
      render(
        <EditableForm
          profile={mockProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Profile Picture')).toBeInTheDocument();
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
      expect(screen.getByText('Contact Information')).toBeInTheDocument();
      expect(screen.getByText('Education & Experience')).toBeInTheDocument();
      expect(screen.getByText('Change Password (Optional)')).toBeInTheDocument();
    });

    test('renders save and cancel buttons', () => {
      render(
        <EditableForm
          profile={mockProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('validates required fields', async () => {
      render(
        <EditableForm
          profile={mockProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Clear required fields
      const firstNameInput = screen.getByDisplayValue('John');
      const lastNameInput = screen.getByDisplayValue('Smith');
      const usernameInput = screen.getByDisplayValue('johndoe');

      fireEvent.change(firstNameInput, { target: { value: '' } });
      fireEvent.change(lastNameInput, { target: { value: '' } });
      fireEvent.change(usernameInput, { target: { value: '' } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument();
        expect(screen.getByText('Last name is required')).toBeInTheDocument();
        expect(screen.getByText('Username is required')).toBeInTheDocument();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    test('validates phone number format', async () => {
      render(
        <EditableForm
          profile={mockProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const phoneInput = screen.getByDisplayValue('+1234567890');
      fireEvent.change(phoneInput, { target: { value: 'invalid-phone' } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    test('validates email format', async () => {
      render(
        <EditableForm
          profile={mockProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const emailInput = screen.getByDisplayValue('john@example.com');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    test('validates website URL format', async () => {
      render(
        <EditableForm
          profile={mockProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const websiteInput = screen.getByDisplayValue('https://example.com');
      fireEvent.change(websiteInput, { target: { value: 'invalid-url' } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid website URL')).toBeInTheDocument();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    test('validates graduation year range', async () => {
      render(
        <EditableForm
          profile={mockProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const graduationYearInput = screen.getByDisplayValue('2020');
      fireEvent.change(graduationYearInput, { target: { value: '1800' } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid graduation year')).toBeInTheDocument();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    test('validates age range', async () => {
      render(
        <EditableForm
          profile={mockProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const ageInput = screen.getByDisplayValue('30');
      fireEvent.change(ageInput, { target: { value: '150' } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid age (1-120)')).toBeInTheDocument();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    test('validates experience range', async () => {
      render(
        <EditableForm
          profile={mockProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const experienceInput = screen.getByDisplayValue('5');
      fireEvent.change(experienceInput, { target: { value: '60' } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter valid years of experience (0-50)')).toBeInTheDocument();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    test('validates password requirements', async () => {
      render(
        <EditableForm
          profile={mockProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const newPasswordInput = screen.getByPlaceholderText('Enter new password');
      fireEvent.change(newPasswordInput, { target: { value: '123' } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    test('validates password confirmation match', async () => {
      render(
        <EditableForm
          profile={mockProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const newPasswordInput = screen.getByPlaceholderText('Enter new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm new password');

      fireEvent.change(newPasswordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    test('calls onSave with correct data when form is valid', async () => {
      mockOnSave.mockResolvedValue({ success: true });

      render(
        <EditableForm
          profile={mockProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'John',
            lastName: 'Smith',
            username: 'johndoe',
            phone: '+1234567890',
            age: '30',
            gender: 'male',
            degree: 'Bachelor of Science',
            fieldOfStudy: 'Computer Science',
            graduationYear: '2020',
            experience: '5',
            location: 'New York',
            address: '123 Main St',
            website: 'https://example.com',
          })
        );
      });
    });

    test('prevents form submission during save operation', async () => {
      mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <EditableForm
          profile={mockProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      // Button should be disabled during save
      expect(saveButton).toBeDisabled();
      expect(saveButton).toHaveTextContent('Saving...');

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1);
      });
    });

    test('handles save errors gracefully', async () => {
      mockOnSave.mockRejectedValue(new Error('Save failed'));

      render(
        <EditableForm
          profile={mockProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to update profile. Please try again.')).toBeInTheDocument();
      });

      // Button should be re-enabled after error
      expect(saveButton).not.toBeDisabled();
      expect(saveButton).toHaveTextContent('Save Changes');
    });

    test('handles network errors', async () => {
      const networkError = new Error('Network Error');
      networkError.request = {}; // Simulate axios network error
      mockOnSave.mockRejectedValue(networkError);

      render(
        <EditableForm
          profile={mockProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Network error. Please check your connection and try again.')).toBeInTheDocument();
      });
    });

    test('handles validation errors from server', async () => {
      const validationError = {
        response: {
          status: 422,
          data: { message: 'Validation failed', errors: { email: ['Email already exists'] } }
        }
      };
      mockOnSave.mockRejectedValue(validationError);

      render(
        <EditableForm
          profile={mockProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Validation failed. Please check your inputs.')).toBeInTheDocument();
      });
    });

    test('handles authentication errors', async () => {
      const authError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };
      mockOnSave.mockRejectedValue(authError);

      render(
        <EditableForm
          profile={mockProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Authentication failed. Please log in again.')).toBeInTheDocument();
      });
    });
  });

  describe('Cancel Functionality', () => {
    test('calls onCancel when cancel button is clicked', () => {
      render(
        <EditableForm
          profile={mockProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    test('cancel button is disabled during save operation', async () => {
      mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <EditableForm
          profile={mockProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      const cancelButton = screen.getByRole('button', { name: /cancel/i });

      fireEvent.click(saveButton);

      // Both buttons should be disabled during save
      expect(saveButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('File Upload', () => {
    test('handles profile picture file selection', () => {
      render(
        <EditableForm
          profile={mockProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const fileInput = screen.getByLabelText(/change photo/i);
      const file = new File(['test'], 'test.png', { type: 'image/png' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      // The file should be processed (mocked FileReader)
      expect(fileInput.files[0]).toBe(file);
    });

    test('validates file size', () => {
      render(
        <EditableForm
          profile={mockProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const fileInput = screen.getByLabelText(/change photo/i);
      // Create a file larger than 2MB
      const largeFile = new File(['x'.repeat(3 * 1024 * 1024)], 'large.png', { type: 'image/png' });

      fireEvent.change(fileInput, { target: { files: [largeFile] } });

      expect(screen.getByText('Image size must be less than 2MB')).toBeInTheDocument();
    });

    test('validates file type', () => {
      render(
        <EditableForm
          profile={mockProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const fileInput = screen.getByLabelText(/change photo/i);
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      expect(screen.getByText('Please select a valid image file')).toBeInTheDocument();
    });
  });

  describe('Form State Management', () => {
    test('clears errors when user starts typing', () => {
      render(
        <EditableForm
          profile={mockProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const firstNameInput = screen.getByDisplayValue('John');

      // First make an error by clearing the field and trying to submit
      fireEvent.change(firstNameInput, { target: { value: '' } });
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      // Error should appear
      expect(screen.getByText('First name is required')).toBeInTheDocument();

      // Now start typing - error should clear
      fireEvent.change(firstNameInput, { target: { value: 'J' } });

      expect(screen.queryByText('First name is required')).not.toBeInTheDocument();
    });

    test('updates form data when inputs change', () => {
      render(
        <EditableForm
          profile={mockProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const firstNameInput = screen.getByDisplayValue('John');
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

      expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
    });

    test('handles select dropdown changes', () => {
      render(
        <EditableForm
          profile={mockProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const genderSelect = screen.getByDisplayValue('male');
      fireEvent.change(genderSelect, { target: { value: 'female' } });

      expect(screen.getByDisplayValue('female')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper form labels', () => {
      render(
        <EditableForm
          profile={mockProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText('First Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Username *')).toBeInTheDocument();
      expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
      expect(screen.getByLabelText('Age')).toBeInTheDocument();
      expect(screen.getByLabelText('Gender')).toBeInTheDocument();
    });

    test('has tooltips for complex fields', () => {
      render(
        <EditableForm
          profile={mockProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const tooltips = screen.getAllByTestId('tooltip');
      expect(tooltips.length).toBeGreaterThan(0);
    });

    test('buttons have proper accessibility attributes', () => {
      render(
        <EditableForm
          profile={mockProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      const cancelButton = screen.getByRole('button', { name: /cancel/i });

      expect(saveButton).toHaveAttribute('type', 'button');
      expect(cancelButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Edge Cases', () => {
    test('handles empty profile gracefully', () => {
      const emptyProfile = {
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        profilePic: '',
      };

      render(
        <EditableForm
          profile={emptyProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Should render empty inputs
      expect(screen.getByDisplayValue('')).toBeInTheDocument();
    });

    test('handles profile with missing optional fields', () => {
      const partialProfile = {
        firstName: 'John',
        lastName: 'Smith',
        username: 'johndoe',
        email: 'john@example.com',
        profilePic: 'https://example.com/profile.jpg',
        // Missing optional fields
      };

      render(
        <EditableForm
          profile={partialProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Should render with empty values for missing fields
      expect(screen.getByDisplayValue('')).toBeInTheDocument();
    });

    test('prevents multiple simultaneous submissions', async () => {
      mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <EditableForm
          profile={mockProfile}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save changes/i });

      // Click save multiple times quickly
      fireEvent.click(saveButton);
      fireEvent.click(saveButton);
      fireEvent.click(saveButton);

      // Should only call onSave once
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1);
      });
    });
  });
});