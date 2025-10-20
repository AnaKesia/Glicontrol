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
    medicamentoContainer: {
      backgroundColor: tema.botaoFundo,
      borderRadius: 10,
      padding: 15,
      marginTop: 20,
      alignSelf: 'center',
      width: '100%',
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 3,
    },

    medicamentoTitulo: {
      color: '#fff',
      fontSize: fonte + 2,
      fontWeight: 'bold',
      marginBottom: 5,
    },

    medicamentoNome: {
      color: '#fff',
      fontSize: fonte + 1,
      fontWeight: '600',
    },

    medicamentoDetalhe: {
      color: '#fff',
      fontSize: fonte,
    },
  });