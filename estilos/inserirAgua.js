import { StyleSheet } from 'react-native';

export const criarEstilos = (tema, fonte) =>
  StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      backgroundColor: tema.fundo,
      padding: 20,
    },
    innerContainer: {
      flex: 1,
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
      textAlign: 'center',
      marginBottom: 10,
    },
    input: {
      backgroundColor: '#ffffff',
      color: '#000000',
      fontSize: fonte,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 10,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: tema.bordaInput || '#cccccc',
      textAlign: 'center',
    },
    botoesRapidosContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginBottom: 30,
    },
    botaoRapido: {
      backgroundColor: tema.botaoFundo,
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 20,
      margin: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    botaoRapidoTexto: {
      color: tema.botaoTexto,
      fontSize: fonte,
      fontWeight: 'bold',
    },
    botaoSalvar: {
      backgroundColor: tema.botaoFundo,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
    },
    botaoSalvarTexto: {
      color: tema.botaoTexto,
      fontSize: fonte,
      fontWeight: 'bold',
    },
  });
