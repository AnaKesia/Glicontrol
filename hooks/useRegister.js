import { useState } from 'react';
import { auth } from '../firebaseConfig';
import firestore from '@react-native-firebase/firestore';

export const useRegister = () => {
  const [erros, setErros] = useState({});

  const validarCampos = (nome, email, senha) => {
    const novosErros = {};
    if (!nome) novosErros.nome = 'Informe seu nome.';
    if (!email) novosErros.email = 'Informe seu e-mail.';
    else if (!/\S+@\S+\.\S+/.test(email)) novosErros.email = 'Formato de e-mail inválido.';
    if (!senha) novosErros.senha = 'Informe sua senha.';
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const registrar = async (nome, email, senha) => {
    if (!validarCampos(nome, email, senha)) {
      throw new Error('Existem campos inválidos.');
    }

    try {
      // 1) Registrar no Auth
      const cred = await auth().createUserWithEmailAndPassword(email, senha);

      // 2) Salvar displayName no Auth (opcional)
      await cred.user.updateProfile({ displayName: nome });

      // 3) 🔹 SALVAR NO FIRESTORE
      await firestore()
        .collection('usuarios')
        .doc(cred.user.uid)
        .set({
          nome: nome,
          email: email,
          criadoEm: firestore.FieldValue.serverTimestamp(),
        });

      return { user: cred.user };
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Este e-mail já está em uso.');
      }
      if (error.code === 'auth/invalid-email') {
        throw new Error('Formato de e-mail inválido.');
      }
      if (error.code === 'auth/weak-password') {
        throw new Error('Senha muito fraca. Escolha uma senha com pelo menos 6 caracteres.');
      }
      throw new Error('Erro ao registrar. Tente novamente.');
    }
  };

  return { registrar, erros, setErros };
};
