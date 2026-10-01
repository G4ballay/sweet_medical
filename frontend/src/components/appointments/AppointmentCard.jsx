import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import PersonIcon from '@mui/icons-material/Person';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  AppointmentStatus,
  AppointmentTab,
  canBeModifiedByPatient,
  formatDate,
  formatSlotLabel,
  formatTime,
  getAppointmentStatus,
  getCancellationReason,
  getDoctorName,
  getLocationName,
  getPatientName,
  getPreviousAppointmentDate,
  getProposedAppointmentDate,
  getProposedAppointmentEndDate,
  getRawAppointmentStatus,
  getRescheduleReason,
  getServiceName,
  getStatusMeta
} from '../../utils/appointment.utils';
import { formatCurrency, getCoverageColor, getCoverageText } from '../../utils/formatters';

export function AppointmentCard({
  appointment,
  isDoctor,
  cancellingId,
  confirmingId,
  modifyingId,
  respondingId,
  doctorDetails = {},
  patientDetails = {},
  serviceDetails = {},
  locationDetails = {},
  onCancel,
  onConfirm,
  onModify,
  onAcceptReschedule,
  onRejectReschedule,
  readOnly = false,
  compact = false,
  isSlot = false,
  isSelected = false,
  onToggleCartItem,
  shortDate = false,
  hideCoverage = false
}) {
  const statusMeta = !isSlot ? getStatusMeta(appointment) : null;
  const rawStatus = !isSlot ? getRawAppointmentStatus(appointment) : null;
  const canCancel = !isSlot && !readOnly && getAppointmentStatus(appointment) === AppointmentTab.UPCOMING;
  const isRescheduleProposed = !isSlot && rawStatus === AppointmentStatus.RESCHEDULE_PROPOSED;
  const canConfirm = !isSlot && !readOnly && isDoctor && rawStatus === AppointmentStatus.BOOKED && getAppointmentStatus(appointment) === AppointmentTab.UPCOMING;
  const canModify = !isSlot && !readOnly && getAppointmentStatus(appointment) === AppointmentTab.UPCOMING && !isRescheduleProposed && (isDoctor || canBeModifiedByPatient(appointment));
  const canAnswerReschedule = !isSlot && !readOnly && !isDoctor && getAppointmentStatus(appointment) === AppointmentTab.UPCOMING && isRescheduleProposed;

  const doctorName = isSlot ? (appointment.doctorName || 'Doctor N/A') : getDoctorName(appointment, doctorDetails);
  const patientName = !isSlot ? getPatientName(appointment, patientDetails) : '';
  const serviceName = isSlot ? (appointment.serviceName || 'Servicio N/A') : getServiceName(appointment, serviceDetails);
  const locationName = isSlot ? (appointment.locationName || 'Sede N/A') : getLocationName(appointment, locationDetails);
  const coverageLevel = appointment.coverageLevel || appointment.coverage;
  const hasCost = appointment.cost !== undefined && appointment.cost !== null;
  const cancellationReason = !isSlot ? getCancellationReason(appointment) : null;
  const rescheduleReason = !isSlot ? getRescheduleReason(appointment) : null;
  const previousStartTime = !isSlot ? getPreviousAppointmentDate(appointment) : null;
  const proposedStartTime = !isSlot ? (getProposedAppointmentDate(appointment) || (isRescheduleProposed ? appointment.startTime || appointment.startsAt : '')) : null;
  const proposedEndTime = !isSlot ? (getProposedAppointmentEndDate(appointment) || (isRescheduleProposed ? appointment.endTime || appointment.endsAt : '')) : null;
  const isCancelled = !isSlot && getAppointmentStatus(appointment) === AppointmentTab.CANCELLED;
  const isResponding = !isSlot && respondingId === appointment.id;

  const dateStr = formatDate(appointment, (shortDate || compact) ? 'short' : 'long');
  const timeStr = formatTime(appointment);

  if (compact) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', textTransform: 'capitalize' }}>
            {dateStr} - {timeStr}
          </Typography>
          {statusMeta && (
            <Chip
              label={statusMeta.label}
              size="small"
              sx={{
                bgcolor: statusMeta.background,
                color: statusMeta.color,
                borderColor: statusMeta.border,
                fontSize: '0.7rem',
                height: 18,
                fontWeight: 800,
                '& .MuiChip-label': { px: 1 }
              }}
            />
          )}
        </Stack>

        <Stack spacing={0.6} sx={{ mt: 0.2 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              <strong>{isDoctor ? 'Paciente:' : 'Médico:'}</strong> {isDoctor ? patientName : doctorName}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <MedicalInformationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              <strong>Servicio:</strong> {serviceName}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              <strong>Sede:</strong> {locationName}
            </Typography>
          </Stack>

          {!isDoctor && !hideCoverage && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <LocalHospitalIcon sx={{ fontSize: 16, color: getCoverageColor(coverageLevel) }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                <strong>Cobertura:</strong> {getCoverageText(coverageLevel)}
              </Typography>
            </Stack>
          )}

          {!isDoctor && !hideCoverage && hasCost && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', pt: 0.2 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.85rem' }}>
                Costo: {formatCurrency(appointment.cost)}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Box>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderColor: isSelected
          ? 'primary.main'
          : (!isSlot && getAppointmentStatus(appointment) === AppointmentTab.UPCOMING ? 'divider' : alpha('#6B7280', 0.2)),
        borderWidth: isSelected ? 2 : 1,
        borderStyle: 'solid',
        position: 'relative',
        boxShadow: isSelected
          ? '0px 4px 20px rgba(0, 0, 0, 0.1)'
          : (readOnly ? 'none' : undefined),
        borderRadius: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: isSlot ? 'translateY(-4px)' : undefined,
          boxShadow: isSlot ? '0px 8px 24px rgba(0, 0, 0, 0.12)' : undefined,
        }
      }}
    >
      <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
        <Box sx={{ pr: !isSlot ? { xs: 0, sm: 14 } : 0 }}>
          <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center', mb: 1 }}>
            <CalendarMonthIcon color={isSelected ? 'primary' : 'action'} fontSize="small" />
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem', textTransform: 'capitalize', color: isSelected ? 'primary.main' : 'text.primary' }}>
              {dateStr}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
            <AccessTimeIcon color="action" fontSize="small" />
            <Typography variant="body1" sx={{ fontWeight: isSlot ? 600 : 600 }}>
              {timeStr}
            </Typography>
          </Stack>
        </Box>

        {!isSlot && statusMeta && (
          <Chip
            label={statusMeta.label}
            size="small"
            sx={{
              position: { xs: 'static', sm: 'absolute' },
              top: { sm: 18 },
              right: { sm: 18 },
              alignSelf: 'flex-start',
              order: { xs: 2, sm: 0 },
              mt: { xs: 1.2, sm: 0 },
              bgcolor: statusMeta.background,
              color: statusMeta.color,
              border: '1px solid',
              borderColor: statusMeta.border,
              fontWeight: 800,
              letterSpacing: 0,
              '& .MuiChip-label': {
                px: 1.2,
              },
            }}
          />
        )}

        <Divider sx={{ mt: { xs: 2, sm: 0 }, mb: 2 }} />

        <Stack spacing={1.4}>
          <Stack direction="row" spacing={1.4} sx={{ alignItems: 'center' }}>
            <PersonIcon color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 0 }}>
              {isDoctor ? patientName : doctorName}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.4} sx={{ alignItems: 'center' }}>
            <MedicalInformationIcon color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 0 }}>
              {serviceName}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.4} sx={{ alignItems: 'center' }}>
            <LocationOnIcon color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 0 }}>
              {locationName}
            </Typography>
          </Stack>

          {!isDoctor && !hideCoverage && (
            <>
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" spacing={1.4} sx={{ alignItems: 'center' }}>
                <LocalHospitalIcon color={getCoverageColor(coverageLevel)} fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  {getCoverageText(coverageLevel)}
                </Typography>
              </Stack>
            </>
          )}

          {!isDoctor && !hideCoverage && hasCost && (
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', pt: 0.5 }}>
              {formatCurrency(appointment.cost)}
            </Typography>
          )}

          {!isSlot && isCancelled && cancellationReason && (
            <Box
              sx={{
                mt: 0.5,
                p: 1.5,
                bgcolor: 'error.lighter',
                borderRadius: 1,
                border: '1px solid',
                borderColor: alpha('#DC2626', 0.24),
              }}
            >
              <Typography variant="caption" sx={{ display: 'block', color: 'error.main', fontWeight: 800, mb: 0.5 }}>
                Motivo de cancelacion
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.5, overflowWrap: 'anywhere' }}>
                {cancellationReason}
              </Typography>
            </Box>
          )}

          {!isSlot && isRescheduleProposed && (
            <Box
              sx={{
                mt: 0.5,
                p: 1.5,
                bgcolor: alpha('#EA580C', 0.08),
                borderRadius: 1,
                border: '1px solid',
                borderColor: alpha('#EA580C', 0.24),
              }}
            >
              <Typography variant="caption" sx={{ display: 'block', color: '#9A3412', fontWeight: 800, mb: 0.5 }}>
                Reprogramacion pendiente
              </Typography>
              {proposedStartTime && (
                <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.5, fontWeight: 700 }}>
                  Nuevo horario: {formatSlotLabel({ startTime: proposedStartTime, endTime: proposedEndTime })}
                </Typography>
              )}
              {previousStartTime && (
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5, mt: 0.5 }}>
                  Horario original: {formatSlotLabel({ startTime: previousStartTime })}
                </Typography>
              )}
              {rescheduleReason && (
                <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.5, overflowWrap: 'anywhere', mt: 0.5 }}>
                  {rescheduleReason}
                </Typography>
              )}
            </Box>
          )}
        </Stack>
      </CardContent>

      {isSlot && (
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            size="large"
            variant={isSelected ? "outlined" : "contained"}
            color={isSelected ? "error" : "primary"}
            onClick={() => onToggleCartItem(appointment)}
            fullWidth
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
            aria-label={isSelected ? `Quitar turno con Dr. ${doctorName} el ${dateStr} a las ${timeStr}` : `Seleccionar turno con Dr. ${doctorName} el ${dateStr} a las ${timeStr}`}
          >
            {isSelected ? "Quitar Turno" : "Seleccionar Turno"}
          </Button>
        </CardActions>
      )}

      {!isSlot && canCancel && (
        <CardActions sx={{ p: 2.5, pt: 0, flexDirection: 'column', gap: 1 }}>
          {canConfirm && (
            <Tooltip title="Confirmar este turno">
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<CheckCircleIcon />}
                disabled={confirmingId === appointment.id || cancellingId === appointment.id}
                onClick={() => onConfirm(appointment)}
                sx={{ ml: '0 !important' }}
              >
                {confirmingId === appointment.id ? 'Confirmando...' : 'Confirmar turno'}
              </Button>
            </Tooltip>
          )}
          {canModify && (
            <Tooltip title="Modificar este turno">
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<EditCalendarIcon />}
                disabled={modifyingId === appointment.id || cancellingId === appointment.id || isResponding}
                onClick={() => onModify(appointment)}
                sx={{ ml: '0 !important' }}
              >
                {modifyingId === appointment.id ? 'Modificando...' : 'Reprogramar turno'}
              </Button>
            </Tooltip>
          )}
          {canAnswerReschedule && (
            <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ width: '100%', gap: 1.5 }}>
              <Button
                fullWidth
                variant="contained"
                color="success"
                startIcon={<CheckIcon />}
                disabled={isResponding || cancellingId === appointment.id}
                onClick={() => onAcceptReschedule(appointment)}
                sx={{ ml: '0 !important' }}
              >
                {isResponding ? 'Respondiendo...' : 'Aceptar cambio'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<CloseIcon />}
                disabled={isResponding || cancellingId === appointment.id}
                onClick={() => onRejectReschedule(appointment)}
                sx={{ ml: '0 !important' }}
              >
                Rechazar
              </Button>
            </Stack>
          )}
          <Tooltip title="Cancelar este turno">
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<CancelOutlinedIcon />}
              disabled={cancellingId === appointment.id || confirmingId === appointment.id || modifyingId === appointment.id || isResponding}
              onClick={() => onCancel(appointment)}
              sx={{ ml: '0 !important' }}
            >
              {cancellingId === appointment.id ? 'Cancelando...' : 'Cancelar turno'}
            </Button>
          </Tooltip>
        </CardActions>
      )}
    </Card>
  );
}
