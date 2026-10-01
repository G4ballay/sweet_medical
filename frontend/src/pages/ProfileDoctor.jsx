import { useEffect, useState } from 'react';

import {
    Alert,
    Box,
    CircularProgress,
    Container,
    Snackbar,
    Typography,
} from '@mui/material';

import { getDoctorById, updateDoctor } from '../services/doctor.service.js';
import { getLocations } from '../services/location.service.js';
import { getPractices } from '../services/practice.service.js';
import { getSpecialties } from '../services/specialty.service.js';

import DoctorAvailabilitySection from '../components/settings/doctorSettings/DoctorAvailabilitySection.jsx';
import DoctorLocationsSection from '../components/settings/doctorSettings/DoctorLocationSection.jsx';
import DoctorProfessionalSection from '../components/settings/doctorSettings/DoctorProfessionalSection.jsx';
import DoctorServicesSection from '../components/settings/doctorSettings/DoctorServicesSection.jsx';
import ResponsiveSection from '../components/settings/ResponsiveSection.jsx';
import UserAccountSection from '../components/settings/UserAccountSection.jsx';

import { useUserProfileForm } from '../hooks/useUserProfileForm.js';

import { useNotification } from '../context/NotificationContext.jsx'

function ProfileDoctor() {

  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState(null);
  const [userId, setUserId] = useState(null);

  const [specialtyOptions, setSpecialtyOptions] = useState(null);
  const [practiceOptions, setPracticeOptions] = useState(null);
  const [locationOptions, setlocationOptions] = useState(null);

  const [initialDoctorForm, setInitialDoctorForm] = useState(null);


  const {
      userForm,
      setUserForm,
      userHasChanges,
      loadUser,
      saveUser,
  } = useUserProfileForm();

  const [doctorForm, setDoctorForm] = useState({
    name: '',
    registration: '',
    availabilities: [],
    services: {
      SPECIALTY: [],
      PRACTICE: [],
    },
    locationIds: [],
  });

   const { showNotification } = useNotification();

  {/* Guardado del usuario */}
  const handleSaveUser = async () => {
    try {
      await saveUser(userId);

      showNotification(
        'Datos de usuario actualizados correctamente',
        'success'
      );
    } catch (error) {
      showNotification(
        error.response?.data?.message ||
          'Ocurrió un error al actualizar el usuario',
        'error'
      );
    }
  };

  {/* Guardado del doctor */}
  const handleSaveDoctor = async () => {
    try {
      const payload = {
        name: doctorForm.name,
        specialtyIds: doctorForm.services.SPECIALTY,
        practiceIds: doctorForm.services.PRACTICE,
        locationIds: doctorForm.locationIds,
        availabilities: doctorForm.availabilities,
      };

      await updateDoctor(doctorId, payload);

      setInitialDoctorForm({
        ...doctorForm,
      })

      showNotification(
        'Datos de doctor actualizados correctamente',
        'success'
      );
    } catch (error) {
      showNotification(
        error.response?.data?.message ||
        'Ocurrió un error al actualizar el doctor',
        'error'
      );
    }
  };

  {/* Carga de datos iniciales */}
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);

        const storedUser = JSON.parse(
          localStorage.getItem('sweet-medical-user')
        );

        const currentUserId = storedUser.userId;
        const currentDoctorId = storedUser.doctorId;

        setUserId(currentUserId);
        setDoctorId(currentDoctorId);


        const [doctor, specialties, practices, locations] = await Promise.all([
          getDoctorById(currentDoctorId),
          getSpecialties(),
          getPractices(),
          getLocations(),
          loadUser(currentUserId),//Carga el mismo todo el usuario
        ]);

        setSpecialtyOptions(specialties);
        setPracticeOptions(practices);
        setlocationOptions(locations);

        const uniqueIds = (ids = []) => [...new Set(ids)];

        const servicesFromDoctor = doctor.services || {
          SPECIALTY: [],
          PRACTICE: [],
        };

        const doctorFormFromApi = {
          name: doctor.name || '',
          registration: doctor.registration || '',
          availabilities: doctor.availabilities || [],
          services: servicesFromDoctor,
          locationIds: doctor.locationIds || [],
        };

        setDoctorForm(doctorFormFromApi);
        setInitialDoctorForm(doctorFormFromApi);
      } catch (error) {
        console.error('Error cargando perfil médico:', error);
        showNotification('Ocurrió un error al cargar el perfil', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  {/* Simbolo de carga Inicial */}
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  {/*Helper*/}
  const normalizeIds = (ids = []) => [...ids].sort();

  const normalizeServices = (services = {}) => ({
    SPECIALTY: normalizeIds(services.SPECIALTY),
    PRACTICE: normalizeIds(services.PRACTICE),
  });

  {/* Chequea si hubo cambios */}
  const professionalHasChanges =
    initialDoctorForm &&
    (
      doctorForm.name !== initialDoctorForm.name
    );

  const availabilityHasChanges =
    initialDoctorForm &&
    JSON.stringify(doctorForm.availabilities) !==
    JSON.stringify(initialDoctorForm.availabilities);

  const servicesHasChanges =
    initialDoctorForm &&
    JSON.stringify(normalizeServices(doctorForm.services)) !==
    JSON.stringify(normalizeServices(initialDoctorForm.services));

  const locationsHasChanges =
    initialDoctorForm &&
    JSON.stringify(doctorForm.locationIds) !==
    JSON.stringify(initialDoctorForm.locationIds);

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 6 }}>
      <Typography variant="pageTitle" component="h1" gutterBottom>
        Mi Perfil
      </Typography>

      <Typography
        sx={{
          color: 'text.secondary',
          mb: 4,
        }}
      >
        Administrá la información de tu cuenta, datos profesionales y disponibilidad.
      </Typography>

      <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }} >
        {/* DATOS DE USUARIO */}
        <ResponsiveSection title="Datos de usuario">
          <UserAccountSection
            value={userForm}
            onChange={setUserForm}
            onSave={handleSaveUser}
            hasChanges={userHasChanges}
          />
        </ResponsiveSection>
        


        {/* DATOS MEDICOS */}
        <ResponsiveSection title="Información profesional">
          <DoctorProfessionalSection
          value={{
            name: doctorForm.name,
            registration: doctorForm.registration,
          }}
          onChange={(professionalData) =>
            setDoctorForm((prev) => ({
              ...prev,
              ...professionalData,
            }))
          }
          onSave={handleSaveDoctor}
          hasChanges={professionalHasChanges}
        />
        </ResponsiveSection>
        

        {/* DISPONIBILIDADES */}
        <ResponsiveSection title="Agenda y disponibilidades">
          <DoctorAvailabilitySection
            value={doctorForm.availabilities}
            onChange={(availabilities) =>
              setDoctorForm((prev) => ({
                ...prev,
                availabilities,
              }))
            }
            onSave={handleSaveDoctor}
            hasChanges={availabilityHasChanges}
          />
        </ResponsiveSection>
        
        {/* SERVICIOS */}
        <ResponsiveSection title="Servicios y especialidades">
         <DoctorServicesSection
            value={doctorForm.services}
            specialtyOptions={specialtyOptions}
            practiceOptions={practiceOptions}
            onChange={(services) =>
              setDoctorForm((prev) => ({
                ...prev,
                services,
              }))
            }
            onSave={handleSaveDoctor}
            hasChanges={servicesHasChanges}
          />
        </ResponsiveSection>
        

        {/* LOCACIONES */}
        <ResponsiveSection title="Locaciones">
          <DoctorLocationsSection
            value={doctorForm.locationIds}
            locationOptions={locationOptions}
            onChange={(locationIds) =>
              setDoctorForm((prev) => ({
                ...prev,
                locationIds,
              }))
            }
            onSave={handleSaveDoctor}
            hasChanges={locationsHasChanges}
          />
        </ResponsiveSection>
        
      </Box>
    </Container>
  );
}

export default ProfileDoctor;