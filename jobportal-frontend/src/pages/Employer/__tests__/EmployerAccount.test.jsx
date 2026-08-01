import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import EmployerAccount from '../EmployerAccount';
import { AuthContext } from '../../../context/AuthContext';

// Mock all the dependencies
jest.mock('../../../context/AuthContext', () => ({
    useAuth: () => ({
        logout: jest.fn(),
    }),
    AuthContext: {
        Provider: ({ children }) => children,
    },
}));

jest.mock('../../../api', () => ({
    getMyJobs: jest.fn(),
    getJobApplications: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
}));

jest.mock('../../../components/Employer/JobCard', () => () => <div>JobCard</div>);
jest.mock('../../../components/Employer/ApplicantCard', () => () => <div>ApplicantCard</div>);
jest.mock('../../../components/Employer/CompanyDetailModal', () => () => <div>CompanyDetailModal</div>);
jest.mock('../../../components/Employer/ProfileCard', () => ({ profile, isEditing, onEditToggle }) => (
    <div data-testid="profile-card">
        <div>Profile: {profile.firstName} {profile.lastName}</div>
        <div>Phone: {profile.phoneNumber}</div>
        <button onClick={onEditToggle} disabled={isEditing}>
            {isEditing ? 'Editing' : 'Edit Profile'}
        </button>
    </div>
));
jest.mock('../../../components/Employer/EditableForm', () => ({ onSave, onCancel }) => (
    <div data-testid="editable-form">
        <button onClick={() => onSave({
            firstName: 'Jane',
            lastName: 'Smith',
            phoneNumber: '+1987654321',
            email: 'jane@example.com'
        })}>
            Save Changes
        </button>
        <button onClick={onCancel}>Cancel</button>
    </div>
));
jest.mock('../../../components/Employer/SecurityForm', () => () => <div>SecurityForm</div>);
jest.mock('../../../components/CollapsibleSection', () => ({ children, title }) => (
    <div data-testid="collapsible-section">
        <h3>{title}</h3>
        {children}
    </div>
));
jest.mock('../../../components/JobSeeker/PremiumFeatures', () => () => <div>PremiumFeatures</div>);
jest.mock('../../../components/JobSeeker/NotificationPreferences', () => () => <div>NotificationPreferences</div>);
jest.mock('../../../components/JobSeeker/PrivacySettings', () => () => <div>PrivacySettings</div>);
jest.mock('../../../components/ProfileCompletenessIndicator', () => () => <div>ProfileCompletenessIndicator</div>);

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        header: ({ children, ...props }) => <header {...props}>{children}</header>,
        footer: ({ children, ...props }) => <footer {...props}>{children}</footer>,
        button: ({ children, ...props }) => <button {...props}>{children}</button>,
    },
    AnimatePresence: ({ children }) => children,
}));

// Mock react-icons
jest.mock('react-icons/fi', () => ({
    FiUser: () => <span>User</span>,
    FiLock: () => <span>Lock</span>,
    FiBriefcase: () => <span>Briefcase</span>,
    FiPlus: () => <span>Plus</span>,
    FiLogOut: () => <span>Logout</span>,
    FiSun: () => <span>Sun</span>,
    FiMoon: () => <span>Moon</span>,
    FiHome: () => <span>Home</span>,
    FiBell: () => <span>Bell</span>,
    FiEdit: () => <span>Edit</span>,
    FiSave: () => <span>Save</span>,
    FiMail: () => <span>Mail</span>,
    FiPhone: () => <span>Phone</span>,
    FiCalendar: () => <span>Calendar</span>,
    FiMapPin: () => <span>MapPin</span>,
    FiUsers: () => <span>Users</span>,
    FiCloud: () => <span>Cloud</span>,
    FiSettings: () => <span>Settings</span>,
}));

