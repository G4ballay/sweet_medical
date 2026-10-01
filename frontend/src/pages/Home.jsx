import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventNoteIcon from '@mui/icons-material/EventNote';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';

import { Box, Button, Card, CardActionArea, CardContent, Container, Grid, Paper, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppointmentCard } from '../components/appointments/AppointmentCard';
import { useAuth } from '../context/AuthContext';
import { Role } from '../enums/role.enum';
import { useAppointmentDetails } from '../hooks/useAppointmentDetails';
import { getAppointments } from '../services/appointment.service';
import {
  AppointmentTab,
  getAppointmentStatus,
  normalizeAppointments
} from '../utils/appointment.utils';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMedico = user?.role === Role.DOCTOR;

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getAppointments()
      .then(normalizeAppointments)
      .then((data) => {
        if (isMounted) {
          setAppointments(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const nextAppointment = appointments
    .filter((appointment) => getAppointmentStatus(appointment) === AppointmentTab.UPCOMING)
    .sort((a, b) => {
      const aDate = new Date(a.startTime || a.date || a.startsAt);
      const bDate = new Date(b.startTime || b.date || b.startsAt);
      return aDate - bDate;
    })[0] || null;

  const { doctorDetails, patientDetails, serviceDetails, locationDetails } = useAppointmentDetails(
    nextAppointment ? [nextAppointment] : [],
    isMedico
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 20) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const patientActions = [
    {
      title: 'Buscar Turnos',
      subtitle: 'Encontrá profesionales disponibles y reservá tu cita médica.',
      icon: <SearchIcon sx={{ fontSize: 26 }} />,
      path: '/buscar-turnos',
    },
    {
      title: 'Mis Turnos',
      subtitle: 'Gestioná tus turnos programados, reprogramá o cancelá citas.',
      icon: <EventNoteIcon sx={{ fontSize: 26 }} />,
      path: '/mis-turnos',
    },
    {
      title: 'Mi Perfil',
      subtitle: 'Mantené actualizados tus datos personales y de contacto.',
      icon: <PersonIcon sx={{ fontSize: 26 }} />,
      path: '/perfil',
    },
    {
      title: 'Notificaciones',
      subtitle: 'Revisá recordatorios, avisos y confirmaciones de citas.',
      icon: <NotificationsIcon sx={{ fontSize: 26 }} />,
      path: '/notificaciones',
    },
  ];

  const doctorActions = [
    {
      title: 'Mis Turnos',
      subtitle: 'Visualizá tus turnos programados y gestioná tus consultas.',
      icon: <EventNoteIcon sx={{ fontSize: 26 }} />,
      path: '/mis-turnos',
    },
    {
      title: 'Mi Perfil',
      subtitle: 'Administrá tus datos profesionales, especialidades y horarios.',
      icon: <MedicalServicesIcon sx={{ fontSize: 26 }} />,
      path: '/perfil-medico',
    },
    {
      title: 'Notificaciones',
      subtitle: 'Revisá alertas sobre nuevos turnos o cancelaciones.',
      icon: <NotificationsIcon sx={{ fontSize: 26 }} />,
      path: '/notificaciones',
    },
  ];

  const actions = isMedico ? doctorActions : patientActions;

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>

      <Paper
        elevation={0}
        sx={{
          background: (t) => t.custom.gradientPrimary,
          color: 'secondary.main',
          borderRadius: '20px',
          p: { xs: 2.5, sm: 3, md: 3.5 },
          position: 'relative',
          overflow: 'hidden',
          mb: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ maxWidth: '600px', zIndex: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em', fontFamily: "'Inter', sans-serif", fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}>
            {getGreeting()}, {user?.name || 'Usuario'}
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9, lineHeight: 1.5, fontWeight: 400, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            {isMedico
              ? 'Desde este portal podés coordinar tus citas médicas, revisar las consultas agendadas y configurar tu perfil profesional de forma ágil y segura.'
              : 'Gestioná tus consultas médicas online de manera simple. Reservá turnos con especialistas, hacé seguimiento de tus citas y más.'}
          </Typography>
        </Box>
      </Paper>

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
        Accesos Rápidos
      </Typography>
      <Grid container spacing={2.2} sx={{ mb: 3 }}>
        {actions.map((action) => {
          const mdSize = Math.floor(12 / actions.length);
          const smSize = actions.length > 3 ? 6 : mdSize;

          return (
            <Grid
              size={{
                xs: 12,
                sm: smSize,
                md: mdSize
              }}
              key={action.title}
            >
              <Card
                variant="elevate"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    '& .icon-container': {
                      backgroundColor: (t) => alpha(t.palette.primary.main, 0.1),
                      color: 'primary.main',
                    },
                    '& .arrow-icon': {
                      transform: 'translateX(4px)',
                      color: 'primary.main',
                    },
                  }
                }}
              >
                <CardActionArea
                  onClick={() => navigate(action.path)}
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '100%', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box
                        className="icon-container"
                        sx={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '14px',
                          backgroundColor: (t) => alpha(t.palette.primary.main, 0.05),
                          color: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {action.icon}
                      </Box>
                      <ArrowForwardIcon
                        className="arrow-icon"
                        sx={{
                          color: 'text.secondary',
                          fontSize: 20,
                          transition: 'all 0.3s ease',
                          mt: 0.5
                        }}
                      />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.8, color: 'text.primary', fontSize: '1.05rem' }}>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.45, fontSize: '0.85rem' }}>
                      {action.subtitle}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
        Resumen de Cuenta
      </Typography>
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Paper elevation={0} sx={{ flex: '1 1 300px', p: 3, border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
            <CalendarMonthIcon sx={{ color: 'primary.main', fontSize: 22 }} />
            Próximo Turno
          </Typography>
          {loading && (
            <Box sx={{ bgcolor: 'background.default', borderRadius: '12px', p: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '130px', mb: 7 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', py: 1 }}>
                Cargando...
              </Typography>
            </Box>
          )}
          {!loading && !nextAppointment && (
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ bgcolor: 'background.default', borderRadius: '12px', p: 2, border: '1px solid', borderColor: 'divider', mb: 2, flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '130px' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 1 }}>
                  No tenés turnos programados para los próximos días.
                </Typography>
              </Box>
              <Button
                onClick={() => navigate(isMedico ? '/mis-turnos' : '/buscar-turnos')}
                fullWidth
                variant="contained"
              >
                {isMedico ? 'Ver Mis Turnos' : 'Buscar Nuevo Turno'}
              </Button>
            </Box>
          )}
          {!loading && nextAppointment && (
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ bgcolor: 'background.default', borderRadius: '12px', p: 2, border: '1px solid', borderColor: 'divider', mb: 2, flexGrow: 1, minHeight: '130px' }}>
                <AppointmentCard
                  appointment={nextAppointment}
                  isDoctor={isMedico}
                  doctorDetails={doctorDetails}
                  patientDetails={patientDetails}
                  serviceDetails={serviceDetails}
                  locationDetails={locationDetails}
                  readOnly={true}
                  compact={true}
                  hideCoverage={true}
                />
              </Box>
              <Button
                onClick={() => navigate('/mis-turnos')}
                fullWidth
                variant="contained"
              >
                {'Ver Mis Turnos'}
              </Button>
            </Box>
          )}
        </Paper>

        <Paper elevation={0} sx={{ flex: '1 1 300px', p: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 22 }} />
            Estado del Perfil
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.5 }}>
            Tu información de contacto y credenciales de acceso están validadas correctamente.
          </Typography>
        </Paper>

      </Box>
    </Container>
  );
}

export default Home;