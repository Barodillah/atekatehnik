export const parseAdminDate = (dateStr) => {
  if (!dateStr) return null;
  // Treat UTC+0 from DB explicitly if no timezone indicator is present
  const safeDate = dateStr.includes('Z') ? dateStr : dateStr.replace(' ', 'T') + 'Z';
  return new Date(safeDate);
};

export const formatAdminDate = (dateStr, options = { month: 'short', day: 'numeric', year: 'numeric' }) => {
  const d = parseAdminDate(dateStr);
  if (!d) return '—';
  return d.toLocaleDateString('en-US', { timeZone: 'Asia/Jakarta', ...options });
};

// For dates with time
export const formatAdminDateTime = (dateStr, options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) => {
  const d = parseAdminDate(dateStr);
  if (!d) return '—';
  return d.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', ...options });
};

export const formatAdminTime = (dateStr, options = { hour: '2-digit', minute: '2-digit' }) => {
  const d = parseAdminDate(dateStr);
  if (!d) return '—';
  return d.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', ...options });
};
