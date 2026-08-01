# CareerPlus Job Portal API Documentation

## Overview

The CareerPlus Job Portal API is a comprehensive RESTful API built with Laravel that provides all the necessary endpoints for a full-featured job portal. It supports user authentication, job listings, applications, company profiles, and AI-powered job recommendations.

## Base URL

```
http://localhost:8000/api
```

## Authentication

The API uses Laravel Sanctum for authentication with Bearer tokens. Most endpoints require authentication except for public job and company listings.

### How Authentication Works

1. Users register or login to obtain an access token
2. The token is included in the Authorization header for authenticated requests
3. Tokens are invalidated on logout or when the user deletes their account

## Rate Limiting

The API implements rate limiting to prevent abuse:
- Authentication endpoints: 5 requests per minute
- Search endpoints: 30 requests per minute
- Other endpoints: 60 requests per minute
- Premium users get higher rate limits

## API Endpoints

### Authentication Endpoints

#### Register User
- **Endpoint**: `POST /api/register`
- **Purpose**: Creates a new user account in the system
- **Functionality**: Validates user input, hashes password, creates user record, and generates an authentication token
- **User Access**: Public (anyone can register)
- **Request Body**:
  - `name` (string, required) - User's full name
  - `username` (string, required) - Unique username for the user
  - `email` (string, required) - Unique email address
  - `password` (string, required) - Password (minimum 8 characters)
  - `password_confirmation` (string, required) - Password confirmation
  - `degree` (string, optional) - Educational qualification
  - `fieldOfStudy` (string, optional) - Field of study
  - `graduationYear` (integer, optional) - Year of graduation
  - `experience` (string, optional) - Work experience description
  - `hasCompany` (boolean, optional) - Whether user is an employer
  - `companyName` (string, optional) - Company name (if employer)
  - `companyLocation` (string, optional) - Company location (if employer)
  - `employeesCount` (integer, optional) - Number of employees (if employer)
  - `establishmentYear` (integer, optional) - Year company was established (if employer)
- **Response**: User object with access token
- **How It Works**: 
  1. Validates all required fields
  2. Checks for unique email and username
  3. Hashes the password
  4. Creates user record in database
  5. Generates Sanctum token
  6. Returns user data and token

#### Login User
- **Endpoint**: `POST /api/login`
- **Purpose**: Authenticates existing users and provides access token
- **Functionality**: Verifies credentials and generates a new authentication token
- **User Access**: Public (registered users)
- **Request Body**:
  - `email` (string, required) - Registered email address
  - `password` (string, required) - Account password
- **Response**: Access token and token type
- **How It Works**:
  1. Finds user by email
  2. Verifies password using hash
  3. Creates new Sanctum token
  4. Returns token for use in subsequent requests

#### Logout User
- **Endpoint**: `POST /api/logout`
- **Purpose**: Invalidates the current authentication token
- **Functionality**: Deletes the token used in the request from the database
- **User Access**: Authenticated users (job seekers, employers, admins)
- **Response**: Success message
- **How It Works**:
  1. Identifies token from Authorization header
  2. Deletes token from personal_access_tokens table
  3. Returns success message

#### Get Authenticated User
- **Endpoint**: `GET /api/user`
- **Purpose**: Retrieves information about the currently authenticated user
- **Functionality**: Returns user profile data based on the authentication token
- **User Access**: Authenticated users (job seekers, employers, admins)
- **Response**: User object with all profile information
- **How It Works**:
  1. Identifies user from Authorization token
  2. Retrieves user data from database
  3. Returns complete user object

### Password Reset Endpoints

#### Send Password Reset Link
- **Endpoint**: `POST /api/password/email`
- **Purpose**: Sends a password reset link to a user's email address
- **Functionality**: Generates a reset token and sends email with reset instructions
- **User Access**: Public (anyone with a registered email)
- **Request Body**:
  - `email` (string, required) - Registered email address
