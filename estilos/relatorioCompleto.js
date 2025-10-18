import { StyleSheet } from 'react-native';

export const criarEstilos = (tema, tamanhoFonte) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tema.fundo,
    padding: 20,
  },
  titulo: {
    color: tema.texto,
    fontSize: tamanhoFonte + 4,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  filtros: {
    marginBottom: 15,
  },
  filtrosMesAno: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  filtrosAno: {
    marginBottom: 15,
  },
  picker: {
    color: tema.texto,
    backgroundColor: tema.fundo === '#cce6ff' ? '#ADD8E6' : '#003366',
  },
  texto: {
    color: tema.texto,
    fontSize: tamanhoFonte,
    marginVertical: 2,
  },
  subtitulo: {
    fontSize: tamanhoFonte + 2,
    fontWeight: 'bold',
    color: tema.texto,
    marginBottom: 8,
  },
  registroBox: {
    borderWidth: 1,
    borderColor: tema.botaoFundo,
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    color: tema.texto,
  },
  botao: {
    backgroundColor: tema.botaoFundo,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  botaoTexto: {
    color: tema.botaoTexto,
    fontSize: tamanhoFonte,
    fontWeight: 'bold',
  },
  sectionBox: {
    borderWidth: 1,
    borderColor: tema.botaoFundo,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  botaoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
});
