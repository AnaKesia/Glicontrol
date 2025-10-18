import { StyleSheet } from 'react-native';

export const criarEstilos = (tema, fonte) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tema.fundo,
    padding: 20,
  },
  titulo: {
    color: tema.texto,
    fontSize: fonte + 4,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  texto: {
    color: tema.texto,
    fontSize: fonte,
  },
  botao: {
    marginTop: 30,
    backgroundColor: tema.botaoFundo,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoBotao: {
    color: tema.botaoTexto,
    fontSize: fonte,
    fontWeight: 'bold',
  },
});