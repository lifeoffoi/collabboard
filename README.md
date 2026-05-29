# CollabBoard — Advanced React + Redux Revision Reference

Concepts here go beyond TaskFlow. Use this when you need the patterns for
createEntityAdapter, createSelector, optimistic updates, useDebounce, usePolling,
React.memo, useCallback, FileReader, and nested relational data.

---

## How to Run

```bash
# Terminal 1 — API
npm run api        # json-server on port 3001

# Terminal 2 — App
npm run dev        # Vite on port 5173
```

Test accounts in db.json:
- janice@collabboard.com / password123 (admin)
- spencer@collabboard.com / password123 (user)
- alex@collabboard.com / password123 (user)

---

## Project Structure

```
src/
  context/
    AuthContext.jsx     # Context API + useReducer for auth (login/register/logout/avatar)
    UIContext.jsx       # Context for UI state (sidebar open/closed)
  hooks/
    useDebounce.js      # Debounces a value after N ms of inactivity
    usePolling.js       # Calls a function on an interval, cleans up on unmount
    useLocalStorage.js  # useState synced to localStorage
  redux/
    store.js            # configureStore
    projectsSlice.js    # createEntityAdapter + createAsyncThunk for projects
    tasksSlice.js       # createEntityAdapter + optimistic updates
    commentsSlice.js    # createEntityAdapter for comments
    selectors.js        # createSelector memoised selectors
  components/
    TaskCard.jsx        # React.memo + useCallback
    ActivityFeed.jsx    # usePolling + useCallback
    Pagination.jsx      # Client-side pagination component
    Sidebar.jsx         # Consumes UIContext
    Navbar.jsx          # Consumes AuthContext + UIContext
    PrivateRoute.jsx    # Outlet pattern — redirects if not logged in
    PublicRoute.jsx     # Outlet pattern — redirects if already logged in
    ErrorBoundary.jsx   # Class component
    SkeletonCard.jsx    # Loading placeholder
  pages/
    LoginPage.jsx       # Controlled form, dispatches login action via context
    RegisterPage.jsx    # Controlled form with role selection
    ProjectsPage.jsx    # Pagination, role-based delete, activity feed
    ProjectDetailPage.jsx # Filters, sort, useDebounce search, useSearchParams
    TaskDetailPage.jsx  # Subtasks (dynamic array), comments, progress bar
    ProfilePage.jsx     # File upload via FileReader API → base64
```

---

## createEntityAdapter

Manages a normalised collection (like a Map keyed by id).
Gives you pre-built reducers and selectors for free.

```js
import { createEntityAdapter } from '@reduxjs/toolkit';

const adapter = createEntityAdapter();

// adapter.getInitialState() → { ids: [], entities: {} }
// adapter.setAll(state, items)     — replace entire collection
// adapter.addOne(state, item)      — add one
// adapter.upsertOne(state, item)   — add or update one
// adapter.removeOne(state, id)     — remove by id
// adapter.updateOne(state, { id, changes }) — partial update

const slice = createSlice({
  name: 'projects',
  initialState: adapter.getInitialState({ status: 'idle' }),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.fulfilled, (state, action) => {
        adapter.setAll(state, action.payload);
      })
      .addCase(addProject.fulfilled,    (state, action) => { adapter.addOne(state, action.payload); })
      .addCase(deleteProject.fulfilled, (state, action) => { adapter.removeOne(state, action.payload); });
  },
});

// Scoped selectors — pass the slice's state, not root state
export const { selectAll: selectAllProjects, selectById: selectProjectById }
  = adapter.getSelectors((state) => state.projects);
```

---

## createSelector (Memoised Selectors)

`createSelector` from Redux Toolkit (re-exports from Reselect).
Only recomputes when its input selectors return new values.

