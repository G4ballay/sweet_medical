import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';
import NotificationList from '../components/notifications/NotificationList';

function Notifications() {
  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
      <Typography variant="pageTitle" component="h1">
        Notificaciones
      </Typography>
      <Typography sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
        En esta sección vas a ver tus notificaciones: recordatorios de turnos,
        cambios de horario y mensajes importantes del sistema.
      </Typography>
      <Box sx={{ mt: 3 }}>
        <NotificationList />
      </Box>
    </Container>

  );
}

export default Notifications;