- **Response**: Success message
- **How It Works**:
  1. Validates email exists in database
  2. Generates secure reset token
  3. Stores token in password_reset_tokens table
  4. Sends email with reset link

#### Reset Password
- **Endpoint**: `POST /api/password/reset`
- **Purpose**: Allows users to reset their password using a valid token
- **Functionality**: Validates reset token and updates user password
- **User Access**: Users with valid reset token
- **Request Body**:
  - `token` (string, required) - Password reset token
  - `email` (string, required) - Email address associated with token
  - `password` (string, required) - New password
  - `password_confirmation` (string, required) - New password confirmation
- **Response**: Success message
- **How It Works**:
  1. Validates token and email combination
  2. Ensures new password meets requirements
  3. Hashes and updates password in database
  4. Deletes used reset token
  5. Sends confirmation email

### Email Verification Endpoints

#### Resend Verification Email
- **Endpoint**: `POST /api/email/resend`
- **Purpose**: Sends a new email verification link to the user
- **Functionality**: Generates verification link and sends to user's email
- **User Access**: Authenticated users with unverified emails
- **Response**: Success message
- **How It Works**:
  1. Checks if user's email is already verified
  2. Generates new verification URL
  3. Sends verification email

#### Verify Email
- **Endpoint**: `GET /api/email/verify/{id}/{hash}`
- **Purpose**: Verifies a user's email address
- **Functionality**: Marks user's email as verified in the database
- **User Access**: Users with valid verification link
- **Response**: Success message
- **How It Works**:
  1. Validates user ID and hash
  2. Updates email_verified_at timestamp
  3. Returns verification success message

### Profile Management Endpoints

#### Get Profile
- **Endpoint**: `GET /api/profile`
- **Purpose**: Retrieves the authenticated user's complete profile
- **Functionality**: Returns detailed user information including job seeker or employer data
- **User Access**: Authenticated users (job seekers, employers, admins)
- **Response**: Complete user profile object
- **How It Works**:
  1. Identifies user from Authorization token
  2. Retrieves all user data including optional fields
  3. Returns formatted profile information

#### Update Profile
- **Endpoint**: `PUT /api/profile`
- **Purpose**: Updates the authenticated user's profile information
- **Functionality**: Modifies user profile data in the database
- **User Access**: Authenticated users (job seekers, employers, admins)
- **Request Body**:
  - All fields from registration are optional for update
- **Response**: Updated user object
- **How It Works**:
  1. Validates provided fields
  2. Updates user record in database
  3. Returns updated profile data

#### Update Password
- **Endpoint**: `PUT /api/profile/password`
- **Purpose**: Changes the authenticated user's password
- **Functionality**: Validates current password and updates to new password
- **User Access**: Authenticated users (job seekers, employers, admins)
- **Request Body**:
  - `current_password` (string, required) - Current account password
  - `password` (string, required) - New password
  - `password_confirmation` (string, required) - New password confirmation
- **Response**: Success message
- **How It Works**:
  1. Validates current password
  2. Ensures new password meets requirements
  3. Hashes and updates password in database
  4. Invalidates all existing tokens for security
  5. Sends confirmation email

#### Delete Account
- **Endpoint**: `DELETE /api/profile`
- **Purpose**: Permanently removes the user's account from the system
- **Functionality**: Deletes user record and all associated data
- **User Access**: Authenticated users (job seekers, employers, admins)
- **Request Body**:
  - `password` (string, required) - Account password for confirmation
- **Response**: Success message
- **How It Works**:
  1. Validates password to prevent accidental deletion
  2. Deletes user record from database
  3. Removes all associated applications, job listings, etc.
  4. Invalidates all authentication tokens
  5. Returns success message

### Job Management Endpoints

