import { Alert, Snackbar } from '@mui/material';
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { deleteNotification, getNotifications, markNotificationAsRead } from '../services/notification.service';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe ser usado dentro de un NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');
  const [notificaciones, setNotificaciones] = useState([]);

  const showNotification = (msg, sev = 'success') => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  useEffect(() => {
    if (!token) {
      setNotificaciones([]);
      return;
    }

    getNotifications()
      .then(data => setNotificaciones(data))
      .catch(console.error);

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      auth: { token }
    });

    socket.on('notification', (nuevaNotificacion) => {
      showNotification(nuevaNotificacion.message || 'Tienes una nueva notificación', 'info');
      setNotificaciones(prev => [nuevaNotificacion, ...prev]);
    });

    return () => socket.disconnect();
  }, [token]);

  const handleMarcarLeida = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotificaciones(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleEliminarNotif = async (id) => {
    try {
      await deleteNotification(id);
      setNotificaciones(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        notificaciones,
        handleMarcarLeida,
        handleEliminarNotif
      }}
    >
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 8 }}
      >
        <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }} sx={{
          boxShadow: (theme) => theme.custom.shadowElevate
        }}>
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}