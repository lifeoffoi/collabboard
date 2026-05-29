import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchComments, addComment } from '../redux/commentsSlice';
import { selectTaskById, updateTask } from '../redux/tasksSlice';
import { selectTaskComments } from '../redux/selectors';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';

const TaskDetailPage = () => {
  const { projectId, taskId } = useParams();
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const task      = useSelector((s) => selectTaskById(s, taskId));
  const comments  = useSelector((s) => selectTaskComments(s, taskId));

  const [subtasks, setSubtasks]   = useState([]);
  const [newSub, setNewSub]       = useState('');
  const [commentText, setComment] = useState('');
  const [users, setUsers]         = useState([]);

  useEffect(() => {
    dispatch(fetchComments(taskId));
    api.get(`/subtasks?taskId=${taskId}`).then((r) => setSubtasks(r.data));
    api.get('/users').then((r) => setUsers(r.data));
  }, [dispatch, taskId]);

  const author = (id) => users.find((u) => u.id === id)?.name || 'Unknown';

  // Dynamic subtask list — add new subtask to local state before saving
  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSub.trim()) return;
    const res = await api.post('/subtasks', { taskId, title: newSub, done: false, id: String(Date.now()) });
    setSubtasks((prev) => [...prev, res.data]);
    setNewSub('');
  };

  const toggleSubtask = async (sub) => {
    const updated = { ...sub, done: !sub.done };
    await api.patch(`/subtasks/${sub.id}`, { done: updated.done });
    setSubtasks((prev) => prev.map((s) => s.id === sub.id ? updated : s));
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await dispatch(addComment({ taskId, authorId: user.id, text: commentText }));
    setComment('');
  };

  if (!task) return <div style={{ padding: '1rem' }}>Loading task... <button onClick={() => navigate(-1)}>Back</button></div>;

  const done  = subtasks.filter((s) => s.done).length;
  const total = subtasks.length;

  return (
    <div style={{ padding: '1rem', maxWidth: 700 }}>
      <button onClick={() => navigate(`/projects/${projectId}`)} className="back-btn">Back to Project</button>

      <h2>{task.title}</h2>
      <p style={{ color: '#666', marginBottom: '1rem' }}>{task.description}</p>
      <p><strong>Status:</strong> {task.status} | <strong>Priority:</strong> {task.priority} | <strong>Due:</strong> {task.dueDate || 'None'}</p>

      {/* Subtasks — dynamic form array */}
      <section style={{ marginTop: '1.5rem' }}>
        <h3>Subtasks {total > 0 && `(${done}/${total})`}</h3>
        {total > 0 && (
          <div className="progress-bar">
            <div style={{ width: `${(done / total) * 100}%` }} />
          </div>
        )}
        <ul className="subtask-list">
          {subtasks.map((sub) => (
            <li key={sub.id} style={{ textDecoration: sub.done ? 'line-through' : 'none', color: sub.done ? '#aaa' : 'inherit' }}>
              <input type="checkbox" checked={sub.done} onChange={() => toggleSubtask(sub)} />
              {sub.title}
            </li>
          ))}
        </ul>
        <form onSubmit={handleAddSubtask} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <input value={newSub} onChange={(e) => setNewSub(e.target.value)} placeholder="Add subtask..." style={{ flex: 1 }} />
          <button type="submit" className="btn-primary">Add</button>
        </form>
      </section>

      {/* Comments */}
      <section style={{ marginTop: '2rem' }}>
        <h3>Comments</h3>
        {comments.map((c) => (
          <div key={c.id} className="comment">
            <strong>{author(c.authorId)}</strong>
            <span className="comment-time">{new Date(c.createdAt).toLocaleDateString()}</span>
            <p>{c.text}</p>
          </div>
        ))}
        <form onSubmit={handleComment} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <input value={commentText} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment..." style={{ flex: 1 }} />
          <button type="submit" className="btn-primary">Post</button>
        </form>
      </section>
    </div>
  );
};

export default TaskDetailPage;
