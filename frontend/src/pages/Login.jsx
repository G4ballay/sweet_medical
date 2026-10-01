import SweetMedicalIcon from "@/assets/logo.svg?react";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
  SvgIcon,
  TextField,
  Typography
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginWrapper = styled(Box)({
  display: "flex",
  minHeight: "100vh",
  overflow: "hidden",
  backgroundColor: "background.default"
});

const BannerContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  width: "60%",
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  position: "relative",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
  [theme.breakpoints.down("md")]: {
    display: "none",
  }
}));

const FormContainer = styled(Box)(({ theme }) => ({
  width: "40%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.background.paper,
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(6),
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  [theme.breakpoints.down("md")]: {
    width: "100%",
  },
  [theme.breakpoints.up("sm")]: {
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6),
  }
}));

function useLoginForm() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ error: "", loading: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ error: "", loading: true });
    try {
      await login(formData);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Error al iniciar sesión. Verificá tus credenciales.";
      setStatus({ error: msg, loading: false });
    }
  };

  return { formData, handleChange, showPassword, togglePassword, status, handleSubmit };
}

const SideBanner = () => (
  <BannerContainer>
    <Box sx={{ position: "relative", zIndex: 1, textAlign: "center", px: 6 }}>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 80,
          height: 80,
          borderRadius: (t) => t.custom.radiusLg,
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(10px)",
          mb: 4,
        }}
      >
        <SvgIcon component={SweetMedicalIcon} inheritViewBox sx={{ fontSize: 44, color: "secondary.main" }} />
      </Box>
      <Typography variant="h3" sx={{ color: "secondary.main", fontWeight: 800, mb: 2, letterSpacing: "-0.02em" }}>
        Sweet Medical
      </Typography>
      <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.85)", fontWeight: 400, maxWidth: 400, mx: "auto", lineHeight: 1.6 }}>
        Tu plataforma integral para gestionar turnos médicos de forma simple y segura.
      </Typography>
    </Box>
  </BannerContainer>
);

export default function Login() {
  const navigate = useNavigate();
  const { formData, handleChange, showPassword, togglePassword, status, handleSubmit } = useLoginForm();

  return (
    <LoginWrapper>
      <SideBanner />
      <FormContainer>
        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%", maxWidth: 420 }}>
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", justifyContent: "center", mb: 3, gap: 1 }}>
            <SvgIcon component={SweetMedicalIcon} inheritViewBox sx={{ mr: 1, fontSize: 28, color: "primary.main" }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: "primary.main" }}>
              Sweet Medical
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}>
            Bienvenido
          </Typography>
          <Typography sx={{ color: "text.secondary", mb: 4, fontSize: "0.95rem" }}>
            Ingresá tus credenciales para acceder a tu cuenta
          </Typography>

          {status.error && (
            <Alert
              severity="error"
              aria-live="assertive"
              sx={{
                mb: 3,
                borderRadius: (t) => t.custom.radiusMd,
                "& .MuiAlert-icon": { color: "primary.main" },
              }}
            >
              {status.error}
            </Alert>
          )}

          <TextField
            autoFocus
            fullWidth
            label="Email o usuario"
            name="identifier"
            value={formData.identifier}
            onChange={handleChange}
            required
            autoComplete="username"
            sx={{ mb: 2.5 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircleOutlinedIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            fullWidth
            label="Contraseña"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            sx={{ mb: 3 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePassword}
                      edge="end"
                      size="small"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? (
                        <VisibilityOffIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                      ) : (
                        <VisibilityIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Link
              component={RouterLink}
              to="/contrasena-olvidada"
              variant="body2"
              sx={{
                color: "primary.main",
                fontSize: "0.82rem",
                cursor: "pointer",
                fontWeight: 500,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
              /*component="button"
              type="button"
              variant="body2"
              onClick={() => {}}
              sx={{
                color: "primary.main",
                fontSize: "0.82rem",
                cursor: "pointer",
                fontWeight: 500,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}*/
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </Box>

          <Button type="submit" fullWidth variant="contained" disabled={status.loading} sx={{ py: 1.5, fontSize: "1rem", mb: 3 }}>
            {status.loading ? (
              <CircularProgress size={24} sx={{ color: "secondary.main" }} aria-label="Cargando..." />
            ) : (
              "Iniciar Sesión"
            )}
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
              ¿Aún no eres usuario?{" "}
              <Link
                component={RouterLink}
                to="/registro"
                sx={{
                  color: "primary.main",
                  fontWeight: 500,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Regístrate aquí
              </Link>
            </Typography>
          </Box>
        </Box>
      </FormContainer>
    </LoginWrapper>
  );
}
