import { StyleSheet } from 'react-native';

export const criarEstilos = (tema, fontSize) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: tema.fundo,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderBottomWidth: 1,
      borderColor: tema.borda || '#ccc',
    },
    nome: {
      fontWeight: 'bold',
      fontSize: fontSize,
      color: tema.texto,
    },
    empty: {
      textAlign: 'center',
      marginTop: 50,
      fontSize: fontSize,
      color: tema.texto + 'bb',
    },
    addButton: {
      position: 'absolute',
      right: 20,
      bottom: 20,
      backgroundColor: tema.botaoFundo,
      borderRadius: 30,
      padding: 16,
      elevation: 5,
    },
    buttonsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    editButton: {
      padding: 8,
    },
    deleteButton: {
      padding: 8,
    },
    checkButton: {
      padding: 8,
    },
  });