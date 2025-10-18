import { StyleSheet } from 'react-native';

export const criarEstilos = (tema, fonte) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tema.fundo,
      padding: 20,
      justifyContent: 'center',
    },
    title: {
      fontSize: fonte + 6,
      color: tema.texto,
      marginBottom: 20,
      textAlign: 'center',
    },
    input: {
      backgroundColor: tema.inputFundo || '#fff',
      color: '#000000',
      fontSize: fonte,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 10,
      marginBottom: 15,
    },
    horaSelecionada: {
      color: tema.texto,
      fontSize: fonte,
      marginBottom: 15,
      textAlign: 'center',
    },
  });