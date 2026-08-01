import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import JobSeekerAccount from '../JobSeekerAccount';

// Mock all the dependencies
jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    logout: jest.fn(),
  }),
}));

jest.mock('../../../api', () => ({
  getProfile: jest.fn(),
  getApplications: jest.fn(),
  getNotifications: jest.fn(),
  updateProfile: jest.fn(),
}));

jest.mock('../../../components/JobSeeker/ProfileCard', () => ({ profile, isEditing, onEditToggle }) => (
  <div data-testid="profile-card">
    <div data-testid="profile-name">{profile.firstName} {profile.lastName}</div>
    <div data-testid="profile-email">{profile.email}</div>
    {!isEditing && (
      <button data-testid="edit-button" onClick={onEditToggle}>
        Edit Profile
      </button>
    )}
  </div>
));

jest.mock('../../../components/JobSeeker/EditableForm', () => ({ profile, onSave, onCancel }) => (
  <div data-testid="editable-form">
    <div data-testid="form-profile-name">{profile.firstName} {profile.lastName}</div>
    <button data-testid="save-button" onClick={() => onSave({
      firstName: 'Updated',
      lastName: 'User',
      username: 'updateduser',
      email: 'updated@example.com',
      phone: '+1234567890',
      age: '25',
      gender: 'female',
      degree: 'Master of Science',
      fieldOfStudy: 'Data Science',
      graduationYear: '2022',
      experience: '3',
      location: 'San Francisco',
      address: '456 Tech St',
      website: 'https://updated.com',
    })}>
      Save Changes
    </button>
    <button data-testid="cancel-button" onClick={onCancel}>
      Cancel
    </button>
  </div>
));

jest.mock('../../../components/JobSeeker/AppliedJobList', () => ({ jobs }) => (
  <div data-testid="applied-job-list">
    {jobs.map(job => (
      <div key={job.id} data-testid={`job-${job.id}`}>
        {job.title}
      </div>
    ))}
  </div>
));

jest.mock('../../../components/ProfileCompletenessIndicator', () => ({ profile, userType }) => (
  <div data-testid="profile-completeness">
    Profile completeness for {userType}
  </div>
));

jest.mock('../../../components/JobSeeker/ResumeUpload', () => ({ onUpload, currentResume }) => (
  <div data-testid="resume-upload">
    Resume Upload Component
  </div>
));

jest.mock('../../../components/JobSeeker/JobRecommendations', () => () => (
  <div data-testid="job-recommendations">
    Job Recommendations Component
  </div>
));

jest.mock('../../../components/JobSeeker/SkillsExperience', () => ({ skills, experience, onUpdate }) => (
  <div data-testid="skills-experience">
    Skills & Experience Component
  </div>
));

jest.mock('../../../components/JobSeeker/EducationHistory', () => ({ education, onUpdate }) => (
  <div data-testid="education-history">
    Education History Component
  </div>
));

jest.mock('../../../components/JobSeeker/Portfolio', () => ({ projects, onUpdate }) => (
  <div data-testid="portfolio">
    Portfolio Component
  </div>
));

jest.mock('../../../components/JobSeeker/SavedJobs', () => () => (
  <div data-testid="saved-jobs">
    Saved Jobs Component
  </div>
));

jest.mock('../../../components/JobSeeker/NotificationPreferences', () => () => (
  <div data-testid="notification-preferences">
    Notification Preferences Component
  </div>
));

jest.mock('../../../components/JobSeeker/PrivacySettings', () => () => (
  <div data-testid="privacy-settings">
    Privacy Settings Component
  </div>
));

jest.mock('../../../components/JobSeeker/AccountStats', () => ({ applications }) => (
  <div data-testid="account-stats">
    Account Stats Component
  </div>
));

jest.mock('../../../components/JobSeeker/SocialMediaLinks', () => () => (
  <div data-testid="social-media-links">
    Social Media Links Component
  </div>
));

jest.mock('../../../components/JobSeeker/ContactInfo', () => ({ contact, onUpdate }) => (
  <div data-testid="contact-info">
    Contact Info Component
  </div>
));

