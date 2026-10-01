import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  TextField,
  Typography,
} from '@mui/material';

function DoctorProfessionalSection({ value, onChange, onSave, variant, hasChanges }) {
  const nameTooLong = value.name.length > 30;

  const handleChange = (field, newValue) => {
    onChange({
      ...value,
      [field]: newValue,
    });
  };

  const content = (
    <>
      {variant !== 'plain' && (
        <>
          <Typography id="doctor-professional-title" variant="h6" fontWeight={600}>
            Información profesional
          </Typography>

          <Typography id="doctor-professional-description" variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Gestioná tu nombre profesional y matrícula.
          </Typography>

          <Divider sx={{ my: 2 }} />
        </>
      )}

     <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '1fr 1fr',
          },
          gap: 2,
        }}
      >
        <TextField
          fullWidth
          label="Nombre profesional"
          value={value.name}
          error={nameTooLong}
          helperText='El nombre profesional no puede superar los 30 caracteres.'
          onChange={(e) => handleChange('name', e.target.value)}
          slotProps={{
            htmlInput: {
              maxLength: 30,
              'aria-label': 'Nombre profesional',
            },
          }}
        />

        <TextField
          fullWidth
          disabled
          label="Matrícula"
          value={value.registration}
          helperText="La matrícula no puede modificarse desde el perfil."
          slotProps={{
            htmlInput: {
              'aria-readonly': 'true',
            },
          }}
        />
      </Box>

      <Box sx={{display: 'flex',justifyContent: 'flex-end',mt: 3,}}>
        <Button variant="contained" onClick={onSave} disabled={!hasChanges || nameTooLong}>
          Guardar información profesional
        </Button>
      </Box>
    </>
  );

  if (variant === 'plain') {
    return content;
  }

  return (
    <Card
      component="section"
      aria-labelledby="doctor-professional-title"
      aria-describedby="doctor-professional-description"
    >
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}

export default DoctorProfessionalSection;