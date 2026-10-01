import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Button,
  Container,
  MenuItem,
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
import { createPatient } from '../../services/patient.service.js';
import { getHealthInsurances } from '../../services/healthInsurance.service.js';

function PatientRegisterForm({ onBack }) {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(false);
  const [healthInsuranceOptions, setHealthInsuranceOptions] = useState([]);

  const [form, setForm] = useState({
    fullName: '',
    dni: '',
    username: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    healthInsuranceId: '',
    planId: '',
  });

  const selectedHealthInsurance = healthInsuranceOptions.find(
    (healthInsurance) => healthInsurance.id === form.healthInsuranceId
  );

  const planOptions = selectedHealthInsurance?.plans || [];

  const emailsMatch =
    form.email === form.confirmEmail || form.confirmEmail === '';

  const passwordsMatch =
    form.password === form.confirmPassword || form.confirmPassword === '';

  const dniIsValid = /^[0-9]{7,9}$/.test(form.dni);
  const nameIsValid = form.fullName.trim().length > 0 && form.fullName.trim().length <= 30;
  const usernameIsValid = form.username.trim().length > 0 && form.username.trim().length <= 30;

  const canSubmit =
    form.fullName.trim() !== '' &&
    dniIsValid &&
    form.username.trim() !== '' &&
    form.email.trim() !== '' &&
    form.confirmEmail.trim() !== '' &&
    form.password.trim() !== '' &&
    form.confirmPassword.trim() !== '' &&
    form.healthInsuranceId !== '' &&
    form.planId !== '' &&
    form.email === form.confirmEmail &&
    form.password === form.confirmPassword;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'healthInsuranceId' ? { planId: '' } : {}),
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
        role: 'patient',
      });

      await createPatient({
        userId: createdUser.id,
        documentNumber: form.dni,
        name: form.fullName,
        healthInsuranceId: form.healthInsuranceId,
        planId: form.planId,
      });

      showNotification(
        'Registro exitoso. Ya podés iniciar sesión.',
        'success'
      );

      navigate('/iniciar-sesion');
    } catch (error) {
      showNotification(
        error.response?.data?.message ||
          'Ocurrió un error al registrar el paciente',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadHealthInsurances = async () => {
      try {
        const healthInsurances = await getHealthInsurances();
        setHealthInsuranceOptions(healthInsurances);
      } catch (error) {
        showNotification(
          'Ocurrió un error al cargar las obras sociales',
          'error'
        );
      }
    };

    loadHealthInsurances();
  }, []);

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
            component="section"
            aria-labelledby="patient-register-title"
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
            <Typography id="patient-register-title" variant="h4" fontWeight={600} sx={{ mb: 1 }}>
              Registro de Paciente
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Completá tus datos para crear una cuenta.
            </Typography>

            <form 
              onSubmit={handleSubmit}
              aria-label="Formulario de registro de paciente"
              noValidate
            >
              <Stack spacing={2}>
                <TextField
                  label="Nombre completo"
                  autoComplete="name"
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
                  label="DNI"
                  name="dni"
                  value={form.dni}
                  onChange={(e) => {
                    const onlyNumbers = e.target.value.replace(/\D/g, '');

                    setForm((prev) => ({
                      ...prev,
                      dni: onlyNumbers,
                    }));
                  }}
                  error={form.dni !== '' && !dniIsValid}
                  helperText={
                    form.dni !== '' && !dniIsValid
                      ? 'El DNI debe tener entre 7 y 9 números.'
                      : ''
                  }
                  slotProps={{
                    htmlInput: {
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                      maxLength: 9,
                    },
                  }}
                  fullWidth
                  required
                />

                <TextField
                  label="Nombre de usuario"
                  autoComplete="username"
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
                  autoComplete="email"
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

                <TextField
                  select
                  label="Obra social"
                  name="healthInsuranceId"
                  value={form.healthInsuranceId}
                  onChange={handleChange}
                  fullWidth
                  required
                >
                  {healthInsuranceOptions.map((healthInsurance) => (
                    <MenuItem
                      key={healthInsurance.id}
                      value={healthInsurance.id}
                    >
                      {healthInsurance.name}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Plan"
                  name="planId"
                  value={form.planId}
                  onChange={handleChange}
                  disabled={!form.healthInsuranceId}
                  error={Boolean(form.healthInsuranceId) && !form.planId}
                  helperText={
                    !form.healthInsuranceId
                      ? 'Seleccioná primero una obra social.'
                      : !form.planId
                        ? 'Seleccioná un plan.'
                        : ''
                  }
                  fullWidth
                  required
                >
                  {planOptions.map((plan) => (
                    <MenuItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </MenuItem>
                  ))}
                </TextField>

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
                  passwordHelperText="Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número."
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

export default PatientRegisterForm;