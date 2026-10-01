import AddIcon from '@mui/icons-material/Add';
import { Accordion, AccordionDetails, AccordionSummary, Box, Container, Typography } from '@mui/material';

const faqs = [
  { question: '¿Cómo saco un turno?', answer: 'Podés buscar especialistas y reservar un turno directamente desde la plataforma en pocos segundos.' },
  { question: '¿La plataforma es gratuita?', answer: 'Sí, registrarse y gestionar turnos es completamente gratuito para pacientes.' },
  { question: '¿Recibo recordatorios?', answer: 'Sí, enviamos recordatorios automáticos antes de cada consulta médica.' },
  { question: '¿Puedo cancelar un turno?', answer: 'Sí, Podés cancelar o reprogramar tus turnos desde tu perfil hasta 1 hora antes de la consulta.' },
  { question: '¿Cómo encuentro especialistas?', answer: 'Podés filtrar por especialidad, ubicación y disponibilidad.' },
];

export default function FAQ() {
  return (
    <Box id="faq" sx={{ py: { xs: 8, md: 16 }, backgroundColor: 'background.default' }}>
      <Container maxWidth="lg">
        {/* TITLE */}
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
          <Typography variant="h2" sx={{ fontWeight: 800, color: 'text.primary', mb: 3, fontSize: { xs: '2.25rem', sm: '2.75rem', md: '3.5rem' } }}>
            Preguntas Frecuentes
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: { xs: '1rem', md: '1.1rem' }, maxWidth: 700, mx: 'auto', lineHeight: 1.8 }}>
            Respondemos las dudas más comunes sobre Sweet Medical.
          </Typography>
        </Box>

        {/* FAQ LIST */}
        <Box>
          {faqs.map((faq, index) => (
            <Accordion
              key={index}
              disableGutters
              elevation={0}
              square
              sx={{
                backgroundColor: 'transparent',
                borderBottom: (t) => `1px solid ${t.palette.divider}`,
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary
                expandIcon={<AddIcon sx={{ color: 'primary.main', fontSize: 28 }} />}
                sx={{ py: 3, '& .MuiAccordionSummary-content': { margin: 0 } }}
                id={`faq-header-${index}`}
                aria-controls={`faq-content-${index}`}
              >
                <Typography sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }, color: 'text.primary' }}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pb: 4, pt: 0 }}>
                <Typography sx={{ color: 'text.secondary', lineHeight: 1.9, fontSize: '1rem', maxWidth: 800 }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Box>
  );
}