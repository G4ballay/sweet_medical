import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CloseIcon from '@mui/icons-material/Close';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  InputAdornment,
  Radio,
  RadioGroup,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppointmentCard } from '../components/appointments/AppointmentCard';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Role } from '../enums/role.enum';
import { useAppointmentDetails } from '../hooks/useAppointmentDetails';
import { acceptRescheduleAppointment, cancelAppointment, confirmAppointment, getAppointments, rejectRescheduleAppointment, rescheduleAppointment, searchAvailableSlots } from '../services/appointment.service';
import {
  AppointmentStatus,
  AppointmentTab,
  formatSlotLabel,
  getAppointmentDate,
  getAppointmentStatus,
  getDoctorId,
  getDoctorName,
  getLocationId,
  getLocationName,
  getPatientName,
  getPreviousAppointmentDate,
  getServiceId,
  getServiceName,
  getServiceType,
  normalizeAppointments,
  normalizeList
} from '../utils/appointment.utils';

function AppointmentSkeletons() {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} variant="rounded" height={250} />
      ))}
    </Box>
  );
}

function ModifyAppointmentSkeletons() {
  return (
    <Stack spacing={1.2}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} variant="rounded" height={60} />
      ))}
    </Stack>
  );
}

const buildAvailableSlotsFilters = (appointment, dateFrom) => {
  const serviceType = getServiceType(appointment);
  const serviceId = getServiceId(appointment);
  const doctorId = getDoctorId(appointment);
  const locationId = getLocationId(appointment);

  const filters = {
    serviceType,
    serviceId,
    dateFrom: dateFrom.toISOString(),
  };

  if (doctorId) {
    filters.doctorIds = [doctorId];
  }
  if (locationId) {
    filters.locationIds = [locationId];
  }

  return filters;
};

function EmptyState({ isDoctor, activeTab, hasSearch, onSearchAppointments }) {
  const copy = {
    [AppointmentTab.UPCOMING]: isDoctor
      ? 'No tenés turnos programados para los próximos días.'
      : 'No tenés turnos programados. Cuando reserves uno, lo vas a ver acá.',
    [AppointmentTab.PAST]: 'Todavía no hay turnos pasados para mostrar.',
    [AppointmentTab.CANCELLED]: 'No hay turnos cancelados para mostrar.',
  };

  return (
    <Box
      sx={{
        textAlign: 'center',
        p: { xs: 3, sm: 5 },
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <EventAvailableIcon sx={{ fontSize: 48, color: 'text.tertiary', mb: 2 }} />
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        {hasSearch ? 'No encontramos coincidencias' : 'Sin turnos por ahora'}
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 520, mx: 'auto', lineHeight: 1.6 }}>
        {hasSearch ? 'Probá con otro nombre, servicio o sede.' : copy[activeTab]}
      </Typography>
      {!isDoctor && activeTab === AppointmentTab.UPCOMING && !hasSearch && (
        <Button
          variant="contained"
          onClick={onSearchAppointments}
          startIcon={<CalendarMonthIcon />}
          sx={{ mt: 3 }}
        >
          Reservar Turno
        </Button>
      )}
    </Box>
  );
}



