import { StyleSheet } from 'react-native';

export const criarEstilos = (tema, tamanhoBase) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tema.fundo,
      padding: 20,
    },
    titulo: {
      color: tema.texto,
      fontSize: tamanhoBase + 6,
      fontWeight: 'bold',
      marginBottom: 20,
      alignSelf: 'center',
    },
    item: {
      backgroundColor: tema.botaoFundo,
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
    },
    texto: {
      color: tema.botaoTexto,
      fontSize: tamanhoBase,
      marginBottom: 5,
    },
    vazio: {
      color: tema.texto,
      fontSize: tamanhoBase + 2,
      alignSelf: 'center',
      marginTop: 30,
    },
    acoes: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 10,
    },
    botaoEditar: {
      backgroundColor: '#28a745',
      padding: 8,
      borderRadius: 5,
      marginRight: 10,
    },
    botaoExcluir: {
      backgroundColor: '#dc3545',
      padding: 8,
      borderRadius: 5,
    },
  });