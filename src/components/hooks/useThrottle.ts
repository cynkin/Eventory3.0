"use client";

import * as React from "react";

/**
 * Hook that throttles a value - limits how often it can update.
 * Useful for rate-limiting API calls during continuous user interaction.
 * 
 * @param value - The value to throttle
 * @param interval - Minimum time between updates in milliseconds (default: 500ms)
 * @returns The throttled value
 */
export function useThrottle<T>(value: T, interval: number = 500): T {
    const [throttledValue, setThrottledValue] = React.useState<T>(value);
    const lastExecuted = React.useRef<number>(Date.now());
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    React.useEffect(() => {
        const now = Date.now();
        const elapsed = now - lastExecuted.current;

        if (elapsed >= interval) {
            // Enough time has passed, update immediately
            lastExecuted.current = now;
            setThrottledValue(value);
        } else {
            // Schedule update for when interval completes (trailing throttle)
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                lastExecuted.current = Date.now();
                setThrottledValue(value);
            }, interval - elapsed);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [value, interval]);

    return throttledValue;
}

/**
 * Hook that throttles a callback function.
 * Returns a stable function reference that limits execution frequency.
 * 
 * @param callback - The function to throttle
 * @param interval - Minimum time between calls in milliseconds (default: 500ms)
 * @returns Throttled callback function
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
    callback: T,
    interval: number = 500
): (...args: Parameters<T>) => void {
    const callbackRef = React.useRef(callback);
    const lastExecuted = React.useRef<number>(0);
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
            const now = Date.now();
            const elapsed = now - lastExecuted.current;

            if (elapsed >= interval) {
                lastExecuted.current = now;
                callbackRef.current(...args);
            } else {
                // Schedule trailing call
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                timeoutRef.current = setTimeout(() => {
                    lastExecuted.current = Date.now();
                    callbackRef.current(...args);
                }, interval - elapsed);
            }
        },
        [interval]
    );
}
