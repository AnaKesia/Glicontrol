import { StyleSheet } from 'react-native';

export const criarEstilos = (tema, fonte) => StyleSheet.create({
  container: { padding: 20, backgroundColor: tema.fundo, flexGrow: 1 },
  title: { fontSize: fonte + 4, color: tema.texto, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { color: tema.texto, fontSize: fonte, marginBottom: 10, marginTop: 10 },
  input: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: fonte },
  sintomasContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 15 },
  sintomaButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, margin: 5, borderWidth: 1, borderColor: tema.botaoFundo },
  sintomaTexto: { fontSize: fonte },
  buttonGroup: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  intensidadeButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5, borderWidth: 1, borderColor: tema.botaoFundo },
  botao: { paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  botaoTexto: { fontWeight: 'bold', fontSize: fonte },
});
