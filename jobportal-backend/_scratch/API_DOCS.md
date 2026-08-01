# Job Portal API Documentation

## Authentication

### Register
- **Endpoint**: `POST /api/register`
- **Description**: Register a new user
- **Request Body**:
  - `name` (string, required)
  - `username` (string, required)
  - `email` (string, required)
  - `password` (string, required)
  - `password_confirmation` (string, required)
  - `degree` (string, optional)
  - `fieldOfStudy` (string, optional)
  - `graduationYear` (integer, optional)
  - `experience` (string, optional)
  - `hasCompany` (boolean, optional)
  - `companyName` (string, optional)
  - `companyLocation` (string, optional)
  - `employeesCount` (integer, optional)
  - `establishmentYear` (integer, optional)
- **Response**: User object with access token

### Login
- **Endpoint**: `POST /api/login`
- **Description**: Login to get access token
- **Request Body**:
  - `email` (string, required)
  - `password` (string, required)
- **Response**: Access token

### Logout
- **Endpoint**: `POST /api/logout`
- **Description**: Logout and invalidate access token
- **Authentication**: Required
- **Response**: Success message

### Get Authenticated User
- **Endpoint**: `GET /api/user`
- **Description**: Get the authenticated user's information
- **Authentication**: Required
- **Response**: User object

## Password Reset

### Send Reset Link
- **Endpoint**: `POST /api/password/email`
- **Description**: Send password reset link to user's email
- **Request Body**:
  - `email` (string, required)
- **Response**: Success message

### Reset Password
- **Endpoint**: `POST /api/password/reset`
- **Description**: Reset user's password
- **Request Body**:
  - `token` (string, required)
  - `email` (string, required)
  - `password` (string, required)
  - `password_confirmation` (string, required)
- **Response**: Success message

## Email Verification

### Resend Verification Email
- **Endpoint**: `POST /api/email/resend`
- **Description**: Resend email verification link
- **Authentication**: Required
- **Response**: Success message

### Verify Email
- **Endpoint**: `GET /api/email/verify/{id}/{hash}`
- **Description**: Verify user's email address
- **Response**: Success message

## Profile Management

### Get Profile
- **Endpoint**: `GET /api/profile`
- **Description**: Get the authenticated user's profile
- **Authentication**: Required
- **Response**: User object

### Update Profile
- **Endpoint**: `PUT /api/profile`
- **Description**: Update the authenticated user's profile
- **Authentication**: Required
- **Request Body**:
  - `name` (string, optional)
  - `username` (string, optional)
  - `email` (string, optional)
  - `degree` (string, optional)
  - `fieldOfStudy` (string, optional)
  - `graduationYear` (integer, optional)
  - `experience` (string, optional)
  - `hasCompany` (boolean, optional)
  - `companyName` (string, optional)
  - `companyLocation` (string, optional)
  - `employeesCount` (integer, optional)
  - `establishmentYear` (integer, optional)
- **Response**: Updated user object

### Update Password
- **Endpoint**: `PUT /api/profile/password`
- **Description**: Update the authenticated user's password
- **Authentication**: Required
- **Request Body**:
  - `current_password` (string, required)
  - `password` (string, required)
  - `password_confirmation` (string, required)
- **Response**: Success message

### Delete Account
- **Endpoint**: `DELETE /api/profile`
- **Description**: Delete the authenticated user's account
- **Authentication**: Required
- **Request Body**:
  - `password` (string, required)
- **Response**: Success message

## Job Management

### Get Jobs (Public)
- **Endpoint**: `GET /api/jobs`
- **Description**: Get a list of active jobs
- **Query Parameters**:
  - `search` (string, optional) - Search in title, description, location, category
  - `location` (string, optional) - Filter by location
  - `job_type` (string, optional) - Filter by job type (full-time, part-time, etc.)
  - `experience_level` (string, optional) - Filter by experience level (entry, mid, senior, etc.)
  - `category` (string, optional) - Filter by job category
  - `salary_min` (numeric, optional) - Minimum salary filter
  - `salary_max` (numeric, optional) - Maximum salary filter
  - `is_remote` (boolean, optional) - Filter by remote jobs
  - `sort_by` (string, optional) - Sort by `title`, `created_at`, or `salary`
  - `sort_direction` (string, optional) - Sort direction `asc` or `desc`
  - `per_page` (integer, optional) - Results per page (1-100)
- **Response**: Paginated list of jobs

### Get Job (Public)
- **Endpoint**: `GET /api/jobs/{id}`
- **Description**: Get details of a specific job
- **Response**: Job object with employer information

### Create Job
- **Endpoint**: `POST /api/jobs`
- **Description**: Create a new job listing
- **Authentication**: Required
- **Request Body**:
  - `title` (string, required)
  - `description` (string, required)
  - `location` (string, required)
  - `job_type` (string, required)
  - `experience_level` (string, required)
  - `salary_min` (numeric, optional)
  - `salary_max` (numeric, optional)
  - `salary_type` (string, optional)
  - `category` (string, required)
  - `is_remote` (boolean, optional)
  - `application_deadline` (date, optional)
- **Response**: Created job object

### Update Job
- **Endpoint**: `PUT /api/jobs/{id}`
- **Description**: Update a job listing
- **Authentication**: Required (job owner only)
- **Request Body**:
  - `title` (string, optional)
  - `description` (string, optional)
  - `location` (string, optional)
  - `job_type` (string, optional)
  - `experience_level` (string, optional)
  - `salary_min` (numeric, optional)
  - `salary_max` (numeric, optional)
  - `salary_type` (string, optional)
  - `category` (string, optional)
  - `is_remote` (boolean, optional)
  - `is_active` (boolean, optional)
  - `application_deadline` (date, optional)
