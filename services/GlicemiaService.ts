import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export class GlicemiaService {
  async salvarMedicao(dados: any, medicaoId?: string) {
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
        return 'Medição atualizada!';
      } else {
        await medicoesRef.add(dadosComUsuario);
        return 'Medição registrada!';
      }
    } catch (error) {
      console.error('Erro ao salvar medição:', error);
      throw new Error('Falha ao salvar medição.');
    }
  }
}
