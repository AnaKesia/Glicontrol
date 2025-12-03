import { StyleSheet } from 'react-native';

export const criarEstilos = (tema, fonte) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tema.fundo,
      padding: 16,
    },
    titulo: {
      fontSize: fonte + 5,
      fontWeight: 'bold',
      color: tema.texto,
      textAlign: 'center',
      marginBottom: 10,
    },
    topoLinha: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    dataTexto: {
      color: tema.botaoTexto,
      backgroundColor: tema.botaoFundo,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 10,
      fontSize: fonte,
      marginRight: 10,
    },
    botaoAdd: {
      backgroundColor: tema.botaoFundo,
      padding: 8,
      borderRadius: 50,
    },
    total: {
      color: tema.texto,
      fontSize: fonte + 2,
      textAlign: 'center',
      marginBottom: 20,
    },
    card: {
      backgroundColor: tema.cardFundo || '#1E1E1E',
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 2,
    },
    cardConteudo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    textoCard: {
      color: tema.texto,
      fontSize: fonte + 1,
      fontWeight: 'bold',
    },
    hora: {
      color: tema.fundo === '#cce6ff' ? '#003366' : '#f0f0f0',
      fontSize: fonte - 1,
      marginTop: 4,
    },
    acoes: {
      flexDirection: 'row',
    },
    botaoAcao: {
      marginLeft: 10,
    },
    vazio: {
      textAlign: 'center',
      color: tema.txtplaceholder,
      fontSize: fonte,
    },
  });
