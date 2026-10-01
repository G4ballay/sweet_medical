import { useState } from 'react';

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';

import CancelIcon from '@mui/icons-material/Cancel';

function DoctorServicesSection({
  value,
  specialtyOptions,
  practiceOptions,
  onChange,
  onSave,
  variant,
  hasChanges,
}) {
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedPractice, setSelectedPractice] = useState('');

  const servicesValue = {
    SPECIALTY: value?.SPECIALTY || [],
    PRACTICE: value?.PRACTICE || [],
  };

  const uniqueSpecialtyOptions = specialtyOptions.filter(
    (specialty, index, self) =>
      index === self.findIndex((item) => item.id === specialty.id)
  );

  const uniquePracticeOptions = practiceOptions.filter(
    (practice, index, self) =>
      index === self.findIndex((item) => item.id === practice.id)
  );

  const addService = (type, selectedId) => {
    if (!selectedId) return;

    const currentServices = servicesValue[type];

    if (currentServices.includes(selectedId)) {
      return;
    }

    onChange({
      ...servicesValue,
      [type]: [...currentServices, selectedId],
    });

    if (type === 'SPECIALTY') {
      setSelectedSpecialty('');
    }

    if (type === 'PRACTICE') {
      setSelectedPractice('');
    }
  };

  const removeService = (type, serviceId) => {
    onChange({
      ...servicesValue,
      [type]: servicesValue[type].filter((id) => id !== serviceId),
    });
  };

  const getServiceName = (type, serviceId) => {
    const options =
      type === 'SPECIALTY'
        ? specialtyOptions
        : practiceOptions;

    return (
      options.find((option) => option.id === serviceId)?.name ||
      serviceId
    );
  };

  const content = (
  <>
    {variant !== 'plain' && (
      <>
        <Typography variant="h6" fontWeight={600}>
          Servicios y especialidades
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Seleccioná las especialidades y prácticas que ofrecés.
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
        gap: 3,
        width: '100%',
      }}
    >
      {/* ESPECIALIDADES */}
      <Box
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              minHeight: 180,
              width: '100%',
            }}
          >
            <Typography fontWeight={600} sx={{ mb: 2 }}>
              Especialidades
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexDirection: {
                    xs: 'column',
                    sm: 'row',
                },
              }}
            >
              <TextField
                select
                size="small"
                label="Seleccionar especialidad"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                sx={{ flex: 1, width: '100%' }}
                slotProps={{
                  htmlInput: {
                    'aria-label': 'Seleccionar práctica',
                  },
                }}
              >
                {uniqueSpecialtyOptions.map((specialty) => (
                  <MenuItem key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </MenuItem>
                ))}
              </TextField>

              <Button
                variant="outlined"
                aria-label="Agregar especialidades"
                onClick={() => addService('SPECIALTY', selectedSpecialty)}
                sx={{flexShrink: 0}}
              >
                Agregar
              </Button>
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 3, mb: 1 }}
            >
              Especialidades seleccionadas
            </Typography>

            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              {servicesValue.SPECIALTY.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Ninguna seleccionada
                </Typography>
              ) : (
                servicesValue.SPECIALTY.map((serviceId) => (
                  <Chip
                    key={serviceId}
                    label={getServiceName('SPECIALTY', serviceId)}
                    onDelete={() => removeService('SPECIALTY', serviceId)}
                    color="primary"
                    variant="filled"
                  />
                ))
              )}
            </Box>
          </Box>
      {/* PRACTICAS */}
      <Box
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              minHeight: 180,
              width: '100%',
            }}
          >
            <Typography fontWeight={600} sx={{ mb: 2 }}>
              Prácticas
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexDirection: {
                    xs: 'column',
                    sm: 'row',
                },
              }}
            >
              <TextField
                select
                size="small"
                label="Seleccionar práctica"
                value={selectedPractice}
                onChange={(e) => setSelectedPractice(e.target.value)}
                sx={{ flex: 1, width: '100%' }}
                slotProps={{
                  htmlInput: {
                    'aria-label': 'Seleccionar práctica',
                  },
                }}
              >
                {uniquePracticeOptions.map((practice) => (
                  <MenuItem key={practice.id} value={practice.id}>
                    {practice.name}
                  </MenuItem>
                ))}
              </TextField>

              <Button
                variant="outlined"
                aria-label="Agregar especialidad"
                onClick={() => addService('PRACTICE', selectedPractice)}
                sx={{flexShrink: 0}}
              >
                Agregar
              </Button>
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 3, mb: 1 }}
            >
              Prácticas seleccionadas
            </Typography>

            <Box
              component="ul"
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              {servicesValue.PRACTICE.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Ninguna seleccionada
                </Typography>
              ) : (
                servicesValue.PRACTICE.map((serviceId) => (
                  <Chip
                    key={serviceId}
                    label={getServiceName('PRACTICE', serviceId)}
                    component="li"
                    deleteIcon={<CancelIcon aria-hidden="true" />}
                    onDelete={() => removeService('PRACTICE', serviceId)}
                    color="primary"
                    variant="filled"
                  />
                ))
              )}
            </Box>
          </Box>
    </Box>

    <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 3,}}>
      <Button variant="contained" onClick={onSave} disabled={!hasChanges}>
        Guardar servicios
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
    aria-labelledby="doctor-services-title"
    aria-describedby="doctor-services-description"
  >
    <CardContent>
      {content}
    </CardContent>
  </Card>
);
}
export default DoctorServicesSection;