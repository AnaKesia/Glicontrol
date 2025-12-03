import { format } from 'date-fns';

export function formatarData(timestamp) {
  try {
    const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(data, 'dd/MM/yyyy HH:mm');
  } catch {
    return String(timestamp);
  }
}