import { useState, useEffect } from 'react';

// Returns a debounced version of `value` that only updates after `delay` ms of inactivity.
// Prevents expensive operations (API calls, filtering) on every keystroke.
const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer); // cleanup cancels the timer on next keystroke
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