#### Get Jobs (Public)
- **Endpoint**: `GET /api/jobs`
- **Purpose**: Retrieves a list of active job listings for job seekers
- **Functionality**: Returns paginated job listings with filtering and sorting options
- **User Access**: Public (no authentication required)
- **Query Parameters**:
  - `search` (string, optional) - Search in title, description, location, category
  - `location` (string, optional) - Filter by location
  - `job_type` (string, optional) - Filter by job type (full-time, part-time, etc.)
  - `experience_level` (string, optional) - Filter by experience level (entry, mid, senior, etc.)
  - `category` (string, optional) - Filter by job category
  - `salary_min` (numeric, optional) - Minimum salary filter
  - `salary_max` (numeric, optional) - Maximum salary filter
  - `is_remote` (boolean, optional) - Filter by remote jobs
  - `company_id` (integer, optional) - Filter by company
  - `posted_after` (date, optional) - Filter jobs posted after this date
  - `posted_before` (date, optional) - Filter jobs posted before this date
  - `sort_by` (string, optional) - Sort by `title`, `created_at`, `salary`, `application_deadline`, `popularity`
  - `sort_direction` (string, optional) - Sort direction `asc` or `desc`
  - `per_page` (integer, optional) - Results per page (1-100)
- **Response**: Paginated list of jobs with employer information
- **How It Works**:
  1. Applies filters based on query parameters
  2. Sorts results according to sort options
  3. Paginates results
  4. Returns job listings with company details

#### Get Job (Public)
- **Endpoint**: `GET /api/jobs/{id}`
- **Purpose**: Retrieves detailed information about a specific job
- **Functionality**: Returns complete job details including employer information
- **User Access**: Public (no authentication required)
- **Response**: Job object with employer information
- **How It Works**:
  1. Finds job by ID
  2. Retrieves associated company information
  3. Returns complete job details

#### Create Job
- **Endpoint**: `POST /api/jobs`
- **Purpose**: Allows employers to post new job listings
- **Functionality**: Creates a new job record in the database
- **User Access**: Authenticated employers
- **Request Body**:
  - `title` (string, required) - Job title
  - `description` (string, required) - Detailed job description
  - `location` (string, required) - Job location
  - `job_type` (string, required) - Type of job (full-time, part-time, etc.)
  - `experience_level` (string, required) - Required experience level
  - `category` (string, required) - Job category
  - `salary_min` (numeric, optional) - Minimum salary
  - `salary_max` (numeric, optional) - Maximum salary
  - `salary_type` (string, optional) - Salary type (hourly, monthly, yearly)
  - `is_remote` (boolean, optional) - Whether job is remote
  - `application_deadline` (date, optional) - Deadline for applications
  - `required_skills` (array, optional) - List of required skills
  - `benefits` (array, optional) - List of job benefits
- **Response**: Created job object
- **How It Works**:
  1. Validates employer authentication
  2. Validates required job fields
  3. Associates job with employer's company
  4. Creates job record in database
  5. Returns created job with ID

#### Update Job
- **Endpoint**: `PUT /api/jobs/{id}`
- **Purpose**: Allows employers to modify their existing job listings
- **Functionality**: Updates job information in the database
- **User Access**: Authenticated employers (job owner only)
- **Request Body**:
  - All fields from job creation are optional for update
  - `is_active` (boolean, optional) - Whether job listing is active
- **Response**: Updated job object
- **How It Works**:
  1. Validates employer owns this job
  2. Updates provided fields in database
  3. Returns updated job information

#### Delete Job
- **Endpoint**: `DELETE /api/jobs/{id}`
- **Purpose**: Allows employers to remove their job listings
- **Functionality**: Permanently deletes job record from database
- **User Access**: Authenticated employers (job owner only)
- **Response**: Success message
- **How It Works**:
  1. Validates employer owns this job
  2. Deletes job record
  3. Also deletes associated applications
  4. Returns success message

#### Get My Jobs
- **Endpoint**: `GET /api/my-jobs`
- **Purpose**: Retrieves all job listings posted by the authenticated employer
- **Functionality**: Returns paginated list of employer's jobs
- **User Access**: Authenticated employers
- **Response**: Paginated list of jobs
- **How It Works**:
  1. Identifies employer from authentication token
  2. Retrieves all jobs associated with employer's company
  3. Returns paginated job listings

### Application Management Endpoints

#### Get My Applications
- **Endpoint**: `GET /api/applications`
- **Purpose**: Retrieves all job applications made by the authenticated job seeker
- **Functionality**: Returns paginated list of user's job applications
- **User Access**: Authenticated job seekers
- **Response**: Paginated list of applications with job details
- **How It Works**:
  1. Identifies user from authentication token
  2. Retrieves all applications made by user
  3. Includes associated job and company information
  4. Returns paginated results

#### Create Application
- **Endpoint**: `POST /api/applications`
- **Purpose**: Allows job seekers to apply for jobs
- **Functionality**: Creates a new job application record
- **User Access**: Authenticated job seekers
- **Request Body**:
  - `job_id` (integer, required) - ID of job to apply for
  - `cover_letter` (string, optional) - Application cover letter
  - `resume` (file, optional) - Resume file upload
- **Response**: Created application object
- **How It Works**:
  1. Validates job seeker authentication
  2. Ensures job exists and is active
  3. Prevents duplicate applications for same job
  4. Creates application record with pending status
  5. Returns application details

#### Get Application
- **Endpoint**: `GET /api/applications/{id}`
- **Purpose**: Retrieves details of a specific job application
- **Functionality**: Returns application information including job details
- **User Access**: Authenticated job seekers (application owner only)
- **Response**: Application object with job information
- **How It Works**:
  1. Validates user owns this application
  2. Retrieves application details from database
  3. Includes associated job and company information
  4. Returns complete application object

#### Update Application
- **Endpoint**: `PUT /api/applications/{id}`
- **Purpose**: Allows job seekers to modify their pending applications
- **Functionality**: Updates application information in database
- **User Access**: Authenticated job seekers (application owner only)
- **Request Body**:
  - `cover_letter` (string, optional) - Updated cover letter
- **Response**: Updated application object
- **How It Works**:
  1. Validates user owns this application
  2. Ensures application status is still pending
  3. Updates provided fields in database
  4. Returns updated application information

#### Delete Application
- **Endpoint**: `DELETE /api/applications/{id}`
- **Purpose**: Allows job seekers to withdraw pending applications
- **Functionality**: Permanently deletes application record from database
- **User Access**: Authenticated job seekers (application owner only)
- **Response**: Success message
- **How It Works**:
  1. Validates user owns this application
  2. Ensures application status is still pending
  3. Deletes application record from database
  4. Returns success message

#### Get Job Applications (Employer)
- **Endpoint**: `GET /api/jobs/{jobId}/applications`
- **Purpose**: Allows employers to view all applications for their job listings
- **Functionality**: Returns paginated list of applications for a specific job
- **User Access**: Authenticated employers (job owner only)
- **Response**: Paginated list of applications with applicant information
- **How It Works**:
  1. Validates employer owns specified job
  2. Retrieves all applications for that job
  3. Includes applicant profile information
  4. Returns paginated results

#### Update Application Status (Employer)
- **Endpoint**: `PUT /api/applications/{id}/status`
- **Purpose**: Allows employers to update the status of job applications
- **Functionality**: Changes application status in database
- **User Access**: Authenticated employers (job owner only)
- **Request Body**:
  - `status` (string, required) - One of: pending, reviewed, accepted, rejected
- **Response**: Updated application object
- **How It Works**:
  1. Validates employer owns job associated with application
  2. Updates application status field
  3. Returns updated application information

### Company Management Endpoints

#### Get Companies
- **Endpoint**: `GET /api/companies`
- **Purpose**: Retrieves a list of companies in the job portal
- **Functionality**: Returns paginated list of company profiles
- **User Access**: Public (no authentication required)
- **Query Parameters**:
  - `search` (string, optional) - Search in company name or description
  - `industry` (string, optional) - Filter by industry
  - `is_verified` (boolean, optional) - Filter by verification status
  - `sort_by` (string, optional) - Sort by `name`, `created_at`, `employees_count`
  - `sort_direction` (string, optional) - Sort direction `asc` or `desc`
  - `per_page` (integer, optional) - Results per page (1-100)
