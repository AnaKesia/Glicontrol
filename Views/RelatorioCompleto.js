import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useConfiguracoes } from './Configuracoes';
import { criarEstilos } from '../estilos/relatorioCompleto';
import auth from '@react-native-firebase/auth';
import { associarSintomas } from '../services/sintomasService';
import { analisarGlicemia } from '../services/analiseService';
import { prepararRegistrosParaAnalise } from '../services/registroService';
import { calcularIntervaloPorFiltro } from '../utils/intervalo';
import { compartilharRelatorio } from '../services/compartilhamentoService';
import { formatarData } from '../utils/formatarData';
import { LineChart } from 'react-native-chart-kit';
import { buscaRegistrosPressao } from '../services/buscaPressao';
import { prepararRegistrosDePressao, analisarPressao } from '../services/analisePressao';
import { buscarHistoricoPeso, analisarPeso } from '../services/analisePeso';

const RelatorioCompleto = () => {
  const [carregando, setCarregando] = useState(true);
  const [registros, setRegistros] = useState([]);
  const [registrosPressao, setRegistrosPressao] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [sintomasTexto, setSintomasTexto] = useState([]);
  const [filtro, setFiltro] = useState('ultimos7');
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1);
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const [registrosPeso, setRegistrosPeso] = useState([]);
  const [avaliacaoPeso, setAvaliacaoPeso] = useState('');

  const { config, temas, tamanhosFonte } = useConfiguracoes();
  const temaAtual = temas[config.tema];
  const tamanhoFonteAtual = tamanhosFonte[config.fonte];
  const estilos = criarEstilos(temaAtual, tamanhoFonteAtual);

  useEffect(() => {
    const carregarDados = async () => {
      setCarregando(true);
      const userId = auth().currentUser?.uid;
      if (!userId) return;

      try {
        const intervalo = calcularIntervaloPorFiltro(filtro, mesSelecionado, anoSelecionado);

        const registrosPreparados = await prepararRegistrosParaAnalise(userId, intervalo);
        setRegistros(registrosPreparados);
        const alertasGlicemia = analisarGlicemia(registrosPreparados, intervalo);
        const sintomas = associarSintomas(registrosPreparados, intervalo);
        setSintomasTexto(sintomas);

        const registrosPressaoPreparados = await buscaRegistrosPressao(userId, intervalo);
        setRegistrosPressao(registrosPressaoPreparados);
        const alertasPressao = analisarPressao(registrosPressaoPreparados, intervalo);

        const historico = await buscarHistoricoPeso(userId);
        const resultadoPeso = analisarPeso(historico, intervalo);

        setRegistrosPeso(resultadoPeso.lista);
        setAvaliacaoPeso(resultadoPeso.avaliacao);

        setAlertas([...alertasGlicemia, ...alertasPressao]);

      } catch (e) {
        console.error('Erro ao carregar relatório:', e);
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, [filtro, mesSelecionado, anoSelecionado]);

  if (carregando) {
    return <View style={estilos.container}><ActivityIndicator size="large" color={temaAtual.botaoFundo} /></View>;
  }

  const screenWidth = Dimensions.get('window').width - 75;
  const intervalo = calcularIntervaloPorFiltro(filtro, mesSelecionado, anoSelecionado);

  const registrosFiltrados = registros.filter(r => {
    const data = r.timestamp.toDate ? r.timestamp.toDate() : new Date(r.timestamp);
    if (!intervalo) return true;
    if (intervalo.inicio && data < intervalo.inicio) return false;
    if (intervalo.fim && data >= intervalo.fim) return false;
    return true;
  });

  const chartData = {
    labels: registrosFiltrados.map(() => ''),
    datasets: [{ data: registrosFiltrados.map(r => Number(r.valor)), color: () => temaAtual.botaoFundo, strokeWidth: 2 }],
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={estilos.container} contentContainerStyle={estilos.scrollContent}>
        <Text style={estilos.titulo}>Relatório Completo</Text>

        <View style={estilos.filtros}>
          <Picker selectedValue={filtro} onValueChange={setFiltro} style={estilos.picker}>
            <Picker.Item label="Últimos 7 dias" value="ultimos7" />
            <Picker.Item label="Últimos 30 dias" value="ultimos30" />
            <Picker.Item label="Todos os dados" value="todos" />
            <Picker.Item label="Filtrar por mês e ano" value="mesAno" />
            <Picker.Item label="Filtrar por ano" value="ano" />
          </Picker>
        </View>

        <View style={estilos.sectionBox}>
          <Text style={estilos.subtitulo}>Gráfico de Variação</Text>
          <LineChart data={chartData} width={screenWidth} height={220}
            chartConfig={{
              backgroundGradientFrom: temaAtual.fundo,
              backgroundGradientTo: temaAtual.fundo,
              color: () => temaAtual.botaoFundo,
              labelColor: () => temaAtual.texto,
              propsForDots: { r: '3', strokeWidth: '1', stroke: temaAtual.botaoFundo },
              propsForBackgroundLines: { stroke: temaAtual.texto + '33' },
            }}
            withDots
            withShadow={false}
            withInnerLines
            withOuterLines={false}
            withHorizontalLabels
            withVerticalLabels={false}
            bezier
            style={{ borderRadius: 10 }}
          />
        </View>

        <View style={estilos.sectionBox}>
          {alertas.map((item, i) => <Text key={i} style={estilos.texto}>• {item}</Text>)}
          {sintomasTexto.map((item, i) => <Text key={i} style={estilos.texto}>• {item}</Text>)}
        </View>

        <View style={estilos.sectionBox}>
          <Text style={estilos.texto}>{avaliacaoPeso}</Text>
        </View>

        <View style={estilos.sectionBox}>
          <Text style={estilos.subtitulo}>Medições de Glicemia</Text>
          {registros.map(item => (
            <View key={item.id} style={estilos.registroBox}>
              <Text style={estilos.texto}>Data: {formatarData(item.timestamp)}</Text>
              <Text style={estilos.texto}>Valor: {item.valor ?? 'N/A'} mg/dL</Text>
              {item.sintomas && item.sintomas.length > 0 &&
                <Text style={estilos.texto}>Sintomas: {item.sintomas.join(', ')}</Text>
              }
            </View>
          ))}
        </View>

        <View style={estilos.sectionBox}>
          <Text style={estilos.subtitulo}>Pressões Arteriais</Text>
          {registrosPressao.length === 0 ? (
            <Text style={estilos.texto}>Nenhum registro de pressão para o período selecionado.</Text>
          ) : (
            registrosPressao.map(item => (
              <View key={item.id} style={estilos.registroBox}>
                <Text style={estilos.texto}>Data: {formatarData(item.timestamp)}</Text>
                <Text style={estilos.texto}>Sistólica: {item.sistolica ?? '---'} mmHg</Text>
                <Text style={estilos.texto}>Diastólica: {item.diastolica ?? '---'} mmHg</Text>
                <Text style={estilos.texto}>Classificação: {item.classificacao ?? '---'}</Text>
                {item.observacao && <Text style={estilos.texto}>Obs: {item.observacao}</Text>}
              </View>
            ))
          )}
        </View>

        <View style={estilos.sectionBox}>
          <Text style={estilos.subtitulo}>Registros de Peso</Text>

          {registrosPeso.length === 0 ? (
            <Text style={estilos.texto}>Nenhum registro de peso para o período selecionado.</Text>
          ) : (
            registrosPeso.map((item, index) => (
              <View key={index} style={estilos.registroBox}>
                <Text style={estilos.texto}>Data: {formatarData(item.timestamp)}</Text>
                <Text style={estilos.texto}>Peso: {item.peso} kg</Text>
              </View>
            ))
          )}
        </View>

      </ScrollView>

      <View style={estilos.botaoContainer}>
        <TouchableOpacity
          onPress={() => compartilharRelatorio({ alertas, sintomasTexto, registros, registrosPressao }, 'JSON')}
          style={estilos.botao}
        >
          <Text style={estilos.botaoTexto}>Compartilhar Relatório</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RelatorioCompleto;
