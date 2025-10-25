import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const colecoesUsuario = ['medicoes', 'medicamentos', 'refeicoes', 'sintomas', 'usoMedicamentos'];

export const deletarContaEDados = async () => {
  const user = auth().currentUser;

  if (!user) throw new Error('Nenhum usuário autenticado.');

  const usuarioId = user.uid;

  try {
    for (const colecao of colecoesUsuario) {
      const snapshot = await firestore()
        .collection(colecao)
        .where('usuarioId', '==', usuarioId)
        .get();

      if (!snapshot.empty) {
        const batch = firestore().batch();
        snapshot.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
      }
    }

    await user.delete();

    return 'Conta e todos os dados removidos com sucesso.';
  } catch (error) {
    if (error.code === 'auth/requires-recent-login') {
      throw new Error(
        'Por segurança, faça login novamente e tente excluir a conta.'
      );
    }
    throw new Error('Falha ao deletar conta. Tente novamente mais tarde.');
  }
};
