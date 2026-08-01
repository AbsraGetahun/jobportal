import React, { useState } from 'react';
import '../../../styles/components/JobSeeker/JobSeekerAccount.css';
import ProfileCompletenessIndicator from './ProfileCompletenessIndicator';
import EditableForm from './EditableForm';
import ResumeUpload from './ResumeUpload';
import JobRecommendations from './JobRecommendations';
import SavedJobs from './SavedJobs';
import AccountStats from './AccountStats';
import PremiumFeatures from './PremiumFeatures';
import NotificationPreferences from './NotificationPreferences';
import PrivacySettings from './PrivacySettings';
import SocialMediaLinks from './SocialMediaLinks';
import ContactInfo from './ContactInfo';
import ActivityHistory from './ActivityHistory';
import DownloadProfileData from './DownloadProfileData';
import AccountVerification from './AccountVerification';

const JobSeekerAccount = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, City, Country',
    website: 'johndoe.com',
    degree: 'Bachelor of Science',
    fieldOfStudy: 'Computer Science',
    experience: '5 years',
    skills: [
      { id: 1, name: 'JavaScript', proficiency: 90 },
      { id: 2, name: 'React', proficiency: 85 },
      { id: 3, name: 'Node.js', proficiency: 80 },
      { id: 4, name: 'Python', proficiency: 75 }
    ],
    workHistory: [
      {
        id: 1,
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        startDate: '2020-01-01',
        endDate: 'Present',
        description: 'Led development of cloud-based applications'
      },
      {
        id: 2,
        title: 'Software Developer',
        company: 'Startup Inc',
        startDate: '2018-03-01',
        endDate: '2019-12-31',
        description: 'Developed web applications using modern frameworks'
      }
    ],
    education: [
      {
        id: 1,
        institution: 'University of Technology',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        startDate: '2014-09-01',
        endDate: '2018-06-01'
      }
    ],
    portfolio: [
      {
        id: 1,
        title: 'E-commerce Platform',
        description: 'Full-stack e-commerce solution',
        technologies: ['React', 'Node.js', 'MongoDB']
      }
    ]
  });

  const [applications] = useState([
    { id: 1, jobTitle: 'Frontend Developer', company: 'WebTech Solutions', status: 'Interview Scheduled', date: '2025-08-15' },
    { id: 2, jobTitle: 'React Developer', company: 'Innovate Co', status: 'Under Review', date: '2025-08-10' },
    { id: 3, jobTitle: 'Full Stack Engineer', company: 'Digital Systems', status: 'Rejected', date: '2025-08-05' }
  ]);

  const [savedJobs] = useState([
    { id: 1, title: 'Senior UI/UX Designer', company: 'Creative Agency', location: 'Remote', salary: '$90,000 - $120,000' },
    { id: 2, title: 'DevOps Engineer', company: 'Cloud Services', location: 'San Francisco, CA', salary: '$130,000 - $160,000' }
  ]);

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    shareWithRecruiters: true,
    showEmail: false
  });

  const [socialLinks, setSocialLinks] = useState({
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    twitter: 'https://twitter.com/johndoe'
  });

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode', !isDarkMode);
  };

  const handleProfileUpdate = (updatedData) => {
    setProfileData(prev => ({ ...prev, ...updatedData }));
  };

  const handleNotificationChange = (type) => {
    setNotifications(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handlePrivacyChange = (setting, value) => {
    setPrivacy(prev => ({ ...prev, [setting]: value }));
  };

  const handleSocialLinkChange = (platform, url) => {
    setSocialLinks(prev => ({ ...prev, [platform]: url }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'fas fa-user' },
    { id: 'applications', label: 'Applications', icon: 'fas fa-briefcase' },
    { id: 'resume', label: 'Resume', icon: 'fas fa-file-alt' },
    { id: 'jobs', label: 'Jobs', icon: 'fas fa-search' },
    { id: 'settings', label: 'Settings', icon: 'fas fa-cog' },
    { id: 'premium', label: 'Premium', icon: 'fas fa-crown' },
    { id: 'activity', label: 'Activity', icon: 'fas fa-history' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <>
            <ProfileCompletenessIndicator profileData={profileData} />
            <EditableForm 
              profileData={profileData} 
              onUpdate={handleProfileUpdate} 
            />
            <ContactInfo 
              contactInfo={{
                email: profileData.email,
                phone: profileData.phone,
                address: profileData.address,
                website: profileData.website
              }}
              onUpdate={handleProfileUpdate}
            />
            <SocialMediaLinks 
              links={socialLinks}
              onChange={handleSocialLinkChange}
            />
          </>
        );
      case 'applications':
        return (
          <>
            <AccountStats applications={applications} profileData={profileData} />
            <div className="applications-section">
              <h3>My Applications</h3>
              <div className="applications-list">
                {applications.map(app => (
                  <div key={app.id} className="application-card">
                    <div className="application-header">
                      <h4>{app.jobTitle}</h4>
                      <span className={`status ${app.status.toLowerCase().replace(' ', '-')}`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="company">{app.company}</p>
                    <p className="date">Applied on {app.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      case 'resume':
        return <ResumeUpload />;
      case 'jobs':
        return (
          <>
            <JobRecommendations />
            <SavedJobs jobs={savedJobs} />
          </>
        );
      case 'settings':
        return (
          <>
            <NotificationPreferences 
              notifications={notifications}
              onChange={handleNotificationChange}
            />
            <PrivacySettings 
              privacy={privacy}
              onChange={handlePrivacyChange}
            />
          </>
        );
      case 'premium':
        return <PremiumFeatures />;
      case 'activity':
        return <ActivityHistory />;
      default:
        return null;
    }
  };

  return (
    <div className={`job-seeker-account ${isDarkMode ? 'dark' : ''}`}>
      <div className="account-header">
        <div className="header-content">
          <h1>My Account</h1>
          <div className="header-actions">
            <button className="theme-toggle" onClick={toggleDarkMode}>
              {isDarkMode ? (
                <i className="fas fa-sun"></i>
              ) : (
                <i className="fas fa-moon"></i>
              )}
            </button>
            <button className="download-data">
              <i className="fas fa-download"></i>
              Download Data
            </button>
          </div>
        </div>
        <p className="account-subtitle">
          Manage your profile, applications, and account settings
        </p>
      </div>

      <div className="account-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={tab.icon}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="account-content">
        {renderTabContent()}
      </div>

      <div className="account-footer">
        <DownloadProfileData />
        <AccountVerification />
      </div>
    </div>
  );
};

export default JobSeekerAccount;