import { useState } from 'react';
import s from './ProfilePage.module.scss';
import { Button } from '../../components/Button/Button';
import { Svg } from '../../components/Svg/Svg';
import { Input } from '../../components/Input/Input';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { userSelector } from '../../store/selectors/AuthSelectors';
import { updateProfileUser } from '../../store/actions/authActions';
import { validateField } from '../../utils/validation';

export const ProfilePage = () => {
  const user = useAppSelector(userSelector);
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [nameError, setNameError] = useState<string>();

  const handleEdit = () => {
    if (isEditing) {
      const error = validateField(name, 'text');
      if (error) {
        setNameError(error);
        return;
      }
      setNameError('');
      dispatch(updateProfileUser(name.trim())).then(() => setIsEditing(false));
    } else {
      setNameError('');
      setIsEditing(true);
    }
  };

  if (!user) return null;

  return (
    <div className={s.root}>
      <div className={s.wrapper}>
        <h1 className={s.title}>Профиль</h1>

        <div className={s.userInfo}>
          <div className={s.userHeader}>
            <div className={s.avatar}>
              <Svg
                name="user"
                width={32}
                height={32}
                className={s.avatarIcon}
              />
            </div>
            <div className={s.userDetails}>
              <div className={s.userName}>{user.name}</div>
              <div className={s.userEmail}>{user.email}</div>
            </div>
            <Button
              text={isEditing ? 'Сохранить' : 'Редактировать'}
              variant="primary"
              onClick={handleEdit}
            />
          </div>
          {isEditing && (
            <>
              <div className={s.divider} />
              <Input
                id="profile-name"
                name="name"
                label="Имя"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError('');
                }}
                icon="user"
                error={nameError}
                required
                minLength={2}
                maxLength={30}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
