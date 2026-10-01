import { Box, Button, Card, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Hero({ onNavigate }) {
  const navigate = useNavigate();
  return (
    <Box id="hero" sx={{ position: 'relative', minHeight: { xs: 'calc(100vh - 80px)', md: '100vh' }, display: 'flex', alignItems: 'center', width: '100%', overflow: 'hidden', py: { xs: 8, md: 0 } }}>
      {/* BACKGROUND IMAGE */}
      <Box
        component="img"
        src='/heroPhoto.jpg'
        alt="Doctor"
        sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
      />
      {/* DARK OVERLAY */}
      <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.70), rgba(0,0,0,0.25))' }} />

      {/* CONTENT */}
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Card sx={{
          width: '100%',
          maxWidth: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 6,
          px: { xs: 2.5, sm: 4, md: 8 },
          py: { xs: 4, sm: 4, md: 6 },
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: (t) => t.custom.radiusXl,
          boxShadow: 'none',
        }}>
          {/* LEFT */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h2" sx={{ fontWeight: 800, lineHeight: 1.05, color: 'secondary.main', mb: 3, fontSize: { xs: '2.25rem', sm: '3.25rem', md: '4.5rem' } }}>
              Gestioná tus turnos médicos fácilmente
            </Typography>
            <Typography sx={{ color: 'text.tertiary', lineHeight: 1.9, fontSize: { xs: '1rem', md: '1.1rem' }, mb: 4, maxWidth: 500 }}>
              Reservá consultas online, recibí recordatorios automáticos y encontrá especialistas en segundos.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                onClick={() => navigate('/registro')}
                variant="contained"
                size="large"
                sx={{ px: 4, py: 1.5 }}
              >
                Registrarse
              </Button>
              <Button
                onClick={() => onNavigate('nosotros')}
                variant="outlined"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: 'secondary.main',
                  '&:hover': {
                    borderColor: 'secondary.main',
                    backgroundColor: 'rgba(255,255,255,0.08)'
                  }
                }}
              >
                Ver más
              </Button>
            </Box>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}