import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import api from '../utils/axios';

// createEntityAdapter gives us: selectAll, selectById, selectIds,
// plus addOne/addMany/upsertOne/removeOne/updateOne pre-built reducers
const adapter = createEntityAdapter();

export const fetchProjects = createAsyncThunk('projects/fetchAll', async () => {
  const res = await api.get('/projects');
  return res.data;
});

export const addProject = createAsyncThunk('projects/add', async (project) => {
  const res = await api.post('/projects', { ...project, id: String(Date.now()) });
  return res.data;
});

export const deleteProject = createAsyncThunk('projects/delete', async (id) => {
  await api.delete(`/projects/${id}`);
  return id;
});

export const updateProjectStatus = createAsyncThunk('projects/updateStatus', async ({ id, status }) => {
  const res = await api.patch(`/projects/${id}`, { status });
  return res.data;
});

const projectsSlice = createSlice({
  name: 'projects',
  initialState: adapter.getInitialState({ status: 'idle', error: null, total: 0 }),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending,   (state) => { state.status = 'loading'; })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.total  = action.payload.length;
        adapter.setAll(state, action.payload);
      })
      .addCase(fetchProjects.rejected,  (state, action) => { state.status = 'failed'; state.error = action.error.message; })
      .addCase(addProject.fulfilled,          (state, action) => { adapter.addOne(state, action.payload); })
      .addCase(deleteProject.fulfilled,       (state, action) => { adapter.removeOne(state, action.payload); })
      .addCase(updateProjectStatus.fulfilled, (state, action) => { adapter.upsertOne(state, action.payload); });
  },
});

export default projectsSlice.reducer;

// Entity adapter selectors — scoped to state.projects
export const {
  selectAll:   selectAllProjects,
  selectById:  selectProjectById,
  selectIds:   selectProjectIds,
} = adapter.getSelectors((state) => state.projects);
