import {
  CalendarTodayOutlined,
  CancelOutlined,
  CheckCircleOutlineOutlined,
  DeleteOutlined,
  MailOutlined,
  NotificationsNoneOutlined,
  SwapHorizOutlined,
  TaskAltOutlined
} from '@mui/icons-material';
import { Box, Chip, IconButton, Typography } from '@mui/material';

const estilosPorTipo = {
  confirmacion: { color: '#43a047', chipColor: '#e8f5e9', icono: CheckCircleOutlineOutlined },
  recordatorio: { color: '#1e88e5', chipColor: '#e3f2fd', icono: NotificationsNoneOutlined },
  cancelacion:  { color: '#e53935', chipColor: '#fdecea', icono: CancelOutlined },
  cambio:       { color: '#fb8c00', chipColor: '#fff3e0', icono: SwapHorizOutlined },
  realizado:    { color: '#43a047', chipColor: '#e8f5e9', icono: TaskAltOutlined },
};

export default function NotificationItem({ notificacion, onMarcarLeida, onEliminar}) {
  const estilo = estilosPorTipo[notificacion.tipo] || estilosPorTipo.recordatorio;
  const IconoTipo = estilo.icono;

  return (
    <Box sx={(theme) => ({
      display: 'flex',
      alignItems: 'flex-start',
      gap: 2,
      p: 2.5,
      mb: 1,
      borderRadius: 1,
      border: '1px solid #dcdcdc',
      position: 'relative',
      ...(notificacion.leida ? {} : { borderLeft: `4px solid ${theme.palette.primary.main}` }),
    })}>

      {!notificacion.leida && (
        <Box sx={{
          position: 'absolute',
          top: 14,
          right: 14,
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: 'primary.main',
        }} />
      )}

      <Box sx={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        backgroundColor: estilo.color + '20',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <IconoTipo sx={{ color: estilo.color, fontSize: 22 }} />
      </Box>

      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', pr: 3 }}>
          <Typography variant="body1" fontWeight={notificacion.leida ? 400 : 700}>
            {notificacion.titulo}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {notificacion.fecha}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {notificacion.mensaje}
        </Typography>

        <Chip
          icon={<CalendarTodayOutlined />}
          label={notificacion.fechaTurno}
          size="small"
          sx={{
            mt: 1,
            backgroundColor: estilo.chipColor,
            color: estilo.color,
            fontWeight: 600,
            fontSize: '0.75rem',
        
            '& .MuiChip-icon': {
              color: estilo.color, 
              marginRight: '-12px'  
            }
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
            <IconButton
              size="small"
              aria-label={notificacion.leida ? "Marcar como no leída" : "Marcar como leída"}
              sx={{ color: '#888', p: 0.5 }}
              onClick={() => onMarcarLeida(notificacion.id)}
            >
              <MailOutlined sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              aria-label="Eliminar notificación"
              sx={{ color: '#888', p: 0.5 }}
              onClick={() => onEliminar(notificacion.id)}
            >
              <DeleteOutlined sx={{ fontSize: 18 }} />
            </IconButton>
        </Box>
      </Box>

    </Box>
  );
}