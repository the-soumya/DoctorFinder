/**
 * Healthcare Portal formatting utilities
 * Prevents duplicate "Dr. Dr.", formats fees, dates, and simplifies medical terminology.
 */

export const formatDoctorName = (name) => {
  if (!name) return 'Doctor';
  // Strip duplicate Dr. Dr. or leading Dr / Dr.
  const clean = name.replace(/^(Dr\.?|Dr\s+)+/gi, '').trim();
  return `Dr. ${clean}`;
};

export const formatCurrency = (amount) => {
  if (amount == null) return '₹500';
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  return isNaN(num) ? '₹500' : `₹${num.toFixed(0)}`;
};

export const formatTriageUrgency = (level) => {
  switch ((level || '').toUpperCase()) {
    case 'EMERGENT':
    case 'CRITICAL':
    case 'HIGH':
      return {
        label: 'Seek Immediate Care',
        badgeClass: 'badge-danger',
        textColor: '#DC2626',
        bgColor: '#FEF2F2',
        borderColor: '#FCA5A5'
      };
    case 'URGENT':
    case 'MODERATE':
      return {
        label: 'Consult Within 24-48 Hours',
        badgeClass: 'badge-warning',
        textColor: '#D97706',
        bgColor: '#FFFBEB',
        borderColor: '#FCD34D'
      };
    case 'ROUTINE':
    case 'LOW':
    default:
      return {
        label: 'Standard Consultation Advised',
        badgeClass: 'badge-success',
        textColor: '#16A34A',
        bgColor: '#F0FDF4',
        borderColor: '#86EFAC'
      };
  }
};
