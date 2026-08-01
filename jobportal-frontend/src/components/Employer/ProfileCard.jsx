import { motion } from 'framer-motion';
import { FiEdit, FiPhone, FiBriefcase, FiMapPin, FiUser, FiMail, FiCalendar, FiUsers } from 'react-icons/fi';

// Helper function to get icon description for accessibility
const getIconDescription = (iconName) => {
  const descriptions = {
    FiEdit: 'Edit profile',
    FiPhone: 'Phone number',
    FiBriefcase: 'Company name',
    FiMapPin: 'Location',
    FiUser: 'User',
    FiMail: 'Email',
    FiCalendar: 'Age',
    FiUsers: 'Gender'
  };
  return descriptions[iconName] || '';
};

const ProfileCard = ({ profile, isEditing, onEditToggle }) => {
    console.log('🎴 ========== PROFILE CARD RENDER ==========');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('🎴 ProfileCard received profile:', profile);
    console.log('📞 ProfileCard phone:', profile?.phone);
    console.log('📞 Phone field exists?', 'phone' in profile);
    console.log('📞 Phone field type:', typeof profile?.phone);
    console.log('📞 Phone field length:', profile?.phone ? profile.phone.length : 0);

    // Log all profile fields for debugging
    if (profile) {
        console.log('📋 ALL PROFILE FIELDS:');
        Object.entries(profile).forEach(([key, value]) => {
            console.log(`  ${key}: "${value}" (${typeof value})`);
        });
    }

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
                        src={profile.profilePicture}
                        alt={`${profile.firstName} ${profile.lastName}`}
                        className="profile-pic"
                    />
                    {!isEditing && (
                        <motion.button
                            className="edit-icon"
                            onClick={onEditToggle}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Edit Profile"
                        >
                            <FiEdit />
                        </motion.button>
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
                    <p className="profile-location">
                        <FiMapPin aria-hidden="true" /> Location: {profile.location || 'Not specified'}
                        <span className="sr-only">Location: {profile.location || 'Not specified'}</span>
                    </p>
                    <h4>Company Information</h4>
                    {profile.companyName && (
                        <p className="profile-company">
                            <FiBriefcase aria-hidden="true" /> Company: {profile.companyName}
                            <span className="sr-only">Company: {profile.companyName}</span>
                        </p>
                    )}
                    {profile.companyLocation && (
                        <p className="profile-company-location">
                            <FiMapPin aria-hidden="true" /> Company Location: {profile.companyLocation}
                            <span className="sr-only">Company Location: {profile.companyLocation}</span>
                        </p>
                    )}
                    {profile.employeesCount && (
                        <p className="profile-employees">
                            <FiUsers aria-hidden="true" /> Employees: {profile.employeesCount}
                            <span className="sr-only">Employees: {profile.employeesCount}</span>
                        </p>
                    )}
                    {profile.establishmentYear && (
                        <p className="profile-establishment">
                            <FiCalendar aria-hidden="true" /> Established: {profile.establishmentYear}
                            <span className="sr-only">Established: {profile.establishmentYear}</span>
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ProfileCard;