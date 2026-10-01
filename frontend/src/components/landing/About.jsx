import ChildCareIcon from '@mui/icons-material/ChildCare';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HealingIcon from '@mui/icons-material/Healing';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { Box, Card, Container, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

const specialties = [
  { icon: <FavoriteIcon sx={{ fontSize: 42 }} />, title: 'Cardiología', description: 'Especialistas en prevención y control cardiovascular.' },
  { icon: <ChildCareIcon sx={{ fontSize: 42 }} />, title: 'Pediatría', description: 'Atención integral para niños y adolescentes.' },
  { icon: <PsychologyIcon sx={{ fontSize: 42 }} />, title: 'Psicología', description: 'Acompañamiento profesional para tu bienestar emocional.' },
  { icon: <HealingIcon sx={{ fontSize: 42 }} />, title: 'Clínica médica', description: 'Consultas generales y seguimiento personalizado.' },
];

export default function About() {
  return (
    <Box id="nosotros" sx={{ py: { xs: 8, md: 16 } }}>
      <Container maxWidth="xl">
        {/* TOP */}
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
          <Typography variant="h2" sx={{ fontWeight: 800, color: 'text.primary', mb: 3, fontSize: { xs: '2.25rem', sm: '2.75rem', md: '3.5rem' } }}>
            Nuestros especialistas
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: { xs: '1rem', md: '1.15rem' }, maxWidth: 760, mx: 'auto', lineHeight: 1.9 }}>
            Contamos con profesionales altamente capacitados para brindarte atención médica rápida, segura y personalizada.
          </Typography>
        </Box>

        {/* GRID */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(4,1fr)' }, gap: 4 }}>
          {specialties.map((item, index) => (
            <Card
              variant="elevate"
              key={index}
              sx={{
                p: 5,
                borderRadius: (t) => t.custom.radiusXl,
                textAlign: 'center',
              }}
            >
              {/* ICON */}
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: (t) => t.custom.radiusLg,
                  backgroundColor: (t) => alpha(t.palette.primary.main, 0.1),
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 4,
                }}
              >
                {item.icon}
              </Box>

              {/* TITLE */}
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                {item.title}
              </Typography>

              {/* DESCRIPTION */}
              <Typography sx={{ color: 'text.secondary', lineHeight: 1.9, fontSize: '1rem' }}>
                {item.description}
              </Typography>
            </Card>
          ))}
        </Box>

        {/* STATS */}
        <Box sx={{ mt: { xs: 6, md: 12 }, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3,1fr)' }, gap: 4 }}>
          {[
            ['+50', 'Especialistas'],
            ['+10k', 'Turnos gestionados'],
            ['24/7', 'Soporte disponible'],
          ].map(([number, label]) => (
            <Box key={label} sx={{ textAlign: 'center' }}>
              <Typography variant="h2" sx={{ fontWeight: 800, color: 'primary.main', mb: 1, fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' } }}>
                {number}
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}