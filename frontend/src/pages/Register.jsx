import { useState } from "react";
import RoleSelector from "../components/register/RoleSelector";
import PatientRegisterForm from "../components/register/PatientRegisterForm";
import DoctorRegisterForm from "../components/register/DoctorRegisterForm";

function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState(null);

  return (
    <main className="register-page">
      {!selectedRole && (
        <RoleSelector onSelectRole={setSelectedRole} />
      )}

      {selectedRole === "PATIENT" && (
        <PatientRegisterForm
          onBack={() => setSelectedRole(null)}
        />
      )}

      {selectedRole === "DOCTOR" && (
        <DoctorRegisterForm
            onBack={() => setSelectedRole(null)}
        />
      )}
    </main>
  );
}

export default RegisterPage;