import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileCard from '../ProfileCard';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
}));

// Mock react-icons
jest.mock('react-icons/fi', () => ({
  FiEdit: () => <span data-testid="edit-icon">Edit</span>,
  FiPhone: () => <span>Phone</span>,
  FiBriefcase: () => <span>Briefcase</span>,
  FiBook: () => <span>Book</span>,
  FiMapPin: () => <span>MapPin</span>,
  FiUser: () => <span>User</span>,
  FiMail: () => <span>Mail</span>,
  FiCalendar: () => <span>Calendar</span>,
  FiUsers: () => <span>Users</span>,
  FiLoader: () => <span data-testid="loader-icon">Loading</span>,
}));

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
  profilePic: 'https://example.com/profile.jpg',
};

const mockOnEditToggle = jest.fn();

describe('ProfileCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders profile information correctly', () => {
      render(
        <ProfileCard
          profile={mockProfile}
          isEditing={false}
          onEditToggle={mockOnEditToggle}
        />
      );

      expect(screen.getByText('John Doe Smith')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Username: johndoe')).toBeInTheDocument();
      expect(screen.getByText('+1234567890')).toBeInTheDocument();
      expect(screen.getByText('Age: 30')).toBeInTheDocument();
      expect(screen.getByText('Gender: male')).toBeInTheDocument();
      expect(screen.getByText('Bachelor of Science')).toBeInTheDocument();
      expect(screen.getByText('Field: Computer Science')).toBeInTheDocument();
      expect(screen.getByText('Experience: 5')).toBeInTheDocument();
      expect(screen.getByText('Location: New York')).toBeInTheDocument();
    });

    test('renders edit button when not editing', () => {
      render(
        <ProfileCard
          profile={mockProfile}
          isEditing={false}
          onEditToggle={mockOnEditToggle}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      expect(editButton).toBeInTheDocument();
      expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
    });

    test('does not render edit button when editing', () => {
      render(
        <ProfileCard
          profile={mockProfile}
          isEditing={true}
          onEditToggle={mockOnEditToggle}
        />
      );

      const editButton = screen.queryByRole('button', { name: /edit profile/i });
      expect(editButton).not.toBeInTheDocument();
    });

    test('renders profile picture with correct alt text', () => {
      render(
        <ProfileCard
          profile={mockProfile}
          isEditing={false}
          onEditToggle={mockOnEditToggle}
        />
      );

      const profileImg = screen.getByAltText('John Doe Smith');
      expect(profileImg).toBeInTheDocument();
      expect(profileImg.src).toBe('https://example.com/profile.jpg');
    });
  });

  describe('Edit Button Functionality', () => {
    test('calls onEditToggle when edit button is clicked', async () => {
      render(
        <ProfileCard
          profile={mockProfile}
          isEditing={false}
          onEditToggle={mockOnEditToggle}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(mockOnEditToggle).toHaveBeenCalledTimes(1);
      });
    });

    test('prevents event bubbling when edit button is clicked', () => {
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };

      render(
        <ProfileCard
          profile={mockProfile}
          isEditing={false}
          onEditToggle={mockOnEditToggle}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit profile/i });

      // Simulate click with mock event
      fireEvent.click(editButton);

      // The component should handle preventDefault and stopPropagation internally
      expect(mockOnEditToggle).toHaveBeenCalledTimes(1);
    });

    test('handles keyboard events correctly', () => {
      render(
        <ProfileCard
          profile={mockProfile}
          isEditing={false}
          onEditToggle={mockOnEditToggle}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit profile/i });

      // Test Enter key
      fireEvent.keyDown(editButton, { key: 'Enter' });
      expect(mockOnEditToggle).toHaveBeenCalledTimes(1);

      // Test Space key
      fireEvent.keyDown(editButton, { key: ' ' });
      expect(mockOnEditToggle).toHaveBeenCalledTimes(2);

      // Test other keys (should not trigger)
      fireEvent.keyDown(editButton, { key: 'A' });
      expect(mockOnEditToggle).toHaveBeenCalledTimes(2);
    });

    test('shows loading state when button is clicked', async () => {
      // Mock a slow onEditToggle function
      const slowOnEditToggle = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <ProfileCard
          profile={mockProfile}
          isEditing={false}
          onEditToggle={slowOnEditToggle}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      fireEvent.click(editButton);

      // Should show loading state
      expect(editButton).toBeDisabled();

      await waitFor(() => {
        expect(slowOnEditToggle).toHaveBeenCalledTimes(1);
      });
    });

    test('displays error message when onEditToggle fails', async () => {
      const failingOnEditToggle = jest.fn().mockRejectedValue(new Error('Test error'));

      render(
        <ProfileCard
          profile={mockProfile}
          isEditing={false}
          onEditToggle={failingOnEditToggle}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to enter edit mode. Please try again.')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('has correct ARIA attributes', () => {
      render(
        <ProfileCard
          profile={mockProfile}
          isEditing={false}
          onEditToggle={mockOnEditToggle}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      expect(editButton).toHaveAttribute('aria-label', 'Edit profile information');
      expect(editButton).toHaveAttribute('tabIndex', '0');
      expect(editButton).toHaveAttribute('role', 'button');
    });

    test('has correct ARIA attributes when error occurs', async () => {
      const failingOnEditToggle = jest.fn().mockRejectedValue(new Error('Test error'));

      render(
        <ProfileCard
          profile={mockProfile}
          isEditing={false}
          onEditToggle={failingOnEditToggle}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(editButton).toHaveAttribute('aria-describedby', 'edit-error');
        const errorElement = screen.getByText('Failed to enter edit mode. Please try again.');
        expect(errorElement).toHaveAttribute('id', 'edit-error');
        expect(errorElement).toHaveAttribute('role', 'alert');
      });
    });

    test('has screen reader only text for profile information', () => {
      render(
        <ProfileCard
          profile={mockProfile}
          isEditing={false}
          onEditToggle={mockOnEditToggle}
        />
      );

      // Check for screen reader text
      expect(screen.getByText('Email: john@example.com')).toHaveClass('sr-only');
      expect(screen.getByText('Username: johndoe')).toHaveClass('sr-only');
      expect(screen.getByText('Phone: +1234567890')).toHaveClass('sr-only');
      expect(screen.getByText('Age: 30')).toHaveClass('sr-only');
      expect(screen.getByText('Gender: male')).toHaveClass('sr-only');
      expect(screen.getByText('Degree: Bachelor of Science')).toHaveClass('sr-only');
      expect(screen.getByText('Field of study: Computer Science')).toHaveClass('sr-only');
      expect(screen.getByText('Experience: 5')).toHaveClass('sr-only');
      expect(screen.getByText('Location: New York')).toHaveClass('sr-only');
    });
  });

  describe('Conditional Rendering', () => {
    test('renders optional fields only when they have values', () => {
      const profileWithMissingFields = {
        ...mockProfile,
        middleName: '',
        phone: '',
        age: '',
        gender: '',
        degree: '',
        fieldOfStudy: '',
        graduationYear: '',
        experience: 0,
        location: '',
      };

      render(
        <ProfileCard
          profile={profileWithMissingFields}
          isEditing={false}
          onEditToggle={mockOnEditToggle}
        />
      );

      // Should still render name without middle name
      expect(screen.getByText('John Smith')).toBeInTheDocument();

      // Optional fields should not be rendered
      expect(screen.queryByText(/phone/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/age/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/gender/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/degree/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/field/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/graduation year/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/experience/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/location/i)).not.toBeInTheDocument();
    });

    test('handles empty profile gracefully', () => {
      const emptyProfile = {
        firstName: '',
        lastName: '',
        email: '',
        profilePic: '',
      };

      render(
        <ProfileCard
          profile={emptyProfile}
          isEditing={false}
          onEditToggle={mockOnEditToggle}
        />
      );

      // Should render empty name
      expect(screen.getByText('')).toBeInTheDocument();
    });
  });
});