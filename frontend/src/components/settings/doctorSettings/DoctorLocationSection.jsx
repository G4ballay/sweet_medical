import { useState } from 'react';

import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';

function DoctorLocationsSection({
  value,
  locationOptions,
  onChange,
  onSave,
  variant,
  hasChanges,
}) {
  const [selectedLocation, setSelectedLocation] = useState('');

  const addLocation = () => {
    if (!selectedLocation) return;

    if (value.includes(selectedLocation)) {return;}

    onChange([
      ...value,
      selectedLocation,
    ]);

    setSelectedLocation('');
  };

  const removeLocation = (locationId) => {
    onChange(
      value.filter((id) => id !== locationId)
    );
  };

  const getLocation = (id) => {
    return locationOptions.find(
      (location) => location.id === id
    );
  };

  const content = (
  <>
    {variant !== 'plain' && (
      <>
        <Typography id="doctor-locations-title" variant="h6" fontWeight={600}>
          Locaciones
        </Typography>

        <Typography id="doctor-locations-description" variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Administrá los centros médicos donde atendés.
        </Typography>

        <Divider sx={{ my: 2 }} />
      </>
    )}

    <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <TextField
            select
            fullWidth
            size="small"
            label="Seleccionar locación"
            value={selectedLocation}
            onChange={(e) =>
              setSelectedLocation(e.target.value)
            }
            slotProps={{
              htmlInput: {
                'aria-label': 'Seleccionar centro médico',
              },
            }}
          >
            {locationOptions.map((location) => (
              <MenuItem
                key={location.id}
                value={location.id}
              >
                {location.name}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="outlined"
            aria-label="Agregar locación"
            onClick={addLocation}
            sx={{
              minWidth: 110,
              flexShrink: 0,
            }}
          >
            Agregar
          </Button>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 3, mb: 2 }}
        >
          Locaciones asignadas
        </Typography>

        <Box
          component="ul"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {value.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
            >
              No hay locaciones asignadas.
            </Typography>
          ) : (
            value.map((locationId) => {
              const location = getLocation(locationId);

              if (!location) return null;

              return (
                <Box
                  component="li"
                  key={locationId}
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography fontWeight={600}>
                      {location.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {location.fullAddress}
                    </Typography>
                  </Box>

                  <Button
                    color="error"
                    aria-label={`Quitar ${location.name}`}
                    onClick={() => removeLocation(locationId)}
                    sx={{ flexShrink: 0 }}
                  >
                    Quitar
                  </Button>
                </Box>
              );
            })
          )}
        </Box>

    <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 3,}}>
      <Button variant="contained" onClick={onSave} disabled={!hasChanges}>
        Guardar locaciones
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
    aria-labelledby="doctor-locations-title"
    aria-describedby="doctor-locations-description"
    sx={{ borderRadius: 2 }}
  >
    <CardContent>
      {content}
    </CardContent>
  </Card>
);
}
export default DoctorLocationsSection;