```js
import { createSelector } from '@reduxjs/toolkit';

// Input selectors run first; output selector only runs if inputs changed
export const selectFilteredTasks = createSelector(
  [
    selectAllTasks,               // input 1
    (_, projectId) => projectId,  // input 2 — extra arg passed at call site
    (_, __, filters) => filters,  // input 3
  ],
  (tasks, projectId, filters) => {
    // This function is memoised — skipped if tasks/projectId/filters unchanged
    return tasks
      .filter((t) => t.projectId === projectId)
      .filter((t) => !filters?.priority || t.priority === filters.priority);
  }
);

// Usage in component — pass extra args after state
const tasks = useSelector((s) => selectFilteredTasks(s, projectId, { priority: 'high' }));
```

---

## Optimistic Updates

Update the UI immediately before the API responds.
Roll back if the API call fails.

```js
// In the slice:
reducers: {
  optimisticStatusUpdate: (state, action) => {
    adapter.updateOne(state, { id: action.payload.id, changes: { status: action.payload.status } });
  },
},
extraReducers: (builder) => {
  builder
    .addCase(updateTaskStatus.fulfilled, (state, action) => {
      adapter.upsertOne(state, action.payload); // confirmed by server
    })
    .addCase(updateTaskStatus.rejected, (state, action) => {
      state.error = action.payload?.error; // UI has already changed — handle rollback here
    });
},

// In the component:
const handleStatusChange = (e) => {
  const newStatus = e.target.value;
  dispatch(optimisticStatusUpdate({ id: task.id, status: newStatus })); // instant
  dispatch(updateTaskStatus({ id: task.id, status: newStatus }));        // async
};
```

---

## useDebounce

Prevents running expensive logic on every keystroke.

```js
import { useState, useEffect } from 'react';

const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer); // cancel on next keystroke
  }, [value, delay]);

  return debouncedValue;
};

// Usage
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);

// Use debouncedSearch for filtering — only updates 300ms after typing stops
const filtered = tasks.filter(t => t.title.includes(debouncedSearch));
```

---

## usePolling

Runs a callback on a fixed interval, stops on unmount.

```js
import { useEffect, useRef } from 'react';

const usePolling = (callback, interval = 5000) => {
  const savedCallback = useRef(callback);
  useEffect(() => { savedCallback.current = callback; }, [callback]);

  useEffect(() => {
    savedCallback.current();                                // run immediately
    const id = setInterval(() => savedCallback.current(), interval);
    return () => clearInterval(id);                        // cleanup on unmount
  }, [interval]);
};

// Usage — polls every 5 seconds
usePolling(fetchActivityFeed, 5000);
```

**Why useRef?** Without it, changing `callback` would restart the interval every render.
The ref keeps the callback up to date without triggering the `useEffect`.

---

## React.memo and useCallback

**React.memo** — wraps a component; skips re-render if props are the same (shallow equal).

**useCallback** — memoises a function so its reference stays stable between renders.
Without it, a new function is created every render → memo sees a new prop → re-renders anyway.

```jsx
import { memo, useCallback } from 'react';

// memo — TaskCard only re-renders when task or projectId changes
const TaskCard = memo(({ task, projectId }) => {
  const dispatch = useDispatch();

  // useCallback — stable reference; memo comparison works correctly
  const handleStatusChange = useCallback((e) => {
    dispatch(updateTaskStatus({ id: task.id, status: e.target.value }));
  }, [dispatch, task.id]); // only recreated when task.id changes

  return (
    <div>
      <span>{task.title}</span>
      <select onChange={handleStatusChange} value={task.status}>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>
    </div>
  );
});
```

---

## FileReader API (Profile Picture Upload)

Converts a local file to a base64 string without a real server upload.

```jsx
import { useRef } from 'react';

const ProfilePage = () => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const base64 = event.target.result; // "data:image/png;base64,..."
      saveToDatabase(base64);             // store as string
    };

    reader.readAsDataURL(file); // triggers onload asynchronously
  };

  return (
    <>
      <button onClick={() => fileInputRef.current.click()}>Upload Photo</button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </>
  );
};
```

---

## Dynamic Form Arrays (Subtasks)

Managing a list of items in local state before saving.

```jsx
const [subtasks, setSubtasks] = useState([]);
const [newTitle, setNewTitle] = useState('');

// Add
const handleAdd = async (e) => {
  e.preventDefault();
  const res = await api.post('/subtasks', { title: newTitle, done: false });
  setSubtasks((prev) => [...prev, res.data]); // append to array
  setNewTitle('');
};

// Toggle
const toggle = async (sub) => {
  const updated = { ...sub, done: !sub.done };
  await api.patch(`/subtasks/${sub.id}`, { done: updated.done });
  setSubtasks((prev) => prev.map((s) => s.id === sub.id ? updated : s));
};

// Render
{subtasks.map((sub) => (
  <li key={sub.id}>
    <input type="checkbox" checked={sub.done} onChange={() => toggle(sub)} />
    <span style={{ textDecoration: sub.done ? 'line-through' : 'none' }}>{sub.title}</span>
  </li>
))}
```

---

## Context API with useReducer (Auth pattern — like movies-app)

The professor's pattern: Context for auth, Redux only for server data.

```jsx
// 1. Define reducer
function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      localStorage.setItem('user', JSON.stringify(action.payload));
      return { ...state, user: action.payload };
    case 'LOGOUT':
      localStorage.removeItem('user');
      return { ...state, user: null };
    default:
      return state;
  }
}

// 2. Create context + provider
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: JSON.parse(localStorage.getItem('user') || 'null'),
  });

  const login  = (user)  => dispatch({ type: 'LOGIN',  payload: user });
  const logout = ()      => dispatch({ type: 'LOGOUT' });

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Custom hook
export const useAuth = () => useContext(AuthContext);
```

---

## PrivateRoute and PublicRoute with Outlet

The professor used this pattern (Outlet-based, cleaner than wrapping children).

```jsx
// PrivateRoute — renders child routes if logged in, else redirects
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// PublicRoute — renders child routes only if NOT logged in
const PublicRoute = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : <Outlet />;
};

// In App.jsx — nest routes inside the guard route
<Route element={<PrivateRoute />}>
  <Route path="/"        element={<ProjectsPage />} />
  <Route path="/profile" element={<ProfilePage />} />
</Route>

<Route element={<PublicRoute />}>
  <Route path="/login"    element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
</Route>
```

---

## Pagination (Client-side)

```jsx
const PAGE_SIZE = 3;
const [page, setPage] = useState(1);

const paginated  = allItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
const totalPages = Math.ceil(allItems.length / PAGE_SIZE);

// Render paginated items, pass page controls to Pagination component
<Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
```

---

## Key Files to Study

| File | Concept |
|---|---|
| `src/context/AuthContext.jsx` | Context API + useReducer, login/register/logout, localStorage |
| `src/redux/projectsSlice.js` | createEntityAdapter, CRUD thunks, adapter selectors |
| `src/redux/tasksSlice.js` | createEntityAdapter, optimistic updates, rollback on reject |
| `src/redux/selectors.js` | createSelector with multiple inputs and extra args |
| `src/hooks/useDebounce.js` | useEffect cleanup, debounce pattern |
| `src/hooks/usePolling.js` | setInterval + cleanup, useRef to avoid stale closures |
| `src/components/TaskCard.jsx` | React.memo + useCallback working together |
| `src/components/ActivityFeed.jsx` | usePolling + useCallback |
| `src/pages/ProfilePage.jsx` | useRef + FileReader API |
| `src/pages/TaskDetailPage.jsx` | Dynamic subtask array, comments, local state + API sync |
| `src/pages/ProjectDetailPage.jsx` | useDebounce, useSearchParams, createSelector with filters |
| `src/components/PrivateRoute.jsx` | Outlet-based route protection |

Good luck.