jest.mock('react-icons/fa', () => ({
    FaLinkedin: () => <span>LinkedIn</span>,
    FaTwitter: () => <span>Twitter</span>,
    FaGithub: () => <span>GitHub</span>,
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Link: ({ children, ...props }) => <a {...props}>{children}</a>,
    useNavigate: () => jest.fn(),
}));

const api = require('../../../api');

const renderWithRouter = (component) => {
    return render(
        <BrowserRouter>
            {component}
        </BrowserRouter>
    );
};

describe('EmployerAccount Profile Update', () => {
    const mockProfileData = {
        data: {
            name: 'John Doe',
            username: 'johndoe',
            email: 'john@example.com',
            phone: '+1234567890',
            age: 30,
            gender: 'male',
            location: 'New York',
            profile_picture: '/path/to/profile.jpg',
            companyName: 'Tech Corp',
            companyLocation: 'NYC',
            employeesCount: 100,
            establishmentYear: 2010,
        }
    };

    const mockJobsData = {
        data: {
            data: [
                {
                    id: 1,
                    title: 'Software Engineer',
                    employer: {
                        companyName: 'Tech Corp',
                        companyLocation: 'NYC',
                        establishmentYear: 2010,
                    }
                }
            ]
        }
    };

    const mockApplicationsData = {
        data: {
            data: []
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup default mock responses
        api.getProfile.mockResolvedValue(mockProfileData);
        api.getMyJobs.mockResolvedValue(mockJobsData);
        api.getJobApplications.mockResolvedValue(mockApplicationsData);
    });

    test('loads and displays profile data correctly', async () => {
        renderWithRouter(<EmployerAccount />);

        await waitFor(() => {
            expect(api.getProfile).toHaveBeenCalled();
        });

        // Check if profile data is displayed
        await waitFor(() => {
            expect(screen.getByText('Profile: John Doe')).toBeInTheDocument();
            expect(screen.getByText('Phone: +1234567890')).toBeInTheDocument();
        });
    });

    test('updates profile state correctly after successful API call', async () => {
        const mockUpdatedProfile = {
            data: {
                name: 'Jane Smith',
                username: 'janesmith',
                email: 'jane@example.com',
                phone: '+1987654321', // Backend returns 'phone'
                age: 35,
                gender: 'female',
                location: 'Los Angeles',
                profile_picture: '/path/to/new-profile.jpg',
                companyName: 'New Tech Corp',
                companyLocation: 'LA',
                employeesCount: 200,
                establishmentYear: 2015,
            }
        };

        api.updateProfile.mockResolvedValue(mockUpdatedProfile);

        renderWithRouter(<EmployerAccount />);

        await waitFor(() => {
            expect(screen.getByText('Profile: John Doe')).toBeInTheDocument();
        });

        // Click edit button
        const editButton = screen.getByText('Edit Profile');
        fireEvent.click(editButton);

        // Wait for editable form to appear
        await waitFor(() => {
            expect(screen.getByTestId('editable-form')).toBeInTheDocument();
        });

        // Click save button
        const saveButton = screen.getByText('Save Changes');
        fireEvent.click(saveButton);

        // Wait for API call and state update
        await waitFor(() => {
            expect(api.updateProfile).toHaveBeenCalled();
        });

        // Verify the profile was updated with correct field mapping
        await waitFor(() => {
            expect(screen.getByText('Profile: Jane Smith')).toBeInTheDocument();
            expect(screen.getByText('Phone: +1987654321')).toBeInTheDocument(); // Should map backend 'phone' to frontend 'phoneNumber'
        });
    });

    test('handles profile update errors gracefully', async () => {
        const errorMessage = 'Failed to update profile';
        api.updateProfile.mockRejectedValue({
            response: {
                data: { message: errorMessage },
                status: 400
            }
        });

        // Mock window.alert
        const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

        renderWithRouter(<EmployerAccount />);

        await waitFor(() => {
            expect(screen.getByText('Profile: John Doe')).toBeInTheDocument();
        });

        // Click edit button
        const editButton = screen.getByText('Edit Profile');
        fireEvent.click(editButton);

        // Click save button
        const saveButton = screen.getByText('Save Changes');
        fireEvent.click(saveButton);

        // Wait for error handling
        await waitFor(() => {
            expect(mockAlert).toHaveBeenCalledWith(`Error updating profile: ${errorMessage}`);
        });

        mockAlert.mockRestore();
    });

    test('maintains profile data consistency between backend and frontend', async () => {
        const mockUpdatedProfile = {
            data: {
                name: 'Updated Name',
                phone: '+1555123456',
                email: 'updated@example.com',
                age: 40,
                gender: 'other',
                location: 'Updated City',
                profile_picture: '/updated/path.jpg',
                companyName: 'Updated Company',
                companyLocation: 'Updated Location',
                employeesCount: 150,
                establishmentYear: 2020,
            }
        };

        api.updateProfile.mockResolvedValue(mockUpdatedProfile);

        renderWithRouter(<EmployerAccount />);

        await waitFor(() => {
            expect(screen.getByText('Profile: John Doe')).toBeInTheDocument();
        });

        // Trigger profile update
        const editButton = screen.getByText('Edit Profile');
        fireEvent.click(editButton);

        const saveButton = screen.getByText('Save Changes');
        fireEvent.click(saveButton);

        // Verify all fields are correctly mapped and displayed
        await waitFor(() => {
            expect(screen.getByText('Profile: Updated Name')).toBeInTheDocument();
            expect(screen.getByText('Phone: +1555123456')).toBeInTheDocument();
        });

        // Verify the API was called with correct data structure
        expect(api.updateProfile).toHaveBeenCalledWith(expect.any(FormData));
    });

    test('handles missing profile data gracefully', async () => {
        const incompleteProfileData = {
            data: {
                name: 'Incomplete User',
                // Missing phone and other fields
            }
        };

        api.getProfile.mockResolvedValue(incompleteProfileData);

        renderWithRouter(<EmployerAccount />);

        await waitFor(() => {
            expect(screen.getByText('Profile: Incomplete User')).toBeInTheDocument();
        });

        // Should handle missing phone gracefully
        expect(screen.getByText('Phone:')).toBeInTheDocument(); // Empty phone should still show the label
    });

    test('displays validation errors correctly', async () => {
        const mockValidationError = {
            response: {
                status: 422,
                data: {
                    message: 'Validation failed',
                    errors: {
                        email: ['The email field must be a valid email address.'],
                        username: ['The username field must be unique.']
                    }
                }
            }
        };

        // Mock console.error to avoid console pollution in tests
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

        api.updateProfile.mockRejectedValue(mockValidationError);

        renderWithRouter(<EmployerAccount />);

        await waitFor(() => {
            expect(screen.getByText('Profile: John Doe')).toBeInTheDocument();
        });

        // Trigger profile update
        const editButton = screen.getByText('Edit Profile');
        fireEvent.click(editButton);

        const saveButton = screen.getByText('Save Changes');
        fireEvent.click(saveButton);

        // Wait for error handling
        await waitFor(() => {
            expect(api.updateProfile).toHaveBeenCalled();
        });

        // Verify that validation errors are logged
        expect(consoleErrorSpy).toHaveBeenCalledWith('📝 Detailed validation errors:', mockValidationError.response.data.errors);
        expect(consoleErrorSpy).toHaveBeenCalledWith('❌ email: The email field must be a valid email address.');
        expect(consoleErrorSpy).toHaveBeenCalledWith('❌ username: The username field must be unique.');

        // Verify that alert is shown with validation errors
        expect(alertSpy).toHaveBeenCalledWith('Validation Errors:\nemail: The email field must be a valid email address.\nusername: The username field must be unique.');

        // Cleanup
        consoleErrorSpy.mockRestore();
        alertSpy.mockRestore();
    });
});