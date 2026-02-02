import { StyleSheet } from 'react-native';

export const criarEstilosListaAtividadesFisicas = (tema, fonte) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tema.fundo,
      padding: 16,
    },
    titulo: {
      fontSize: fonte + 5,
      fontWeight: 'bold',
      color: tema.texto,
      textAlign: 'center',
      marginBottom: 12,
    },
    label: {
      color: tema.texto,
      fontSize: fonte,
      marginBottom: 4,
    },
    pickerContainer: {
      backgroundColor: tema.cardFundo,
      borderRadius: 10,
      marginBottom: 12,
    },
    card: {
      backgroundColor: tema.cardFundo,
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 2,
    },
    tipo: {
      fontSize: fonte + 2,
      fontWeight: 'bold',
      color: tema.botaoTexto,
    },
    minutos: {
      fontSize: fonte,
      color: tema.botaoTexto,
      marginTop: 4,
    },
    data: {
      fontSize: fonte - 1,
      color: tema.txtplaceholder,
      marginTop: 2,
    },
    vazio: {
      textAlign: 'center',
      color: tema.txtplaceholder,
      fontSize: fonte,
      marginTop: 30,
    },
    secaoTitulo: {
      fontSize: fonte + 4,
      fontWeight: 'bold',
      color: tema.texto,
      marginTop: 16,
      marginBottom: 6,
    },
    secaoTitulo: {
      fontSize: fonte + 2,
      fontWeight: 'bold',
      color: tema.texto,
    },
    secaoTotal: {
      fontSize: fonte,
      color: tema.txtplaceholder,
    },
    secaoHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 16,
      marginBottom: 6,
    },
    secaoTitulo: {
      fontSize: fonte + 2,
      fontWeight: 'bold',
      color: tema.texto,
    },
    secaoTotal: {
      fontSize: fonte,
      color: tema.texto,
    },
    fab: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      backgroundColor: tema.botaoFundo,
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 5,
    },
  });
