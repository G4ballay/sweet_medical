import SearchIcon from '@mui/icons-material/Search';
import { Alert, Autocomplete, Box, Button, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { MedicalServiceStrategies } from '../../services/medical-service.strategy';

export default function AppointmentSearchBox({
  type,
  setType,
  strategy,
  options,
  selection,
  setSelection,
  locations,
  locationId,
  setLocationId,
  filteredDoctors,
  doctorId,
  setDoctorId,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  loading,
  error,
  handleSearch
}) {
  const todayStr = new Date().toLocaleDateString('en-CA');

  return (
    <Box>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <ToggleButtonGroup
            value={type}
            exclusive
            onChange={(_, val) => val && setType(val)}
            color="primary"
            aria-label="Tipo de búsqueda"
          >
            {Object.keys(MedicalServiceStrategies).map((strat) => (
              <ToggleButton key={strat} value={strat} sx={{ px: 4, py: 1 }}>
                {MedicalServiceStrategies[strat].label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Autocomplete
          options={options}
          getOptionLabel={(option) => option.name || ""}
          value={options.find(o => o.id === selection) || null}
          onChange={(event, newValue) => {
            setSelection(newValue ? newValue.id : "");
          }}
          disabled={options.length === 0}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          noOptionsText="No se encontraron opciones"
          renderInput={(params) => (
            <TextField
              {...params}
              label={strategy.selectLabel}
              placeholder="Escribe para buscar..."
            />
          )}
        />

        <Autocomplete
          options={locations}
          getOptionLabel={(option) => {
            if (!option) return "";
            return `${option.name}${option.city?.trim() ? ` (${option.city.trim()})` : ""}`;
          }}
          value={locations.find(loc => loc.id === locationId) || null}
          onChange={(event, newValue) => {
            setLocationId(newValue ? newValue.id : "");
          }}
          disabled={!selection || locations.length === 0}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          noOptionsText="No se encontraron sedes"
          renderInput={(params) => (
            <TextField
              {...params}
              label="Sede (Opcional)"
              placeholder="Escribe para buscar..."
            />
          )}
        />

        <Autocomplete
          options={filteredDoctors}
          getOptionLabel={(option) => option.name || ""}
          value={filteredDoctors.find(d => d.id === doctorId) || null}
          onChange={(event, newValue) => {
            setDoctorId(newValue ? newValue.id : "");
          }}
          disabled={!selection || filteredDoctors.length === 0}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          noOptionsText="No se encontraron médicos"
          renderInput={(params) => (
            <TextField
              {...params}
              label="Médico (Opcional)"
              placeholder="Escribe para buscar..."
            />
          )}
        />



        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          <Box sx={{ flex: 1 }}>
            <TextField
              type="date"
              label="Fecha Desde (Opcional)"
              fullWidth
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              slotProps={{ 
                inputLabel: { shrink: true },
                htmlInput: { min: todayStr }
              }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <TextField
              type="date"
              label="Fecha Hasta (Opcional)"
              fullWidth
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              slotProps={{ 
                inputLabel: { shrink: true },
                htmlInput: { min: dateFrom || todayStr }
              }}
            />
          </Box>
        </Stack>

        <Box sx={{ pt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={handleSearch}
            disabled={loading || !selection}
            startIcon={<SearchIcon />}
            sx={{ py: 1.5, fontSize: '1.1rem', borderRadius: 2 }}
          >
            {loading ? "Buscando..." : "Buscar Turnos Disponibles"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
