"use client";

import * as React from "react";

/**
 * Hook that debounces a value - delays updating until a pause in changes.
 * Useful for search inputs to avoid firing API calls on every keystroke.
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Hook that debounces a callback function.
 * Returns a stable function reference that delays execution.
 * 
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Debounced callback function
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
    callback: T,
    delay: number = 300
): (...args: Parameters<T>) => void {
    const callbackRef = React.useRef(callback);
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    // Keep callback ref updated
    React.useLayoutEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return React.useCallback(
        (...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                callbackRef.current(...args);
            }, delay);
        },
        [delay]
    );
}
