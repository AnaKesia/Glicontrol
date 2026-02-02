import { StyleSheet } from 'react-native';

export const criarEstilosRegistrarAtividade = (tema, fonte) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: tema.cardFundo,
    },
    titulo: {
      fontSize: fonte + 4,
      fontWeight: 'bold',
      color: tema.texto,
      marginBottom: 20,
      textAlign: 'center',
    },
    label: {
      fontSize: fonte - 2,
      color: tema.texto,
      marginBottom: 6,
    },
    input: {
      backgroundColor: tema.fundo,
      borderRadius: 8,
      paddingVertical: fonte <= 14 ? 10 : 14,
      paddingHorizontal: 12,
      marginBottom: 16,
      justifyContent: 'center',
    },
    inputTexto: {
      fontSize: fonte,
      color: tema.texto,
    },
    pickerContainer: {
      backgroundColor: tema.fundo,
      borderRadius: 8,
      marginBottom: 16,
      overflow: 'hidden',
    },
    botao: {
      backgroundColor: tema.botaoFundo,
      paddingVertical: fonte <= 14 ? 12 : 16,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 10,
    },
    botaoTexto: {
      color: tema.botaoTexto,
      fontWeight: 'bold',
      fontSize: fonte,
    },
  });
