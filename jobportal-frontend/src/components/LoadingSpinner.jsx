import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12'
    };

    return (
        <div className="flex flex-col items-center justify-center gap-3 p-4">
            <motion.div
                className={`${sizeClasses[size]} border-2 border-current border-t-transparent rounded-full`}
                animate={{ rotate: 360 }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'linear'
                }}
            />
            {message && (
                <motion.p
                    className="text-sm text-current opacity-75"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {message}
                </motion.p>
            )}
        </div>
    );
};

export default LoadingSpinner;