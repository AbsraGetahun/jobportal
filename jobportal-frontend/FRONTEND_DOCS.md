# CareerPlus Job Portal - Frontend Documentation

## Overview

The CareerPlus Job Portal frontend is a modern, responsive React application that provides an intuitive user interface for job seekers, employers, and administrators. Built with React, it leverages modern web technologies to deliver a seamless user experience across all devices.

## Technology Stack

- **React** - Core framework for building the user interface
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **Framer Motion** - Animation library for smooth transitions
- **React Icons** - Icon library for UI elements
- **CSS Modules** - Scoped styling for components

## Project Structure

```
career/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images and other media
│   ├── components/         # Reusable UI components
│   │   ├── Employer/       # Employer-specific components
│   │   ├── JobSeeker/      # Job seeker-specific components
│   │   └── JobNotification/ # Notification components
│   ├── context/            # React context providers
│   ├── pages/              # Page components
│   │   ├── Admin/          # Admin dashboard pages
│   │   ├── Auto/           # Authentication pages
│   │   ├── Employer/       # Employer dashboard pages
│   │   └── JobSeeker/      # Job seeker dashboard pages
│   ├── routes/             # Route definitions
│   ├── styles/             # CSS stylesheets
│   └── api.js             # API client configuration
├── package.json           # Project dependencies and scripts
└── vite.config.js         # Build configuration
```

## Key Features

### Authentication System

The frontend implements a complete authentication system with:
- User registration for job seekers and employers
- Login functionality with role-based access
- Password reset capabilities
- Email verification workflow
- Session management with token storage

### Job Seeker Features

#### Dashboard
- Personalized job recommendations using AI algorithms
- Application tracking with status updates
- Profile management with detailed information
- Resume upload and management
- Saved job listings
- Notification system for application updates

#### Job Search
- Advanced search with filtering by location, category, job type, etc.
- Job listing display with pagination
- Detailed job view with company information
- Application submission with cover letter and resume

#### Profile Management
- Comprehensive profile editing with all relevant fields
- Profile picture upload
- Skills and experience management
- Education history tracking
- Portfolio/project showcase
- Social media integration
- Privacy and notification settings

### Employer Features

#### Dashboard
- Company profile management
- Job posting and management
- Application tracking for posted jobs
- Applicant status management (accept/reject)
- Notification system for new applications

#### Job Management
- Create new job listings with detailed information
- Edit existing job postings
- Delete job listings
- View all posted jobs with application statistics

#### Applicant Management
- View applications for each job posting
- Review applicant profiles and resumes
- Update application status (pending, reviewed, accepted, rejected)
- Communicate with applicants

### Admin Features

#### System Management
- View all job seekers, employers, and jobs
- Manage job listings
- Verify company profiles
- Access feedback system
- Monitor platform activity

## Component Architecture

### Authentication Context

The application uses React Context for authentication state management:
- User authentication status tracking
- Token management in localStorage
- Role-based access control
- API client configuration with automatic token injection

### API Client

A centralized API client (`src/api.js`) handles all communication with the backend:
- Base URL configuration
- Request/response interceptors for token management
- Error handling and response formatting
- All API endpoints wrapped in convenient methods

### Page Components

#### Welcome Page (`/`)
The main landing page featuring:
- Hero section with call-to-action buttons
- Job search functionality
- Feature highlights
- Testimonials from users
- Statistics display
- FAQ section
- Premium features showcase
- Responsive design for all devices

#### Registration Page (`/register`)
User registration with:
- Job seeker/employer selection
- Comprehensive form validation
- Real-time error feedback
- Success redirection

#### Login Page (`/login`)
User authentication with:
- Email/password validation
- Role-based login
- Error handling
- Success redirection to appropriate dashboard

#### Job Seeker Account (`/jobseekeraccount`)
Comprehensive dashboard with:
- Profile management
- Application tracking
- Job recommendations
- Resume management
- Skills and experience tracking
- Account settings
- Notification preferences
- Privacy controls

#### Employer Account (`/employeraccount`)
Employer dashboard with:
- Company profile management
- Job posting interface
- Application tracking
- Applicant management
- Account settings

#### Job Search (`/jobsearch`)
Job listing and search interface with:
- Search and filtering capabilities
- Job listing display
- Pagination support
- Detailed job views
- Application submission

#### Job Application (`/jobapplication/:jobId`)
Job application submission with:
- Job details display
- Application form with cover letter
- Resume upload
- Validation and error handling

#### Employer Job Posting (`/employerjobposting`)
Job creation interface with:
- Comprehensive job posting form
- Validation and error handling
- Success confirmation

### Reusable Components

#### Profile Components
- ProfileCard - Displays user profile information
- EditableForm - Editable form for profile updates
- ProfileCompletenessIndicator - Visual indicator of profile completeness

#### Job Components
- JobRecommendations - AI-powered job suggestions
- AppliedJobList - List of job applications with status
- SavedJobs - List of bookmarked jobs

#### Account Components
- SecurityForm - Password change interface
- ResumeUpload - Resume file upload component
- SkillsExperience - Skills and experience management
- EducationHistory - Education background tracking
- Portfolio - Project/portfolio showcase
- NotificationPreferences - Notification settings
- PrivacySettings - Privacy controls
- AccountStats - Application statistics
- SocialMediaLinks - Social profile integration
- ContactInfo - Contact information management
- ActivityHistory - User activity tracking
- DownloadProfileData - Profile data export
- PremiumFeatures - Premium feature showcase
- AccountVerification - Account verification status

## Styling System

The application uses a modular CSS approach with:
- Base styles for consistent typography and spacing
- Component-specific styles
- Responsive design for mobile, tablet, and desktop
- Dark/light theme support
- CSS variables for consistent color palette

## Routing

The application implements client-side routing with:
- Public routes (welcome, registration, login)
- Protected routes (dashboard, profile, job search)
- Role-based route access (job seeker, employer, admin)
- Route guards for authentication validation

## State Management

The frontend uses a combination of:
- React Context for global state (authentication)
- Component-level state for UI interactions
- API client for data fetching and mutation

## Responsive Design

The application is fully responsive with:
- Mobile-first design approach
- Flexible grid layouts
- Media queries for different screen sizes
- Touch-friendly interface elements
- Optimized performance on all devices

## Performance Optimization

The frontend implements several performance optimizations:
- Code splitting for lazy loading
- Component memoization
- Efficient re-rendering
- Image optimization
- Bundle size optimization

## Accessibility

The application follows accessibility best practices:
- Semantic HTML structure
- Proper ARIA attributes
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance
- Focus management

## Error Handling

The frontend implements comprehensive error handling:
- API error interception and display
- Form validation with user feedback
- Network error handling
- Graceful degradation for failed operations
- User-friendly error messages

## Testing

The frontend includes:
- Unit tests for components
- Integration tests for user flows
- End-to-end tests for critical paths
- Accessibility testing
- Performance testing

## Deployment

The application is configured for:
- Development server with hot reloading
- Production build optimization
- Environment-specific configuration
- CI/CD pipeline integration

## Future Enhancements

Planned improvements include:
- Real-time notifications with WebSockets
- Enhanced AI matching algorithms
- Advanced analytics dashboard
- Video interview integration
- Skill assessment tools
- Payment integration for premium features
- Social networking features
- Mobile app development

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation
```bash
cd career
npm install
```

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

## Contributing

The frontend follows standard React development practices:
- Component-based architecture
- Consistent coding standards
- Git workflow for version control
- Pull request review process
- Automated testing pipeline

## Support

For issues or questions about the frontend:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information
4. Contact the development team