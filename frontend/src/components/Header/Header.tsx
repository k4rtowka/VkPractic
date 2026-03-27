import s from './Header.module.scss';
import logo from '../../assets/reward.png';
import { Button } from '../Button/Button';
import { Svg } from '../Svg/Svg';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logout } from '../../store/reducers/UserSlice';
import { isAuthSelector } from '../../store/selectors/AuthSelectors';

export const Header = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAuth = useAppSelector(isAuthSelector);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/home');
  };

  return (
    <div className={s.root}>
      <div className={s.leftWrapper} onClick={() => navigate('/home')}>
        <div className={s.logoWrapper}>
          <img className={s.logo} src={logo} alt="logo" />
        </div>
        <div className={s.title}>QuizMaster</div>
      </div>
      <div className={s.rightWrapper}>
        {isAuth ? (
          <>
            <Button
              text="Мои викторины"
              variant="secondary"
              onClick={() => navigate('/quiz-library')}
            />
            <Button
              text="Создать викторину"
              variant="primary"
              icon={<Svg name="plus" />}
              onClick={() => navigate('/quiz-create')}
            />
            <button
              className={s.iconButton}
              onClick={() => navigate('/profile')}
              type="button"
              aria-label="Профиль"
            >
              <Svg name="user" />
            </button>
            <button
              className={s.iconButton}
              onClick={handleLogout}
              type="button"
              aria-label="Выход"
            >
              <Svg name="logout" />
            </button>
          </>
        ) : (
          <Button
            text="Войти"
            variant="primary"
            onClick={() => navigate('/auth')}
          />
        )}
      </div>
    </div>
  );
};
