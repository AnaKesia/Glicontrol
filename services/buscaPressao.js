import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export async function buscaRegistrosPressao(intervalo = null) {
  const userId = auth().currentUser?.uid;
  if (!userId) return [];

  let query = firestore().collection('pressoes').where('usuarioId', '==', userId);

  if (intervalo) {
    if (intervalo.inicio) query = query.where('timestamp', '>=', intervalo.inicio);
    if (intervalo.fim) query = query.where('timestamp', '<', intervalo.fim);
  }

  query = query.orderBy('timestamp', 'desc');

  const snapshot = await query.get();
  const registros = [];
  snapshot.forEach(doc => {
    registros.push({ id: doc.id, ...doc.data() });
  });

  return registros;
}
