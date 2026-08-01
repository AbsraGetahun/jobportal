import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';

const FeedbackMessage = ({ type, message, onClose, duration = 5000 }) => {
    useEffect(() => {
        if (duration > 0 && onClose) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success': return <FiCheckCircle />;
            case 'error': return <FiXCircle />;
            case 'warning': return <FiAlertCircle />;
            case 'info': return <FiInfo />;
            default: return <FiInfo />;
        }
    };

    const getStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400';
            case 'info':
                return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-400';
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={`fixed top-4 right-4 z-50 max-w-sm p-4 border rounded-lg shadow-lg ${getStyles()}`}
                role="alert"
            >
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 text-lg">
                        {getIcon()}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">{message}</p>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="flex-shrink-0 ml-2 text-current opacity-70 hover:opacity-100 transition-opacity"
                            aria-label="Close notification"
                        >
                            <FiXCircle className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Progress bar for auto-dismiss */}
                {duration > 0 && (
                    <motion.div
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: duration / 1000, ease: 'linear' }}
                        className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg"
                    />
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default FeedbackMessage;