- **Response**: Paginated list of companies
- **How It Works**:
  1. Retrieves all company records from database
  2. Applies filters based on query parameters
  3. Sorts results according to sort options
  4. Returns paginated results

#### Get Company
- **Endpoint**: `GET /api/companies/{id}`
- **Purpose**: Retrieves detailed information about a specific company
- **Functionality**: Returns complete company profile
- **User Access**: Public (no authentication required)
- **Response**: Company object with job listings
- **How It Works**:
  1. Finds company by ID
  2. Includes associated job listings
  3. Returns complete company information

#### Create Company
- **Endpoint**: `POST /api/companies`
- **Purpose**: Allows users to create company profiles
- **Functionality**: Creates a new company record in database
- **User Access**: Authenticated users (typically employers)
- **Request Body**:
  - `name` (string, required) - Company name
  - All other fields from registration are optional for company creation
- **Response**: Created company object
- **How It Works**:
  1. Validates user authentication
  2. Ensures company name is unique
  3. Creates company record in database
  4. Returns company details with ID

#### Update Company
- **Endpoint**: `PUT /api/companies/{id}`
- **Purpose**: Allows authorized users to modify company profiles
- **Functionality**: Updates company information in database
- **User Access**: Authenticated employers (company owner) or admins
- **Request Body**:
  - All company fields are optional for update
  - `is_verified` (boolean, optional) - Verification status (admins only)
- **Response**: Updated company object
- **How It Works**:
  1. Validates user owns company or is admin
  2. Updates provided fields in database
  3. Returns updated company information

#### Delete Company
- **Endpoint**: `DELETE /api/companies/{id}`
- **Purpose**: Allows authorized users to remove company profiles
- **Functionality**: Permanently deletes company record and associated jobs
- **User Access**: Authenticated employers (company owner) or admins
- **Response**: Success message
- **How It Works**:
  1. Validates user owns company or is admin
  2. Deletes company record
  3. Also deletes associated job listings and applications
  4. Returns success message

#### Verify Company (Admin)
- **Endpoint**: `POST /api/companies/{id}/verify`
- **Purpose**: Allows admins to verify company profiles
- **Functionality**: Sets company verification status to true
- **User Access**: Authenticated admins only
- **Response**: Updated company object
- **How It Works**:
  1. Validates admin authentication
  2. Updates company's is_verified field to true
  3. Returns updated company information

### AI Job Recommendations Endpoints

#### Get Personalized Recommendations
- **Endpoint**: `GET /api/recommendations`
- **Purpose**: Provides personalized job recommendations for users
- **Functionality**: Combines profile-based, history-based, and popularity-based recommendations
- **User Access**: Authenticated users (job seekers)
- **Query Parameters**:
  - `limit` (integer, optional) - Number of recommendations to return (1-100)
  - `category` (string, optional) - Filter recommendations by category
  - `job_type` (string, optional) - Filter recommendations by job type
  - `experience_level` (string, optional) - Filter recommendations by experience level
- **Response**: List of recommended jobs with recommendation scores
- **How It Works**:
  1. Identifies user from authentication token
  2. Combines multiple recommendation algorithms:
     - Profile-based matching (30% weight)
     - History-based matching (40% weight)
     - Popularity-based matching (20% weight)
     - Random exploration (10% weight)
  3. Applies filters if provided
  4. Returns sorted list of recommended jobs with relevance scores

