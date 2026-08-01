import React, { useState } from 'react';
import '../../styles/components/JobSeeker/DownloadProfileData.css';

const DownloadProfileData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [downloadHistory, setDownloadHistory] = useState([
    { id: 1, date: '2025-08-15', type: 'PDF', size: '2.4 MB' },
    { id: 2, date: '2025-08-01', type: 'JSON', size: '1.1 MB' },
    { id: 3, date: '2025-07-15', type: 'CSV', size: '0.8 MB' }
  ]);

  const handleDownload = (format) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // In a real app, this would trigger a download
      console.log(`Downloading profile data as ${format}`);
      setIsLoading(false);
      
      // Add to download history
      const newDownload = {
        id: downloadHistory.length + 1,
        date: new Date().toISOString().split('T')[0],
        type: format.toUpperCase(),
        size: format === 'pdf' ? '2.4 MB' : format === 'json' ? '1.1 MB' : '0.8 MB'
      };
      
      setDownloadHistory([newDownload, ...downloadHistory]);
    }, 1500);
  };

  return (
    <div className="download-profile-data">
      <div className="download-header">
        <h3>Download Your Profile Data</h3>
        <p className="download-subtitle">
          Get a copy of your profile information in various formats
        </p>
      </div>

      <div className="download-options">
        <div className="format-option">
          <div className="format-icon pdf">
            <i className="fas fa-file-pdf"></i>
          </div>
          <div className="format-info">
            <h4>PDF Document</h4>
            <p>Professional format for job applications</p>
          </div>
          <button 
            className="download-btn primary"
            onClick={() => handleDownload('pdf')}
            disabled={isLoading}
          >
            {isLoading ? 'Preparing...' : 'Download PDF'}
          </button>
        </div>

        <div className="format-option">
          <div className="format-icon json">
            <i className="fas fa-file-code"></i>
          </div>
          <div className="format-info">
            <h4>JSON Data</h4>
            <p>Structured data for developers</p>
          </div>
          <button 
            className="download-btn secondary"
            onClick={() => handleDownload('json')}
            disabled={isLoading}
          >
            {isLoading ? 'Preparing...' : 'Download JSON'}
          </button>
        </div>

        <div className="format-option">
          <div className="format-icon csv">
            <i className="fas fa-file-csv"></i>
          </div>
          <div className="format-info">
            <h4>CSV Spreadsheet</h4>
            <p>Tabular format for data analysis</p>
          </div>
          <button 
            className="download-btn tertiary"
            onClick={() => handleDownload('csv')}
            disabled={isLoading}
          >
            {isLoading ? 'Preparing...' : 'Download CSV'}
          </button>
        </div>
      </div>

      <div className="download-history">
        <h4>Download History</h4>
        {downloadHistory.length > 0 ? (
          <div className="history-list">
            {downloadHistory.map((item) => (
              <div className="history-item" key={item.id}>
                <div className="history-icon">
                  <i className="fas fa-download"></i>
                </div>
                <div className="history-content">
                  <h5>{item.type} File</h5>
                  <p>Downloaded on {item.date}</p>
                </div>
                <div className="history-meta">
                  <span className="file-size">{item.size}</span>
                  <button className="download-again">
                    <i className="fas fa-redo"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-history">No downloads yet</p>
        )}
      </div>

      <div className="data-info">
        <h4>About Your Data</h4>
        <ul>
          <li>Includes all profile information, skills, and experience</li>
          <li>Contains application history and saved jobs</li>
          <li>Excludes private messages and password information</li>
          <li>Data is updated in real-time</li>
        </ul>
      </div>
    </div>
  );
};

export default DownloadProfileData;