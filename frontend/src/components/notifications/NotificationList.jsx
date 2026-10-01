import { Box, Typography } from '@mui/material'
import { useState } from 'react'
import { useNotification } from '../../context/NotificationContext'
import NotificationFilter from './NotificationFilter'
import NotificationItem from './NotificationItem'

export default function NotificationList() {
  const [filter, setFilter] = useState('todas')

  const { notificaciones, handleMarcarLeida, handleEliminarNotif } = useNotification();

  const notificacionesFiltradas = notificaciones.filter((n) => {
    if (filter === 'sin_leer') return !n.isRead
    if (filter === 'leidas') return n.isRead
    return true
  })

  function adaptarNotificacion(n) {
    return {
      id: n.id,
      tipo: 'recordatorio',
      titulo: 'Notificación',
      mensaje: n.message,
      fecha: new Date(n.createTimestamp).toLocaleString('es-AR'),
      fechaTurno: '',
      leida: n.isRead,
    }
  }

  return (
    <Box>
      <NotificationFilter
        filter={filter}
        setFilter={setFilter}
        notificaciones={notificaciones}
      />
      <Box sx={{ mt: 2 }}>
        {notificaciones.length === 0 && (
          <Typography color="text.secondary">
            No hay notificaciones para mostrar
          </Typography>
        )}

        {notificacionesFiltradas.map((n) => (
          <NotificationItem
            key={n.id}
            notificacion={adaptarNotificacion(n)}
            onMarcarLeida={handleMarcarLeida}
            onEliminar={handleEliminarNotif}
          />
        ))}

        {notificaciones.length > 0 && notificacionesFiltradas.length === 0 && (
          <Typography color="text.secondary">
            No hay notificaciones en esta categoría
          </Typography>
        )}
      </Box>
    </Box>
  )
}