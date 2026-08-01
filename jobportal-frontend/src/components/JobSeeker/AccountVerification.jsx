import React, { useState } from 'react';
import '../../styles/components/JobSeeker/AccountVerification.css';

const AccountVerification = () => {
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, submitted, verified, rejected
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Government ID', status: 'verified', date: '2025-08-01' },
    { id: 2, name: 'Email Address', status: 'verified', date: '2025-07-15' },
    { id: 3, name: 'Phone Number', status: 'pending', date: null }
  ]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const verificationLevels = [
    {
      level: 'Basic',
      description: 'Email and phone verification',
      benefits: ['Apply to jobs', 'Save job listings', 'Receive notifications'],
      completed: true
    },
    {
      level: 'Standard',
      description: 'Identity verification',
      benefits: ['Enhanced profile visibility', 'Priority job alerts', 'Access to premium jobs'],
      completed: verificationStatus === 'verified'
    },
    {
      level: 'Premium',
      description: 'Professional verification',
      benefits: ['Top profile visibility', 'Direct messaging from employers', 'Exclusive job opportunities'],
      completed: false
    }
  ];

  const handleDocumentUpload = (documentType) => {
    setSelectedDocument(documentType);
    setIsUploading(true);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadProgress(0);
          
          // Update document status
          setDocuments(prevDocs => 
            prevDocs.map(doc => 
              doc.name === documentType 
                ? { ...doc, status: 'submitted', date: new Date().toISOString().split('T')[0] } 
                : doc
            )
          );
          
          setVerificationStatus('submitted');
          return 0;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <i className="fas fa-check-circle verified"></i>;
      case 'pending':
        return <i className="fas fa-clock pending"></i>;
      case 'submitted':
        return <i className="fas fa-paper-plane submitted"></i>;
      case 'rejected':
        return <i className="fas fa-times-circle rejected"></i>;
      default:
        return <i className="fas fa-question-circle"></i>;
    }
  };

  const getStatusClass = (status) => {
    return `status-badge ${status}`;
  };

  const requiredDocuments = [
    { name: 'Government ID', description: 'Passport, Driver\'s License, or National ID' },
    { name: 'Proof of Address', description: 'Utility bill or bank statement (within 3 months)' },
    { name: 'Professional Photo', description: 'Clear headshot for your profile' }
  ];

  return (
    <div className="account-verification">
      <div className="verification-header">
        <h3>Account Verification</h3>
        <p className="verification-subtitle">
          Verify your identity to unlock premium features and build trust with employers
        </p>
      </div>

      <div className="verification-status">
        <div className="status-header">
          <h4>Verification Status</h4>
          <div className={`status-indicator ${verificationStatus}`}>
            {verificationStatus === 'verified' && <i className="fas fa-check-circle"></i>}
            {verificationStatus === 'pending' && <i className="fas fa-clock"></i>}
            {verificationStatus === 'submitted' && <i className="fas fa-paper-plane"></i>}
            {verificationStatus === 'rejected' && <i className="fas fa-times-circle"></i>}
            <span>{verificationStatus.charAt(0).toUpperCase() + verificationStatus.slice(1)}</span>
          </div>
        </div>
        
        <div className="verification-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: verificationStatus === 'verified' ? '100%' : 
                       verificationStatus === 'submitted' ? '66%' : '33%' 
              }}
            ></div>
          </div>
          <div className="progress-steps">
            <div className={`step ${verificationStatus !== 'pending' ? 'completed' : ''}`}>
              <i className="fas fa-envelope"></i>
              <span>Email Verified</span>
            </div>
            <div className={`step ${verificationStatus === 'submitted' || verificationStatus === 'verified' ? 'completed' : ''}`}>
              <i className="fas fa-id-card"></i>
              <span>Documents Submitted</span>
            </div>
            <div className={`step ${verificationStatus === 'verified' ? 'completed' : ''}`}>
              <i className="fas fa-user-check"></i>
              <span>Verification Complete</span>
            </div>
          </div>
        </div>
      </div>

      <div className="verification-levels">
        <h4>Verification Levels</h4>
        <div className="levels-container">
          {verificationLevels.map((level, index) => (
            <div 
              key={index} 
              className={`level-card ${level.completed ? 'completed' : ''}`}
            >
              <div className="level-header">
                <h5>{level.level}</h5>
                {level.completed && <i className="fas fa-check-circle completed-icon"></i>}
              </div>
              <p className="level-description">{level.description}</p>
              <ul className="level-benefits">
                {level.benefits.map((benefit, benefitIndex) => (
                  <li key={benefitIndex}>
                    <i className="fas fa-check"></i>
                    {benefit}
                  </li>
                ))}
              </ul>
              {!level.completed && (
                <button className="upgrade-btn">
                  Upgrade to {level.level}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="document-verification">
        <h4>Document Verification</h4>
        <p className="document-subtitle">
          Submit the following documents to complete your verification
        </p>
        
        <div className="documents-container">
          {requiredDocuments.map((doc, index) => {
            const document = documents.find(d => d.name === doc.name) || { status: 'pending', date: null };
            return (
              <div key={index} className="document-card">
                <div className="document-info">
                  <h5>{doc.name}</h5>
                  <p>{doc.description}</p>
                  {document.date && (
                    <p className="document-date">Submitted on {document.date}</p>
                  )}
                </div>
                <div className="document-status">
                  <div className={getStatusClass(document.status)}>
                    {getStatusIcon(document.status)}
                    <span>{document.status.charAt(0).toUpperCase() + document.status.slice(1)}</span>
                  </div>
                  {document.status === 'pending' && (
                    <button 
                      className="upload-btn"
                      onClick={() => handleDocumentUpload(doc.name)}
                      disabled={isUploading && selectedDocument === doc.name}
                    >
                      {isUploading && selectedDocument === doc.name ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i> Uploading...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-upload"></i> Upload
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {isUploading && selectedDocument && (
          <div className="upload-progress">
            <p>Uploading {selectedDocument}...</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <span>{uploadProgress}%</span>
          </div>
        )}
      </div>

      <div className="verification-benefits">
        <h4>Why Verify Your Account?</h4>
        <div className="benefits-grid">
          <div className="benefit-item">
            <div className="benefit-icon">
              <i className="fas fa-briefcase"></i>
            </div>
            <h5>Increased Job Opportunities</h5>
            <p>Verified profiles get 3x more interview requests</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <h5>Enhanced Security</h5>
            <p>Protect your account from unauthorized access</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <h5>Better Matching</h5>
            <p>Get matched with jobs that fit your verified skills</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">
              <i className="fas fa-star"></i>
            </div>
            <h5>Trust with Employers</h5>
            <p>Stand out with a verified profile badge</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountVerification;