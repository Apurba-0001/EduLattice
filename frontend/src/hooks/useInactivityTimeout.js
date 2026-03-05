import { useEffect, useRef, useCallback } from "react";

const ACTIVITY_EVENTS = [
  "mousedown",
  "mousemove",
  "keydown",
  "scroll",
  "touchstart",
  "click",
  "pointerdown",
  "user-activity", // fired by API interceptor so network requests count as activity
];

// Default: 20 minutes of inactivity
const DEFAULT_TIMEOUT_MS = 20 * 60 * 1000;

/**
 * Hook that monitors user activity and triggers a callback after
 * a specified period of inactivity. Resets the timer on any user
 * interaction (mouse, keyboard, touch, scroll).
 *
 * @param {Function} onTimeout - Called when inactivity timeout expires
 * @param {number}   timeoutMs - Inactivity duration in ms (default 20 min)
 * @param {boolean}  enabled   - Whether the timer is active (e.g. only when logged in)
 */
export default function useInactivityTimeout(
  onTimeout,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  enabled = true,
) {
  const timerRef = useRef(null);
  const onTimeoutRef = useRef(onTimeout);

  // Keep callback ref fresh without resetting timer
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      onTimeoutRef.current();
    }, timeoutMs);
  }, [timeoutMs]);

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    // Start the initial timer
    resetTimer();

    // Reset timer on any user activity
    const handleActivity = () => resetTimer();

    ACTIVITY_EVENTS.forEach((event) => {
      // capture: true ensures events stopped by child components still reach us
      window.addEventListener(event, handleActivity, {
        passive: true,
        capture: true,
      });
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity, { capture: true });
      });
    };
  }, [enabled, resetTimer]);
}
