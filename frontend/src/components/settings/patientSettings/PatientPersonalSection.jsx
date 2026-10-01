import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  TextField,
  Typography,
} from '@mui/material';

function PatientPersonalSection({
  value,
  onChange,
  onSave,
  hasChanges,
  variant = 'card',
}) {
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
          <Typography id="patient-personal-title" variant="h6" fontWeight={600}>
            Información del paciente
          </Typography>

          <Typography id="patient-personal-description" variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Consultá tu documento y actualizá tu nombre.
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
          label="Nombre"
          value={value.name}
          error={nameTooLong}
          helperText='El nombre no puede superar los 30 caracteres.'
          onChange={(e) => handleChange('name', e.target.value)}
          slotProps={{
            htmlInput: {
              maxLength: 30,
            },
          }}
        />

        <TextField
          fullWidth
          disabled
          label="Documento"
          value={value.documentNumber}
          helperText="El documento no puede modificarse desde el perfil."
          slotProps={{
            htmlInput: {
              'aria-readonly': 'true',
            },
          }}
        />
      </Box>

      <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 3,}}>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={!hasChanges}
        >
          Guardar información del paciente
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
      aria-labelledby="patient-personal-title"
      aria-describedby="patient-personal-description"
    >
      <CardContent>{content}</CardContent>
    </Card>
  );
}

export default PatientPersonalSection;