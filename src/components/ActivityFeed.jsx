import { useState, useCallback } from 'react';
import api from '../utils/axios';
import usePolling from '../hooks/usePolling';

const ActivityFeed = () => {
  const [feed, setFeed] = useState([]);

  // useCallback so the reference stays stable — usePolling's ref won't re-trigger
  const fetchFeed = useCallback(async () => {
    try {
      const res = await api.get('/activityFeed?_sort=createdAt&_order=desc&_limit=10');
      setFeed(res.data);
    } catch { /* silently ignore polling errors */ }
  }, []);

  // Polls every 5 seconds; cleans up the interval on unmount
  usePolling(fetchFeed, 5000);

  return (
    <aside className="activity-feed">
      <h4>Activity Feed</h4>
      {feed.length === 0 && <p className="muted">No activity yet.</p>}
      <ul>
        {feed.map((item) => (
          <li key={item.id}>
            <span className="feed-time">{new Date(item.createdAt).toLocaleDateString()}</span>
            <span>{item.action}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default ActivityFeed;
