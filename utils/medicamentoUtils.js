export const prepararDados = (usuarioId, { nome, dose, observacoes, notificar, horarios, intervaloHoras }, notificationIds = []) => {
  const formatarHorario = (date) => date.toTimeString().slice(0, 5);

  return {
    userid: usuarioId,
    Nome: nome.trim(),
    Dose: dose.trim(),
    Observacoes: observacoes.trim(),
    Notificar: notificar,
    Horarios: notificar && horarios && horarios.length ? horarios.map(formatarHorario) : null,
    IntervaloHoras: notificar && intervaloHoras ? parseInt(intervaloHoras, 10) : null,
    notificationIds,
  };
};
