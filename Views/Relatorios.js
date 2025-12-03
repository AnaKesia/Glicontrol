import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { analisarGlicemia, associarSintomas, prepararRegistrosParaAnalise } from '../services/analiseGlicemia';
import { prepararRegistrosDePressao, analisarPressao } from '../services/analisePressao';
import { useConfiguracoes, tamanhosFonte } from './Configuracoes';
import { criarEstilos } from '../estilos/relatorios';

const Relatorio = () => {
  const [alertas, setAlertas] = useState([]);
  const [conclusaoSintoma, setConclusaoSintoma] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const navigation = useNavigation();

  const { config, temas } = useConfiguracoes();
  const tema = temas[config.tema];
  const fonte = tamanhosFonte[config.fonte];

  useEffect(() => {
    const carregarDados = async () => {
      const userId = auth().currentUser?.uid;
      if (!userId) return;

      try {
        const medicoesSnapshot = await firestore()
          .collection('medicoes')
          .where('usuarioId', '==', userId)
          .orderBy('timestamp', 'asc')
          .get();

        const medicoes = medicoesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // 📌 Intervalo de 5 dias (padrão do relatório inteligente)
        const agora = new Date();
        const inicio = new Date(agora.getTime() - 5 * 24 * 60 * 60 * 1000);
        const intervalo = { inicio, fim: agora };

        // 🔎 Análise de glicemia
        const alertasGlicemia = analisarGlicemia(medicoes);

        // 🔎 Associação com sintomas
        const registrosSintomas = await prepararRegistrosParaAnalise(userId);
        const associacoes = associarSintomas(registrosSintomas);

        const relevantes = associacoes.filter(
          msg =>
            !msg.toLowerCase().includes('nenhuma associação') &&
            !msg.toLowerCase().includes('nenhum registro')
        );

        setConclusaoSintoma(relevantes);

        // 🔎 Pressão arterial — agora no mesmo intervalo!
        const registrosPressao = await prepararRegistrosDePressao(userId);
        const alertasPressao = analisarPressao(registrosPressao, intervalo);

        // 🟦 Junta todos os alertas
        const todosAlertas = [...alertasGlicemia, ...alertasPressao];

        setAlertas(todosAlertas);

      } catch (erro) {
        console.error('Erro ao carregar dados:', erro);
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  const styles = criarEstilos(tema, fonte);

  if (carregando) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={tema.botaoFundo} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Relatório Inteligente</Text>
      {alertas.length === 0 ? (
        <Text style={styles.texto}>Nenhum padrão relevante detectado.</Text>
      ) : (
        <FlatList
          data={alertas}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.texto}>• {item}</Text>
              {index === 0 &&
                Array.isArray(conclusaoSintoma) &&
                conclusaoSintoma.length > 0 && (
                  <View style={{ marginTop: 5, marginLeft: 10 }}>
                    {conclusaoSintoma.map((linha, i) => (
                      <Text key={i} style={styles.texto}>↳ {linha}</Text>
                    ))}
                  </View>
              )}
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.botao}
        onPress={() => navigation.navigate('RelatorioCompleto')}
      >
        <Text style={styles.textoBotao}>Ver Relatório Completo</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Relatorio;
