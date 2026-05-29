import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import api from '../utils/axios';

const adapter = createEntityAdapter();

export const fetchComments = createAsyncThunk('comments/fetchByTask', async (taskId) => {
  const res = await api.get(`/comments?taskId=${taskId}`);
  return res.data;
});

export const addComment = createAsyncThunk('comments/add', async (comment) => {
  const res = await api.post('/comments', { ...comment, id: String(Date.now()), createdAt: new Date().toISOString() });
  return res.data;
});

const commentsSlice = createSlice({
  name: 'comments',
  initialState: adapter.getInitialState({ status: 'idle' }),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending,   (state) => { state.status = 'loading'; })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        adapter.setAll(state, action.payload);
      })
      .addCase(addComment.fulfilled, (state, action) => { adapter.addOne(state, action.payload); });
  },
});

export default commentsSlice.reducer;

export const {
  selectAll: selectAllComments,
} = adapter.getSelectors((state) => state.comments);
