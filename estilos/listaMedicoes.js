import { StyleSheet } from 'react-native';

export const criarEstilos = (tema, fonteBase) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tema.fundo,
      padding: 16,
    },
    titulo: {
      color: tema.texto,
      fontSize: fonteBase + 6,
      fontWeight: '700',
      marginBottom: 20,
      alignSelf: 'center',
    },
    secaoTitulo: {
      color: tema.texto,
      fontSize: fonteBase + 2,
      fontWeight: '600',
      marginBottom: 12,
      marginTop: 12,
      paddingLeft: 4,
      opacity: 0.8,
    },
    item: {
      backgroundColor: tema.cartao,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderLeftWidth: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cabecalho: {
      marginBottom: 14,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0,0,0,0.08)',
    },
    valorContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    valorTexto: {
      color: tema.texto,
      fontSize: fonteBase + 3,
      fontWeight: '700',
    },
    statusEmoji: {
      fontSize: fonteBase + 8,
    },
    categoria: {
      color: tema.texto,
      fontSize: fonteBase + 1,
      fontWeight: '600',
      opacity: 0.7,
    },
    linhaInfo: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    icon: {
      fontSize: fonteBase + 3,
      marginRight: 10,
      width: 24,
      textAlign: 'center',
    },
    texto: {
      color: tema.texto,
      fontSize: fonteBase,
      flex: 1,
      lineHeight: fonteBase + 4,
    },
    acoes: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: 'rgba(0,0,0,0.08)',
      gap: 8,
    },
    botaoEditar: {
      padding: 10,
      backgroundColor: 'rgba(0, 132, 255, 0.1)',
      borderRadius: 8,
    },
    botaoExcluir: {
      padding: 10,
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderRadius: 8,
    },
    vazio: {
      color: tema.textoSecundario ?? tema.texto,
      fontSize: fonteBase + 2,
      alignSelf: 'center',
      marginTop: 40,
      fontWeight: '500',
    },
  });
