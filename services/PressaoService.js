import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export class PressaoService {
  async salvarPressao(dados, idExistente) {
    const userId = auth().currentUser?.uid;
    if (!userId) throw new Error('Usuário não autenticado.');

    const pressaoRef = firestore().collection('pressoes');

    if (idExistente) {
      await pressaoRef.doc(idExistente).update({ ...dados, usuarioId: userId });
      return idExistente;
    } else {
      const nova = await pressaoRef.add({ ...dados, usuarioId: userId });
      return nova.id;
    }
  }
}
