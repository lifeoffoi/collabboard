import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { AuthProvider } from './context/AuthContext';
import { UIProvider }   from './context/UIContext';
import ErrorBoundary from './components/ErrorBoundary';
import PrivateRoute  from './components/PrivateRoute';
import PublicRoute   from './components/PublicRoute';
import Navbar        from './components/Navbar';
import Sidebar       from './components/Sidebar';
import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import ProjectsPage      from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import TaskDetailPage    from './pages/TaskDetailPage';
import ProfilePage       from './pages/ProfilePage';
import NotFoundPage      from './pages/NotFoundPage';

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <UIProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <Navbar />
              <div className="app-body">
                <Sidebar />
                <main className="app-main">
                  <Routes>
                    <Route element={<PublicRoute />}>
                      <Route path="/login"    element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                    </Route>
                    <Route element={<PrivateRoute />}>
                      <Route path="/"                                  element={<ProjectsPage />} />
                      <Route path="/projects/:projectId"               element={<ProjectDetailPage />} />
                      <Route path="/projects/:projectId/tasks/:taskId" element={<TaskDetailPage />} />
                      <Route path="/profile"                           element={<ProfilePage />} />
                    </Route>
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>
              </div>
            </ErrorBoundary>
          </BrowserRouter>
        </UIProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;
