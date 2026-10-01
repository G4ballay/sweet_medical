import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Button,
  Container,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import SvgIcon from '@mui/material/SvgIcon';
import SweetMedicalIcon from '@/assets/logo.svg?react';

import PasswordFields from '../common/PasswordFields.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';

import { createUser } from '../../services/user.service.js';
import { createDoctor } from '../../services/doctor.service.js';

function DoctorRegisterForm({ onBack }) {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    licenseNumber: '',
    username: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
  });

  const nameIsValid =
    form.fullName.trim().length > 0 &&
    form.fullName.trim().length <= 30;

  const usernameIsValid =
    form.username.trim().length > 0 &&
    form.username.trim().length <= 30;

  const licenseIsValid =
    /^[0-9]{4,12}$/.test(form.licenseNumber);

  const emailsMatch =
    form.email === form.confirmEmail || form.confirmEmail === '';

  const passwordsMatch =
    form.password === form.confirmPassword || form.confirmPassword === '';

  const passwordIsValid =
    form.password.length >= 8 &&
    form.password.length <= 50 &&
    /[A-Z]/.test(form.password) &&
    /[a-z]/.test(form.password) &&
    /[0-9]/.test(form.password);

  const canSubmit =
    nameIsValid &&
    usernameIsValid &&
    licenseIsValid &&
    form.email.trim() !== '' &&
    form.confirmEmail.trim() !== '' &&
    form.password.trim() !== '' &&
    form.confirmPassword.trim() !== '' &&
    form.email === form.confirmEmail &&
    form.password === form.confirmPassword &&
    passwordIsValid;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLicenseChange = (e) => {
    const onlyNumbers = e.target.value.replace(/\D/g, '');

    setForm((prev) => ({
      ...prev,
      licenseNumber: onlyNumbers,
    }));
  };

  const handlePasswordChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canSubmit) {
      showNotification(
        'Revisá los campos del formulario antes de continuar.',
        'error'
      );
      return;
    }

    try {
      setLoading(true);

      const createdUser = await createUser({
        username: form.username,
        email: form.email,
        password: form.password,
        role: 'doctor',
      });

      await createDoctor({
        userId: createdUser.id,
        registration: `MED-AR-${form.licenseNumber}`,
        name: form.fullName,
        specialtyIds: [],
        practiceIds: [],
        locationIds: [],
        availabilities: [],
      });

      showNotification(
        'Registro exitoso. Ya podés iniciar sesión.',
        'success'
      );

      navigate('/iniciar-sesion');
    } catch (error) {
      showNotification(
        error.response?.data?.message ||
          error.response?.data?.errors?.[0]?.msg ||
          'Ocurrió un error al registrar el médico',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'primary.main',
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 2,
          }}
        >
          <SvgIcon
            component={SweetMedicalIcon}
            inheritViewBox
            aria-hidden="true"
            focusable="false"
            sx={{
              fontSize: {
                xs: 60,
                sm: 70,
                md: 80,
              },
              color: 'white',
              mb: 2,
            }}
          />

          <Typography
            sx={{
              color: 'white',
              fontWeight: 800,
              mb: 4,
              textAlign: 'center',
              fontSize: {
                xs: '2.4rem',
                sm: '3rem',
              },
            }}
          >
            Sweet Medical
          </Typography>

          <Paper
            aria-labelledby="doctor-register-title"
            sx={{
              width: '100%',
              maxWidth: 550,
              p: {
                xs: 3,
                sm: 5,
              },
              borderRadius: (t) => t.custom.radiusMd,
              textAlign: 'center',
            }}
          >
            <Typography id="doctor-register-title" variant="h4" fontWeight={600} sx={{ mb: 1 }}>
              Registro de Médico
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Completá tus datos profesionales.
            </Typography>

            <form 
              onSubmit={handleSubmit}
              aria-label="Formulario de registro de médico"
              noValidate  
            >
              <Stack spacing={2}>
                <TextField
                  label="Nombre completo"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  error={form.fullName !== '' && !nameIsValid}
                  helperText='El nombre no puede superar los 30 caracteres.'
                  slotProps={{
                    htmlInput: {
                      maxLength: 30,
                    },
                  }}
                  fullWidth
                  required
                />

                <TextField
                  label="Número de matrícula"
                  name="licenseNumber"
                  value={form.licenseNumber}
                  onChange={handleLicenseChange}
                  error={form.licenseNumber !== '' && !licenseIsValid}
                  aria-describedby="license-helper-text"
                  helperText={
                    form.licenseNumber !== '' && !licenseIsValid
                      ? 'La matrícula debe tener entre 4 y 12 números.'
                      : ''
                  }
                  fullWidth
                  required
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          MED-AR-
                        </InputAdornment>
                      ),
                    },
                    htmlInput: {
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                      maxLength: 12,
                    },
                  }}
                />

                <TextField
                  label="Nombre de usuario"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  error={form.username !== '' && !usernameIsValid}
                  helperText='El nombre de usuario no puede superar los 30 caracteres.'
                  slotProps={{
                    htmlInput: {
                      maxLength: 30,
                    },
                  }}
                  fullWidth
                  required
                />

                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  fullWidth
                  required
                />

                <TextField
                  label="Confirmar Email"
                  name="confirmEmail"
                  type="email"
                  value={form.confirmEmail}
                  onChange={handleChange}
                  error={!emailsMatch}
                  helperText={!emailsMatch ? 'Los correos no coinciden' : ''}
                  fullWidth
                  required
                />

                <PasswordFields
                  password={form.password}
                  confirmPassword={form.confirmPassword}
                  onPasswordChange={(value) =>
                    handlePasswordChange('password', value)
                  }
                  onConfirmPasswordChange={(value) =>
                    handlePasswordChange('confirmPassword', value)
                  }
                  passwordLabel="Contraseña"
                  confirmPasswordLabel="Confirmar contraseña"
                  passwordHelperText="Debe tener entre 8 y 50 caracteres, una mayúscula, una minúscula y un número."
                  minLength={8}
                  maxLength={50}
                  disabledConfirmUntilPassword
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={!canSubmit || loading}
                  aria-busy={loading}
                >
                  {loading ? 'Registrando...' : 'Registrarme'}
                </Button>

                <Button
                  variant="text"
                  fullWidth
                  onClick={onBack}
                  disabled={loading}
                >
                  Volver
                </Button>
              </Stack>
            </form>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

export default DoctorRegisterForm;