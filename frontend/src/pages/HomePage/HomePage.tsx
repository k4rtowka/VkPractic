import s from './HomePage.module.scss';
import logo from '../../assets/reward.png';
import { Button } from '../../components/Button/Button';
import { Svg } from '../../components/Svg/Svg';
import { useNavigate } from 'react-router-dom';
import { HomePageItem } from './HomePageItem/HomePageItem';
import { HOME_PAGE_ITEMS_LIST } from './const';

export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className={s.root}>
      <div className={s.firstSection}>
        <div className={s.logoWrapper}>
          <img className={s.logo} src={logo} alt="logo" />
        </div>
        <h1 className={s.title}>Добро пожаловать в QuizMaster</h1>
        <div className={s.description}>
          Создавайте викторины, проводите их в реальном времени и наслаждайтесь
          соревновательным процессом
        </div>
        <div className={s.buttons}>
          <Button
            text="Начать сейчас"
            variant="primary"
            onClick={() => navigate('/auth')}
          />
          <Button text="Присоединиться к игре" variant="secondary" />
        </div>
      </div>
      <div className={s.secondSection}>
        <div className={s.card}>
          <div className={s.cardIcon}>
            <Svg
              name="lightning"
              className={s.iconImg}
              width={32}
              height={32}
            />
          </div>
          <div className={s.cardTitle}>Быстрое создание</div>
          <div className={s.cardDescription}>
            Создавайте викторины за несколько минут с интуитивным интерфейсом
          </div>
        </div>
        <div className={s.card}>
          <div className={s.cardIcon}>
            <Svg name="user" className={s.iconImg} width={32} height={32} />
          </div>
          <div className={s.cardTitle}>Игра в реальном времени</div>
          <div className={s.cardDescription}>
            Участники присоединяются по коду комнаты и играют одновременно
          </div>
        </div>
        <div className={s.card}>
          <div className={s.cardIcon}>
            <Svg name="aim" className={s.iconImg} width={32} height={32} />
          </div>
          <div className={s.cardTitle}>Отслеживание результатов</div>
          <div className={s.cardDescription}>
            Просматривайте статистику и результаты всех участников
          </div>
        </div>
      </div>
      <div className={s.thirdSection}>
        <div className={s.title}>Как это работает?</div>
        <div className={s.list}>
          {HOME_PAGE_ITEMS_LIST.map((item, index) => (
            <HomePageItem
              key={index}
              number={index + 1}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
