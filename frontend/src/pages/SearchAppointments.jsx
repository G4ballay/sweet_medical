import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { Accordion, AccordionDetails, AccordionSummary, Badge, Container, Fab, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import AppointmentCartDrawer from '../components/search/AppointmentCartDrawer';
import AppointmentSearchBox from '../components/search/AppointmentSearchBox';
import AppointmentSearchResults from '../components/search/AppointmentSearchResults';
import AppointmentSortBar from '../components/search/AppointmentSortBar';
import { useAppointmentCartContext } from '../context/AppointmentCartContext';
import { useNotification } from '../context/NotificationContext';
import { useSearchAppointments } from '../hooks/useSearchAppointments';
import { bookAppointments } from '../services/appointment.service';

function SearchAppointments() {
  const {
    type, setType, strategy,
    options, selection, setSelection,
    locations, locationId, setLocationId,
    filteredDoctors, doctorId, setDoctorId,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    orderBy, setOrderBy,
    orderDir, setOrderDir,
    appointments, loading, error,
    handleSearch,
    clearResults,
    page, totalPages
  } = useSearchAppointments();

  const {
    cart, isCartOpen, setIsCartOpen,
    addToCart, removeFromCart, isAppointmentSelected,
    clearCart
  } = useAppointmentCartContext();

  const { showNotification } = useNotification();

  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);
  const [bookingErrors, setBookingErrors] = useState({});

  useEffect(() => {
    if (error) {
      showNotification(error, 'error');
    }
  }, [error, showNotification]);

  const handleToggleCartItem = (appointment) => {
    if (isAppointmentSelected(appointment.id)) {
      removeFromCart(appointment.id);
    } else {
      addToCart(appointment);
    }
  };

  const handleConfirmCart = async () => {
    setBookingErrors({});
    try {
      const bookingsData = cart.map(item => ({
        doctorId: item.doctorId,
        startTime: item.startTime,
        serviceType: item.serviceType,
        serviceId: item.serviceId,
        locationId: item.locationId
      }));

      const res = await bookAppointments(bookingsData);
      const { successes, failures } = res;

      if (failures && failures.length > 0) {
        const errors = {};
        failures.forEach(f => {
          const item = cart[f.index];
          if (item) {
            errors[item.id] = f.error;
          }
        });
        setBookingErrors(errors);

        if (successes && successes.length > 0) {
          successes.forEach(success => {
            const item = cart[success.index];
            if (item) removeFromCart(item.id);
          });
          const successCount = successes.length;
          const failCount = failures.length;
          showNotification(
            `Se confirmaron ${successCount} turno(s) con éxito. ${failCount} turno(s) fallaron. Revisa los detalles en tu preselección.`,
            'warning'
          );
        } else {
          showNotification('No se pudo reservar ningún turno. Revisa los errores detallados en tu preselección.', 'error');
        }
        setIsCartOpen(true);
      } else {
        showNotification('Preselección confirmada con éxito.', 'success');
        clearCart();
        setIsCartOpen(false);
        setIsFiltersExpanded(true);
        clearResults();
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Error al confirmar la preselección de turnos.';
      if (cart.length === 1) {
        setBookingErrors({ [cart[0].id]: errMsg });
        showNotification('No se pudo reservar el turno. Revisa el error en tu preselección.', 'error');
        setIsCartOpen(true);
      } else {
        showNotification(errMsg, 'error');
      }
    }
  };

  const onSearchClick = () => {
    handleSearch(1, true);
    setIsFiltersExpanded(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 10 }}>
      <Typography variant="pageTitle" component="h1" gutterBottom>
        Buscar Turnos
      </Typography>
      <Typography sx={{ color: 'text.secondary', lineHeight: 1.7, mb: 4 }}>
        Desde esta sección vas a poder buscar y reservar turnos con los profesionales disponibles.
        Filtrá por especialidad, médico, fecha y horario.
      </Typography>

      <Accordion
        expanded={isFiltersExpanded}
        onChange={(e, isExpanded) => setIsFiltersExpanded(isExpanded)}
        sx={{ mb: 4, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}
        disableGutters
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          id="panel-search-filters-header"
          aria-controls="panel-search-filters-content"
        >
          <Typography variant="h6" fontWeight="bold">Filtros de Búsqueda</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: { xs: 2, sm: 3 } }}>
          <AppointmentSearchBox
            type={type}
            setType={setType}
            strategy={strategy}
            options={options}
            selection={selection}
            setSelection={setSelection}
            locations={locations}
            locationId={locationId}
            setLocationId={setLocationId}
            filteredDoctors={filteredDoctors}
            doctorId={doctorId}
            setDoctorId={setDoctorId}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            loading={loading}
            error={error}
            handleSearch={onSearchClick}
          />
        </AccordionDetails>
      </Accordion>

      {/* Resultados */}
      {appointments.length > 0 && (
        <AppointmentSortBar
          orderBy={orderBy}
          orderDir={orderDir}
          onSortChange={(newOrderBy, newOrderDir) => {
            setOrderBy(newOrderBy);
            setOrderDir(newOrderDir);
            handleSearch(1, true, { orderBy: newOrderBy, orderDir: newOrderDir });
          }}
        />
      )}

      <AppointmentSearchResults
        loading={loading}
        appointments={appointments}
        error={error}
        selection={selection}
        page={page}
        totalPages={totalPages}
        onPageChange={(e, val) => handleSearch(val)}
        isAppointmentSelected={isAppointmentSelected}
        onToggleCartItem={handleToggleCartItem}
      />

      <Fab
        color="primary"
        aria-label={`Ver preselección de turnos. ${cart.length} ${cart.length === 1 ? 'turno seleccionado' : 'turnos seleccionados'}`}
        onClick={() => setIsCartOpen(true)}
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
      >
        <Badge badgeContent={cart.length} color="error">
          <MedicalServicesIcon />
        </Badge>
      </Fab>

      <AppointmentCartDrawer
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        bookingErrors={bookingErrors}
        onRemove={(id) => {
          removeFromCart(id);
          setBookingErrors(prev => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
          });
        }}
        onConfirm={handleConfirmCart}
        onClear={() => {
          clearCart();
          setBookingErrors({});
        }}
      />
    </Container>
  );
}

export default SearchAppointments;