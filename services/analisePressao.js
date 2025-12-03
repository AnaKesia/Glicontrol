import { format } from 'date-fns';
import firestore from '@react-native-firebase/firestore';
import { formatarData } from '../utils/formatarData';

export async function buscarPressaoPorUsuario(userId, dias = null) {
  let query = firestore().collection('pressoes').where('usuarioId', '==', userId);
  if (dias !== null) {
    const limite = new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
    query = query.where('timestamp', '>=', limite);
  }
  const snapshot = await query.orderBy('timestamp', 'asc').get();
  const registros = [];
  snapshot.forEach(doc => {
    registros.push({ id: doc.id, ...doc.data() });
  });
  return registros;
}

export async function prepararRegistrosDePressao(userId, dias = null) {
  const registros = await buscarPressaoPorUsuario(userId, dias);
  return registros.map(r => ({
    id: r.id,
    sistolica: r.sistolica,
    diastolica: r.diastolica,
    classificacao: r.classificacao,
    observacao: r.observacao ?? '',
    timestamp: r.timestamp ?? new Date(),
  }));
}

export function analisarPressao(registros, intervalo = null) {
  if (!Array.isArray(registros) || registros.length === 0) {
    return ['Nenhum registro de pressão para analisar.'];
  }

  registros.sort((a, b) => {
    const dataA = a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
    const dataB = b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
    return dataA - dataB;
  });

  let registrosParaAnalisar = registros;

  if (intervalo && typeof intervalo === 'object') {
    registrosParaAnalisar = registros.filter(r => {
      const data = r.timestamp.toDate ? r.timestamp.toDate() : new Date(r.timestamp);
      if (intervalo.inicio && data < intervalo.inicio) return false;
      if (intervalo.fim && data >= intervalo.fim) return false;
      return true;
    });
  }

  if (registrosParaAnalisar.length === 0) {
    return ['Nenhum registro nesse período para analisar.'];
  }

  const alertas = [];

  registrosParaAnalisar.forEach(r => {
    const s = Number(r.sistolica);
    const d = Number(r.diastolica);

    if (isNaN(s) || isNaN(d)) return;

    if (s >= 180 || d >= 120) {
      alertas.push(`⚠️ Crise hipertensiva detectada: ${s}/${d} mmHg em ${formatarData(r.timestamp)}.`);
    } else if (s >= 140 || d >= 90) {
      alertas.push(`⚠️ Hipertensão estágio 2: ${s}/${d} mmHg em ${formatarData(r.timestamp)}.`);
    } else if (s >= 130 || d >= 80) {
      alertas.push(`⚠️ Hipertensão estágio 1: ${s}/${d} mmHg em ${formatarData(r.timestamp)}.`);
    } else if (s >= 120) {
      alertas.push(`⚠️ Pré-hipertensão: ${s}/${d} mmHg em ${formatarData(r.timestamp)}.`);
    } else {
      alertas.push(`✅ Normal: ${s}/${d} mmHg em ${formatarData(r.timestamp)}.`);
    }
  });

  return alertas.length > 0 ? alertas : ['Nenhum alerta significativo no período.'];
}
