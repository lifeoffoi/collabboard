const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-bar" style={{ height: 16, width: '60%', marginBottom: 10 }} />
    <div className="skeleton-bar" style={{ height: 12, width: '80%', marginBottom: 8 }} />
    <div className="skeleton-bar" style={{ height: 12, width: '40%' }} />
  </div>
);

export default SkeletonCard;
