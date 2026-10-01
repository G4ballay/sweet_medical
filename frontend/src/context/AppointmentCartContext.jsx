import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';

const AppointmentCartContext = createContext(null);

export function AppointmentCartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const stored = localStorage.getItem(`sweet-medical-selection-${user.id}`);
      if (stored) {
        try {
          setCart(JSON.parse(stored));
        } catch {
          setCart([]);
        }
      } else {
        setCart([]);
      }
    } else {
      setCart([]);
    }
  }, [user]);

  const addToCart = useCallback((appointment) => {
    setCart((prev) => {
      if (prev.find((item) => item.id === appointment.id)) {
        return prev;
      }
      const newCart = [...prev, appointment];
      if (user?.id) {
        localStorage.setItem(`sweet-medical-selection-${user.id}`, JSON.stringify(newCart));
      }
      return newCart;
    });
  }, [user]);

  const removeFromCart = useCallback((appointmentId) => {
    setCart((prev) => {
      const newCart = prev.filter((item) => item.id !== appointmentId);
      if (user?.id) {
        localStorage.setItem(`sweet-medical-selection-${user.id}`, JSON.stringify(newCart));
      }
      return newCart;
    });
  }, [user]);

  const isAppointmentSelected = useCallback((appointmentId) => {
    return cart.some((item) => item.id === appointmentId);
  }, [cart]);

  const clearCart = useCallback(() => {
    setCart([]);
    if (user?.id) {
      localStorage.removeItem(`sweet-medical-selection-${user.id}`);
    }
  }, [user]);

  const toggleCart = useCallback(() => {
    setIsCartOpen((prev) => !prev);
  }, []);

  const value = useMemo(() => ({
    cart,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    isAppointmentSelected,
    clearCart,
    toggleCart,
  }), [
    cart,
    isCartOpen,
    addToCart,
    removeFromCart,
    isAppointmentSelected,
    clearCart,
    toggleCart
  ]);

  return (
    <AppointmentCartContext.Provider value={value}>
      {children}
    </AppointmentCartContext.Provider>
  );
}

export function useAppointmentCartContext() {
  const context = useContext(AppointmentCartContext);
  if (!context) {
    throw new Error('useAppointmentCartContext must be used within an AppointmentCartProvider');
  }
  return context;
}
