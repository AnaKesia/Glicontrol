import { StyleSheet } from 'react-native';

export const criarEstilos = (tema, fontSize) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: tema.fundo,
    },
    label: {
      color: tema.texto,
      marginBottom: 5,
      marginTop: 15,
      fontSize,
    },
    input: {
      backgroundColor: '#fff',
      padding: 10,
      borderRadius: 5,
      fontSize,
    },
    pickerContainer: {
       borderWidth: 1,
       borderRadius: 5,
       marginBottom: 10,
     },
    dateButton: {
      backgroundColor: '#007AFF',
      padding: 10,
      marginTop: 10,
      borderRadius: 5,
    },
    dateButtonText: {
      color: '#fff',
      textAlign: 'center',
      fontSize,
    },
    selectedDate: {
      color: tema.texto,
      marginTop: 5,
      fontSize,
    },
    saveButton: {
      backgroundColor: '#28a745',
      padding: 15,
      borderRadius: 5,
      marginTop: 20,
    },
    saveButtonText: {
      color: '#fff',
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize,
    },
    imageButton: {
      backgroundColor: '#4CAF50',
      padding: 10,
      borderRadius: 8,
      marginVertical: 5,
      alignItems: 'center',
    },
    imageButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
  });
