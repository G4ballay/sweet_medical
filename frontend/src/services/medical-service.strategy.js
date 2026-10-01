import { ServiceType } from "../enums/service-type.enum";
import { getSpecialties } from "./specialty.service";
import { getPractices } from "./practice.service";

export const MedicalServiceStrategies = {
  [ServiceType.SPECIALTY]: {
    label: "Especialidad",
    selectLabel: "Selecciona una Especialidad *",
    fetchOptions: getSpecialties,
  },
  [ServiceType.PRACTICE]: {
    label: "Práctica",
    selectLabel: "Selecciona una Práctica *",
    fetchOptions: getPractices,
  }
};

export const getMedicalServiceStrategy = (type) => {
  return MedicalServiceStrategies[type] || MedicalServiceStrategies[ServiceType.SPECIALTY];
};