import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { clearUser } from '../../store/slices/userSlice';
import styles from './Header.module.scss';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: RootState) => state.user);

  const handleLogout = () => {
    dispatch(clearUser());
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to="/">Event Manager</Link>
      </div>
      <nav className={styles.nav}>
        {currentUser ? (
          <>
            <ul className={styles.navLinks}>
              <li>
                <Link to="/profile">Профиль</Link>
              </li>
              <li>
                <Link to="/events">Мероприятия</Link>
              </li>
            </ul>
            <div className={styles.auth}>
              <span className={styles.userName}>
                {currentUser.firstName} {currentUser.lastName}
              </span>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                Выйти
              </button>
            </div>
          </>
        ) : (
          <ul className={styles.navLinks}>
            <li>
              <Link to="/login">Войти</Link>
            </li>
            <li>
              <Link to="/register">Регистрация</Link>
            </li>
          </ul>
        )}
      </nav>
    </header>
  );
};

export default Header;