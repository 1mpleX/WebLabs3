import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateUserAsync } from '../../store/slices/userSlice';
import { User } from '../../types';
import styles from './Profile.module.scss';

export const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const { currentUser, loading, error } = useSelector((state: RootState) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>(currentUser || {});

  if (!currentUser) {
    return <div>Пользователь не авторизован</div>;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(updateUserAsync(formData)).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  return (
    <div className={styles.profile}>
      <h2>Профиль пользователя</h2>
      
      {error && <div className={styles.error}>{error}</div>}
      
      {isEditing ? (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Имя:</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName || ''}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Фамилия:</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName || ''}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Пол:</label>
            <select
              name="gender"
              value={formData.gender || ''}
              onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
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
              value={formData.birthDate?.split('T')[0] || ''}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.buttons}>
            <button type="submit" disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button type="button" onClick={() => setIsEditing(false)} disabled={loading}>
              Отмена
            </button>
          </div>
        </form>
      ) : (
        <div className={styles.info}>
          <p><strong>Имя:</strong> {currentUser.firstName}</p>
          <p><strong>Фамилия:</strong> {currentUser.lastName}</p>
          <p><strong>Email:</strong> {currentUser.email}</p>
          <p><strong>Пол:</strong> {currentUser.gender === 'male' ? 'Мужской' : 'Женский'}</p>
          <p><strong>Дата рождения:</strong> {new Date(currentUser.birthDate).toLocaleDateString()}</p>
          <button onClick={() => setIsEditing(true)}>Редактировать</button>
        </div>
      )}
    </div>
  );
}; 