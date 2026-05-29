import { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { optimisticStatusUpdate, updateTaskStatus } from '../redux/tasksSlice';

const PRIORITY_STYLE = {
  high:   { background: '#fee2e2', color: '#b91c1c' },
  medium: { background: '#fef3c7', color: '#92400e' },
  low:    { background: '#d1fae5', color: '#065f46' },
};

// memo — only re-renders when task prop or projectId changes
const TaskCard = memo(({ task, projectId, users = [] }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const assignee = users.find((u) => u.id === task.assigneeId);

  // useCallback — stable reference so parent list does not create new fn on every render
  const handleStatusChange = useCallback((e) => {
    const newStatus = e.target.value;
    // 1. Optimistic update — instant UI change
    dispatch(optimisticStatusUpdate({ id: task.id, status: newStatus }));
    // 2. API call — reverts if it fails (handled in rejected case of tasksSlice)
    dispatch(updateTaskStatus({ id: task.id, status: newStatus }));
  }, [dispatch, task.id]);

  const handleClick = useCallback(() => {
    navigate(`/projects/${projectId}/tasks/${task.id}`);
  }, [navigate, projectId, task.id]);

  const overdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div className="task-card" onClick={handleClick}>
      <div className="task-card-header">
        <strong>{task.title}</strong>
        {task.priority && (
          <span className="badge" style={PRIORITY_STYLE[task.priority]}>
            {task.priority}
          </span>
        )}
      </div>
      <p className="task-desc">{task.description}</p>
      <div className="task-card-footer" onClick={(e) => e.stopPropagation()}>
        {task.dueDate && (
          <span style={{ fontSize: 12, color: overdue ? 'red' : '#666' }}>
            Due: {task.dueDate}{overdue ? ' (overdue)' : ''}
          </span>
        )}
        {assignee && <span className="assignee">{assignee.name}</span>}
        <select value={task.status} onChange={handleStatusChange}>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>
  );
});

TaskCard.displayName = 'TaskCard';
export default TaskCard;
