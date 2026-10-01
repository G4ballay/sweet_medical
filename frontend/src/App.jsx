import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/shared/Layout';
import ProtectedRoute from './components/shared/ProtectedRoute';
import { AppointmentCartProvider } from './context/AppointmentCartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { theme } from './styles/theme';

/* PUBLICAS */
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

/* PRIVADAS */
import Appointments from './pages/Appointments';
import ForgotPasswordPage from './pages/ForgotPassword';
import Home from './pages/Home';
import Notifications from './pages/Notifications';
import ProfileDoctor from './pages/ProfileDoctor';
import ProfilePatient from './pages/ProfilePatient';
import SearchAppointments from './pages/SearchAppointments';

const LandingRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/inicio" replace /> : <Landing />;
};

const LoginRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/inicio" replace /> : <Login />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <AppointmentCartProvider>
              <Routes>
                {/* PUBLICAS */}
                <Route path="/" element={<LandingRoute />} />
                <Route path="/iniciar-sesion" element={<LoginRoute />} />
                <Route path="/contrasena-olvidada" element={<ForgotPasswordPage />} />
                <Route path="/registro" element={<Register />} />
                {/* PUBLICAS */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/" element={<Navigate to="/inicio" replace />} />
                    <Route path="/inicio" element={<Home />} />
                    <Route path="/buscar-turnos" element={<SearchAppointments />} />
                    <Route path="/mis-turnos" element={<Appointments />} />
                    <Route path="/notificaciones" element={<Notifications />} />
                    <Route path="/perfil" element={<ProfilePatient />} />
                    <Route path="/perfil-medico" element={<ProfileDoctor />} />
                  </Route>
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppointmentCartProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
