import { useId, useState } from 'react';

import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';

import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function PasswordFields({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  passwordLabel = 'Nueva contraseña',
  confirmPasswordLabel = 'Confirmar contraseña',
  passwordHelperText = 'Completá este campo solo si querés cambiar la contraseña.',
  disabledConfirmUntilPassword = true,
  minLength = 8,
  maxLength = 50,
  showRules = true,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const passwordRulesId = useId();

  const hasPassword = password.trim() !== '';
  const hasConfirmPassword = confirmPassword.trim() !== '';

  const passwordsMatch = password === confirmPassword;


  const passwordRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const passwordTooLong =
  password.length > maxLength;

  const showConfirmPasswordError =
    hasPassword &&
    hasConfirmPassword &&
    !passwordsMatch;

  const PasswordRule = ({ valid, children }) => (
    <Typography
      variant="caption"
      sx={{
        color: valid ? 'success.main' : 'error.main',
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        lineHeight: 1.4,
        fontWeight: 500,
      }}
    >
      {valid ? (
        <CheckCircleIcon sx={{ fontSize: 16 }} aria-hidden="true"/>
      ) : (
        <CancelIcon sx={{ fontSize: 16 }} aria-hidden="true"/>
      )}

      {children}
    </Typography>
  );

  return (
    <>
      <Box>
        <TextField
          fullWidth
          type={showPassword ? 'text' : 'password'}
          label={passwordLabel}
          value={password}
          error={passwordTooLong}
          helperText={
            passwordTooLong
              ? `La contraseña no puede superar los ${maxLength} caracteres.`
              : passwordHelperText
          }
          onChange={(e) => onPasswordChange(e.target.value)}
          autoComplete="new-password"
          slotProps={{
            htmlInput: {
              maxLength,
              'aria-describedby': showRules && hasPassword ? passwordRulesId : undefined,
            },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((prev) => !prev)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        {showRules && hasPassword && (
          <Box
            id={passwordRulesId}
            role="status"
            aria-live="polite"
            sx={{
              mt: 1,
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
              },
              gap: 0.5,
            }}
          >
            <PasswordRule valid={passwordRules.length}>
              Entre {minLength} y {maxLength} caracteres
            </PasswordRule>

            <PasswordRule valid={passwordRules.uppercase}>
              Una letra mayúscula
            </PasswordRule>

            <PasswordRule valid={passwordRules.lowercase}>
              Una letra minúscula
            </PasswordRule>

            <PasswordRule valid={passwordRules.number}>
              Un número
            </PasswordRule>
          </Box>
        )}
      </Box>

      <TextField
        fullWidth
        type={showConfirmPassword ? 'text' : 'password'}
        label={confirmPasswordLabel}
        value={confirmPassword}
        onChange={(e) => onConfirmPasswordChange(e.target.value)}
        autoComplete="new-password"
        disabled={disabledConfirmUntilPassword && !hasPassword}
        error={showConfirmPasswordError}
        helperText={
          showConfirmPasswordError
            ? 'Las contraseñas no coinciden'
            : hasPassword
              ? 'Repetí la contraseña para confirmar.'
              : 'Completá primero la contraseña.'
        }
        slotProps={{
          htmlInput: {
            maxLength,
          },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  disabled={disabledConfirmUntilPassword && !hasPassword}
                  aria-label={
                    showConfirmPassword
                      ? 'Ocultar confirmación de contraseña'
                      : 'Mostrar confirmación de contraseña'
                  }
                  aria-pressed={showConfirmPassword}
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    </>
  );
}

export default PasswordFields;