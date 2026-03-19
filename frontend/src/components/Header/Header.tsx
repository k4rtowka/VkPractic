import s from './Header.module.scss';
import logo from '../../assets/reward.png';
import { Button } from '../Button/Button';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const navigate = useNavigate();

  return (
    <div className={s.root}>
      <div className={s.leftWrapper} onClick={() => navigate('/home')}>
        <div className={s.logoWrapper}>
          <img className={s.logo} src={logo} alt="logo" />
        </div>
        <div className={s.title}>QuizMaster</div>
      </div>
      <div className={s.rightWrapper}>
        <Button
          text="Войти"
          variant="primary"
          onClick={() => navigate('/auth')}
        />
      </div>
    </div>
  );
};
