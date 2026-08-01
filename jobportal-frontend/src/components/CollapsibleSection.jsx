import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const CollapsibleSection = ({ title, children, defaultOpen = false, icon }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const toggleSection = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="collapsible-section">
            <motion.button
                className="collapsible-header"
                onClick={toggleSection}
                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                whileTap={{ scale: 0.98 }}
            >
                <div className="header-content">
                    {icon && <span className="section-icon">{icon}</span>}
                    <h3>{title}</h3>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <FiChevronDown />
                </motion.div>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="collapsible-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <div className="content-wrapper">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CollapsibleSection;