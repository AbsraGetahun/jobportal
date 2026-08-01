import { Routes, Route, Navigate } from 'react-router-dom';
//import React from 'react';
import React, { useEffect } from 'react';

import { useAuth } from '../context/AuthContext';
import Login from '../pages/Auto/Login';
import Register from '../pages/Auto/Register';
import Dashboard from '../pages/Dashboard';
// JobSeeker Imports

import Welcome from '../pages/JobSeeker/Welcome';
import JobApplication from '../pages/JobSeeker/JobApplication';

import NotificationList from '../pages/JobSeeker/NotificationList';
import NotificationDetail from '../pages/JobSeeker/NotificationDetail';

import JobSeekerAccount from '../pages/JobSeeker/JobSeekerAccount';
import JobSearch from '../pages/JobSeeker/JobSearch';
import Resume from '../pages/JobSeeker/Resume';
// Employer Imports

import EmployerAccount from '../pages/Employer/EmployerAccount';
import PaymentPage from '../pages/PaymentPage';
import EmployerJobPosting from '../pages/Employer/EmployerJobPosting';
import EmployerNotifications from '../pages/Employer/EmployerNotifications';

// Admin Imports
import AdminDashboard from '../pages/Admin/AdminDashboard';
import AdminProfile from '../pages/Admin/AdminProfile';
import AdminJobSeekerList from '../pages/Admin/AdminJobSeekerList';
import AdminJobSeekerDetail from '../pages/Admin/AdminJobSeekerDetail';
import AdminEmployerList from '../pages/Admin/AdminEmployerList';
import AdminEmployerDetail from '../pages/Admin/AdminEmployerDetail';
import AdminPostedJobList from '../pages/Admin/AdminPostedJobList';
import AdminPostedJobDetail from '../pages/Admin/AdminPostedJobDetail';
import AdminFeedbackList from '../pages/Admin/AdminFeedbackList';
import AdminFeedbackDetail from '../pages/Admin/AdminFeedbackDetail';
import AdminApplicationList from '../pages/Admin/AdminApplicationList';
import AdminApplicationDetail from '../pages/Admin/AdminApplicationDetail';
import AdminReports from '../pages/Admin/AdminReports';
import AdminFraudAlerts from '../pages/Admin/AdminFraudAlerts';
import AdminCMS from '../pages/Admin/AdminCMS';
import AdminSupport from '../pages/Admin/AdminSupport';
import AdminSystemSettings from '../pages/Admin/AdminSystemSettings';
import AdminNotifications from '../pages/Admin/AdminNotifications';

import ProtectedRoute from '../components/ProtectedRoute';

import JobSeekersList from '../testJobSeekersList';
import App from '../App';

function Logout() {
  const { logout } = useAuth();
  useEffect(() => { logout(); }, []);
  return <Navigate to="/login" replace />;
}

function RegisterAndLogout() {
  const { logout } = useAuth();
  useEffect(() => { logout(); }, []);
  return <Navigate to="/register" replace />;
}

// PublicRoute Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => (
    <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Welcome />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register-and-logout" element={<RegisterAndLogout />} />
        <Route path="/payment" element={<PaymentPage />} />

        {/* JobSeeker Routes */}
        <Route element={<ProtectedRoute allowedUserTypes={['jobseeker']} />}>
            <Route path="/jobseekeraccount" element={<JobSeekerAccount />} />
            <Route path="/jobsearch" element={<JobSearch />} />
            <Route path="/jobapplication" element={<JobApplication />} />
            <Route path="/jobapplication/:jobId" element={<JobApplication />} />
            <Route path="/jobs/:jobId/apply" element={<JobApplication />} />
            <Route path="/notification/:id" element={<NotificationDetail />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/notificationlist" element={<NotificationList />} />
        </Route>

        {/* Employer Routes */}
        <Route element={<ProtectedRoute allowedUserTypes={['employer']} />}>
            <Route path="/" element={<Welcome />} />
            <Route path="/employeraccount" element={<EmployerAccount />} />
            <Route path="/employerjobposting" element={<EmployerJobPosting />} />
            <Route path="/employernotifications" element={<EmployerNotifications />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedUserTypes={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />

            <Route path="/admin/employers" element={<AdminEmployerList />} />
            <Route path="/admin/employers/:id" element={<AdminEmployerDetail />} />
            <Route path="/admin/jobseekers" element={<AdminJobSeekerList />} />
            <Route path="/admin/jobseekers/:id" element={<AdminJobSeekerDetail />} />
            <Route path="/admin/jobs" element={<AdminPostedJobList />} />
            <Route path="/admin/jobseekerslist" element={<JobSeekersList />} />
            <Route path="/admin/jobs/:jobId" element={<AdminPostedJobDetail />} />
            <Route path="/admin/feedback" element={<AdminFeedbackList />} />
            <Route path="/admin/feedback/:feedbackId" element={<AdminFeedbackDetail />} />

            {/* New Admin Routes */}
            <Route path="/admin/applications" element={<AdminApplicationList />} />
            <Route path="/admin/applications/:id" element={<AdminApplicationDetail />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/fraud" element={<AdminFraudAlerts />} />
            <Route path="/admin/cms" element={<AdminCMS />} />
            <Route path="/admin/support" element={<AdminSupport />} />
            <Route path="/admin/settings" element={<AdminSystemSettings />} />
        </Route>

        {/* Catch all unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />
    </Routes>
    
);

export default AppRoutes;