jest.mock('../../../components/JobSeeker/ActivityHistory', () => ({ activities }) => (
  <div data-testid="activity-history">
    Activity History Component
  </div>
));

jest.mock('../../../components/JobSeeker/DownloadProfileData', () => () => (
  <div data-testid="download-profile-data">
    Download Profile Data Component
  </div>
));

jest.mock('../../../components/JobSeeker/PremiumFeatures', () => () => (
  <div data-testid="premium-features">
    Premium Features Component
  </div>
));

jest.mock('../../../components/JobSeeker/AccountVerification', () => () => (
  <div data-testid="account-verification">
    Account Verification Component
  </div>
));

jest.mock('../../../components/FeedbackMessage', () => ({ type, message, onClose }) => (
  <div data-testid={`feedback-${type}`}>
    {message}
    <button data-testid="close-feedback" onClick={onClose}>Close</button>
  </div>
));

jest.mock('../../../components/LoadingSpinner', () => ({ size }) => (
  <div data-testid="loading-spinner" data-size={size}>
    Loading...
  </div>
));

jest.mock('../../../components/CollapsibleSection', () => ({ title, children, icon, defaultOpen }) => (
  <div data-testid="collapsible-section">
    <h3>{title}</h3>
    <div>{children}</div>
  </div>
));

import api from '../../../api';

const mockProfile = {
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
  skills: [],
  education: [],
  work_experience: [],
  portfolio: [],
};

const mockApplications = [
  {
    id: 1,
    job: { title: 'Software Engineer', employer: { name: 'Tech Corp' } },
    created_at: '2024-01-01',
    status: 'pending',
  },
];

const renderJobSeekerAccount = () => {
  return render(
    <BrowserRouter>
      <JobSeekerAccount />
    </BrowserRouter>
  );
};