#### Get Profile-Based Recommendations
- **Endpoint**: `GET /api/recommendations/profile`
- **Purpose**: Recommends jobs based on user's profile information
- **Functionality**: Matches job requirements with user's education and experience
- **User Access**: Authenticated users (job seekers)
- **Query Parameters**:
  - `limit` (integer, optional) - Number of recommendations to return (1-100)
  - `category` (string, optional) - Filter recommendations by category
  - `job_type` (string, optional) - Filter recommendations by job type
- **Response**: List of jobs matched to user's profile with match scores
- **How It Works**:
  1. Analyzes user's education and experience fields
  2. Matches with job requirements and categories
  3. Calculates relevance scores based on:
     - Field of study matching (40%)
     - Experience level matching (30%)
     - Category matching (20%)
     - Location matching (10%)
  4. Returns sorted list of matching jobs

#### Get History-Based Recommendations
- **Endpoint**: `GET /api/recommendations/history`
- **Purpose**: Recommends jobs similar to those the user has previously applied for
- **Functionality**: Uses application history to suggest similar positions
- **User Access**: Authenticated users (job seekers) with application history
- **Query Parameters**:
  - `limit` (integer, optional) - Number of recommendations to return (1-100)
  - `category` (string, optional) - Filter recommendations by category
  - `job_type` (string, optional) - Filter recommendations by job type
- **Response**: List of jobs similar to previously applied positions with match scores
- **How It Works**:
  1. Retrieves user's application history
  2. Analyzes job categories and types from previous applications
  3. Finds similar active jobs in database
  4. Calculates similarity scores based on:
     - Category similarity (40%)
     - Job type similarity (30%)
     - Experience level similarity (20%)
     - Location similarity (10%)
  5. Returns sorted list of similar jobs

#### Get Trending Jobs
- **Endpoint**: `GET /api/recommendations/trending`
- **Purpose**: Recommends currently popular jobs based on views and applications
- **Functionality**: Returns jobs with high engagement metrics
- **User Access**: Public (no authentication required)
- **Query Parameters**:
  - `limit` (integer, optional) - Number of recommendations to return (1-100)
  - `category` (string, optional) - Filter recommendations by category
  - `job_type` (string, optional) - Filter recommendations by job type
- **Response**: List of trending jobs with popularity scores
- **How It Works**:
  1. Calculates job popularity based on:
     - Recent views (50%)
     - Recent applications (30%)
     - Time since posting (20%)
  2. Applies filters if provided
  3. Returns sorted list of trending jobs

### Job View Tracking Endpoints

#### Track Job View
- **Endpoint**: `POST /api/jobs/{jobId}/track-view`
- **Purpose**: Records when a user views a job listing to improve recommendations
- **Functionality**: Updates user's job view history
- **User Access**: Authenticated users (job seekers)
- **Response**: Success message
- **How It Works**:
  1. Identifies user from authentication token
  2. Records job view in job_views table
  3. Updates view count and timestamp
  4. Returns success message

#### Get Most Viewed Jobs
- **Endpoint**: `GET /api/job-views/most-viewed`
- **Purpose**: Retrieves user's most frequently viewed job listings
- **Functionality**: Returns sorted list of jobs based on view frequency
- **User Access**: Authenticated users (job seekers)
- **Query Parameters**:
  - `limit` (integer, optional) - Number of jobs to return (1-100)
- **Response**: List of user's most viewed jobs with view counts
- **How It Works**:
  1. Identifies user from authentication token
  2. Retrieves job view records for user
  3. Sorts by view count
  4. Returns formatted list of most viewed jobs

### Advanced Search Endpoints

