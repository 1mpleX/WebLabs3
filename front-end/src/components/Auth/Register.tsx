import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setUser } from '../../store/slices/userSlice';
import axiosInstance from '../../api/axios';
import styles from './Auth.module.scss';

export const Register: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    gender: '',
    birthDate: '',
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/auth/register', formData);
      
      // Сохраняем токены
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      // Устанавливаем пользователя в Redux
      dispatch(setUser(response.data.user));
      
      // После успешной регистрации перенаправляем на страницу мероприятий
      navigate('/events');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Ошибка при регистрации. Возможно, email уже используется.');
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2>Регистрация</h2>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Имя:</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Фамилия:</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Пароль:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Пол:</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
            >
              <option value="">Выберите пол</option>
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Дата рождения:</label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit" className={styles.submitBtn}>
            Зарегистрироваться
          </button>
        </form>
        <p className={styles.authLink}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
}; 