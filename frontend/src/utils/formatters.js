export const formatCurrency = (amount) => 
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);

export const getCoverageText = (level) => {
  switch (level) {
    case 'NO_CUBIERTA': return 'No cubierta';
    case 'PARCIAL': return 'Cubierta parcialmente';
    default: return 'Totalmente cubierta';
  }
};

export const getCoverageColor = (level) => {
  switch (level) {
    case 'NO_CUBIERTA': return 'error';
    case 'PARCIAL': return 'warning';
    default: return 'success';
  }
};
