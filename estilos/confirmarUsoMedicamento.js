import { StyleSheet } from 'react-native';

export const criarEstilos = (tema, fontSize) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: tema.fundo,
      padding: 20,
    },
    titulo: {
      fontSize: fontSize + 6,
      color: tema.texto,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    label: {
      color: tema.texto,
      fontSize: fontSize,
      marginBottom: 8,
    },
    pickerContainer: {
      backgroundColor: tema.botaoFundo,
      borderRadius: 8,
      marginBottom: 20,
    },
    switchContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 20,
    },
    input: {
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: 10,
      marginBottom: 20,
      fontSize: fontSize,
      color: '#000',
    },
    botaoSalvar: {
      backgroundColor: '#28a745',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
    },
    botaoTexto: {
      color: '#fff',
      fontSize: fontSize,
      fontWeight: 'bold',
    },
  });