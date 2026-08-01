import React from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiRefreshCw, FiHome, FiMail } from 'react-icons/fi';

class EnhancedErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null,
            retryCount: 0
        };
    }

    static getDerivedStateFromError(error) {
        // Generate unique error ID for tracking
        const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        return {
            hasError: true,
            errorId,
            error: error
        };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details for debugging
        console.group('🚨 Enhanced Error Boundary');
        console.error('Error ID:', this.state.errorId);
        console.error('Error:', error);
        console.error('Error Info:', errorInfo);
        console.error('Component Stack:', errorInfo.componentStack);
        console.error('Error Boundary Props:', this.props);
        console.groupEnd();

        // Report error to monitoring service (if available)
        this.reportError(error, errorInfo);

        this.setState({
            errorInfo,
            retryCount: this.state.retryCount + 1
        });
    }

    reportError = (error, errorInfo) => {
        // In a real application, you would send this to your error monitoring service
        const errorReport = {
            errorId: this.state.errorId,
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            retryCount: this.state.retryCount,
            props: this.props
        };

        // Store in localStorage for debugging (in development)
        if (process.env.NODE_ENV === 'development') {
            const existingErrors = JSON.parse(localStorage.getItem('error_logs') || '[]');
            existingErrors.push(errorReport);
            localStorage.setItem('error_logs', JSON.stringify(existingErrors.slice(-10))); // Keep last 10 errors
        }

        // You could also send to an error monitoring service like Sentry
        // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    };

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: 0
        });
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    handleReportIssue = () => {
        const subject = encodeURIComponent(`Bug Report: ${this.state.errorId}`);
        const body = encodeURIComponent(`
Error ID: ${this.state.errorId}
Error Message: ${this.state.error?.message}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}

Please describe what you were doing when this error occurred:
[Your description here]
        `);

        window.open(`mailto:support@careerplus.com?subject=${subject}&body=${body}`);
    };

    render() {
        if (this.state.hasError) {
            const { error, errorInfo, errorId, retryCount } = this.state;
            const { fallback: Fallback, showDetails = true } = this.props;

            // If a custom fallback component is provided, use it
            if (Fallback) {
                return (
                    <Fallback
                        error={error}
                        errorInfo={errorInfo}
                        errorId={errorId}
                        retryCount={retryCount}
                        onRetry={this.handleRetry}
                    />
                );
            }

            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="enhanced-error-boundary"
                >
                    <div className="error-container">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="error-icon"
                        >
                            <FiAlertTriangle />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="error-content"
                        >
                            <h1>Something went wrong</h1>
                            <p className="error-message">
                                We encountered an unexpected error. Our team has been notified.
                            </p>

                            <div className="error-details">
                                <div className="error-id">
                                    <strong>Error ID:</strong> {errorId}
                                </div>
                                {retryCount > 0 && (
                                    <div className="retry-count">
                                        <strong>Retry Attempts:</strong> {retryCount}
                                    </div>
                                )}
                            </div>

                            {showDetails && error && (
                                <motion.details
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="error-technical"
                                >
                                    <summary>Technical Details</summary>
                                    <div className="error-stack">
                                        <h4>Error Message:</h4>
                                        <code>{error.message}</code>

                                        {errorInfo && (
                                            <>
                                                <h4>Component Stack:</h4>
                                                <pre>{errorInfo.componentStack}</pre>
                                            </>
                                        )}

                                        <h4>Stack Trace:</h4>
                                        <pre>{error.stack}</pre>
                                    </div>
                                </motion.details>
                            )}

                            <div className="error-actions">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={this.handleRetry}
                                    className="retry-button"
                                    disabled={retryCount >= 3}
                                >
                                    <FiRefreshCw />
                                    {retryCount >= 3 ? 'Max Retries Reached' : 'Try Again'}
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={this.handleGoHome}
                                    className="home-button"
                                >
                                    <FiHome />
                                    Go Home
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={this.handleReportIssue}
                                    className="report-button"
                                >
                                    <FiMail />
                                    Report Issue
                                </motion.button>
                            </div>

                            <div className="error-help">
                                <p>
                                    If this problem persists, please{' '}
                                    <button onClick={this.handleReportIssue} className="link-button">
                                        contact our support team
                                    </button>{' '}
                                    with the error ID above.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            );
        }

        return this.props.children;
    }
}

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
    const WrappedComponent = (props) => (
        <EnhancedErrorBoundary {...errorBoundaryProps}>
            <Component {...props} />
        </EnhancedErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

    return WrappedComponent;
};

// Hook for manual error reporting
export const useErrorReporting = () => {
    const reportError = React.useCallback((error, context = {}) => {
        const errorReport = {
            errorId: `MANUAL_ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            message: error.message || 'Manual error report',
            stack: error.stack,
            context,
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString()
        };

        console.error('Manual Error Report:', errorReport);

        // Store in localStorage for debugging
        if (process.env.NODE_ENV === 'development') {
            const existingErrors = JSON.parse(localStorage.getItem('manual_error_logs') || '[]');
            existingErrors.push(errorReport);
            localStorage.setItem('manual_error_logs', JSON.stringify(existingErrors.slice(-10)));
        }

        // You could also send to an error monitoring service
        // Sentry.captureException(error, { extra: context });
    }, []);

    return { reportError };
};

export default EnhancedErrorBoundary;