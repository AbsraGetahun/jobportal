import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiBook, FiTool, FiPrinter, FiSun, FiMoon, FiLogOut, FiSearch, FiDownload } from 'react-icons/fi';
import { FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import '../../styles/pages/JobSeeker/ResumePage.css';

const splitName = (fullName) => {
    if (!fullName) return { firstName: '', lastName: '' };
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return { firstName: parts[0], lastName: '' };
    return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
};

const Resume = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [resumeName, setResumeName] = useState(null);
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('theme');
        if (!saved) return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        return saved;
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.getProfile();
                const data = res.data.data;
                setProfile(data);
                setResumeName(data.resume_filename || null);
            } catch (err) {
                console.error('Error fetching profile for resume:', err);
                setError('Failed to load your resume. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = () => { logout(); navigate('/'); };
    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    if (loading) {
        return <div className="resume-page"><div className="resume-loading">Loading resume...</div></div>;
    }
    if (error) {
        return <div className="resume-page"><div className="resume-error">{error}</div></div>;
    }

    const name = splitName(profile?.name || '');
    const fullName = profile?.name || 'Your Name';
    const skills = Array.isArray(profile?.skills) ? profile.skills : [];
    const education = Array.isArray(profile?.education) ? profile.education : [];
    const work = Array.isArray(profile?.work_experience) ? profile.work_experience : [];

    return (
        <div className={`resume-page ${theme}`}>
            <header className="careerplus__header">
                <div className="careerplus__header-container">
                    <h1 className="careerplus__logo">CareerPlus</h1>
                    <nav className="careerplus__nav">
                        <button className="careerplus__nav-icon" title="Search Jobs" onClick={() => navigate('/jobsearch')}><FiSearch /></button>
                        <button className="careerplus__nav-icon" title="Logout" onClick={handleLogout}><FiLogOut /></button>
                        <button className="careerplus__theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                            {theme === 'light' ? <FiMoon /> : <FiSun />}
                        </button>
                    </nav>
                </div>
            </header>

            <div className="resume-toolbar no-print">
                <button className="resume-btn" onClick={() => window.print()}><FiPrinter /> Print / Save as PDF</button>
                {resumeName && (
                    <span className="resume-file"><FiDownload /> {resumeName}</span>
                )}
            </div>

            <main className="resume-document">
                <section className="resume-header">
                    <div className="resume-avatar"><FiUser size={42} /></div>
                    <div>
                        <h1 className="resume-name">{fullName}</h1>
                        <p className="resume-title">
                            {profile?.degree ? profile.degree + (profile.fieldOfStudy ? `, ${profile.fieldOfStudy}` : '') : (profile?.fieldOfStudy || 'Job Seeker')}
                        </p>
                        <div className="resume-contact">
                            {profile?.email && <span><FiMail /> {profile.email}</span>}
                            {profile?.phone && <span><FiPhone /> {profile.phone}</span>}
                            {profile?.location && <span><FiMapPin /> {profile.location}</span>}
                        </div>
                    </div>
                </section>

                <section className="resume-section">
                    <h2><FiUser /> Profile Summary</h2>
                    <p>
                        {name.firstName ? `${name.firstName} ` : ''}is a {profile?.degree || 'professional'} with
                        {profile?.experience ? ` ${profile.experience} year(s) of experience` : ' growing experience'} in the {profile?.fieldOfStudy || 'field'}.
                        {profile?.location ? ` Based in ${profile.location}.` : ''}
                    </p>
                </section>

                <section className="resume-section">
                    <h2><FiBook /> Education</h2>
                    {education.length > 0 ? (
                        <ul className="resume-list">
                            {education.map((e, i) => (
                                <li key={i}>
                                    <strong>{e.degree || e.title || 'Degree'}</strong>
                                    {e.school || e.institution ? ` — ${e.school || e.institution}` : ''}
                                    {e.year ? ` (${e.year})` : ''}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="resume-empty">
                            {profile?.degree ? `${profile.degree} in ${profile.fieldOfStudy || '—'}` : 'No education details added yet.'}
                            {profile?.graduationYear ? ` (Graduated ${profile.graduationYear})` : ''}
                        </p>
                    )}
                </section>

                <section className="resume-section">
                    <h2><FiBriefcase /> Work Experience</h2>
                    {work.length > 0 ? (
                        <ul className="resume-list">
                            {work.map((w, i) => (
                                <li key={i}>
                                    <strong>{w.title || w.role || 'Role'}</strong>
                                    {w.company ? ` at ${w.company}` : ''}
                                    {w.duration || w.period ? ` (${w.duration || w.period})` : ''}
                                    {w.description ? <p>{w.description}</p> : null}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="resume-empty">
                            {profile?.experience ? `${profile.experience} year(s) of experience.` : 'No work experience added yet.'}
                        </p>
                    )}
                </section>

                <section className="resume-section">
                    <h2><FiTool /> Skills</h2>
                    {skills.length > 0 ? (
                        <div className="resume-skills">
                            {skills.map((s, i) => (
                                <span key={i} className="resume-skill">{typeof s === 'string' ? s : (s.name || 'Skill')}</span>
                            ))}
                        </div>
                    ) : (
                        <p className="resume-empty">No skills listed yet. Add them from your account profile.</p>
                    )}
                </section>

                <section className="resume-section no-print">
                    <h2><FiDownload /> Resume File</h2>
                    {resumeName ? (
                        <p>Your resume <strong>{resumeName}</strong> is on file.</p>
                    ) : (
                        <p className="resume-empty">No resume file uploaded yet. You can upload one from your account profile.</p>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Resume;
