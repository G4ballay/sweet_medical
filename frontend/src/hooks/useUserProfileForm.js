import { useState } from 'react';
import { getUserById, updateUser } from '../services/user.service.js';

export function useUserProfileForm() {
  const [userForm, setUserForm] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [initialUserForm, setInitialUserForm] = useState(null);

  const userHasChanges =
    initialUserForm &&
    (
      userForm.email !== initialUserForm.email ||
      userForm.username !== initialUserForm.username ||
      userForm.password.trim() !== ''
    );

  const loadUser = async (userId) => {
    const user = await getUserById(userId);

    const userFormFromApi = {
      email: user.email || '',
      username: user.username || '',
      password: '',
      confirmPassword: '',
    };

    setUserForm(userFormFromApi);

    setInitialUserForm({
      email: userFormFromApi.email,
      username: userFormFromApi.username,
    });

    return user;
  };

  const saveUser = async (userId) => {
    const storedUser = JSON.parse(localStorage.getItem('sweet-medical-user'));

    const payload = {
      email: userForm.email,
      username: userForm.username,
      role: storedUser.role,
    };

    if (userForm.password.trim() !== '') {
      payload.password = userForm.password;
    }

    const updatedUser = await updateUser(userId, payload);

    setInitialUserForm({
      email: userForm.email,
      username: userForm.username,
    });

    setUserForm((prev) => ({
      ...prev,
      password: '',
      confirmPassword: '',
    }));

    return updatedUser;
  };

  return {
    userForm,
    setUserForm,
    userHasChanges,
    loadUser,
    saveUser,
  };
}