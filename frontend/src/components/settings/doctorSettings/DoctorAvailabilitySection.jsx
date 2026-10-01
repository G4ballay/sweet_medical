import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import { DAYS_OF_WEEK } from '../../../utils/daysOfWeek';

function DoctorAvailabilitySection({value, onChange, onSave, variant, hasChanges}) {

  const titleId = 'doctor-availability-title';
  const descriptionId = 'doctor-availability-description';

  {/*Chequeo de superposición*/}
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const isInvalidRange = (availability) => {
    return (
      timeToMinutes(availability.startTime) >=
      timeToMinutes(availability.endTime)
    );
  };

  const hasOverlap = (availabilities, currentIndex) => {
    const current = availabilities[currentIndex];

    const currentStart = timeToMinutes(current.startTime);
    const currentEnd = timeToMinutes(current.endTime);

    return availabilities.some((availability, index) => {
      if (index === currentIndex) return false;
      if (availability.dayOfWeek !== current.dayOfWeek) return false;

      const start = timeToMinutes(availability.startTime);
      const end = timeToMinutes(availability.endTime);

      return currentStart < end && start < currentEnd;
    });
  };

  const hasAvailabilityErrors = value.some((_, index) => {
    return isInvalidRange(value[index]) || hasOverlap(value, index);
  });

  {/*Manejo de disponibilidades*/}
  const handleAvailabilityChange = (index, field, newValue) => {
    const updatedAvailabilities = [...value];

    updatedAvailabilities[index] = {
      ...updatedAvailabilities[index],
      [field]: newValue,
    };

    onChange(updatedAvailabilities);
  };

  const addAvailability = (dayOfWeek) => {
    onChange([
      ...value,
      {
        dayOfWeek,
        startTime: '09:00',
        endTime: '18:00',
      },
    ]);
  };

  const removeAvailability = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

 const content = (
  <>
    {variant !== 'plain' && (
      <>
        <Typography id={titleId} variant="h6" fontWeight={600}>
          Agenda y disponibilidades
        </Typography>

        <Typography
          id={descriptionId}
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          Configurá los días y horarios en los que atendés pacientes.
        </Typography>

        <Divider sx={{ my: 2 }} />
      </>
    )}

    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {DAYS_OF_WEEK.map((day) => {
        const dayAvailabilities = value.filter(
          (availability) => availability.dayOfWeek === day.value
        );

        return (
          <Box
            key={day.value}
            component="section"
            aria-labelledby={`availability-day-${day.value}`}
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: '120px 1fr auto',
              },
              gap: 3,
              alignItems: 'center',
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <Typography id={`availability-day-${day.value}`} fontWeight={600}>
              {day.label}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {dayAvailabilities.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Sin horarios cargados
                </Typography>
              )}

              {dayAvailabilities.map((availability, index) => {
                const realIndex = value.indexOf(availability);
                const invalidRange = isInvalidRange(availability);
                const overlap = hasOverlap(value, realIndex);
                const hasError = invalidRange || overlap;
                const errorId = `availability-error-${day.value}-${index}`;

                return (
                  <Box
                    key={`${day.value}-${index}`}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        alignItems: 'center',
                        flexWrap: 'wrap',
                      }}
                    >
                      <TextField
                        type="time"
                        size="small"
                        label="Desde"
                        value={availability.startTime}
                        error={hasError}
                        onChange={(e) =>
                          handleAvailabilityChange(
                            realIndex,
                            'startTime',
                            e.target.value
                          )
                        }
                        slotProps={{
                          inputLabel: {
                            shrink: true,
                          },
                          htmlInput: {
                            'aria-label': `Horario de inicio para ${day.label}`,
                            'aria-invalid': hasError,
                            'aria-describedby': hasError ? errorId : undefined,
                          },
                        }}
                        sx={{ width: 150 }}
                      />

                      <TextField
                        type="time"
                        size="small"
                        label="Hasta"
                        value={availability.endTime}
                        error={hasError}
                        onChange={(e) =>
                          handleAvailabilityChange(
                            realIndex,
                            'endTime',
                            e.target.value
                          )
                        }
                        slotProps={{
                          inputLabel: {
                            shrink: true,
                          },
                          htmlInput: {
                            'aria-label': `Horario de fin para ${day.label}`,
                            'aria-invalid': hasError,
                            'aria-describedby': hasError ? errorId : undefined,
                          },
                        }}
                        sx={{ width: 150 }}
                      />

                      <IconButton
                        color="error"
                        aria-label={`Eliminar horario de ${day.label}`}
                        onClick={() => removeAvailability(realIndex)}
                      >
                        <DeleteIcon aria-hidden="true" />
                      </IconButton>
                    </Box>

                    {invalidRange && (
                      <Typography
                        id={errorId}
                        variant="caption"
                        color="error"
                        role="alert"
                      >
                        El horario de inicio debe ser menor al horario de finalización.
                      </Typography>
                    )}

                    {!invalidRange && overlap && (
                      <Typography
                        id={errorId}
                        variant="caption"
                        color="error"
                        role="alert"
                      >
                        Este horario se superpone con otro bloque del mismo día.
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>

            <Button
              variant="outlined"
              aria-label={`Agregar horario para ${day.label}`}
              onClick={() => addAvailability(day.value)}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Agregar horario
            </Button>
          </Box>
        );
      })}
    </Box>

    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
      <Button
        variant="contained"
        onClick={onSave}
        disabled={!hasChanges || hasAvailabilityErrors}
        aria-disabled={!hasChanges || hasAvailabilityErrors}
      >
        Guardar agenda
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
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <CardContent>{content}</CardContent>
    </Card>
  );
}

export default DoctorAvailabilitySection;