- **Response**: Updated job object

### Delete Job
- **Endpoint**: `DELETE /api/jobs/{id}`
- **Description**: Delete a job listing
- **Authentication**: Required (job owner only)
- **Response**: Success message

### Get My Jobs
- **Endpoint**: `GET /api/my-jobs`
- **Description**: Get jobs posted by the authenticated employer
- **Authentication**: Required
- **Response**: Paginated list of jobs

## Application Management

### Get My Applications
- **Endpoint**: `GET /api/applications`
- **Description**: Get applications made by the authenticated user
- **Authentication**: Required
- **Response**: Paginated list of applications

### Create Application
- **Endpoint**: `POST /api/applications`
- **Description**: Apply for a job
- **Authentication**: Required
- **Request Body**:
  - `job_id` (integer, required)
  - `cover_letter` (string, optional)
- **Response**: Created application object

### Get Application
- **Endpoint**: `GET /api/applications/{id}`
- **Description**: Get details of a specific application
- **Authentication**: Required (application owner only)
- **Response**: Application object with job information

### Update Application
- **Endpoint**: `PUT /api/applications/{id}`
- **Description**: Update an application (only allowed if status is pending)
- **Authentication**: Required (application owner only)
- **Request Body**:
  - `cover_letter` (string, optional)
- **Response**: Updated application object

### Delete Application
- **Endpoint**: `DELETE /api/applications/{id}`
- **Description**: Delete an application (only allowed if status is pending)
- **Authentication**: Required (application owner only)
- **Response**: Success message

### Get Job Applications (Employer)
- **Endpoint**: `GET /api/jobs/{jobId}/applications`
- **Description**: Get applications for a specific job
- **Authentication**: Required (job owner only)
- **Response**: Paginated list of applications

### Update Application Status (Employer)
- **Endpoint**: `PUT /api/applications/{id}/status`
- **Description**: Update the status of an application
- **Authentication**: Required (job owner only)
- **Request Body**:
  - `status` (string, required) - One of: pending, reviewed, accepted, rejected
- **Response**: Updated application object

## Company Management

### Get Companies
- **Endpoint**: `GET /api/companies`
- **Description**: Get a list of companies
- **Response**: Paginated list of companies

### Get Company
- **Endpoint**: `GET /api/companies/{id}`
- **Description**: Get details of a specific company
- **Response**: Company object

### Create Company
- **Endpoint**: `POST /api/companies`
- **Description**: Create a new company
- **Authentication**: Required
- **Request Body**:
  - `name` (string, required)
  - `logo` (string, optional)
  - `description` (string, optional)
  - `industry` (string, optional)
  - `website` (string, optional)
  - `phone` (string, optional)
  - `email` (string, optional)
  - `address` (string, optional)
  - `city` (string, optional)
  - `state` (string, optional)
  - `country` (string, optional)
  - `postal_code` (string, optional)
  - `employees_count` (integer, optional)
  - `establishment_year` (integer, optional)
- **Response**: Created company object

### Update Company
- **Endpoint**: `PUT /api/companies/{id}`
- **Description**: Update a company
- **Authentication**: Required (admin or company owner)
- **Request Body**:
  - `name` (string, optional)
  - `logo` (string, optional)
  - `description` (string, optional)
  - `industry` (string, optional)
  - `website` (string, optional)
  - `phone` (string, optional)
  - `email` (string, optional)
  - `address` (string, optional)
  - `city` (string, optional)
  - `state` (string, optional)
  - `country` (string, optional)
  - `postal_code` (string, optional)
  - `employees_count` (integer, optional)
  - `establishment_year` (integer, optional)
  - `is_verified` (boolean, optional)
- **Response**: Updated company object

### Delete Company
- **Endpoint**: `DELETE /api/companies/{id}`
- **Description**: Delete a company
- **Authentication**: Required (admin or company owner)
- **Response**: Success message

### Verify Company (Admin)
- **Endpoint**: `POST /api/companies/{id}/verify`
- **Description**: Verify a company
- **Authentication**: Required (admin only)
- **Response**: Updated company object

## AI Job Recommendations

### Get Personalized Recommendations
- **Endpoint**: `GET /api/recommendations`
- **Description**: Get personalized job recommendations based on profile, history, and popularity
- **Authentication**: Required
- **Query Parameters**:
  - `limit` (integer, optional) - Number of recommendations to return (1-100)
- **Response**: List of recommended jobs with recommendation scores

### Get Profile-Based Recommendations
- **Endpoint**: `GET /api/recommendations/profile`
- **Description**: Get job recommendations based on user's profile information
- **Authentication**: Required
- **Query Parameters**:
  - `limit` (integer, optional) - Number of recommendations to return (1-100)
- **Response**: List of jobs matched to user's profile with match scores

### Get History-Based Recommendations
- **Endpoint**: `GET /api/recommendations/history`
- **Description**: Get job recommendations based on user's application history
- **Authentication**: Required
- **Query Parameters**:
  - `limit` (integer, optional) - Number of recommendations to return (1-100)
- **Response**: List of jobs similar to previously applied positions with match scores

## Job View Tracking

### Track Job View
- **Endpoint**: `POST /api/jobs/{jobId}/track-view`
- **Description**: Track when a user views a job (used to improve recommendations)
- **Authentication**: Required
- **Response**: Success message

### Get Most Viewed Jobs
- **Endpoint**: `GET /api/job-views/most-viewed`
- **Description**: Get user's most viewed jobs
- **Authentication**: Required
- **Query Parameters**:
  - `limit` (integer, optional) - Number of jobs to return (1-100)
- **Response**: List of user's most viewed jobs with view counts