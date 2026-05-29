import { createSelector } from '@reduxjs/toolkit';
import { selectAllProjects } from './projectsSlice';
import { selectAllTasks }    from './tasksSlice';
import { selectAllComments } from './commentsSlice';

// Filtered + sorted tasks for a given project
// createSelector memoises: only recomputes when tasks, projectId, filters, or sortBy change
export const selectFilteredTasks = createSelector(
  [
    selectAllTasks,
    (_, projectId) => projectId,
    (_, __, filters) => filters,
    (_, __, ___, sortBy) => sortBy,
  ],
  (tasks, projectId, filters, sortBy) => {
    let result = tasks.filter((t) => t.projectId === projectId);

    if (filters?.assigneeId) result = result.filter((t) => t.assigneeId === filters.assigneeId);
    if (filters?.priority)   result = result.filter((t) => t.priority   === filters.priority);
    if (filters?.status)     result = result.filter((t) => t.status     === filters.status);

    const ORDER = { high: 0, medium: 1, low: 2 };
    return [...result].sort((a, b) => {
      if (sortBy === 'priority')  return (ORDER[a.priority] ?? 1) - (ORDER[b.priority] ?? 1);
      if (sortBy === 'dueDate')   return new Date(a.dueDate) - new Date(b.dueDate);
      return new Date(a.createdAt) - new Date(b.createdAt); // default: creation date
    });
  }
);

// Summary stats per project (comment count, task counts)
export const selectProjectSummaries = createSelector(
  [selectAllProjects, selectAllTasks, selectAllComments],
  (projects, tasks, comments) =>
    projects.map((p) => {
      const projectTasks = tasks.filter((t) => t.projectId === p.id);
      const taskIds      = projectTasks.map((t) => t.id);
      return {
        ...p,
        taskCount:     projectTasks.length,
        completed:     projectTasks.filter((t) => t.status === 'completed').length,
        commentCount:  comments.filter((c) => taskIds.includes(c.taskId)).length,
      };
    })
);

// Comments for a specific task
export const selectTaskComments = createSelector(
  [selectAllComments, (_, taskId) => taskId],
  (comments, taskId) => comments.filter((c) => c.taskId === taskId)
);
