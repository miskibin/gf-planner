export const getDaysUntil = (dateString: string): number => {
  const today = new Date();
  const targetDate = new Date(dateString);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getDateBadge = (dateString: string): { text: string; color: string } | null => {
  const daysUntil = getDaysUntil(dateString);
  
  if (daysUntil === 0) {
    return { text: 'Today', color: '#FF3B30' };
  } else if (daysUntil === 1) {
    return { text: 'Tomorrow', color: '#FF9500' };
  } else if (daysUntil > 1 && daysUntil <= 7) {
    return { text: `In ${daysUntil} days`, color: '#007AFF' };
  } else if (daysUntil < 0 && daysUntil >= -7) {
    return { text: `${Math.abs(daysUntil)} days ago`, color: '#999' };
  } else if (daysUntil < -7) {
    return { text: 'Past', color: '#999' };
  }
  
  return null;
};

export const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};
