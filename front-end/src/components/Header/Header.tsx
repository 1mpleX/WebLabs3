import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Header.module.scss';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        EventManager
      </Link>
      <nav className={styles.nav}>
        {isAuthenticated ? (
          <>
            <span className={styles.username}>{user?.name}</span>
            <Link to="/events" className={styles.link}>
              Мероприятия
            </Link>
            <button onClick={logout} className={styles.button}>
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={styles.link}>
              Войти
            </Link>
            <Link to="/register" className={styles.link}>
              Регистрация
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;