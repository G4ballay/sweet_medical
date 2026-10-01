import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Link,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

 return (
    <Box
        component="main"
        sx={(theme) => ({
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
            background: `linear-gradient(
                135deg,
                ${theme.palette.primary.main} 0%,
                ${theme.palette.primary.dark} 100%
            )`,
        })}
    >
        <Container maxWidth="sm">
            <Card
                component="article"
                aria-labelledby="forgot-password-title"
                sx={{
                width: "100%",
                boxShadow: 4,
                p: 2,
                }}
            >
              <CardContent>
                <Typography
                    id="forgot-password-title"
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        textAlign: "center",
                        mb: 3,
                    }}
                >
                    Recuperación de contraseña
                </Typography>

                <Typography
                    variant="body1"
                    sx={{
                    textAlign: "center",
                    mb: 3,
                    }}
                >
                    Para solicitar un cambio de contraseña, envíanos un correo electrónico a:
                </Typography>

                <Typography
                    variant="h6"
                    component="p"
                    sx={{
                        textAlign: "center",
                        mb: 3,
                        fontWeight: 600,
                    }}
                >
                    <Link
                    href="mailto:soporte@sweetmedical.com"
                    underline="hover"
                    aria-label="Enviar correo electrónico a soporte de Sweet Medical: soporte@sweetmedical.com"
                    >
                        soporte@sweetmedical.com
                    </Link>
                </Typography>

                <Typography
                    variant="body1"
                    component="p"
                    sx={{
                    textAlign: "center",
                    mb: 4,
                    }}
                >
                    Un representante de Sweet Medical se pondrá en contacto para asistirte en el proceso de recuperación de tu contraseña.
                </Typography>

                
                    <Button
                    variant="contained"
                    onClick={() => navigate("/iniciar-sesion")}
                    aria-label="Volver a la página de inicio de sesión"
                    sx={{ display: "flex", mx: "auto" }}
                    >
                    Volver al inicio de sesión
                    </Button>
                </CardContent>
            </Card>
        </Container>
    </Box>
    );
}