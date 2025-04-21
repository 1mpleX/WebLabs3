import { Event } from '../../types';
import styles from './EventCard.module.scss';

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className={styles.card}>
      {event.image_url && (
        <img src={event.image_url} alt={event.title} className={styles.image} />
      )}
      <div className={styles.content}>
        <h3 className={styles.title}>{event.title}</h3>
        <p className={styles.description}>{event.description}</p>
        <p className={styles.date}>{formatDate(event.date)}</p>
      </div>
    </div>
  );
};

export default EventCard;