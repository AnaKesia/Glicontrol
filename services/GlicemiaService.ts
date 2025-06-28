import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export class GlicemiaService {
  async salvarMedicao(dados: any, medicaoId?: string) {
    const usuario = auth().currentUser;
    if (!usuario) throw new Error('Usuário não autenticado');

    const dadosComUsuario = {
      ...dados,
      usuarioId: usuario.uid,
    };

    if (medicaoId) {
      await firestore()
        .collection('medicoes')
        .doc(medicaoId)
        .set(dadosComUsuario, { merge: true });
      return 'Medição atualizada!';
    } else {
      await firestore().collection('medicoes').add(dadosComUsuario);
      return 'Medição registrada!';
    }
  }
}
