export const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '';
  
  const messageDate = new Date(dateString);
  const now = new Date();
  
  // Validar si la fecha es inválida
  if (isNaN(messageDate.getTime())) return '';

  // Si es el mismo día, mostrar hora formato 12 horas (ej: 4:15 PM)
  if (messageDate.toDateString() === now.toDateString()) {
    return messageDate.toLocaleTimeString('es-MX', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  // Si es de un día anterior, mostrar día y mes corto (ej: 28 mar)
  return messageDate.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short'
  });
};