function CancelAppointmentDialog({ open, appointment, reason, reasonError, cancellingId, onReasonChange, onClose, onConfirm }) {
  const isCancelling = Boolean(appointment?.id && cancellingId === appointment.id);

  return (
    <Dialog
      open={open}
      onClose={isCancelling ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        Cancelar turno
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2, color: 'text.secondary' }}>
          Indica el motivo de la cancelacion. Este dato es obligatorio para informar correctamente el cambio.
        </DialogContentText>
        <TextField
          autoFocus
          fullWidth
          multiline
          minRows={4}
          label="Motivo"
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          error={Boolean(reasonError)}
          helperText={reasonError || ' '}
          disabled={isCancelling}
          slotProps={{ htmlInput: { maxLength: 500 } }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={isCancelling} variant="outlined">
          Volver
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isCancelling}
          variant="contained"
          color="error"
          startIcon={<CancelOutlinedIcon />}
        >
          {isCancelling ? 'Cancelando...' : 'Confirmar cancelacion'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function RejectRescheduleDialog({ open, appointment, reason, reasonError, respondingId, onReasonChange, onClose, onConfirm }) {
  const isResponding = Boolean(appointment?.id && respondingId === appointment.id);

  return (
    <Dialog
      open={open}
      onClose={isResponding ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        Rechazar reprogramacion
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2, color: 'text.secondary' }}>
          Indica el motivo del rechazo para informar al profesional.
        </DialogContentText>
        <TextField
          autoFocus
          fullWidth
          multiline
          minRows={4}
          label="Motivo"
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          error={Boolean(reasonError)}
          helperText={reasonError || ' '}
          disabled={isResponding}
          slotProps={{ htmlInput: { maxLength: 500 } }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={isResponding} variant="outlined">
          Volver
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isResponding || !reason.trim()}
          variant="contained"
          color="error"
          startIcon={<CloseIcon />}
        >
          {isResponding ? 'Rechazando...' : 'Confirmar rechazo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ModifyAppointmentDialog({
  open,
  isDoctor,
  slots,
  selectedSlotId,
  reason,
  reasonError,
  loading,
  error,
  modifying,
  onSelectSlot,
  onReasonChange,
  onClose,
  onConfirm
}) {
  return (
    <Dialog
      open={open}
      onClose={modifying ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>{'Reprogramar turno'}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2, color: 'text.secondary' }}>
          {isDoctor
            ? 'Elegi un horario disponible de tu agenda e indica el motivo. El paciente debera aceptar o rechazar el cambio.'
            : 'Elegi otro horario disponible para el mismo profesional y servicio.'}
        </DialogContentText>

        {loading && <ModifyAppointmentSkeletons />}

        {!loading && error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && slots.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography color="text.secondary">
              No encontramos horarios alternativos disponibles.
            </Typography>
          </Box>
        )}

        {!loading && slots.length > 0 && (
          <Box sx={{ maxHeight: 280, overflowY: 'auto', pr: 1, my: 1.5 }}>
            <RadioGroup value={selectedSlotId} onChange={(event) => onSelectSlot(event.target.value)}>
              <Stack spacing={1.2}>
                {slots.map((slot) => (
                  <Box
                    key={slot.id}
                    sx={{
                      border: '1px solid',
                      borderColor: selectedSlotId === slot.id ? 'primary.main' : 'divider',
                      bgcolor: selectedSlotId === slot.id ? alpha('#D9043D', 0.06) : 'background.paper',
                      borderRadius: 1,
                      px: 1.5,
                    }}
                  >
                    <FormControlLabel
                      value={slot.id}
                      control={<Radio />}
                      disabled={modifying}
                      label={
                        <Box sx={{ py: 1 }}>
                          <Typography sx={{ fontWeight: 700 }}>
                            {formatSlotLabel(slot)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {slot.locationName || slot.location?.name || 'Sede disponible'}
                          </Typography>
                        </Box>
                      }
                      sx={{ width: '100%', m: 0 }}
                    />
                  </Box>
                ))}
              </Stack>
            </RadioGroup>
          </Box>
        )}

        {!loading && slots.length > 0 && (
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Motivo"
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            error={Boolean(reasonError)}
            helperText={reasonError || ' '}
            disabled={modifying}
            slotProps={{ htmlInput: { maxLength: 500 } }}
            sx={{ mt: 2 }}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={modifying} variant="outlined">
          Volver
        </Button>
        <Button
          onClick={onConfirm}
          disabled={modifying || loading || !selectedSlotId || !reason.trim()}
          variant="contained"
          startIcon={<EditCalendarIcon />}
        >
          {modifying ? 'Modificando...' : isDoctor ? 'Enviar propuesta' : 'Confirmar cambio'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Appointments() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const isDoctor = user?.role === Role.DOCTOR;

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(AppointmentTab.UPCOMING);
  const [search, setSearch] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [modifyingId, setModifyingId] = useState(null);
  const [respondingId, setRespondingId] = useState(null);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [appointmentToModify, setAppointmentToModify] = useState(null);
  const [appointmentToRejectReschedule, setAppointmentToRejectReschedule] = useState(null);
  const [modificationSlots, setModificationSlots] = useState([]);
  const [selectedModificationSlotId, setSelectedModificationSlotId] = useState('');
  const [modificationReason, setModificationReason] = useState('');
  const [modificationReasonError, setModificationReasonError] = useState('');
  const [loadingModificationSlots, setLoadingModificationSlots] = useState(false);
  const [modificationError, setModificationError] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [cancelReasonError, setCancelReasonError] = useState('');
  const [rejectRescheduleReason, setRejectRescheduleReason] = useState('');
  const [rejectRescheduleReasonError, setRejectRescheduleReasonError] = useState('');
  const { doctorDetails, patientDetails, serviceDetails, locationDetails } = useAppointmentDetails(appointments, isDoctor);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAppointments();
      setAppointments(normalizeAppointments(data));
    } catch (err) {
      const message = err.message === 'Network Error'
        ? 'Error de conexión con el servidor.'
        : err.response?.data?.message || 'No pudimos cargar tus turnos.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);



  const counts = useMemo(() => appointments.reduce((acc, appointment) => {
    const status = getAppointmentStatus(appointment);
    acc[status] += 1;
    return acc;
  }, {
    [AppointmentTab.UPCOMING]: 0,
    [AppointmentTab.PAST]: 0,
    [AppointmentTab.CANCELLED]: 0,
  }), [appointments]);

  const visibleAppointments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return appointments
      .filter((appointment) => getAppointmentStatus(appointment) === activeTab)
      .filter((appointment) => {
        if (!normalizedSearch) return true;
        const haystack = [
          appointment.doctorName,
          appointment.doctor?.name,
          getDoctorName(appointment, doctorDetails),
          appointment.patientName,
          appointment.patient?.name,
          getPatientName(appointment, patientDetails),
          appointment.serviceName,
          appointment.specialtyName,
          appointment.practiceName,
          getServiceName(appointment, serviceDetails),
          appointment.locationName,
          appointment.location?.name,
          getLocationName(appointment, locationDetails),
        ].filter(Boolean).join(' ').toLowerCase();

        return haystack.includes(normalizedSearch);
      })
      .sort((a, b) => {
        const first = getAppointmentDate(a)?.getTime() || 0;
        const second = getAppointmentDate(b)?.getTime() || 0;
        return activeTab === AppointmentTab.PAST ? second - first : first - second;
      });
  }, [activeTab, appointments, doctorDetails, locationDetails, patientDetails, serviceDetails, search]);

  const handleOpenCancelDialog = (appointment) => {
    setAppointmentToCancel(appointment);
    setCancelReason('');
    setCancelReasonError('');
  };

  const handleCloseCancelDialog = () => {
    if (cancellingId) return;
    setAppointmentToCancel(null);
    setCancelReason('');
    setCancelReasonError('');
  };

  const handleCancelReasonChange = (value) => {
    setCancelReason(value);
    if (value.trim()) {
      setCancelReasonError('');
    }
  };

  const handleConfirmCancelAppointment = async () => {
    if (!appointmentToCancel) return;

    const reason = cancelReason.trim();
    if (!reason) {
      setCancelReasonError('El motivo es obligatorio.');
      return;
    }

    setCancellingId(appointmentToCancel.id);
    try {
      await cancelAppointment(appointmentToCancel.id, reason);
      setAppointments(prev => prev.map(item => (
        item.id === appointmentToCancel.id ? { ...item, status: AppointmentStatus.CANCELLED, cancellationReason: reason } : item
      )));
      setAppointmentToCancel(null);
      setCancelReason('');
      setCancelReasonError('');
      showNotification('Turno cancelado correctamente. Se notificara a la contraparte.', 'success');
    } catch (err) {
      const message = err.response?.data?.message || 'No se pudo cancelar el turno.';
      showNotification(message, 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const handleConfirmAppointment = async (appointment) => {
    setConfirmingId(appointment.id);
    try {
      await confirmAppointment(appointment.id);
      setAppointments(prev => prev.map(item => (
        item.id === appointment.id ? { ...item, status: AppointmentStatus.CONFIRMED } : item
      )));
      showNotification('Turno confirmado correctamente. Se notificara al paciente.', 'success');
    } catch (err) {
      const message = err.response?.data?.message || 'No se pudo confirmar el turno.';
      showNotification(message, 'error');
    } finally {
      setConfirmingId(null);
    }
  };

  const handleOpenModifyDialog = async (appointment) => {
    setAppointmentToModify(appointment);
    setModificationSlots([]);
    setSelectedModificationSlotId('');
    setModificationReason('');
    setModificationReasonError('');
    setModificationError('');
    setLoadingModificationSlots(true);

    const dateFrom = new Date(Date.now() + 60 * 60 * 1000);
    const serviceType = getServiceType(appointment);
    const serviceId = getServiceId(appointment);
    const doctorId = getDoctorId(appointment);

    if (!serviceType || !serviceId || !doctorId) {
      setModificationError('No pudimos cargar horarios alternativos porque el turno no tiene todos los datos necesarios.');
      setLoadingModificationSlots(false);
      return;
    }

    try {
      const data = await searchAvailableSlots(buildAvailableSlotsFilters(appointment, dateFrom));

      const currentStart = appointment.startTime || appointment.startsAt;
      const currentLocationId = getLocationId(appointment);
      const availableSlots = normalizeList(data?.availableSlots || data)
        .filter((slot) => (slot.startTime || slot.startsAt) !== currentStart)
        .map((slot) => ({
          ...slot,
          id: `${slot.doctorId || getDoctorId(appointment)}-${slot.locationId || currentLocationId}-${slot.startTime || slot.startsAt || slot.date}`,
        }));

      setModificationSlots(availableSlots);
      setSelectedModificationSlotId(availableSlots[0]?.id || '');
    } catch (err) {
      const backendMessage = err.response?.data?.message || '';
      const message = err.message === 'Network Error'
        ? 'Error de conexion con el servidor.'
        : backendMessage.includes('identificador')
          ? 'No pudimos cargar horarios alternativos para este turno.'
          : backendMessage || 'No pudimos cargar horarios alternativos.';
      setModificationError(message);
    } finally {
      setLoadingModificationSlots(false);
    }
  };

  const handleCloseModifyDialog = () => {
    if (modifyingId) return;
    setAppointmentToModify(null);
    setModificationSlots([]);
    setSelectedModificationSlotId('');
    setModificationReason('');
    setModificationReasonError('');
    setModificationError('');
  };

  const handleModificationReasonChange = (value) => {
    setModificationReason(value);
    if (value.trim()) {
      setModificationReasonError('');
    }
  };

  const handleConfirmModifyAppointment = async () => {
    if (!appointmentToModify || !selectedModificationSlotId) return;

    const selectedSlot = modificationSlots.find((slot) => slot.id === selectedModificationSlotId);
    if (!selectedSlot) return;

    const reason = modificationReason.trim();
    if (!reason) {
      setModificationReasonError('El motivo es obligatorio.');
      return;
    }

    setModifyingId(appointmentToModify.id);
    try {
      const startTime = selectedSlot.startTime || selectedSlot.startsAt || selectedSlot.date;
      const nextStatus = isDoctor ? AppointmentStatus.RESCHEDULE_PROPOSED : AppointmentStatus.BOOKED;
      await rescheduleAppointment(appointmentToModify.id, startTime, reason, isDoctor ? nextStatus : undefined);
      setAppointments(prev => prev.map(item => (
        item.id === appointmentToModify.id ? {
          ...item,
          previousStartTime: item.startTime || item.startsAt,
          startTime,
          endTime: selectedSlot.endTime || selectedSlot.endsAt || item.endTime,
          proposedStartTime: startTime,
          proposedEndTime: selectedSlot.endTime || selectedSlot.endsAt || item.endTime,
          locationId: selectedSlot.locationId || item.locationId,
          status: nextStatus,
          rescheduleReason: reason,
        } : item
      )));
      setAppointmentToModify(null);
      setModificationSlots([]);
      setSelectedModificationSlotId('');
      setModificationReason('');
      setModificationReasonError('');
      showNotification(
        isDoctor
          ? 'Propuesta de reprogramacion enviada. El paciente debera responder el cambio.'
          : 'Turno modificado correctamente. Se notificara al profesional.',
        'success'
      );
    } catch (err) {
      const message = err.response?.data?.message || 'No se pudo modificar el turno.';
      showNotification(message, 'error');
    } finally {
      setModifyingId(null);
    }
  };

  const handleAcceptReschedule = async (appointment) => {
    setRespondingId(appointment.id);
    try {
      await acceptRescheduleAppointment(appointment.id);
      setAppointments(prev => prev.map(item => (
        item.id === appointment.id ? {
          ...item,
          status: AppointmentStatus.CONFIRMED,
          rescheduleReason: '',
          previousStartTime: '',
          proposedStartTime: '',
          proposedEndTime: '',
        } : item
      )));
      showNotification('Cambio de turno aceptado correctamente. Se notificara al profesional.', 'success');
    } catch (err) {
      const message = err.response?.data?.message || 'No se pudo aceptar la reprogramacion.';
      showNotification(message, 'error');
    } finally {
      setRespondingId(null);
    }
  };

  const handleOpenRejectRescheduleDialog = (appointment) => {
    setAppointmentToRejectReschedule(appointment);
    setRejectRescheduleReason('');
    setRejectRescheduleReasonError('');
  };

  const handleCloseRejectRescheduleDialog = () => {
    if (respondingId) return;
    setAppointmentToRejectReschedule(null);
    setRejectRescheduleReason('');
    setRejectRescheduleReasonError('');
  };

  const handleRejectRescheduleReasonChange = (value) => {
    setRejectRescheduleReason(value);
    if (value.trim()) {
      setRejectRescheduleReasonError('');
    }
  };

  const handleConfirmRejectReschedule = async () => {
    if (!appointmentToRejectReschedule) return;

    const reason = rejectRescheduleReason.trim();
    if (!reason) {
      setRejectRescheduleReasonError('El motivo es obligatorio.');
      return;
    }

    setRespondingId(appointmentToRejectReschedule.id);
    try {
      await rejectRescheduleAppointment(appointmentToRejectReschedule.id, reason);
      const previousStartTime = getPreviousAppointmentDate(appointmentToRejectReschedule);
      setAppointments(prev => prev.map(item => (
        item.id === appointmentToRejectReschedule.id ? {
          ...item,
          startTime: previousStartTime || item.startTime,
          status: AppointmentStatus.BOOKED,
          rescheduleReason: '',
          rescheduleRejectionReason: reason,
          previousStartTime: '',
          proposedStartTime: '',
          proposedEndTime: '',
        } : item
      )));
      setAppointmentToRejectReschedule(null);
      setRejectRescheduleReason('');
      setRejectRescheduleReasonError('');
      showNotification('Cambio de turno rechazado. Se notificara al profesional.', 'success');
    } catch (err) {
      const message = err.response?.data?.message || 'No se pudo rechazar la reprogramacion.';
      showNotification(message, 'error');
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 8 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3 }}>
        <Box>
          <Typography variant="pageTitle" component="h1">
            Mis Turnos
          </Typography>
          <Typography sx={{ color: 'text.secondary', lineHeight: 1.7, maxWidth: 760 }}>
            {isDoctor
              ? 'Revisá tu agenda, consultá los datos principales de cada paciente y cancelá turnos vigentes cuando sea necesario.'
              : 'Revisá tus turnos programados, el historial de atenciones y las cancelaciones desde un mismo lugar.'}
          </Typography>
        </Box>
        {!isDoctor && (
          <Button
            variant="contained"
            onClick={() => navigate('/buscar-turnos')}
            startIcon={<CalendarMonthIcon />}
            sx={{ alignSelf: { xs: 'stretch', sm: 'auto' }, minWidth: 160 }}
          >
            Reservar Turno
          </Button>
        )}
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={isDoctor ? 'Buscar por paciente, servicio o sede' : 'Buscar por médico, servicio o sede'}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              )
            }
          }}
          sx={{
            bgcolor: 'background.paper',
            borderRadius: (t) => `${t.shape.borderRadius}px`
          }}
        />
      </Stack>

      <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 1 }}
        >
          <Tab tabIndex={0} label={`Próximos (${counts[AppointmentTab.UPCOMING]})`} value={AppointmentTab.UPCOMING} />
          <Tab tabIndex={0} label={`Pasados (${counts[AppointmentTab.PAST]})`} value={AppointmentTab.PAST} />
          <Tab tabIndex={0} label={`Cancelados (${counts[AppointmentTab.CANCELLED]})`} value={AppointmentTab.CANCELLED} />
        </Tabs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={loadAppointments}>Reintentar</Button>}>
          {error}
        </Alert>
      )}

      {loading ? (
        <AppointmentSkeletons />
      ) : visibleAppointments.length === 0 ? (
        <EmptyState
          isDoctor={isDoctor}
          activeTab={activeTab}
          hasSearch={Boolean(search.trim())}
          onSearchAppointments={() => navigate('/buscar-turnos')}
        />
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
          {visibleAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              isDoctor={isDoctor}
              cancellingId={cancellingId}
              confirmingId={confirmingId}
              modifyingId={modifyingId}
              respondingId={respondingId}
              doctorDetails={doctorDetails}
              patientDetails={patientDetails}
              serviceDetails={serviceDetails}
              locationDetails={locationDetails}
              onCancel={handleOpenCancelDialog}
              onConfirm={handleConfirmAppointment}
              onModify={handleOpenModifyDialog}
              onAcceptReschedule={handleAcceptReschedule}
              onRejectReschedule={handleOpenRejectRescheduleDialog}
            />
          ))}
        </Box>
      )}

      <ModifyAppointmentDialog
        open={Boolean(appointmentToModify)}
        isDoctor={isDoctor}
        slots={modificationSlots}
        selectedSlotId={selectedModificationSlotId}
        reason={modificationReason}
        reasonError={modificationReasonError}
        loading={loadingModificationSlots}
        error={modificationError}
        modifying={Boolean(modifyingId)}
        onSelectSlot={setSelectedModificationSlotId}
        onReasonChange={handleModificationReasonChange}
        onClose={handleCloseModifyDialog}
        onConfirm={handleConfirmModifyAppointment}
      />

      <CancelAppointmentDialog
        open={Boolean(appointmentToCancel)}
        appointment={appointmentToCancel}
        reason={cancelReason}
        reasonError={cancelReasonError}
        cancellingId={cancellingId}
        onReasonChange={handleCancelReasonChange}
        onClose={handleCloseCancelDialog}
        onConfirm={handleConfirmCancelAppointment}
      />

      <RejectRescheduleDialog
        open={Boolean(appointmentToRejectReschedule)}
        appointment={appointmentToRejectReschedule}
        reason={rejectRescheduleReason}
        reasonError={rejectRescheduleReasonError}
        respondingId={respondingId}
        onReasonChange={handleRejectRescheduleReasonChange}
        onClose={handleCloseRejectRescheduleDialog}
        onConfirm={handleConfirmRejectReschedule}
      />
    </Container>
  );
}

export default Appointments;
