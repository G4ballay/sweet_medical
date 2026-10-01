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

function PatientCoverageSection({
  value,
  healthInsuranceOptions,
  planOptions,
  onChange,
  onSave,
  hasChanges,
  variant = 'card',
}) {
  const titleId = 'patient-coverage-title';
  const descriptionId = 'patient-coverage-description';
  const planHelperId = 'patient-plan-helper-text';

  const handleChange = (field, newValue) => {
    onChange({
      ...value,
      [field]: newValue,
      ...(field === 'healthInsuranceId' ? { planId: '' } : {}),
    });
  };

  const hasValidCoverage =
  value.healthInsuranceId !== '' &&
  value.planId !== '';

  const content = (
    <>
      {variant !== 'plain' && (
        <>
          <Typography id={titleId} variant="h6" fontWeight={600}>
            Obra social y plan
          </Typography>

          <Typography id={descriptionId} variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Modificá tu obra social y el plan asociado.
          </Typography>

          <Divider sx={{ my: 2 }} />
        </>
      )}

      <Box
        sx={{
          display: 'grid',
          gap: 3,
        }}
      >
        <TextField
          select
          fullWidth
          label="Obra social"
          value={value.healthInsuranceId}
          onChange={(e) => handleChange('healthInsuranceId', e.target.value)}
          slotProps={{
            htmlInput: {
              'aria-label': 'Seleccionar obra social',
            },
          }}
        >
          {healthInsuranceOptions.map((healthInsurance) => (
            <MenuItem key={healthInsurance.id} value={healthInsurance.id}>
              {healthInsurance.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          fullWidth
          label="Plan"
          value={value.planId}
          onChange={(e) => handleChange('planId', e.target.value)}
          disabled={!value.healthInsuranceId}
          error={
            Boolean(value.healthInsuranceId) &&
            !value.planId
          }
          helperText={
            <span id={planHelperId} aria-live="polite">
              {!value.healthInsuranceId
                ? 'Seleccioná primero una obra social.'
                : !value.planId
                  ? 'Seleccioná un plan.'
                  : ''}
            </span>
          }
          slotProps={{
            htmlInput: {
              'aria-label': 'Seleccionar plan de obra social',
              'aria-describedby': planHelperId,
            },
          }}
        >
          {planOptions.map((plan) => (
            <MenuItem key={plan.id} value={plan.id}>
              {plan.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 3,}}>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={!hasChanges || !hasValidCoverage}
        >
          Guardar cobertura
        </Button>
      </Box>
    </>
  );

  if (variant === 'plain') return content;

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

export default PatientCoverageSection;