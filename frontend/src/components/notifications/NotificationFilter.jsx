import { ToggleButton, ToggleButtonGroup } from '@mui/material'

export default function NotificationFilter({ filter, setFilter, notificaciones }) {
  const sinLeer = notificaciones.filter(n => !n.isRead).length
  const leidas = notificaciones.filter(n => n.isRead).length

  return (
    <ToggleButtonGroup
      value={filter}
      exclusive
      onChange={(_, val) => val && setFilter(val)}
      color="primary"
      aria-label="Filtrar notificaciones"
    >
      <ToggleButton value="todas">Todas ({notificaciones.length})</ToggleButton>
      <ToggleButton value="sin_leer">Sin leer ({sinLeer})</ToggleButton>
      <ToggleButton value="leidas">Leídas ({leidas})</ToggleButton>
    </ToggleButtonGroup>
  )
}