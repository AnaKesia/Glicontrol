import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { LineChart } from 'react-native-chart-kit';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

import { useConfiguracoes } from './Configuracoes';
import { criarEstilos } from '../estilos/relatorioCompleto';

import { associarSintomas } from '../services/sintomasService';
import { analisarGlicemia } from '../services/analiseService';
import { prepararRegistrosParaAnalise } from '../services/registroService';
import { calcularIntervaloPorFiltro } from '../utils/intervalo';
import { compartilharRelatorio } from '../services/compartilhamentoService';
import { formatarData } from '../utils/formatarData';

import { buscaRegistrosPressao } from '../services/buscaPressao';
import { analisarPressao } from '../services/analisePressao';
import { buscarHistoricoPeso, analisarPeso } from '../services/analisePeso';

const RelatorioCompleto = () => {
  const [carregando, setCarregando] = useState(true);

  const [registros, setRegistros] = useState([]);
  const [registrosPressao, setRegistrosPressao] = useState([]);
  const [registrosPeso, setRegistrosPeso] = useState([]);
  const [avaliacaoPeso, setAvaliacaoPeso] = useState('');

  const [atividadesFisicas, setAtividadesFisicas] = useState([]);
  const [registrosAgua, setRegistrosAgua] = useState([]);

  const [alertas, setAlertas] = useState([]);
  const [sintomasTexto, setSintomasTexto] = useState([]);

  const [filtro, setFiltro] = useState('ultimos7');
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1);
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());

  const { config, temas, tamanhosFonte } = useConfiguracoes();
  const temaAtual = temas[config.tema];
  const tamanhoFonteAtual = tamanhosFonte[config.fonte];
  const estilos = criarEstilos(temaAtual, tamanhoFonteAtual);

  const abrirPickerMesAno = () => {
    // Abrimos o picker para o usuário escolher a data
    DateTimePickerAndroid.open({
      value: new Date(anoSelecionado, mesSelecionado - 1, 1),
      mode: 'date',
      is24Hour: true,
      onChange: (event, selectedDate) => {
        if (event.type === 'set' && selectedDate) {
          // Atualizamos só quando o usuário confirma
          setMesSelecionado(selectedDate.getMonth() + 1);
          setAnoSelecionado(selectedDate.getFullYear());
        }
      },
    });
  };

  const abrirPickerAno = () => {
    // Abrimos o picker, pegando qualquer mês, mas só usamos o ano
    DateTimePickerAndroid.open({
      value: new Date(anoSelecionado, 0, 1),
      mode: 'date',
      is24Hour: true,
      onChange: (event, selectedDate) => {
        if (event.type === 'set' && selectedDate) {
          setAnoSelecionado(selectedDate.getFullYear());
        }
      },
    });
  };

  // ---------------- CARREGAR DADOS ----------------
  useEffect(() => {
    const carregarDados = async () => {
      setCarregando(true);
      const userId = auth().currentUser?.uid;
      if (!userId) return;

      try {
        const intervalo = calcularIntervaloPorFiltro(filtro, mesSelecionado, anoSelecionado);

        // Glicemia
        const glicemias = await prepararRegistrosParaAnalise(userId, intervalo);
        setRegistros(glicemias);
        const alertasGlicemia = analisarGlicemia(glicemias, intervalo);
        const sintomas = associarSintomas(glicemias, intervalo);

        // Pressão
        const pressoes = await buscaRegistrosPressao(userId, intervalo);
        setRegistrosPressao(pressoes);
        const alertasPressao = analisarPressao(pressoes, intervalo);

        // Peso
        const historicoPeso = await buscarHistoricoPeso(userId);
        const resultadoPeso = analisarPeso(historicoPeso, intervalo);
        setRegistrosPeso(resultadoPeso.lista);
        setAvaliacaoPeso(resultadoPeso.avaliacao);

        // Atividade física
        const snapAtividades = await firestore()
          .collection('atividadesFisicas')
          .where('usuarioId', '==', userId)
          .get();

        const atividades = snapAtividades.docs
          .map(doc => ({ id: doc.id, ...doc.data(), timestamp: doc.data().timestamp?.toDate() }))
          .filter(a => (!intervalo?.inicio || a.timestamp >= intervalo.inicio) &&
                       (!intervalo?.fim || a.timestamp < intervalo.fim));
        setAtividadesFisicas(atividades);

        // Água
        const snapAgua = await firestore()
          .collection('agua')
          .where('usuarioId', '==', userId)
          .get();

        const agua = snapAgua.docs
          .map(doc => ({ id: doc.id, ...doc.data(), timestamp: doc.data().timestamp?.toDate() }))
          .filter(a => (!intervalo?.inicio || a.timestamp >= intervalo.inicio) &&
                       (!intervalo?.fim || a.timestamp < intervalo.fim));
        setRegistrosAgua(agua);

        setAlertas([...alertasGlicemia, ...alertasPressao]);
        setSintomasTexto(sintomas);
      } catch (e) {
        console.error('Erro ao carregar relatório:', e);
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, [filtro, mesSelecionado, anoSelecionado]);

  if (carregando) {
    return (
      <View style={estilos.container}>
        <ActivityIndicator size="large" color={temaAtual.botaoFundo} />
      </View>
    );
  }

  // ---------------- FUNÇÕES AUXILIARES ----------------
  const screenWidth = Dimensions.get('window').width - 75;

  const somarPorDia = (lista, campo) => {
    const total = {};
    lista.forEach(item => {
      if (!item.timestamp) return;
      const data = new Date(item.timestamp);
      data.setHours(0, 0, 0, 0);
      const dia = formatarData(data);
      total[dia] = (total[dia] || 0) + Number(item[campo] || 0);
    });
    return total;
  };

  const totalAtividadePorDia = somarPorDia(atividadesFisicas, 'minutos');
  const totalAguaPorDia = somarPorDia(registrosAgua, 'quantidade');

  const chartData = {
    labels: registros.length ? registros.map(() => '') : [''],
    datasets: [{
      data: registros.length ? registros.map(r => Number(r.valor)) : [0],
      color: () => temaAtual.botaoFundo,
      strokeWidth: 2
    }],
  };


  // ---------------- RENDER ----------------
  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={estilos.container} contentContainerStyle={estilos.scrollContent}>

        <Text style={estilos.titulo}>Relatório Completo</Text>

        {/* FILTROS */}
        {/* FILTROS */}
        <View style={estilos.filtros}>
          <Picker
            selectedValue={filtro}
            onValueChange={(value) => setFiltro(value)}
            style={estilos.picker} // estilo do filtro
          >
            <Picker.Item label="Últimos 7 dias" value="ultimos7" />
            <Picker.Item label="Últimos 30 dias" value="ultimos30" />
            <Picker.Item label="Todos os dados" value="todos" />
            <Picker.Item label="Filtrar por mês e ano" value="mesAno" />
            <Picker.Item label="Filtrar por ano" value="ano" />
          </Picker>

          {/* MÊS E ANO SELECIONADOS */}
          {filtro === 'mesAno' && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Picker
                selectedValue={mesSelecionado}
                style={[estilos.picker, { flex: 1, marginRight: 5 }]} // mesmo estilo
                onValueChange={value => setMesSelecionado(value)}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <Picker.Item key={m} label={`Mês ${m}`} value={m} />
                ))}
              </Picker>

              <Picker
                selectedValue={anoSelecionado}
                style={[estilos.picker, { flex: 1, marginLeft: 5 }]} // mesmo estilo
                onValueChange={value => setAnoSelecionado(value)}
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(a => (
                  <Picker.Item key={a} label={`${a}`} value={a} />
                ))}
              </Picker>
            </View>
          )}

          {/* Apenas ano */}
          {filtro === 'ano' && (
            <Picker
              selectedValue={anoSelecionado}
              style={[estilos.picker, { marginTop: 8 }]} // mesmo estilo
              onValueChange={value => setAnoSelecionado(value)}
            >
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(a => (
                <Picker.Item key={a} label={`${a}`} value={a} />
              ))}
            </Picker>
          )}
        </View>

        {/* GRÁFICO */}
        <View style={estilos.sectionBox}>
          <Text style={estilos.subtitulo}>Gráfico de Glicemia</Text>
          <LineChart
            data={chartData}
            width={screenWidth}
            height={220}
            chartConfig={{
              backgroundGradientFrom: temaAtual.fundo,
              backgroundGradientTo: temaAtual.fundo,
              color: () => temaAtual.botaoFundo,
              labelColor: () => temaAtual.texto,
            }}
            bezier
            style={{ borderRadius: 10 }}
          />
        </View>

        {/* ALERTAS */}
        <View style={estilos.sectionBox}>
          {alertas.map((item, i) => <Text key={i} style={estilos.texto}>• {item}</Text>)}
          {sintomasTexto.map((item, i) => <Text key={i} style={estilos.texto}>• {item}</Text>)}
        </View>

        <View style={estilos.sectionBox}>
          <Text style={estilos.subtitulo}>Peso</Text>
          <Text style={estilos.texto}>{avaliacaoPeso}</Text>
        </View>

        {/* GLICEMIAS */}
        <View style={estilos.sectionBox}>
          <Text style={estilos.subtitulo}>Medições de Glicemia</Text>
          {registros.map(item => (
            <View key={item.id} style={estilos.registroBox}>
              <Text style={estilos.texto}>Data: {formatarData(item.timestamp)}</Text>
              <Text style={estilos.texto}>Valor: {item.valor} mg/dL</Text>
            </View>
          ))}
        </View>

        {/* PRESSÃO */}
        <View style={estilos.sectionBox}>
          <Text style={estilos.subtitulo}>Pressão Arterial</Text>
          {registrosPressao.length === 0 ? (
            <Text style={estilos.texto}>Nenhum registro.</Text>
          ) : (
            registrosPressao.map(item => (
              <View key={item.id} style={estilos.registroBox}>
                <Text style={estilos.texto}>Data: {formatarData(item.timestamp)}</Text>
                <Text style={estilos.texto}>Sistólica: {item.sistolica}</Text>
                <Text style={estilos.texto}>Diastólica: {item.diastolica}</Text>
              </View>
            ))
          )}
        </View>

        {/* ATIVIDADE FÍSICA — TOTAL DO DIA */}
        <View style={estilos.sectionBox}>
          <Text style={estilos.subtitulo}>Atividade Física (total do dia)</Text>
          {Object.keys(totalAtividadePorDia).length === 0 ? (
            <Text style={estilos.texto}>Nenhum registro.</Text>
          ) : (
            Object.entries(totalAtividadePorDia).map(([dia, total]) => (
              <Text key={dia} style={estilos.texto}>{dia}: {total} minutos</Text>
            ))
          )}
        </View>

        {/* ÁGUA — TOTAL DO DIA */}
        <View style={estilos.sectionBox}>
          <Text style={estilos.subtitulo}>Consumo de Água (total do dia)</Text>
          {Object.keys(totalAguaPorDia).length === 0 ? (
            <Text style={estilos.texto}>Nenhum registro.</Text>
          ) : (
            Object.entries(totalAguaPorDia).map(([dia, total]) => (
              <Text key={dia} style={estilos.texto}>{dia}: {total} ml</Text>
            ))
          )}
        </View>

        {/* PESO */}
        <View style={estilos.sectionBox}>
          <Text style={estilos.subtitulo}>Registros de Peso</Text>
          {registrosPeso.map((item, i) => (
            <View key={i} style={estilos.registroBox}>
              <Text style={estilos.texto}>Data: {formatarData(item.timestamp)}</Text>
              <Text style={estilos.texto}>Peso: {item.peso} kg</Text>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* BOTÃO DE COMPARTILHAR */}
      <View style={estilos.botaoContainer}>
        <TouchableOpacity
          style={estilos.botao}
          onPress={() => compartilharRelatorio(
            { registros, registrosPressao, registrosPeso, atividadesFisicas, registrosAgua, alertas, sintomasTexto },
            'JSON'
          )}
        >
          <Text style={estilos.botaoTexto}>Compartilhar Relatório</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RelatorioCompleto;
