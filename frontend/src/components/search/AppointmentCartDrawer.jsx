import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import PersonIcon from '@mui/icons-material/Person';
import { Box, Button, Divider, Drawer, IconButton, List, Paper, Typography } from '@mui/material';
import { formatCurrency, getCoverageText, getCoverageColor } from '../../utils/formatters';

function AppointmentCartDrawer({ open, onClose, cart, onRemove, onConfirm, onClear, bookingErrors = {} }) {

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 400 },
          boxSizing: 'border-box',
          p: 3.5,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '20px 0 0 20px'
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ fontSize: '1.25rem' }}>
          Turnos Seleccionados ({cart.length || 0})
        </Typography>
        <IconButton onClick={onClose} aria-label="cerrar preselección">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {cart.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
            Aún no has seleccionado ningún turno.
          </Typography>
        ) : (
          <List disablePadding>
            {cart.map((appointment) => {
              const dateStr = appointment.startTime ? new Date(appointment.startTime).toLocaleDateString() : 'Fecha N/A';
              const startTimeStr = appointment.startTime ? new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
              const endTimeStr = appointment.endTime ? new Date(appointment.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
              const timeStr = startTimeStr && endTimeStr ? `${startTimeStr} - ${endTimeStr}` : 'Hora N/A';
              const doctorName = appointment.doctorName || 'Doctor N/A';
              const serviceName = appointment.serviceName || 'Servicio N/A';
              const locationName = appointment.locationName || 'Sede N/A';
              const coverageText = getCoverageText(appointment.coverageLevel);

              return (
                <Paper
                  key={appointment.id}
                  variant="outlined"
                  sx={{
                    mb: 2.5,
                    p: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 1,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    {/* Fecha */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.2 }}>
                      <CalendarMonthIcon color="primary" sx={{ mr: 1.5, fontSize: '1.25rem' }} />
                      <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                        {dateStr}
                      </Typography>
                    </Box>

                    {/* Hora */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.2 }}>
                      <AccessTimeIcon sx={{ mr: 1.5, fontSize: '1.25rem', color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="semibold" color="text.primary">
                        {timeStr}
                      </Typography>
                    </Box>

                    {/* Médico */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.2 }}>
                      <PersonIcon sx={{ mr: 1.5, fontSize: '1.25rem', color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" fontWeight="medium">
                        {doctorName}
                      </Typography>
                    </Box>

                    {/* Especialidad */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.2 }}>
                      <MedicalInformationIcon sx={{ mr: 1.5, fontSize: '1.25rem', color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {serviceName}
                      </Typography>
                    </Box>

                    {/* Sede */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <LocationOnIcon sx={{ mr: 1.5, fontSize: '1.25rem', color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {locationName}
                      </Typography>
                    </Box>

                    {/* Cobertura y Costo */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      <LocalHospitalIcon color={getCoverageColor(appointment.coverageLevel)} sx={{ mr: 1.5, fontSize: '1.25rem' }} />
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 1.5 }}>
                        {coverageText}
                      </Typography>
                      <Box component="span" sx={{ mx: 1, color: 'text.secondary' }}>•</Box>
                      <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ ml: 1 }}>
                        {formatCurrency(appointment.cost)}
                      </Typography>
                    </Box>

                    {/* Mensaje de error si falló */}
                    {bookingErrors[appointment.id] && (
                      <Box 
                        sx={{ 
                          mt: 2, 
                          p: 1.5, 
                          bgcolor: 'error.lighter', 
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'error.light',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Typography variant="caption" color="error.main" fontWeight="semibold">
                          {bookingErrors[appointment.id]}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <IconButton
                    edge="end"
                    aria-label="eliminar turno"
                    color="error"
                    onClick={() => onRemove(appointment.id)}
                    sx={{
                      ml: 2,
                      bgcolor: 'error.lighter',
                      '&:hover': { bgcolor: 'error.light', color: 'white' }
                    }}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Paper>
              );
            })}
          </List>
        )}
      </Box>

      <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {cart.length > 0 && (
          <Button
            fullWidth
            variant="outlined"
            color="error"
            size="large"
            onClick={onClear}
            sx={{ py: 1.5, borderRadius: 2.5, fontWeight: 'bold' }}
          >
            Limpiar Selección
          </Button>
        )}
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          disabled={cart.length === 0}
          onClick={onConfirm}
          sx={{ py: 1.5, borderRadius: 2.5, fontWeight: 'bold', fontSize: '1.05rem' }}
        >
          Confirmar Preselección
        </Button>
      </Box>
    </Drawer>
  );
}

export default AppointmentCartDrawer;
