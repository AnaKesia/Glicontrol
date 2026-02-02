import { StyleSheet } from 'react-native';

export const criarEstilos = (tema, fontSize) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: tema.fundo,
    },
    titulo: {
      fontSize: fontSize + 4,
      fontWeight: 'bold',
      color: tema.texto,
      textAlign: 'center',
      marginBottom: 16,
      marginTop: 10,
    },
    filtroContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f3f4f6',
      borderRadius: 8,
      paddingHorizontal: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#e5e7eb',
    },
    filtroIcon: {
      marginRight: 8,
    },
    filtroInput: {
      flex: 1,
      paddingVertical: 10,
      fontSize,
      color: '#000000',
    },
    item: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 14,
      marginBottom: 12,
      borderRadius: 10,
      backgroundColor: tema.botaoFundo,
      borderWidth: 1,
      borderColor: tema.botaoFundo,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    nome: {
      fontWeight: 'bold',
      fontSize: fontSize + 1,
      color: tema.botaoTexto,
    },
    empty: {
      textAlign: 'center',
      marginTop: 50,
      fontSize: fontSize,
      color: tema.texto,
      opacity: 0.6,
    },
    addButton: {
      position: 'absolute',
      right: 20,
      bottom: 20,
      backgroundColor: tema.botaoFundo,
      borderRadius: 30,
      padding: 16,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3,
    },
    buttonsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginLeft: 12,
    },
    editButton: {
      padding: 10,
      backgroundColor: 'rgba(0, 132, 255, 0.1)',
      borderRadius: 6,
    },
    deleteButton: {
      padding: 10,
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderRadius: 6,
    },

    checkButton: {
      padding: 10,
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      borderRadius: 6,
    },
  });
