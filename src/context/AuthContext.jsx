import { createContext, useContext, useReducer } from 'react';
import api from '../utils/axios';

const AuthContext = createContext();

const initialState = {
  user: JSON.parse(localStorage.getItem('cb_user') || 'null'),
  status: 'idle',
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOADING':
      return { ...state, status: 'loading', error: null };
    case 'LOGIN':
      localStorage.setItem('cb_user', JSON.stringify(action.payload));
      return { ...state, user: action.payload, status: 'succeeded', error: null };
    case 'LOGOUT':
      localStorage.removeItem('cb_user');
      return { ...state, user: null, status: 'idle', error: null };
    case 'ERROR':
      return { ...state, status: 'failed', error: action.payload };
    case 'UPDATE_AVATAR':
      const updated = { ...state.user, avatar: action.payload };
      localStorage.setItem('cb_user', JSON.stringify(updated));
      return { ...state, user: updated };
    default:
      return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (email, password) => {
    dispatch({ type: 'LOADING' });
    try {
      const res = await api.get(`/users?email=${email}&password=${password}`);
      if (res.data.length === 0) throw new Error('Invalid email or password');
      dispatch({ type: 'LOGIN', payload: res.data[0] });
      return true;
    } catch (err) {
      dispatch({ type: 'ERROR', payload: err.message });
      return false;
    }
  };

  const register = async (name, email, password, role = 'user') => {
    dispatch({ type: 'LOADING' });
    try {
      const check = await api.get(`/users?email=${email}`);
      if (check.data.length > 0) throw new Error('Email already exists');
      const res = await api.post('/users', { name, email, password, role, avatar: '' });
      dispatch({ type: 'LOGIN', payload: res.data });
      return true;
    } catch (err) {
      dispatch({ type: 'ERROR', payload: err.message });
      return false;
    }
  };

  const logout = () => dispatch({ type: 'LOGOUT' });

  const updateAvatar = (base64) => dispatch({ type: 'UPDATE_AVATAR', payload: base64 });

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
