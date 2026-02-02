import notifee, { TriggerType, RepeatFrequency, AndroidImportance } from '@notifee/react-native';

export const criarCanalMedicamentos = async () => {
  await notifee.createChannel({
    id: 'medicamentos',
    name: 'Lembretes de Medicamentos',
    importance: AndroidImportance.HIGH,
  });
};

export const cancelarNotificacoesAntigas = async (ids = []) => {
  try {
    for (const id of ids) {
      await notifee.cancelNotification(id);
    }
  } catch (err) {
    console.warn('Erro ao cancelar notificações antigas:', err);
  }
};

export const agendarNotificacao = async ({ nome, dose, modoNotificacao, horarios, intervaloHoras }) => {
  const novosIds = [];
  await criarCanalMedicamentos();

  const agora = new Date();

  if (modoNotificacao === 'horarios') {
    for (const h of horarios) {
      const data = new Date(h);
      if (data <= agora) data.setDate(data.getDate() + 1);

      const id = await notifee.createTriggerNotification(
        {
          title: 'Hora de tomar o medicamento',
          body: `${nome} - ${dose}`,
          android: { channelId: 'medicamentos', smallIcon: 'ic_notif' },
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: data.getTime(),
          repeatFrequency: RepeatFrequency.DAILY,
        }
      );

      novosIds.push(id);
    }
  } else if (modoNotificacao === 'intervalo') {
    const horas = parseInt(intervaloHoras, 10);
    if (!horas || horas <= 0) return [];

    const primeiroHorario = horarios[0] || new Date();
    let data = new Date(primeiroHorario);
    data.setSeconds(0);
    data.setMilliseconds(0);
    if (data <= agora) data.setDate(data.getDate() + 1);

    while (data.getTime() < primeiroHorario.getTime() + 24 * 60 * 60 * 1000) {
      const id = await notifee.createTriggerNotification(
        {
          title: 'Lembrete de medicamento',
          body: `${nome} - repetir a cada ${horas}h`,
          android: { channelId: 'medicamentos', smallIcon: 'ic_notif' },
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: data.getTime(),
          repeatFrequency: RepeatFrequency.DAILY,
        }
      );
      novosIds.push(id);
      data.setHours(data.getHours() + horas);
    }
  }

  return novosIds;
};
