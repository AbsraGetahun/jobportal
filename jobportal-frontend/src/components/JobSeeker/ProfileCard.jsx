import { motion } from 'framer-motion';
import { FiEdit, FiPhone, FiBriefcase, FiBook, FiMapPin, FiUser, FiMail, FiCalendar, FiUsers, FiLoader } from 'react-icons/fi';
import { useState, useCallback } from 'react';

// Helper function to get icon description for accessibility
const getIconDescription = (iconName) => {
  const descriptions = {
    FiEdit: 'Edit profile',
    FiPhone: 'Phone number',
    FiBriefcase: 'Field of study',
    FiBook: 'Degree',
    FiMapPin: 'Location',
    FiUser: 'User',
    FiMail: 'Email',
    FiCalendar: 'Age',
    FiUsers: 'Gender'
  };
  return descriptions[iconName] || '';
};

const ProfileCard = ({ profile, isEditing, onEditToggle }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleEditClick = useCallback(async (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            // Add a small delay for better UX feedback
            await new Promise(resolve => setTimeout(resolve, 100));

            if (typeof onEditToggle === 'function') {
                onEditToggle();
            } else {
                throw new Error('Edit toggle function not provided');
            }
        } catch (err) {
            console.error('Error toggling edit mode:', err);
            setError('Failed to enter edit mode. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, onEditToggle]);

    const handleKeyDown = useCallback((event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleEditClick(event);
        }
    }, [handleEditClick]);

    return (
        <motion.div
            className="profile-card"
            whileHover={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="profile-header">
                <div className="profile-pic-container">
                    <img
                        src={profile.profilePic}
                        alt={`${profile.firstName} ${profile.lastName}`}
                        className="profile-pic"
                    />
                    {!isEditing && (
                        <motion.button
                            className={`edit-icon ${isLoading ? 'loading' : ''} ${error ? 'error' : ''}`}
                            onClick={handleEditClick}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            whileHover={!isLoading ? { scale: 1.1 } : {}}
                            whileTap={!isLoading ? { scale: 0.9 } : {}}
                            title={error || "Edit Profile"}
                            aria-label="Edit profile information"
                            aria-describedby={error ? "edit-error" : undefined}
                            role="button"
                            tabIndex={0}
                            style={{
                                zIndex: 10,
                                position: 'relative'
                            }}
                        >
                            {isLoading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                    <FiLoader />
                                </motion.div>
                            ) : (
                                <FiEdit />
                            )}
                        </motion.button>
                    )}
                    {error && (
                        <div
                            id="edit-error"
                            className="edit-error-message"
                            role="alert"
                            aria-live="polite"
                        >
                            {error}
                        </div>
                    )}
                </div>
                <div className="profile-info">
                    <h3>{`${profile.firstName} ${profile.middleName || ''} ${profile.lastName}`}</h3>
                    <p className="profile-email">
                        <FiMail aria-hidden="true" /> {profile.email}
                        <span className="sr-only">Email: {profile.email}</span>
                    </p>
                    {profile.username && (
                        <p className="profile-username">
                            <FiUser aria-hidden="true" /> Username: {profile.username}
                            <span className="sr-only">Username: {profile.username}</span>
                        </p>
                    )}
                    {profile.graduationYear && (
                        <p className="profile-graduation-year">
                            <FiCalendar aria-hidden="true" /> Graduation Year: {profile.graduationYear}
                            <span className="sr-only">Graduation Year: {profile.graduationYear}</span>
                        </p>
                    )}
                    {profile.phone && (
                        <p className="profile-phone">
                            <FiPhone aria-hidden="true" /> {profile.phone}
                            <span className="sr-only">Phone: {profile.phone}</span>
                        </p>
                    )}
                    <p className="profile-age">
                        <FiCalendar aria-hidden="true" /> Age: {profile.age || 'Not specified'}
                        <span className="sr-only">Age: {profile.age || 'Not specified'}</span>
                    </p>
                    <p className="profile-gender">
                        <FiUsers aria-hidden="true" /> Gender: {profile.gender || 'Not specified'}
                        <span className="sr-only">Gender: {profile.gender || 'Not specified'}</span>
                    </p>
                    {profile.degree && (
                        <p className="profile-degree">
                            <FiBook aria-hidden="true" /> {profile.degree}
                            <span className="sr-only">Degree: {profile.degree}</span>
                        </p>
                    )}
                    {profile.fieldOfStudy && (
                        <p className="profile-field">
                            <FiBriefcase aria-hidden="true" /> Field: {profile.fieldOfStudy}
                            <span className="sr-only">Field of study: {profile.fieldOfStudy}</span>
                        </p>
                    )}
                    {profile.experience && (
                        <p className="profile-experience">
                            <FiMapPin aria-hidden="true" /> Experience: {profile.experience}
                            <span className="sr-only">Experience: {profile.experience}</span>
                        </p>
                    )}
                   <p className="profile-location">
                       <FiMapPin aria-hidden="true" /> Location: {profile.location || 'Not specified'}
                       <span className="sr-only">Location: {profile.location || 'Not specified'}</span>
                   </p>
               </div>
           </div>
       </motion.div>
    );
};

export default ProfileCard;