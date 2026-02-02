import { StyleSheet } from 'react-native';

export const criarEstilos = (tema, fonte) =>
  StyleSheet.create({
    // Layout principal
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      backgroundColor: tema.fundo,
      padding: 20,
    },
    innerContainer: {
      flex: 1,
    },

    // Título
    title: {
      fontSize: fonte + 5,
      color: tema.texto,
      fontWeight: 'bold',
      marginBottom: 25,
      textAlign: 'center',
    },

    // Inputs lado a lado
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 20,
      gap: 10,
    },
    inputHalf: {
      flex: 1,
    },
    divider: {
      width: 1,
      backgroundColor: tema.bordaInput || '#cccccc',
      marginVertical: 5,
    },

    // Labels e inputs
    label: {
      color: tema.texto,
      fontSize: fonte,
      fontWeight: '600',
      marginBottom: 8,
    },
    subLabel: {
      color: tema.texto,
      fontSize: fonte - 2,
      marginTop: 5,
      opacity: 0.7,
    },
    input: {
      backgroundColor: '#ffffff',
      color: '#000000',
      fontSize: fonte,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: tema.bordaInput || '#cccccc',
    },

    // Card de resultado
    resultCard: {
      marginVertical: 20,
      padding: 20,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#e5e7eb',
    },
    resultLabel: {
      color: tema.texto,
      fontSize: fonte - 1,
      opacity: 0.7,
      marginBottom: 8,
    },
    resultValue: {
      color: tema.texto,
      fontSize: fonte + 10,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    classificacaoTexto: {
      fontSize: fonte,
      fontWeight: '600',
    },

    // Hora selecionada
    horaSelecionada: {
      color: tema.texto,
      fontSize: fonte,
      marginVertical: 10,
      textAlign: 'center',
      opacity: 0.8,
    },
  });
