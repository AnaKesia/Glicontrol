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
 });
};