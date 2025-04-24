import { Link } from 'react-router-dom';
import styles from './NotFound.module.scss';

const NotFound = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>404</h1>
      <p className={styles.description}>Страница не найдена</p>
      <Link to="/" className={styles.link}>
        Вернуться на главную
      </Link>
    </div>
  );
};

export default NotFound;