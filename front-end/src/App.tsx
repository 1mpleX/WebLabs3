import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import { Profile } from './components/Profile/Profile';
import { EventList } from './components/Events/EventList';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import Header from './components/Header/Header';
import styles from './App.module.scss';

const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  
  return currentUser ? element : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);

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
