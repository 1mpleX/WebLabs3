import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { setUser } from './store/slices/userSlice';
import { Profile } from './components/Profile/Profile';
import { EventList } from './components/Events/EventList';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import Header from './components/Header/Header';
import { getCurrentUser } from './api/auth';
import styles from './App.module.scss';

const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  
  return currentUser ? element : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Проверяем наличие токена
        const token = localStorage.getItem('accessToken');
        if (token && !currentUser) {
          // Если токен есть, но пользователя нет в Redux, получаем данные пользователя
          const user = await getCurrentUser();
          dispatch(setUser(user));
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        // В случае ошибки (например, токен истек) очищаем localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    };

    checkAuth();
  }, [dispatch, currentUser]);

  return (
    <Router>
      <div className={styles.app}>
        <Header />
        
        <main className={styles.main}>
          <Routes>
            <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/profile" />} />
            <Route path="/register" element={!currentUser ? <Register /> : <Navigate to="/profile" />} />
            <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
            <Route path="/events" element={<PrivateRoute element={<EventList />} />} />
            <Route path="/" element={currentUser ? <Navigate to="/profile" /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
