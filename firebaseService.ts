import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export const criarMedicao = async (valor, data, categoria, observacoes) => {
  const userId = auth().currentUser.uid;

  return await firestore().collection('medicoes').add({
    valor,
    data,
    categoria,
    observacoes,
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
       observacoes: data.observacao || '',
      };
    })
    .filter(m => m.timestamp)
    .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);

  return medicoes;
};


export const editarMedicao = async (id, dados) => {
  const uid = auth().currentUser.uid;
  const medicaoRef = doc(db, 'usuarios', uid, 'medicoes', id);
  await setDoc(medicaoRef, dados, { merge: true });
};

export const deletarMedicao = async (id) => {
  return await firestore().collection('medicoes').doc(id).delete();
};
