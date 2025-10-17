import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export const criarMedicao = async (valor, data, categoria, observacao) => {
  const userId = auth().currentUser.uid;

  return await firestore().collection('medicoes').add({
    valor,
    data,
    categoria,
    observacao,
    usuarioId: userId,
    timestamp: firestore.Timestamp.fromDate(new Date(data)),
  });
};

export const buscarMedicoesUsuario = async () => {
  const userId = auth().currentUser.uid;

  const snapshot = await firestore()
    .collection('medicoes')
    .where('usuarioId', '==', userId)
    .get();

  const medicoes = snapshot.docs
    .map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        valor: data.valor,
        categoria: data.categoria,
        timestamp: data.timestamp,
        observacao: data.observacao || '',
      };
    })
    .filter(m => m.timestamp)
    .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);

  return medicoes;
};

export const editarMedicao = async (id, dados) => {
  const userId = auth().currentUser.uid;
  await firestore().collection('medicoes').doc(id).set(dados, { merge: true });
};

export const deletarMedicao = async (id) => {
  return await firestore().collection('medicoes').doc(id).delete();
};


export const criarRefeicao = async (tipo, calorias, observacao, data) => {
  const userId = auth().currentUser.uid;

  return await firestore().collection('refeicoes').add({
    tipo,
    calorias,
    observacao,
    usuarioId: userId,
    timestamp: firestore.Timestamp.fromDate(new Date(data)),
  });
};

export const buscarRefeicoesUsuario = async () => {
  const userId = auth().currentUser.uid;

  const snapshot = await firestore()
    .collection('refeicoes')
    .where('usuarioId', '==', userId)
    .get();

  const refeicoes = snapshot.docs
    .map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        tipo: data.tipo,
        calorias: data.calorias,
        observacoes: data.observacoes || '',
        analiseGlicemica: data.analiseGlicemica || '',
        timestamp: data.timestamp,
        usuarioId: userId,
      };
    })
    .filter(r => r.timestamp)
    .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);

  return refeicoes;
};

export const editarRefeicao = async (id, dados) => {
  const userId = auth().currentUser.uid;
  await firestore().collection('refeicoes').doc(id).set(dados, { merge: true });
};

export const deletarRefeicao = async (id) => {
  return await firestore().collection('refeicoes').doc(id).delete();
};

export const registrarSintoma = async (sintomaData) => {
  try {
    await firestore().collection('sintomas').add(sintomaData);
    return true;
  } catch (err) {
    console.error('Erro ao salvar sintoma:', err);
    throw err;
  }
};

export const buscarSintomasPorGlicemia = async (glicemiaId) => {
  try {
    const snapshot = await firestore()
      .collection('sintomas')
      .where('glicemiaId', '==', glicemiaId)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('Erro ao buscar sintomas:', err);
    throw err;
  }
};

export const buscarSintomasPorUsuario = async () => {
  const userId = auth().currentUser.uid;
  const snapshot = await firestore()
    .collection('sintomas')
    .where('usuarioId', '==', userId)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const buscarMedicaoPorId = async (id) => {
  const doc = await firestore().collection('medicoes').doc(id).get();
  return doc.exists ? doc.data() : null;
};

export const editarSintoma = async (id, dados) => {
  try {
    await firestore().collection('sintomas').doc(id).set(dados, { merge: true });
    return true;
  } catch (err) {
    console.error('Erro ao editar sintoma:', err);
    throw err;
  }
};

export const deletarSintoma = async (id) => {
  try {
    await firestore().collection('sintomas').doc(id).delete();
    return true;
  } catch (err) {
    console.error('Erro ao deletar sintoma:', err);
    throw err;
  }
};

export const registrarUsoMedicamento = async ({ medicamentoId, dose, tomado }) => {
  const usuarioId = auth().currentUser.uid;

  return await firestore().collection('usoMedicamento').add({
    usuarioId,
    medicamentoId,
    dose: tomado ? dose : 0,
    tomado,
    timestamp: new Date(),
  });
};

export const buscarMedicamentosUsuario = async () => {
  const userId = auth().currentUser?.uid;
  const snapshot = await firestore()
    .collection('medicamentos')
    .where('userid', '==', userId)
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};
