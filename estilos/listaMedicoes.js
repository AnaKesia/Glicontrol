import { StyleSheet } from 'react-native';

export const criarEstilos = (tema, fonteBase) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tema.fundo,
      padding: 20,
    },
    titulo: {
      color: tema.texto,
      fontSize: fonteBase + 4,
      fontWeight: '700',
      marginBottom: 20,
      alignSelf: 'center',
    },
   item: {
      backgroundColor: tema.cartao,
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
    },
    texto: {
      color: tema.texto,
      fontSize: fonteBase,
      marginBottom: 5,
    },
    acoes: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 10,
    },
    botaoEditar: {
      marginRight: 10,
      backgroundColor: '#28a745',
      padding: 8,
      borderRadius: 5,
    },
    botaoExcluir: {
      backgroundColor: '#dc3545',
      padding: 8,
      borderRadius: 5,
    },
    botaoSintoma: {
      backgroundColor: '#00AAFF',
      padding: 8,
      borderRadius: 5,
      marginLeft: 10,
    },
    vazio: {
      color: tema.textoSecundario ?? tema.texto,
      fontSize: fonteBase + 2,
      alignSelf: 'center',
      marginTop: 30,
    },
  });