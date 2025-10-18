import { StyleSheet } from 'react-native';

export const criarEstilos = (tema, fonte) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tema.fundo,
      padding: 20,
    },
    title: {
      fontSize: fonte + 2,
      color: tema.texto,
      fontWeight: 'bold',
      marginBottom: 20,
      marginTop: 10,
      alignSelf: 'center',
    },
    chart: {
      borderRadius: 16,
    },
    fab: {
      position: 'absolute',
      bottom: 30,
      right: 30,
      backgroundColor: tema.botaoFundo,
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
    },
    alertaContainer: {
      marginTop: 20,
      padding: 15,
      borderRadius: 10,
    },
    alertaTitulo: {
      fontWeight: 'bold',
      fontSize: fonte,
      marginBottom: 5,
    },
    alertaTexto: {
      fontSize: fonte - 2,
    },
  });