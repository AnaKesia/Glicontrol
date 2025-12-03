import firestore from '@react-native-firebase/firestore';

export async function prepararRegistrosParaAnalise(userId, intervalo = null) {
  let queryMedicoes = firestore()
    .collection('medicoes')
    .where('usuarioId', '==', userId);

  if (intervalo?.inicio) queryMedicoes = queryMedicoes.where('timestamp', '>=', intervalo.inicio);
  if (intervalo?.fim) queryMedicoes = queryMedicoes.where('timestamp', '<', intervalo.fim);

  const medicoesSnap = await queryMedicoes.orderBy('timestamp', 'asc').get();
  const medicoes = medicoesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  let querySintomas = firestore()
    .collection('sintomas')
    .where('usuarioId', '==', userId);

  if (intervalo?.inicio) querySintomas = querySintomas.where('timestamp', '>=', intervalo.inicio);
  if (intervalo?.fim) querySintomas = querySintomas.where('timestamp', '<', intervalo.fim);

  const sintomasSnap = await querySintomas.orderBy('timestamp', 'asc').get();
  const sintomas = sintomasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const mapSintomasPorGlicemia = {};
  sintomas.forEach(s => {
    const arr = Array.isArray(s.sintoma) ? s.sintoma : [];
    if (!mapSintomasPorGlicemia[s.glicemiaId]) {
      mapSintomasPorGlicemia[s.glicemiaId] = [];
    }
    mapSintomasPorGlicemia[s.glicemiaId].push(...arr);
  });

  return medicoes.map(m => ({
    id: m.id,
    valor: m.valor ?? null,
    timestamp: m.timestamp,
    sintomas: mapSintomasPorGlicemia[m.id] ?? [],
  }));
}