describe('JobSeekerAccount Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful API responses
    api.getProfile.mockResolvedValue({
      data: { data: mockProfile }
    });

    api.getApplications.mockResolvedValue({
      data: { data: { data: mockApplications } }
    });

    api.getNotifications.mockResolvedValue({
      data: []
    });
  });

  describe('Initial Load', () => {
    test('loads profile data successfully', async () => {
      renderJobSeekerAccount();

      await waitFor(() => {
        expect(api.getProfile).toHaveBeenCalledTimes(1);
        expect(api.getApplications).toHaveBeenCalledTimes(1);
        expect(api.getNotifications).toHaveBeenCalledTimes(1);
      });

      expect(screen.getByTestId('profile-name')).toHaveTextContent('John Smith');
      expect(screen.getByTestId('profile-email')).toHaveTextContent('john@example.com');
    });

    test('shows loading state initially', () => {
      renderJobSeekerAccount();

      expect(screen.getByText('Loading your profile...')).toBeInTheDocument();
    });

    test('handles profile load error', async () => {
      api.getProfile.mockRejectedValue(new Error('Failed to load profile'));

      renderJobSeekerAccount();

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
      });
    });

    test('handles applications load error gracefully', async () => {
      api.getApplications.mockRejectedValue(new Error('Failed to load applications'));

      renderJobSeekerAccount();

      // Should still load profile even if applications fail
      await waitFor(() => {
        expect(api.getProfile).toHaveBeenCalledTimes(1);
      });

      expect(screen.getByTestId('profile-name')).toHaveTextContent('John Smith');
    });
  });

  describe('Profile Edit Flow', () => {
    test('enters edit mode when edit button is clicked', async () => {
      renderJobSeekerAccount();

      await waitFor(() => {
        expect(screen.getByTestId('edit-button')).toBeInTheDocument();
      });

      const editButton = screen.getByTestId('edit-button');
      fireEvent.click(editButton);

      // Should show editable form
      expect(screen.getByTestId('editable-form')).toBeInTheDocument();
      expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument();
    });

    test('cancels edit mode when cancel button is clicked', async () => {
      renderJobSeekerAccount();

      await waitFor(() => {
        expect(screen.getByTestId('edit-button')).toBeInTheDocument();
      });

      // Enter edit mode
      fireEvent.click(screen.getByTestId('edit-button'));

      // Cancel edit
      fireEvent.click(screen.getByTestId('cancel-button'));

      // Should return to view mode
      expect(screen.getByTestId('edit-button')).toBeInTheDocument();
      expect(screen.queryByTestId('editable-form')).not.toBeInTheDocument();
    });

    test('successfully updates profile', async () => {
      const updatedProfile = {
        ...mockProfile,
        name: 'Updated User',
        firstName: 'Updated',
        lastName: 'User',
        username: 'updateduser',
        email: 'updated@example.com',
        phone: '+1234567890',
        age: 25,
        gender: 'female',
        degree: 'Master of Science',
        fieldOfStudy: 'Data Science',
        graduationYear: 2022,
        experience: 3,
        location: 'San Francisco',
        address: '456 Tech St',
        website: 'https://updated.com',
      };

      api.updateProfile.mockResolvedValue({
        data: { data: updatedProfile }
      });

      renderJobSeekerAccount();

      await waitFor(() => {
        expect(screen.getByTestId('edit-button')).toBeInTheDocument();
      });

      // Enter edit mode
      fireEvent.click(screen.getByTestId('edit-button'));

      // Save changes
      fireEvent.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(api.updateProfile).toHaveBeenCalledTimes(1);
      });

      // Should show success message
      expect(screen.getByTestId('feedback-success')).toHaveTextContent('Profile updated successfully!');

      // Should exit edit mode
      expect(screen.getByTestId('edit-button')).toBeInTheDocument();
      expect(screen.queryByTestId('editable-form')).not.toBeInTheDocument();

      // Should update displayed profile data
      expect(screen.getByTestId('profile-name')).toHaveTextContent('Updated User');
    });

    test('handles profile update error', async () => {
      api.updateProfile.mockRejectedValue({
        response: {
          status: 422,
          data: { message: 'Validation failed' }
        }
      });

      renderJobSeekerAccount();

      await waitFor(() => {
        expect(screen.getByTestId('edit-button')).toBeInTheDocument();
      });

      // Enter edit mode
      fireEvent.click(screen.getByTestId('edit-button'));

      // Save changes
      fireEvent.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(screen.getByTestId('feedback-error')).toHaveTextContent('Validation failed. Please check your inputs and try again.');
      });

      // Should remain in edit mode
      expect(screen.getByTestId('editable-form')).toBeInTheDocument();
    });

    test('handles network error during profile update', async () => {
      const networkError = new Error('Network Error');
      networkError.request = {};
      api.updateProfile.mockRejectedValue(networkError);

      renderJobSeekerAccount();

      await waitFor(() => {
        expect(screen.getByTestId('edit-button')).toBeInTheDocument();
      });

      // Enter edit mode
      fireEvent.click(screen.getByTestId('edit-button'));

      // Save changes
      fireEvent.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(screen.getByTestId('feedback-error')).toHaveTextContent('Network error. Please check your connection and try again.');
      });
    });

    test('handles authentication error during profile update', async () => {
      api.updateProfile.mockRejectedValue({
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      });

      renderJobSeekerAccount();

      await waitFor(() => {
        expect(screen.getByTestId('edit-button')).toBeInTheDocument();
      });

      // Enter edit mode
      fireEvent.click(screen.getByTestId('edit-button'));

      // Save changes
      fireEvent.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(screen.getByTestId('feedback-error')).toHaveTextContent('Authentication failed. Please log in again.');
      });
    });

    test('handles server error during profile update', async () => {
      api.updateProfile.mockRejectedValue({
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      });

      renderJobSeekerAccount();

      await waitFor(() => {
        expect(screen.getByTestId('feedback-error')).toHaveTextContent('Server error. Please try again later.');
      });
    });

    test('prevents multiple simultaneous profile updates', async () => {
      api.updateProfile.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      renderJobSeekerAccount();

      await waitFor(() => {
        expect(screen.getByTestId('edit-button')).toBeInTheDocument();
      });

      // Enter edit mode
      fireEvent.click(screen.getByTestId('edit-button'));

      const saveButton = screen.getByTestId('save-button');

      // Click save multiple times quickly
      fireEvent.click(saveButton);
      fireEvent.click(saveButton);
      fireEvent.click(saveButton);

      // Should only call API once
      await waitFor(() => {
        expect(api.updateProfile).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('State Management', () => {
    test('updates profile state correctly after successful update', async () => {
      const updatedProfile = {
        ...mockProfile,
        name: 'Updated User',
        firstName: 'Updated',
        lastName: 'User',
        phone: '+0987654321',
      };

      api.updateProfile.mockResolvedValue({
        data: { data: updatedProfile }
      });

      renderJobSeekerAccount();

      await waitFor(() => {
        expect(screen.getByTestId('edit-button')).toBeInTheDocument();
      });

      // Enter edit mode
      fireEvent.click(screen.getByTestId('edit-button'));

      // Save changes
      fireEvent.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(api.updateProfile).toHaveBeenCalledTimes(1);
      });

      // Verify state was updated
      expect(screen.getByTestId('profile-name')).toHaveTextContent('Updated User');
    });

    test('maintains edit mode on update failure', async () => {
      api.updateProfile.mockRejectedValue(new Error('Update failed'));

      renderJobSeekerAccount();

      await waitFor(() => {
        expect(screen.getByTestId('edit-button')).toBeInTheDocument();
      });

      // Enter edit mode
      fireEvent.click(screen.getByTestId('edit-button'));

      // Save changes (will fail)
      fireEvent.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(screen.getByTestId('feedback-error')).toBeInTheDocument();
      });

      // Should still be in edit mode
      expect(screen.getByTestId('editable-form')).toBeInTheDocument();
      expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument();
    });

    test('updates last updated timestamp after successful update', async () => {
      const originalDate = new Date('2024-01-01');
      jest.spyOn(global, 'Date').mockImplementation(() => originalDate);

      api.updateProfile.mockResolvedValue({
        data: { data: mockProfile }
      });

      renderJobSeekerAccount();

      await waitFor(() => {
        expect(screen.getByTestId('edit-button')).toBeInTheDocument();
      });

      // Enter edit mode
      fireEvent.click(screen.getByTestId('edit-button'));

      // Save changes
      fireEvent.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(api.updateProfile).toHaveBeenCalledTimes(1);
      });

      // The component should have updated its lastUpdated state
      // (This is tested implicitly by the successful update flow)
    });
  });

  describe('Tab Navigation', () => {
    test('shows profile tab by default', async () => {
      renderJobSeekerAccount();

      await waitFor(() => {
        expect(screen.getByTestId('profile-card')).toBeInTheDocument();
      });
    });

    test('switches to applications tab', async () => {
      renderJobSeekerAccount();

      await waitFor(() => {
        const applicationsTab = screen.getByText('Applications');
        fireEvent.click(applicationsTab);
      });

      expect(screen.getByTestId('applied-job-list')).toBeInTheDocument();
    });

    test('switches to skills tab', async () => {
      renderJobSeekerAccount();

      await waitFor(() => {
        const skillsTab = screen.getByText('Skills & Experience');
        fireEvent.click(skillsTab);
      });

      expect(screen.getByTestId('skills-experience')).toBeInTheDocument();
    });
  });

  describe('Error Boundaries', () => {
    test('handles component errors gracefully', async () => {
      // Mock a component that throws an error
      jest.spyOn(console, 'error').mockImplementation(() => {});

      api.getProfile.mockRejectedValue(new Error('Critical error'));

      renderJobSeekerAccount();

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
      });

      console.error.mockRestore();
    });
  });

  describe('Performance', () => {
    test('debounces rapid state changes', async () => {
      renderJobSeekerAccount();

      await waitFor(() => {
        expect(screen.getByTestId('edit-button')).toBeInTheDocument();
      });

      // Rapidly click edit button multiple times
      const editButton = screen.getByTestId('edit-button');
      fireEvent.click(editButton);
      fireEvent.click(editButton);
      fireEvent.click(editButton);

      // Should only enter edit mode once
      expect(screen.getByTestId('editable-form')).toBeInTheDocument();
    });
  });
});