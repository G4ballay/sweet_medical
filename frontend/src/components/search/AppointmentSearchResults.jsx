import { Box, Pagination, Skeleton, Typography, useMediaQuery, useTheme } from '@mui/material';
import { AppointmentCard } from '../appointments/AppointmentCard';

const ITEMS_PER_PAGE = 4;

export default function AppointmentSearchResults({
  loading,
  appointments = [],
  error,
  selection,
  page,
  totalPages = 1,
  onPageChange,
  isAppointmentSelected,
  onToggleCartItem
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const paginatedAppointments = appointments;


  if (loading) {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 1.5 }}>
        {Array.from(new Array(ITEMS_PER_PAGE)).map((_, index) => (
          <Skeleton variant="rounded" height={260} key={index} />
        ))}
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 1.5, mt: 2 }}>
        {paginatedAppointments.map(a => (
          <AppointmentCard
            key={a.id}
            appointment={a}
            isSlot={true}
            shortDate={true}
            isSelected={isAppointmentSelected(a.id)}
            onToggleCartItem={onToggleCartItem}
          />
        ))}
      </Box>

      {appointments.length > 0 && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={onPageChange} 
            color="primary" 
            size={isMobile ? "medium" : "large"} 
            siblingCount={isMobile ? 0 : 1}
          />
        </Box>
      )}

      {appointments.length === 0 && (
        <Box sx={{ textAlign: 'center', p: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {!selection ? "Comienza tu búsqueda" : "No se encontraron turnos"}
          </Typography>
          <Typography color="text.secondary">
            {!selection 
              ? "Selecciona una especialidad o práctica y haz clic en 'Buscar' para ver los turnos disponibles."
              : "Intenta cambiar los filtros de fecha o médico para obtener más resultados."}
          </Typography>
        </Box>
      )}
    </>
  );
}
