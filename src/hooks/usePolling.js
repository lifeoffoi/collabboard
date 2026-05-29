import { useEffect, useRef } from 'react';

// Calls `callback` immediately and then every `interval` ms.
// Stops polling when the component unmounts (cleanup via useEffect return).
const usePolling = (callback, interval = 5000) => {
  const savedCallback = useRef(callback);

  // Keep ref up to date without restarting the interval
  useEffect(() => { savedCallback.current = callback; }, [callback]);

  useEffect(() => {
    savedCallback.current(); // run immediately on mount
    const id = setInterval(() => savedCallback.current(), interval);
    return () => clearInterval(id); // cleanup on unmount
  }, [interval]);
};

export default usePolling;
