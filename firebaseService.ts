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
        sintomas: data.sintomas || [],
        intensidade: data.intensidade || '',
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


export const criarRefeicao = async (tipo, calorias, observacoes, data) => {
  const userId = auth().currentUser.uid;

  return await firestore().collection('refeicoes').add({
    tipo,
    calorias,
    observacoes,
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

export const buscarMedicaoPorId = async (id) => {
  const doc = await firestore().collection('medicoes').doc(id).get();
  return doc.exists ? doc.data() : null;
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

export const criarAtividadeFisica = async ({
  minutos,
  tipo,
  tipoPersonalizado,
  data
}) => {
  const usuarioId = auth().currentUser.uid;

  return await firestore().collection('atividadesFisicas').add({
    usuarioId,
    minutos,
    tipo,
    tipoPersonalizado: tipoPersonalizado || null,
    timestamp: firestore.Timestamp.fromDate(new Date(data)),
  });
};

export const buscarAtividadesFisicasUsuario = async () => {
  const user = auth().currentUser;

  if (!user) {
    console.log('Usuário não autenticado ao buscar atividades');
    return [];
  }

  const snapshot = await firestore()
    .collection('atividadesFisicas')
    .where('usuarioId', '==', user.uid)
    .get();

  console.log('Atividades encontradas:', snapshot.size);

  const atividades = snapshot.docs.map(doc => {
    const data = doc.data();

    return {
      id: doc.id,
      minutos: data.minutos,
      tipo: data.tipo,
      tipoPersonalizado: data.tipoPersonalizado || null,
      timestamp: data.timestamp?.toDate
        ? data.timestamp.toDate()
        : new Date(data.timestamp)
    };
  });

  atividades.sort((a, b) => b.timestamp - a.timestamp);

  return atividades;
};

