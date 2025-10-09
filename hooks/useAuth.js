import auth from '@react-native-firebase/auth';

export const useAuth = () => {
  const login = async (email, senha) => {
    try {
      const cred = await auth().signInWithEmailAndPassword(email, senha);
      return { user: cred.user };
    } catch (error) {
      if (error.code === 'auth/invalid-email') throw new Error('Formato de e-mail inválido.');
      if (error.code === 'auth/user-not-found') throw new Error('Usuário não encontrado.');
      if (error.code === 'auth/wrong-password') throw new Error('Senha incorreta.');
      throw new Error('Erro ao autenticar. Tente novamente.');
    }
  };

  return { login };
};