#### Advanced Job Search
- **Endpoint**: `POST /api/jobs/advanced-search`
- **Purpose**: Provides advanced search capabilities with complex filtering
- **Functionality**: Allows complex search queries with multiple criteria
- **User Access**: Public (no authentication required)
- **Request Body**:
  - `keywords` (string, optional) - Search keywords
  - `location` (string, optional) - Job location
  - `job_types` (array, optional) - List of job types to include
  - `experience_levels` (array, optional) - List of experience levels to include
  - `categories` (array, optional) - List of categories to include
  - `salary_range` (object, optional) - Salary range with min and max values
  - `is_remote` (boolean, optional) - Filter by remote jobs
  - `company_ids` (array, optional) - List of company IDs to include
  - `posted_date_range` (object, optional) - Date range for job posting dates
  - `required_skills` (array, optional) - List of required skills
  - `sort_by` (string, optional) - Sort by `relevance`, `date`, `salary`, `popularity`
  - `sort_direction` (string, optional) - Sort direction `asc` or `desc`
  - `page` (integer, optional) - Page number for pagination
  - `per_page` (integer, optional) - Results per page (1-100)
- **Response**: Paginated list of jobs with relevance scores
- **How It Works**:
  1. Parses complex search criteria
  2. Builds optimized database query
  3. Calculates relevance scores for each result
  4. Returns paginated results with metadata

#### Search Suggestions
- **Endpoint**: `GET /api/search/suggestions`
- **Purpose**: Provides autocomplete suggestions for search queries
- **Functionality**: Returns relevant suggestions based on partial input
- **User Access**: Public (no authentication required)
- **Query Parameters**:
  - `query` (string, required) - Partial search query
  - `type` (string, optional) - Type of suggestions: `jobs`, `companies`, `categories`, `locations`
  - `limit` (integer, optional) - Number of suggestions to return (1-20)
- **Response**: List of search suggestions
- **How It Works**:
  1. Analyzes partial query input
  2. Searches relevant fields based on type
  3. Returns ranked suggestions with match scores

#### Save Search
- **Endpoint**: `POST /api/search/saved`
- **Purpose**: Allows users to save search queries for later use
- **Functionality**: Stores search criteria for future reference
- **User Access**: Authenticated users (job seekers)
- **Request Body**:
  - `name` (string, required) - Name for the saved search
  - `criteria` (object, required) - Search criteria to save
- **Response**: Saved search object
- **How It Works**:
  1. Validates user authentication
  2. Stores search criteria in database
  3. Returns saved search with ID

#### Get Saved Searches
- **Endpoint**: `GET /api/search/saved`
- **Purpose**: Retrieves user's saved search queries
- **Functionality**: Returns list of previously saved searches
- **User Access**: Authenticated users (job seekers)
- **Response**: List of saved searches
- **How It Works**:
  1. Identifies user from authentication token
  2. Retrieves saved searches from database
  3. Returns formatted list of saved searches

#### Delete Saved Search
- **Endpoint**: `DELETE /api/search/saved/{id}`
- **Purpose**: Removes a saved search query
- **Functionality**: Deletes saved search from database
- **User Access**: Authenticated users (job seekers, search owner only)
- **Response**: Success message
- **How It Works**:
  1. Validates user owns this saved search
  2. Deletes saved search record
  3. Returns success message

## Error Handling

The API returns appropriate HTTP status codes and error messages:
- `401 Unauthorized` - For authentication failures
- `403 Forbidden` - For access denied to resources
- `404 Not Found` - For non-existent resources
- `422 Unprocessable Entity` - For validation errors
- `500 Internal Server Error` - For server-side errors

## Testing the API

1. **Register a new user**:
   ```
   POST /api/register
   Content-Type: application/json
   
   {
     "name": "John Doe",
     "username": "johndoe",
     "email": "john@example.com",
     "password": "password123",
     "password_confirmation": "password123"
   }
   ```

2. **Login to get token**:
   ```
   POST /api/login
   Content-Type: application/json
   
   {
     "email": "john@example.com",
     "password": "password123"
   }
   ```

3. **Use token for authenticated requests**:
   ```
   Authorization: Bearer YOUR_ACCESS_TOKEN
   ```

## Security Considerations

- All passwords are securely hashed using bcrypt
- Authentication tokens are randomly generated
- Input validation is performed on all endpoints
- SQL injection protection through Laravel's query builder
- XSS prevention through proper response formatting
- CSRF protection through Sanctum's token system