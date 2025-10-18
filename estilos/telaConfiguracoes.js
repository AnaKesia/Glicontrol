import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginTop: 10,
    marginBottom: 5,
  },
  botaoGrupo: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  botao: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    borderRadius: 8,
  },
  preview: {
    marginTop: 20,
  },
});