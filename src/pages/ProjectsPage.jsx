import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProjects, addProject, deleteProject } from '../redux/projectsSlice';
import { selectProjectSummaries } from '../redux/selectors';
import { useAuth } from '../context/AuthContext';
import SkeletonCard from '../components/SkeletonCard';
import Pagination from '../components/Pagination';
import ActivityFeed from '../components/ActivityFeed';
import ErrorBoundary from '../components/ErrorBoundary';

const PAGE_SIZE = 3;

const ProjectsPage = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const status    = useSelector((s) => s.projects.status);
  const summaries = useSelector(selectProjectSummaries);

  const [page, setPage]       = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]        = useState({ title: '', description: '', dueDate: '', status: 'active' });

  useEffect(() => { dispatch(fetchProjects()); }, [dispatch]);

  const paginated  = summaries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(summaries.length / PAGE_SIZE);

  const field = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleAdd = useCallback(async (e) => {
    e.preventDefault();
    await dispatch(addProject({ ...form, ownerId: user.id, members: [user.id] }));
    setForm({ title: '', description: '', dueDate: '', status: 'active' });
    setShowForm(false);
  }, [dispatch, form, user.id]);

  // Admin-only action
  const handleDelete = useCallback((e, id) => {
    e.stopPropagation();
    dispatch(deleteProject(id));
  }, [dispatch]);

  return (
    <div className="page-layout">
      <div className="page-main">
        <div className="page-header">
          <h2>Projects</h2>
          <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancel' : '+ New Project'}
          </button>
        </div>

        {showForm && (
          <form className="inline-form" onSubmit={handleAdd}>
            <input value={form.title} onChange={field('title')} placeholder="Project title" required />
            <input value={form.description} onChange={field('description')} placeholder="Description" />
            <input type="date" value={form.dueDate} onChange={field('dueDate')} />
            <select value={form.status} onChange={field('status')}>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
            <button type="submit" className="btn-primary">Create</button>
          </form>
        )}

        {status === 'loading' && [1, 2, 3].map((i) => <SkeletonCard key={i} />)}

        {status === 'succeeded' && paginated.map((p) => (
          <div key={p.id} className="project-card" onClick={() => navigate(`/projects/${p.id}`)}>
            <div className="project-card-header">
              <h3>{p.title}</h3>
              <span className={`status-badge ${p.status}`}>{p.status}</span>
            </div>
            <p>{p.description}</p>
            <div className="project-meta">
              <span>{p.taskCount} tasks</span>
              <span>{p.completed} completed</span>
              <span>{p.commentCount} comments</span>
              {p.dueDate && <span>Due: {p.dueDate}</span>}
            </div>
            {/* Role-based: only admin sees Delete */}
            {user?.role === 'admin' && (
              <button className="btn-danger small" onClick={(e) => handleDelete(e, p.id)}>Delete</button>
            )}
          </div>
        ))}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <ErrorBoundary>
        <ActivityFeed />
      </ErrorBoundary>
    </div>
  );
};

export default ProjectsPage;
