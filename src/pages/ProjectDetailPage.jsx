import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, addTask } from '../redux/tasksSlice';
import { selectProjectById } from '../redux/projectsSlice';
import { selectFilteredTasks } from '../redux/selectors';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import ErrorBoundary from '../components/ErrorBoundary';
import SkeletonCard from '../components/SkeletonCard';
import useDebounce from '../hooks/useDebounce';
import api from '../utils/axios';

const ProjectDetailPage = () => {
  const { projectId }  = useParams();
  const dispatch       = useDispatch();
  const navigate       = useNavigate();
  const { user }       = useAuth();
  const project        = useSelector((s) => selectProjectById(s, projectId));
  const tasksStatus    = useSelector((s) => s.tasks.status);

  const [searchParams, setSearchParams] = useSearchParams();
  const sortBy     = searchParams.get('sort')     || 'createdAt';
  const filterPri  = searchParams.get('priority') || '';
  const filterStat = searchParams.get('status')   || '';

  const [search, setSearch]   = useState('');
  const debouncedSearch        = useDebounce(search, 300);
  const [users, setUsers]      = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]        = useState({ title: '', description: '', assigneeId: '', priority: 'medium', dueDate: '' });

  useEffect(() => {
    dispatch(fetchTasks(projectId));
    api.get('/users').then((r) => setUsers(r.data));
  }, [dispatch, projectId]);

  const filters = useMemo(
    () => ({ priority: filterPri || undefined, status: filterStat || undefined }),
    [filterPri, filterStat]
  );

  const filteredTasks = useSelector((s) => selectFilteredTasks(s, projectId, filters, sortBy));

  const visibleTasks = useMemo(
    () => filteredTasks.filter((t) => t.title.toLowerCase().includes(debouncedSearch.toLowerCase())),
    [filteredTasks, debouncedSearch]
  );

  const setParam = (key, val) => setSearchParams((prev) => {
    const next = new URLSearchParams(prev);
    if (val) next.set(key, val); else next.delete(key);
    return next;
  }, { replace: true });

  const field = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleAddTask = async (e) => {
    e.preventDefault();
    await dispatch(addTask({ ...form, projectId, status: 'pending' }));
    setForm({ title: '', description: '', assigneeId: '', priority: 'medium', dueDate: '' });
    setShowForm(false);
  };

  if (!project) return <div style={{ padding: '1rem' }}>Project not found. <button onClick={() => navigate('/')}>Back</button></div>;

  return (
    <div style={{ padding: '1rem' }}>
      <button onClick={() => navigate('/')} className="back-btn">Back to Projects</button>
      <h2>{project.title}</h2>
      <p style={{ color: '#666', marginBottom: '1rem' }}>{project.description}</p>

      <div className="toolbar">
        <input
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        <select value={filterPri}  onChange={(e) => setParam('priority', e.target.value)}>
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={filterStat} onChange={(e) => setParam('status', e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select value={sortBy} onChange={(e) => setParam('sort', e.target.value)}>
          <option value="createdAt">Sort: Date</option>
          <option value="priority">Sort: Priority</option>
          <option value="dueDate">Sort: Due Date</option>
        </select>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ Task'}
        </button>
      </div>

      {showForm && (
        <form className="inline-form" onSubmit={handleAddTask}>
          <input value={form.title} onChange={field('title')} placeholder="Task title" required />
          <input value={form.description} onChange={field('description')} placeholder="Description" />
          <select value={form.assigneeId} onChange={field('assigneeId')}>
            <option value="">Assign to...</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <select value={form.priority} onChange={field('priority')}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <input type="date" value={form.dueDate} onChange={field('dueDate')} />
          <button type="submit" className="btn-primary">Add Task</button>
        </form>
      )}

      <ErrorBoundary>
        {tasksStatus === 'loading'
          ? [1, 2, 3].map((i) => <SkeletonCard key={i} />)
          : visibleTasks.length === 0
            ? <p style={{ color: '#888', marginTop: '1rem' }}>No tasks match your filters.</p>
            : visibleTasks.map((task) => (
                <TaskCard key={task.id} task={task} projectId={projectId} users={users} />
              ))
        }
      </ErrorBoundary>
    </div>
  );
};

export default ProjectDetailPage;
