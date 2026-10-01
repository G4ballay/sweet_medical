import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Card, Container, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

const steps = [
  { icon: <SearchIcon sx={{ fontSize: 42 }} />, title: 'Buscá especialistas', description: 'Encontrá médicos según especialidad, ubicación y disponibilidad.' },
  { icon: <CalendarMonthIcon sx={{ fontSize: 42 }} />, title: 'Reservá turnos', description: 'Elegí el horario que mejor se adapte a vos en segundos.' },
  { icon: <NotificationsActiveIcon sx={{ fontSize: 42 }} />, title: 'Recibí recordatorios', description: 'Te notificamos automáticamente antes de cada consulta.' },
];

export default function HowItWorks() {
  return (
    <Box
      id="comoFunciona"
      sx={{
        py: { xs: 8, md: 16 },
        background: (t) => t.custom.gradientPrimary,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="xl">
        {/* TITLE */}
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
          <Typography variant="h2" sx={{ fontWeight: 800, color: 'secondary.main', mb: 3, fontSize: { xs: '2.25rem', sm: '2.75rem', md: '3.5rem' } }}>
            ¿Cómo funciona?
          </Typography>
          <Typography sx={{ color: 'secondary.main', fontSize: { xs: '1.1rem', md: '1.2rem' }, maxWidth: 700, mx: 'auto', lineHeight: 1.8 }}>
            Gestionar tus consultas médicas nunca fue tan fácil.
          </Typography>
        </Box>

        {/* CARDS */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
          {steps.map((step, index) => (
            <Card
              variant="elevate"
              key={index}
              sx={{
                p: 5,
                borderRadius: (t) => t.custom.radiusXl,
                backgroundColor: 'background.paper',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}>
              <Box sx={{
                width: 72,
                height: 72,
                borderRadius: (t) => t.custom.radiusLg,
                backgroundColor: (t) => alpha(t.palette.primary.main, 0.1),
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 4
              }}>
                {step.icon}
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'text.primary', fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}>
                {step.title}
              </Typography>
              <Typography sx={{ color: 'text.secondary', lineHeight: 1.9, fontSize: '1rem' }}>
                {step.description}
              </Typography>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
}