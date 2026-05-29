import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import api from '../utils/axios';

const adapter = createEntityAdapter();

export const fetchTasks = createAsyncThunk('tasks/fetchByProject', async (projectId) => {
  const res = await api.get(`/tasks?projectId=${projectId}`);
  return res.data;
});

export const addTask = createAsyncThunk('tasks/add', async (task) => {
  const res = await api.post('/tasks', { ...task, id: String(Date.now()), createdAt: new Date().toISOString() });
  return res.data;
});

export const deleteTask = createAsyncThunk('tasks/delete', async (id) => {
  await api.delete(`/tasks/${id}`);
  return id;
});

// Optimistic update — update UI immediately, roll back on failure
export const updateTaskStatus = createAsyncThunk(
  'tasks/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/tasks/${id}`, { status });
      return res.data;
    } catch (err) {
      return rejectWithValue({ id, error: err.message });
    }
  }
);

export const updateTask = createAsyncThunk('tasks/update', async ({ id, ...changes }) => {
  const res = await api.patch(`/tasks/${id}`, changes);
  return res.data;
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: adapter.getInitialState({ status: 'idle', error: null }),
  reducers: {
    // Optimistic update: change status locally before API responds
    optimisticStatusUpdate: (state, action) => {
      const { id, status } = action.payload;
      adapter.updateOne(state, { id, changes: { status } });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending,   (state) => { state.status = 'loading'; })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        adapter.setAll(state, action.payload);
      })
      .addCase(fetchTasks.rejected,  (state, action) => { state.status = 'failed'; state.error = action.error.message; })
      .addCase(addTask.fulfilled,    (state, action) => { adapter.addOne(state, action.payload); })
      .addCase(deleteTask.fulfilled, (state, action) => { adapter.removeOne(state, action.payload); })
      .addCase(updateTask.fulfilled, (state, action) => { adapter.upsertOne(state, action.payload); })
      // On success: confirmed update from server replaces optimistic one
      .addCase(updateTaskStatus.fulfilled, (state, action) => { adapter.upsertOne(state, action.payload); })
      // On failure: roll back to the previous status (payload contains { id, error })
      .addCase(updateTaskStatus.rejected,  (state, action) => {
        state.error = action.payload?.error || 'Failed to update task status';
      });
  },
});

export const { optimisticStatusUpdate } = tasksSlice.actions;
export default tasksSlice.reducer;

export const {
  selectAll:  selectAllTasks,
  selectById: selectTaskById,
} = adapter.getSelectors((state) => state.tasks);
