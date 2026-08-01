import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Performance monitoring hook
export const usePerformance = () => {
    const [metrics, setMetrics] = useState({
        renderCount: 0,
        lastRenderTime: 0,
        averageRenderTime: 0,
        memoryUsage: 0
    });

    const renderTimes = useRef([]);
    const startTime = useRef(performance.now());

    useEffect(() => {
        const endTime = performance.now();
        const renderTime = endTime - startTime.current;

        renderTimes.current.push(renderTime);

        // Keep only last 10 render times for average calculation
        if (renderTimes.current.length > 10) {
            renderTimes.current.shift();
        }

        const averageRenderTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;

        // Get memory usage if available
        const memoryUsage = performance.memory ?
            (performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize) * 100 : 0;

        setMetrics(prev => ({
            renderCount: prev.renderCount + 1,
            lastRenderTime: renderTime,
            averageRenderTime,
            memoryUsage
        }));

        startTime.current = performance.now();
    });

    return metrics;
};

// Debounce hook for search and API calls
export const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Throttle hook for scroll and resize events
export const useThrottle = (callback, delay) => {
    const lastRan = useRef(Date.now());

    return useCallback((...args) => {
        if (Date.now() - lastRan.current >= delay) {
            callback(...args);
            lastRan.current = Date.now();
        }
    }, [callback, delay]);
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (ref, options = {}) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [hasIntersected, setHasIntersected] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIntersecting(entry.isIntersecting);
                if (entry.isIntersecting && !hasIntersected) {
                    setHasIntersected(true);
                }
            },
            {
                threshold: 0.1,
                rootMargin: '50px',
                ...options
            }
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [ref, options, hasIntersected]);

    return { isIntersecting, hasIntersected };
};

// Local storage hook with error handling
export const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setValue];
};

// Network status hook
export const useNetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [connection, setConnection] = useState(navigator.connection || null);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Monitor connection changes if available
        if ('connection' in navigator) {
            const connection = navigator.connection;
            const handleConnectionChange = () => setConnection(connection);

            connection.addEventListener('change', handleConnectionChange);
            setConnection(connection);

            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
                connection.removeEventListener('change', handleConnectionChange);
            };
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return {
        isOnline,
        connection: connection ? {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData
        } : null
    };
};

// API cache hook
export const useApiCache = (cacheKey, ttl = 5 * 60 * 1000) => { // 5 minutes default TTL
    const [cache, setCache] = useLocalStorage('api_cache', {});

    const get = useCallback((key) => {
        const cached = cache[cacheKey]?.[key];
        if (!cached) return null;

        if (Date.now() - cached.timestamp > ttl) {
            // Cache expired, remove it
            setCache(prev => {
                const newCache = { ...prev };
                if (newCache[cacheKey]) {
                    delete newCache[cacheKey][key];
                }
                return newCache;
            });
            return null;
        }

        return cached.data;
    }, [cache, cacheKey, ttl, setCache]);

    const set = useCallback((key, data) => {
        setCache(prev => ({
            ...prev,
            [cacheKey]: {
                ...prev[cacheKey],
                [key]: {
                    data,
                    timestamp: Date.now()
                }
            }
        }));
    }, [cacheKey, setCache]);

    const clear = useCallback(() => {
        setCache(prev => {
            const newCache = { ...prev };
            delete newCache[cacheKey];
            return newCache;
        });
    }, [cacheKey, setCache]);

    return { get, set, clear };
};

// Focus management hook
export const useFocusManagement = () => {
    const focusableElements = useRef([]);

    const registerFocusable = useCallback((element) => {
        if (element && !focusableElements.current.includes(element)) {
            focusableElements.current.push(element);
        }
    }, []);

    const unregisterFocusable = useCallback((element) => {
        const index = focusableElements.current.indexOf(element);
        if (index > -1) {
            focusableElements.current.splice(index, 1);
        }
    }, []);

    const focusNext = useCallback(() => {
        const currentIndex = focusableElements.current.findIndex(el => el === document.activeElement);
        const nextIndex = (currentIndex + 1) % focusableElements.current.length;
        focusableElements.current[nextIndex]?.focus();
    }, []);

    const focusPrevious = useCallback(() => {
        const currentIndex = focusableElements.current.findIndex(el => el === document.activeElement);
        const prevIndex = currentIndex <= 0 ? focusableElements.current.length - 1 : currentIndex - 1;
        focusableElements.current[prevIndex]?.focus();
    }, []);

    return {
        registerFocusable,
        unregisterFocusable,
        focusNext,
        focusPrevious,
        focusableCount: focusableElements.current.length
    };
};

// Keyboard navigation hook
export const useKeyboardNavigation = (handlers) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            const handler = handlers[event.key];
            if (handler) {
                event.preventDefault();
                handler(event);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handlers]);
};

// Resize observer hook
export const useResizeObserver = (ref) => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                setDimensions({ width, height });
            }
        });

        resizeObserver.observe(element);

        return () => {
            resizeObserver.unobserve(element);
        };
    }, [ref]);

    return dimensions;
};

// Idle detection hook
export const useIdle = (timeout = 300000) => { // 5 minutes default
    const [isIdle, setIsIdle] = useState(false);
    const timeoutRef = useRef();

    const resetTimeout = useCallback(() => {
        setIsIdle(false);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setIsIdle(true), timeout);
    }, [timeout]);

    useEffect(() => {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

        events.forEach(event => {
            document.addEventListener(event, resetTimeout, true);
        });

        resetTimeout();

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, resetTimeout, true);
            });
            clearTimeout(timeoutRef.current);
        };
    }, [resetTimeout]);

    return isIdle;
};