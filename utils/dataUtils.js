export const formatarData = (timestamp) => {
  if (timestamp?.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return 'Data inválida';
};
