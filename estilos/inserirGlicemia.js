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
      fontSize: fonte + 5,
      color: tema.texto,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    label: {
      color: tema.texto,
      fontSize: fonte,
      marginBottom: 10,
      marginTop: 10,
    },
    input: {
      backgroundColor: '#ffffff',
      color: '#000000',
      fontSize: fonte,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 10,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: tema.bordaInput || '#cccccc',
    },
    inputPlaceholder: {
      color: '#b0b0b0',
    },
    horaSelecionada: {
      color: tema.texto,
      fontSize: fonte,
      marginBottom: 15,
      textAlign: 'center',
    },
    sintomasContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginBottom: 15,
    },
    sintomaButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      margin: 5,
      borderWidth: 1,
      borderColor: tema.botaoFundo,
    },
    sintomaTexto: {
      fontSize: fonte,
      color: tema.texto,
    },
    buttonGroup: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 15,
    },
    intensidadeButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: tema.botaoFundo,
    },
    botao: {
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      backgroundColor: tema.botaoFundo,
    },
    botaoTexto: {
      fontWeight: 'bold',
      fontSize: fonte,
      color: tema.botaoTexto || '#fff',
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      backgroundColor: tema.fundo,
      padding: 20,
    },
    innerContainer: {
      flex: 1,
    },
  });
