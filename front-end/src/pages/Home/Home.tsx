import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Home.module.scss';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>EventManager</h1>
      <div className={styles.content}>
        <img src="https://i.pinimg.com/736x/90/44/a6/9044a634e09b2a633ff73efad0fdf470.jpg" alt="Logo" className={styles.logo} />
        <p className={styles.description}>
          Добро пожаловать в EventManager - удобное приложение для управления мероприятиями.
          Создавайте, управляйте и отслеживайте события с легкостью!
        </p>
        {!isAuthenticated && (
          <div className={styles.buttons}>
            <Link to="/login" className={styles.button}>
              Войти
            </Link>
            <Link to="/register" className={styles.button}>
              Регистрация
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;