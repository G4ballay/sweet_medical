import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  TextField,
  Typography,
} from '@mui/material';

import PasswordFields from '../common/PasswordFields.jsx';

function UserAccountSection({ value, onChange, onSave, variant, hasChanges}) {
  const usernameTooLong = value.username.length > 30;
  const hasPassword = value.password.trim() !== '';
  const passwordsMatch = value.password === value.confirmPassword;

  const handleChange = (field, newValue) => {
    onChange({
      ...value,
      [field]: newValue,
    });
  };

const content = (
    <>
      {variant !== 'plain' && (
        <>
          <Typography id="user-account-title" variant="h6" fontWeight={600}>
            Datos de usuario
          </Typography>

          <Typography id="user-account-description" variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Actualizá tu email, nombre de usuario y contraseña.
          </Typography>

          <Divider sx={{ my: 2 }} />
        </>
      )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '1fr 1fr',
            },
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            autoComplete="email"
            label="Email"
            value={value.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />

          <TextField
            fullWidth
            autoComplete="username"
            label="Nombre de usuario"
            value={value.username}
            error={usernameTooLong}
            helperText='El nombre de usuario no puede superar los 30 caracteres.'
            onChange={(e) => handleChange('username', e.target.value)}
            slotProps={{
              htmlInput: {
                maxLength: 30,
              },
            }}
          />

          <PasswordFields
            password={value.password}
            confirmPassword={value.confirmPassword}
            onPasswordChange={(newValue) => handleChange('password', newValue)}
            onConfirmPasswordChange={(newValue) =>
              handleChange('confirmPassword', newValue)
            }
          />
        </Box>
      

      <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 3,}}>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={!hasChanges || usernameTooLong || (hasPassword && !passwordsMatch)}
        >
          Guardar datos de usuario
        </Button>
      </Box>
    </>
  );

  if (variant === 'plain') {
    return content;
  }

  return (
    <Card
      component="section"
      aria-labelledby="user-account-title"
      aria-describedby="user-account-description"
    >
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}

export default UserAccountSection;