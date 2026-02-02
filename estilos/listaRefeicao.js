import { StyleSheet } from 'react-native';

export const criarEstilos = (tema, fontSize, config) => {
  const azulEscuro = '#003366';
  const azulClaro = '#f0f0f0';

 return StyleSheet.create({
  container: {
  flex: 1,
  padding: 16,
  backgroundColor: tema.fundo,
  },
  item: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: config.tema === 'escuro' ? azulEscuro : azulClaro,
  padding: 12,
  marginVertical: 6,
  borderRadius: 8,
  justifyContent: 'space-between',
  },
  itemContent: { flex: 1, marginRight: 8 },
  itemTitle: {
  fontSize,
  fontWeight: 'bold',
  color: tema.texto,
   },
   itemSubtitle: {
     fontSize: fontSize - 2,
     color: tema.texto,
   },
   itemObservacoes: {
     fontSize: fontSize - 3,
     color: tema.texto,
     marginTop: 4,
   },
   emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: tema.texto,
    fontSize,
   },
   actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
   },
    actionButton: {
    marginLeft: 8,
   },
   fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007bff',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    },
    itemAnalise: {
     fontSize: fontSize - 3,
     color: '#28a745',
     marginTop: 4,
    },
    titulo: {
      fontSize: 22,
      fontWeight: 'bold',
      textAlign: 'center',
      marginVertical: 10,
      color: tema.texto,
    },
    filtrosContainer: {
      paddingHorizontal: 10,
      marginBottom: 10,
    },
    filtroOrdem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      marginBottom: 10,
    },
    filtroLabel: {
      fontSize,
      fontWeight: '600',
      color: tema.texto,
      marginBottom: 5,
    },
    dropdownText: {
      fontSize,
      color: config.tema === 'escuro' ? 'white' : 'black',
    },
    dropdownItemText: {
      fontSize,
      color: config.tema === 'escuro' ? 'white' : 'black',
    },
    dropdownPlaceholder: {
      fontSize,
      color: config.tema === 'escuro' ? '#ccc' : '#666',
    },
    botaoOrdem: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
      backgroundColor: tema.card,
    },
    botaoOrdemAtivo: {
      backgroundColor: tema.primaria,
    },
    botaoOrdemTexto: {
      color: tema.texto,
    },
    tiposContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    botaoTipo: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
      marginVertical: 4,
      backgroundColor: tema.card,
    },
    botaoTipoAtivo: {
      backgroundColor: tema.primaria,
    },
    botaoTipoTexto: {
      color: tema.texto,
    },
    botaoTipoTextoAtivo: {
      color: 'white',
      fontWeight: 'bold',
    },
    dropdown: {
      backgroundColor: config.tema === 'escuro' ? azulEscuro : 'white',
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: config.tema === 'escuro' ? '#ccc' : '#888',
    },
 });
};