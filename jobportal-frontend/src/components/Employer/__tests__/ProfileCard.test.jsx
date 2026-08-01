import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileCard from '../ProfileCard';

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
}));

// Mock react-icons
jest.mock('react-icons/fi', () => ({
    FiEdit: () => <span data-testid="edit-icon">Edit</span>,
    FiPhone: () => <span data-testid="phone-icon">Phone</span>,
    FiBriefcase: () => <span data-testid="briefcase-icon">Briefcase</span>,
    FiMapPin: () => <span data-testid="map-icon">Map</span>,
    FiUser: () => <span data-testid="user-icon">User</span>,
    FiMail: () => <span data-testid="mail-icon">Mail</span>,
    FiCalendar: () => <span data-testid="calendar-icon">Calendar</span>,
    FiUsers: () => <span data-testid="users-icon">Users</span>,
}));

describe('ProfileCard', () => {
    const mockProfile = {
        firstName: 'John',
        middleName: 'Michael',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        username: 'johndoe',
        phoneNumber: '+1234567890',
        age: 30,
        gender: 'male',
        location: 'New York',
        profilePicture: '/path/to/profile.jpg',
        companyName: 'Tech Corp',
        companyLocation: 'NYC',
        employeesCount: 100,
        establishmentYear: 2010,
    };

    const mockOnEditToggle = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders profile information correctly', () => {
        render(
            <ProfileCard
                profile={mockProfile}
                isEditing={false}
                onEditToggle={mockOnEditToggle}
            />
        );

        // Check basic profile info
        expect(screen.getByText('John Michael Doe')).toBeInTheDocument();
        expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByText('Username: johndoe')).toBeInTheDocument();

        // Check phone number (using phoneNumber field)
        expect(screen.getByText('+1234567890')).toBeInTheDocument();

        // Check other fields
        expect(screen.getByText('Age: 30')).toBeInTheDocument();
        expect(screen.getByText('Gender: male')).toBeInTheDocument();
        expect(screen.getByText('Location: New York')).toBeInTheDocument();

        // Check company info
        expect(screen.getByText('Company: Tech Corp')).toBeInTheDocument();
        expect(screen.getByText('Company Location: NYC')).toBeInTheDocument();
        expect(screen.getByText('Employees: 100')).toBeInTheDocument();
        expect(screen.getByText('Established: 2010')).toBeInTheDocument();
    });

    test('shows edit button when not editing', () => {
        render(
            <ProfileCard
                profile={mockProfile}
                isEditing={false}
                onEditToggle={mockOnEditToggle}
            />
        );

        const editButton = screen.getByRole('button', { name: /edit profile/i });
        expect(editButton).toBeInTheDocument();
    });

    test('calls onEditToggle when edit button is clicked', () => {
        render(
            <ProfileCard
                profile={mockProfile}
                isEditing={false}
                onEditToggle={mockOnEditToggle}
            />
        );

        const editButton = screen.getByRole('button', { name: /edit profile/i });
        fireEvent.click(editButton);

        expect(mockOnEditToggle).toHaveBeenCalledTimes(1);
    });

    test('hides edit button when editing', () => {
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

    test('handles missing optional fields gracefully', () => {
        const incompleteProfile = {
            ...mockProfile,
            phoneNumber: '',
            age: '',
            gender: '',
            location: '',
            companyName: '',
        };

        render(
            <ProfileCard
                profile={incompleteProfile}
                isEditing={false}
                onEditToggle={mockOnEditToggle}
            />
        );

        // Should not render empty fields
        expect(screen.queryByText('Phone:')).not.toBeInTheDocument();
        expect(screen.queryByText('Age:')).not.toBeInTheDocument();
        expect(screen.queryByText('Gender:')).not.toBeInTheDocument();
        expect(screen.queryByText('Location:')).not.toBeInTheDocument();
        expect(screen.queryByText('Company:')).not.toBeInTheDocument();
    });

    test('renders profile picture with correct alt text', () => {
        render(
            <ProfileCard
                profile={mockProfile}
                isEditing={false}
                onEditToggle={mockOnEditToggle}
            />
        );

        const profileImg = screen.getByAltText('John Michael Doe');
        expect(profileImg).toBeInTheDocument();
        expect(profileImg).toHaveAttribute('src', '/path/to/profile.jpg');
    });

    test('applies correct CSS classes', () => {
        render(
            <ProfileCard
                profile={mockProfile}
                isEditing={false}
                onEditToggle={mockOnEditToggle}
            />
        );

        const cardElement = screen.getByRole('img', { name: 'John Michael Doe' }).closest('.profile-card');
        expect(cardElement).toHaveClass('profile-card');
    });
});