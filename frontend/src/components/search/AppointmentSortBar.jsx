import { FormControl, InputLabel, MenuItem, Paper, Select, Typography } from '@mui/material';
import { OrderDirection, OrderFields } from '../../enums/orderables.enum';

function SortDropdown({ label, value, onChange, options, minWidth = 150 }) {
  return (
    <FormControl size="small" sx={{ minWidth }}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default function AppointmentSortBar({ orderBy, orderDir, onSortChange }) {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        mb: 3, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' }, 
        gap: 2, 
        border: '1px solid', 
        borderColor: 'divider', 
        borderRadius: '14px' 
      }}
    >
      <Typography variant="body1" color="text.secondary" fontWeight="bold">
        Ordenar Resultados:
      </Typography>
      
      <SortDropdown 
        label="Campo"
        value={orderBy}
        onChange={(newOrderBy) => onSortChange(newOrderBy, orderDir)}
        minWidth={150}
        options={[
          { value: OrderFields.DATE, label: "Fecha" },
          { value: OrderFields.COST, label: "Costo" }
        ]}
      />

      <SortDropdown 
        label="Dirección"
        value={orderDir}
        onChange={(newOrderDir) => onSortChange(orderBy, newOrderDir)}
        minWidth={180}
        options={[
          { value: OrderDirection.ASC, label: "Ascendente" },
          { value: OrderDirection.DESC, label: "Descendente" }
        ]}
      />
    </Paper>
  );
}
