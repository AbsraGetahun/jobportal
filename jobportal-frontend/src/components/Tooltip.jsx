import { useState } from 'react';
import { FiInfo } from 'react-icons/fi';

const Tooltip = ({ text, position = 'top' }) => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleTooltip = () => {
        setIsVisible(!isVisible);
    };

    const getTooltipPosition = () => {
        switch (position) {
            case 'top': return 'bottom-full mb-2 left-1/2 transform -translate-x-1/2';
            case 'bottom': return 'top-full mt-2 left-1/2 transform -translate-x-1/2';
            case 'left': return 'right-full mr-2 top-1/2 transform -translate-y-1/2';
            case 'right': return 'left-full ml-2 top-1/2 transform -translate-y-1/2';
            default: return 'bottom-full mb-2 left-1/2 transform -translate-x-1/2';
        }
    };

    return (
        <div className="relative inline-block">
            <button
                type="button"
                className="tooltip-icon"
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                onClick={toggleTooltip}
                aria-label="Show help information"
            >
                <FiInfo />
            </button>
            
            {isVisible && (
                <div 
                    className={`absolute z-10 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm tooltip ${getTooltipPosition()}`}
                    role="tooltip"
                >
                    <div className="tooltip-arrow" data-popper-arrow></div>
                    {text}
                </div>
            )}
        </div>
    );
};

export default Tooltip;