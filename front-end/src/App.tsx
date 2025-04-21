import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from  './routes';
import Header from './components/Header/Header';
import styles from './App.module.scss';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className={styles.app}>
          <Header />
          <main className={styles.main}>
            <AppRoutes />
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
