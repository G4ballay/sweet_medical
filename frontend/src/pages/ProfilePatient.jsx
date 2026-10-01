import { useEffect, useState } from 'react';

import {
    Box,
    CircularProgress,
    Container,
    Typography,
} from '@mui/material';

import ResponsiveSection from '../components/settings/ResponsiveSection.jsx';
import UserAccountSection from '../components/settings/UserAccountSection.jsx';
import PatientCoverageSection from '../components/settings/patientSettings/PatientMedicalCoverageSection.jsx';
import PatientPersonalSection from '../components/settings/patientSettings/PatientPersonalSection.jsx';

import { getHealthInsurances } from '../services/healthInsurance.service.js';
import { getPatientById, updatePatient } from '../services/patient.service.js';

import { useUserProfileForm } from '../hooks/useUserProfileForm.js';

import { useNotification } from '../context/NotificationContext.jsx'

function ProfilePatient() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [patientId, setPatientId] = useState(null);
  const [initialPatientForm, setInitialPatientForm] = useState(null);
  const [healthInsuranceOptions, setHealthInsuranceOptions] = useState([]);

  const {
      userForm,
      setUserForm,
      userHasChanges,
      loadUser,
      saveUser,
  } = useUserProfileForm();

  const [patientForm, setPatientForm] = useState({
    name: '',
    documentNumber: '',
    userId: '',
    healthInsuranceId: '',
    planId: '',
  });

  const { showNotification } = useNotification();

  const selectedHealthInsurance = healthInsuranceOptions.find(
    (healthInsurance) =>
      healthInsurance.id === patientForm.healthInsuranceId
  );

  const planOptions = selectedHealthInsurance?.plans || [];

  const patientHasChanges = initialPatientForm && patientForm.name !== initialPatientForm.name;

  const patientCoverageHasChanges =
    initialPatientForm &&
    (
      patientForm.healthInsuranceId !== initialPatientForm.healthInsuranceId ||
      patientForm.planId !== initialPatientForm.planId
    );

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

  {/* Guardado del paciente */}
  const handleSavePatient = async () => {
  try {
    const payload = {
      userId,
      documentNumber: patientForm.documentNumber,
      name: patientForm.name,
      healthInsuranceId: patientForm.healthInsuranceId,
      planId: patientForm.planId,
    };

    await updatePatient(patientId, payload);

    setInitialPatientForm({
      ...patientForm,
    });

    showNotification(
      'Información del paciente actualizada correctamente',
      'success'
    );
  } catch (error) {
    showNotification(
      error.response?.data?.message ||
        'Ocurrió un error al actualizar el paciente',
      'error'
    );
  }
};

const handleCoverageChange = async (nextForm) => {
  const changedHealthInsurance = nextForm.healthInsuranceId !== patientForm.healthInsuranceId;

  setPatientForm({
      ...nextForm,
      planId: changedHealthInsurance ? '' : nextForm.planId,
  });
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
        const currentPatientId = storedUser.patientId;
 
        setUserId(currentUserId);
        setPatientId(currentPatientId);

        const [patient, healthInsurances] = await Promise.all([
          getPatientById(currentPatientId),
          getHealthInsurances(),
        ]);

        //Carga todo el usuario
        await loadUser(currentUserId);

        setHealthInsuranceOptions(healthInsurances);

        const patientFormFromApi = {
          name: patient.name || '',
          documentNumber: patient.documentNumber || '',
          userId: patient.userId || '',
          healthInsuranceId: patient.healthInsurance?.id || '',
          planId: patient.plan?.id || '',
        };

        setPatientForm(patientFormFromApi);
        setInitialPatientForm(patientFormFromApi);
      } catch (error) {
        console.error('Error cargando perfil paciente:', error);
        showNotification(
          'Ocurrió un error al cargar el perfil',
          'error'
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

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

  return (
    <Container 
      component="main"
      maxWidth="lg" 
      sx={{ mt: 2, mb: 6 }}
      aria-labelledby="profile-patient-title"
    >
      <Typography id="profile-patient-title" variant="pageTitle" component="h1" gutterBottom>
        Mi Perfil
      </Typography>

      <Typography sx={{ color: 'text.secondary', mb: 4 }}>
        Administrá la información de tu cuenta.
      </Typography>

      <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }} 
      >
        {/* DATOS DE USUARIO */}
        <ResponsiveSection title="Datos de usuario">
          <UserAccountSection
            value={userForm}
            onChange={setUserForm}
            onSave={handleSaveUser}
            hasChanges={userHasChanges}
          />
        </ResponsiveSection>

        {/* DATOS DE PACIENTE */}
        <ResponsiveSection title="Datos de paciente">
          <PatientPersonalSection
            value={patientForm}
            onChange={setPatientForm}
            onSave={handleSavePatient}
            hasChanges={patientHasChanges}
          />
        </ResponsiveSection>
        
        {/* DATOS DE OBRA SOCIAL */}
        <ResponsiveSection title="Obra social y plan">
          <PatientCoverageSection
            value={patientForm}
            healthInsuranceOptions={healthInsuranceOptions}
            planOptions={planOptions}
            onChange={handleCoverageChange}
            onSave={handleSavePatient}
            hasChanges={patientCoverageHasChanges}
          />
        </ResponsiveSection>
        
      </Box>
    </Container>
  );
}

export default ProfilePatient;