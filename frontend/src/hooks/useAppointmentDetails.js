import { useEffect, useState } from 'react';
import { ServiceType } from '../enums/service-type.enum';
import { getDoctorById } from '../services/doctor.service';
import { getLocations } from '../services/location.service';
import { getPatientById } from '../services/patient.service';
import { getPractices } from '../services/practice.service';
import { getSpecialties } from '../services/specialty.service';
import {
  getDoctorId,
  getLocationId,
  getPatientId,
  getServiceId,
  getServiceKey,
  getServiceType,
  mapById,
  mapServicesByKey,
  normalizeList
} from '../utils/appointment.utils';

export function useAppointmentDetails(appointments, isDoctor) {
  const [doctorDetails, setDoctorDetails] = useState({});
  const [patientDetails, setPatientDetails] = useState({});
  const [serviceDetails, setServiceDetails] = useState({});
  const [locationDetails, setLocationDetails] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!appointments || appointments.length === 0) return;

    // Check if any appointment is missing details that are NOT populated from backend
    const hasMissingServiceNames = appointments.some((appointment) => (
      getServiceId(appointment)
      && !appointment.serviceName
      && !appointment.specialtyName
      && !appointment.practiceName
      && !appointment.service?.name
      && !serviceDetails[getServiceKey(getServiceId(appointment), getServiceType(appointment))]
      && !serviceDetails[getServiceId(appointment)]
    ));

    if (!hasMissingServiceNames) return;

    let isMounted = true;
    setLoading(true);

    Promise.all([
      getSpecialties().then(normalizeList),
      getPractices().then(normalizeList),
    ]).then(([specialties, practices]) => {
      if (!isMounted) return;

      setServiceDetails(prev => ({
        ...prev,
        ...mapServicesByKey(specialties, ServiceType.SPECIALTY),
        ...mapServicesByKey(practices, ServiceType.PRACTICE),
      }));
    }).catch(console.error)
      .finally(() => { if (isMounted) setLoading(false); });

    return () => {
      isMounted = false;
    };
  }, [appointments, serviceDetails]);

  useEffect(() => {
    if (!appointments || appointments.length === 0) return;

    const hasMissingLocationNames = appointments.some((appointment) => (
      getLocationId(appointment)
      && !appointment.locationName
      && !appointment.location?.name
      && !locationDetails[getLocationId(appointment)]
    ));

    if (!hasMissingLocationNames) return;

    let isMounted = true;
    setLoading(true);

    getLocations()
      .then(normalizeList)
      .then((locations) => {
        if (!isMounted) return;
        setLocationDetails(prev => ({ ...prev, ...mapById(locations) }));
      })
      .catch(console.error)
      .finally(() => { if (isMounted) setLoading(false); });

    return () => {
      isMounted = false;
    };
  }, [appointments, locationDetails]);

  useEffect(() => {
    if (!appointments || appointments.length === 0) return;

    const missingDoctorIds = isDoctor ? [] : [...new Set(appointments
      .map(getDoctorId)
      .filter((doctorId) => doctorId && !doctorDetails[doctorId] && !appointments.find(a => getDoctorId(a) === doctorId)?.doctor?.name))];

    if (missingDoctorIds.length === 0) return;

    let isMounted = true;
    setLoading(true);

    Promise.allSettled(missingDoctorIds.map(async (doctorId) => {
      const doctor = await getDoctorById(doctorId);
      return [doctorId, doctor];
    })).then((results) => {
      if (!isMounted) return;

      const nextDoctorDetails = {};
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const [doctorId, doctor] = result.value;
          nextDoctorDetails[doctorId] = doctor;
        }
      });

      if (Object.keys(nextDoctorDetails).length > 0) {
        setDoctorDetails(prev => ({ ...prev, ...nextDoctorDetails }));
      }
    }).catch(console.error)
      .finally(() => { if (isMounted) setLoading(false); });

    return () => {
      isMounted = false;
    };
  }, [appointments, doctorDetails, isDoctor]);

  useEffect(() => {
    if (!appointments || appointments.length === 0) return;

    const missingPatientIds = !isDoctor ? [] : [...new Set(appointments
      .map(getPatientId)
      .filter((patientId) => patientId && !patientDetails[patientId] && !appointments.find(a => getPatientId(a) === patientId)?.patient?.name))];

    if (missingPatientIds.length === 0) return;

    let isMounted = true;
    setLoading(true);

    Promise.allSettled(missingPatientIds.map(async (patientId) => {
      const patient = await getPatientById(patientId);
      return [patientId, patient];
    })).then((results) => {
      if (!isMounted) return;

      const nextPatientDetails = {};
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const [patientId, patient] = result.value;
          nextPatientDetails[patientId] = patient;
        }
      });

      if (Object.keys(nextPatientDetails).length > 0) {
        setPatientDetails(prev => ({ ...prev, ...nextPatientDetails }));
      }
    }).catch(console.error)
      .finally(() => { if (isMounted) setLoading(false); });

    return () => {
      isMounted = false;
    };
  }, [appointments, patientDetails, isDoctor]);

  return { doctorDetails, patientDetails, serviceDetails, locationDetails, loading };
}
