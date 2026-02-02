import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export async function buscaRegistrosPressao(userId, intervalo = null) {
  if (!userId) return [];

  const snapshot = await firestore()
    .collection('pressoes')
    .where('usuarioId', '==', userId)
    .orderBy('timestamp', 'desc')
    .get();

  let registros = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate?.() ?? new Date(doc.data().timestamp),
  }));

  if (intervalo?.inicio) {
    const inicio = intervalo.inicio instanceof Date ? intervalo.inicio : new Date(intervalo.inicio);
    registros = registros.filter(r => r.timestamp >= inicio);
  }
  if (intervalo?.fim) {
    const fim = intervalo.fim instanceof Date ? intervalo.fim : new Date(intervalo.fim);
    registros = registros.filter(r => r.timestamp <= fim);
  }

  return registros;
}
