import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export class GlicemiaService {
  async salvarMedicao(dados, medicaoId) {
    const usuario = auth().currentUser;
    if (!usuario) throw new Error('Usuário não autenticado');

    const medicoesRef = firestore().collection('medicoes');

    const dadosComUsuario = {
      ...dados,
      usuarioId: usuario.uid,
    };

    try {
      if (medicaoId) {
        await medicoesRef.doc(medicaoId).set(dadosComUsuario, { merge: true });
        return medicaoId;
      } else {
        const docRef = await medicoesRef.add(dadosComUsuario);
        return docRef.id;
      }
    } catch (error) {
      console.error('Erro ao salvar medição:', error);
      throw new Error('Falha ao salvar medição.');
    }
  }
}
