import {
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  Box
} from "@mui/material";

import SvgIcon from "@mui/material/SvgIcon";
import SweetMedicalIcon from "@/assets/logo.svg?react";
import PersonIcon from "@mui/icons-material/Person";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import { useNavigate } from "react-router-dom";

function RoleSelector({ onSelectRole }) {
    const navigate = useNavigate();
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "primary.main",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2
      }}
    >
      <Container maxWidth="sm"
        sx={{
          px: {
            xs: 2,
            sm: 3
          }
        }}
      >
        <Box 
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center"
          
        }}>
            <SvgIcon
            component={SweetMedicalIcon}
            inheritViewBox
            aria-hidden="true"
            focusable="false"
            sx={{
            fontSize: {
              xs: 60,
              sm: 70
            },
            color: "white",
            mb: 2
            }}
        />

        <Typography
            sx={{
              color: "white",
              fontWeight: 800,
              mb: 4,
              textAlign: "center",
              fontSize: {
                xs: "2.5rem",
                sm: "3rem"
              }
            }}
        >
            Sweet Medical
        </Typography>
        <Paper
          elevation={6}
          component="section"
          aria-labelledby="register-title"
          sx={{
            width: "100%",
            maxWidth: 520,
            p: {
              xs: 3,
              sm: 5
            },
            borderRadius: (t) => t.custom.radiusMd,
            textAlign: "center"
          }}
        >

          <Typography id="register-title" variant="h4" fontWeight={600}>
            Crear cuenta
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 1, mb: 4 }}
          >
            Seleccioná cómo deseas registrarte
          </Typography>

          <Stack spacing={2}>
            <Button
              variant="outlined"
              size="large"
              aria-label="Registrarme como paciente"
              startIcon={<PersonIcon />}
              onClick={() => onSelectRole("PATIENT")}
              sx={{
                py: 2
              }}
            >
              Registrarme como Paciente
            </Button>

            <Button
              variant="outlined"
              size="large"
              aria-label="Registrarme como médico"
              startIcon={<MedicalServicesIcon />}
              onClick={() => onSelectRole("DOCTOR")}
              sx={{
                py: 2
              }}
            >
              Registrarme como Médico
            </Button>
          </Stack>

          <Typography
            variant="body2"
            sx={{ mt: 4 }}
          >
            ¿Ya tenés cuenta?
          </Typography>

          <Button
            variant="text"
            color="primary"
            aria-label="Iniciar sesion"
            sx={{ mt: 1 }}
            onClick={() => navigate("/iniciar-sesion")}
            >
            Ingresar
            </Button>
        </Paper>
        </Box>
      </Container>
    </Box>
  );
}

export default RoleSelector;