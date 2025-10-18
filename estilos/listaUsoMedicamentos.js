import { StyleSheet } from 'react-native';

export const criarEstilos = (tema, fontSize, nomeTema) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: tema.fundo, padding: 16 },
    item: {
      backgroundColor: nomeTema === 'claro' ? '#99ccff' : tema.botaoFundo,
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    texto: {
      color: tema.botaoTexto,
      fontSize,
      marginBottom: 4,
    },
    bold: { fontWeight: 'bold' },
    botoes: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
      marginTop: 8,
    },
    botaoEditar: {
      padding: 6,
      backgroundColor: tema.fundo,
      borderRadius: 6,
    },
    botaoExcluir: {
      padding: 6,
      backgroundColor: '#dc3545',
      borderRadius: 6,
    },
    vazio: {
      color: tema.texto + 'bb',
      fontSize,
      textAlign: 'center',
      marginTop: 30,
    },
    carregando: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });