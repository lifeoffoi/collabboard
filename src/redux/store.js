import { configureStore } from '@reduxjs/toolkit';
import projectsReducer from './projectsSlice';
import tasksReducer    from './tasksSlice';
import commentsReducer from './commentsSlice';

export const store = configureStore({
  reducer: {
    projects: projectsReducer,
    tasks:    tasksReducer,
    comments: commentsReducer,
  },
});
