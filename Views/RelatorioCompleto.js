import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, Share, Dimensions, ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { format } from 'date-fns';
import { LineChart } from 'react-native-chart-kit';
import { captureRef } from 'react-native-view-shot';
import { Image } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { useConfiguracoes, tamanhosFonte } from './Configuracoes';

function formatarData(timestamp) {
  try {
    const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(data, 'dd/MM/yyyy HH:mm');
  } catch {
    return String(timestamp);
  }
}

async function prepararRegistrosParaAnalise(userId, intervalo = null) {

  let queryMedicoes = firestore().collection('medicoes').where('usuarioId', '==', userId);
  if (intervalo && intervalo.inicio) queryMedicoes = queryMedicoes.where('timestamp', '>=', intervalo.inicio);
  if (intervalo && intervalo.fim) queryMedicoes = queryMedicoes.where('timestamp', '<', intervalo.fim);
  const medicoesSnap = await queryMedicoes.orderBy('timestamp', 'asc').get();
  const medicoes = medicoesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  let querySintomas = firestore().collection('sintomas').where('usuarioId', '==', userId);
  if (intervalo && intervalo.inicio) querySintomas = querySintomas.where('timestamp', '>=', intervalo.inicio);
  if (intervalo && intervalo.fim) querySintomas = querySintomas.where('timestamp', '<', intervalo.fim);
  const sintomasSnap = await querySintomas.orderBy('timestamp', 'asc').get();
  const sintomas = sintomasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const mapSintomasPorGlicemia = {};
  sintomas.forEach(s => {
    const sintomasArray = Array.isArray(s.sintoma) ? s.sintoma : [];
    if (!mapSintomasPorGlicemia[s.glicemiaId]) {
      mapSintomasPorGlicemia[s.glicemiaId] = [];
    }
    mapSintomasPorGlicemia[s.glicemiaId].push(...sintomasArray);
  });

  const registros = medicoes.map(m => ({
    id: m.id,
    valor: m.valor ?? null,
    timestamp: m.timestamp,
    sintomas: mapSintomasPorGlicemia[m.id] ?? [],
  }));

  return registros;
}

function analisarGlicemia(registros, intervalo = null) {
  if (!Array.isArray(registros) || registros.length === 0) {
    return ['Nenhum registro de glicemia para analisar.'];
  }

  registros.sort((a, b) => {
    const dataA = a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
    const dataB = b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
    return dataA - dataB;
  });

  const alertas = [];
  const agora = new Date();

  let registrosFiltrados = registros;
  if (intervalo && intervalo.inicio && intervalo.fim) {
    registrosFiltrados = registros.filter(r => {
      const data = r.timestamp.toDate ? r.timestamp.toDate() : new Date(r.timestamp);
      return data >= intervalo.inicio && data < intervalo.fim;
    });
  } else if (intervalo && intervalo.inicio && !intervalo.fim) {
    registrosFiltrados = registros.filter(r => {
      const data = r.timestamp.toDate ? r.timestamp.toDate() : new Date(r.timestamp);
      return data >= intervalo.inicio;
    });
  } else if (intervalo && !intervalo.inicio && intervalo.fim) {
    registrosFiltrados = registros.filter(r => {
      const data = r.timestamp.toDate ? r.timestamp.toDate() : new Date(r.timestamp);
      return data < intervalo.fim;
    });
  }

  if (registrosFiltrados.length === 0) {
    return ['Nenhum registro no intervalo selecionado para analisar.'];
  }

  const matinais = registrosFiltrados.filter(r => {
    const data = r.timestamp.toDate ? r.timestamp.toDate() : new Date(r.timestamp);
    const hora = data.getHours();
    return hora >= 6 && hora <= 9 && Number(r.valor) < 70;
  });
  if (matinais.length >= 3) {
    alertas.push('⚠️ Possível hipoglicemia recorrente pela manhã (valores abaixo de 70 mg/dL entre 6h e 9h).');
  }

  // Variação brusca em até 2 horas (>= 50 mg/dL diferença)
  for (let i = 1; i < registrosFiltrados.length; i++) {
    const atual = registrosFiltrados[i];
    const anterior = registrosFiltrados[i - 1];

    const valorAtual = Number(atual.valor);
    const valorAnterior = Number(anterior.valor);

    const dataAtual = atual.timestamp.toDate ? atual.timestamp.toDate() : new Date(atual.timestamp);
    const dataAnterior = anterior.timestamp.toDate ? anterior.timestamp.toDate() : new Date(anterior.timestamp);

    const diffMinutos = Math.abs(dataAtual - dataAnterior) / 60000;

    if (!isNaN(valorAtual) && !isNaN(valorAnterior) && Math.abs(valorAtual - valorAnterior) >= 50 && diffMinutos <= 120) {
      alertas.push(`⚠️ Variação brusca detectada entre ${formatarData(anterior.timestamp)} e ${formatarData(atual.timestamp)}.`);
    }
  }

  for (let i = 2; i < registrosFiltrados.length; i++) {
    const v1 = Number(registrosFiltrados[i - 2].valor);
    const v2 = Number(registrosFiltrados[i - 1].valor);
    const v3 = Number(registrosFiltrados[i].valor);
    if (!isNaN(v1) && !isNaN(v2) && !isNaN(v3)) {
      if (v1 > v2 && v2 > v3) {
        alertas.push(`⚠️ Queda progressiva detectada entre ${formatarData(registrosFiltrados[i - 2].timestamp)}, ${formatarData(registrosFiltrados[i - 1].timestamp)} e ${formatarData(registrosFiltrados[i].timestamp)}.`);
        break;
      }
    }
  }

  // Muitas medições em 1 hora (mais de 5)
  for (let i = 0; i < registrosFiltrados.length; i++) {
    const inicio = registrosFiltrados[i].timestamp.toDate ? registrosFiltrados[i].timestamp.toDate() : new Date(registrosFiltrados[i].timestamp);
    let contagem = 1;
    for (let j = i + 1; j < registrosFiltrados.length; j++) {
      const atual = registrosFiltrados[j].timestamp.toDate ? registrosFiltrados[j].timestamp.toDate() : new Date(registrosFiltrados[j].timestamp);
      const diffMin = (atual - inicio) / 60000;
      if (diffMin <= 60) contagem++;
      else break;
    }
    if (contagem > 5) {
      alertas.push('⚠️ Muitas medições em curto intervalo (mais de 5 medições em 1 hora).');
      break;
    }
  }

  registrosFiltrados.forEach(r => {
    const val = Number(r.valor);
    if (!isNaN(val)) {
      if (val > 400) {
        alertas.push(`⚠️ Valor extremamente alto detectado: ${val} mg/dL em ${formatarData(r.timestamp)}.`);
      } else if (val < 40) {
        alertas.push(`⚠️ Valor extremamente baixo detectado: ${val} mg/dL em ${formatarData(r.timestamp)}.`);
      }
    }
  });

  return alertas.length > 0 ? alertas : ['Nenhum alerta significativo encontrado no período selecionado.'];
}

function associarSintomas(registros, intervalo = null) {
  if (!Array.isArray(registros) || registros.length === 0) {
    return ['Nenhum registro de glicemia com sintomas para analisar.'];
  }

  let registrosFiltrados = registros;
  if (intervalo && intervalo.inicio && intervalo.fim) {
    registrosFiltrados = registros.filter(r => {
      const data = r.timestamp.toDate ? r.timestamp.toDate() : new Date(r.timestamp);
      return data >= intervalo.inicio && data < intervalo.fim;
    });
  } else if (intervalo && intervalo.inicio && !intervalo.fim) {
    registrosFiltrados = registros.filter(r => {
      const data = r.timestamp.toDate ? r.timestamp.toDate() : new Date(r.timestamp);
      return data >= intervalo.inicio;
    });
  } else if (intervalo && !intervalo.inicio && intervalo.fim) {
    registrosFiltrados = registros.filter(r => {
      const data = r.timestamp.toDate ? r.timestamp.toDate() : new Date(r.timestamp);
      return data < intervalo.fim;
    });
  }

  if (registrosFiltrados.length === 0) {
    return ['Nenhum registro com sintomas no período selecionado.'];
  }

  const sintomasPorTipo = {};

  registrosFiltrados.forEach(r => {
    if (Array.isArray(r.sintomas)) {
      r.sintomas.forEach(s => {
        if (!sintomasPorTipo[s]) sintomasPorTipo[s] = [];
        sintomasPorTipo[s].push(Number(r.valor));
      });
    }
  });

  const analises = [];

  for (const sintoma in sintomasPorTipo) {
    const valores = sintomasPorTipo[sintoma].filter(v => !isNaN(v));
    if (valores.length > 0) {
      const media = valores.reduce((a, b) => a + b, 0) / valores.length;

      let avaliacao = 'normal';
      if (media < 70) {
        avaliacao = 'baixos';
      } else if (media > 180) {
        avaliacao = 'altos';
      }

      analises.push(`🔍 Sintoma "${sintoma}" esteve associado a valores ${avaliacao} de glicemia (média de ${media.toFixed(1)} mg/dL no período).`);
    }
  }

  return analises.length > 0 ? analises : ['Nenhuma associação significativa entre sintomas e glicemia no período selecionado.'];
}

function calcularIntervaloPorFiltro(filtro, mesSelecionado, anoSelecionado) {
  const agora = new Date();

  switch (filtro) {
    case 'ultimos7':
      return { inicio: new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000), fim: agora };
    case 'ultimos30':
      return { inicio: new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000), fim: agora };
    case 'todos':
      return null;
    case 'mesAno':
      if (!mesSelecionado || !anoSelecionado) return null;
      const inicioMes = new Date(anoSelecionado, mesSelecionado - 1, 1, 0, 0, 0);
      const fimMes = mesSelecionado === 12
        ? new Date(anoSelecionado + 1, 0, 1, 0, 0, 0)
        : new Date(anoSelecionado, mesSelecionado, 1, 0, 0, 0);
      return { inicio: inicioMes, fim: fimMes };
    case 'ano':
      if (!anoSelecionado) return null;
      const inicioAno = new Date(anoSelecionado, 0, 1, 0, 0, 0);
      const fimAno = new Date(anoSelecionado + 1, 0, 1, 0, 0, 0);
      return { inicio: inicioAno, fim: fimAno };
    default:
      return null;
  }
}

const RelatorioCompleto = () => {
  const [carregando, setCarregando] = useState(true);
  const [registros, setRegistros] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [sintomasTexto, setSintomasTexto] = useState([]);
  const [filtro, setFiltro] = useState('ultimos7');
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1);
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());

  useEffect(() => {
    const carregarDados = async () => {
      setCarregando(true);
      const userId = auth().currentUser?.uid;
      if (!userId) return;
      try {
        const intervalo = calcularIntervaloPorFiltro(filtro, mesSelecionado, anoSelecionado);
        const registrosPreparados = await prepararRegistrosParaAnalise(userId, intervalo);
        const alertasGerados = analisarGlicemia(registrosPreparados, intervalo);
        const analisesSintomas = associarSintomas(registrosPreparados, intervalo);

        setRegistros(registrosPreparados);
        setAlertas(alertasGerados);
        setSintomasTexto(analisesSintomas);
      } catch (e) {
        console.error('Erro ao carregar relatório:', e);
      } finally {
        setCarregando(false);
      }
    };
    carregarDados();
  }, [filtro, mesSelecionado, anoSelecionado]);

  const compartilharRelatorio = async () => {
    const texto = [
      '📊 Relatório de Glicemia', '',
      '🔔 Alertas:', ...alertas,
      '',
      'Conclusões sobre sintomas:', ...sintomasTexto,
      '',
      '📋 Registros:',
      ...registros.map(r => {
        const dataFormatada = formatarData(r.timestamp);
        const sintomasTxt = Array.isArray(r.sintomas) && r.sintomas.length > 0
          ? ` com sintomas: ${r.sintomas.join(', ')}` : '';
        return `• ${r.valor ?? '---'} mg/dL em ${dataFormatada}${sintomasTxt}`;
      }),
    ].join('\n');

    try {
      await Share.share({ message: texto });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  if (carregando) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width - 75;
  // Dados filtrados conforme o intervalo
  const intervalo = calcularIntervaloPorFiltro(filtro, mesSelecionado, anoSelecionado);
  const registrosFiltrados = registros.filter(r => {
    const data = r.timestamp.toDate ? r.timestamp.toDate() : new Date(r.timestamp);
    if (!intervalo) return true;
    if (intervalo.inicio && data < intervalo.inicio) return false;
    if (intervalo.fim && data >= intervalo.fim) return false;
    return true;
  });

  const chartData = {
    labels: registrosFiltrados.map((_, i) => ''), // Sem rótulos no eixo X
    datasets: [
      {
        data: registrosFiltrados.map(r => Number(r.valor)),
        color: () => '#007AFF',
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.titulo}>Relatório Completo</Text>

        <View style={styles.filtros}>
          <Picker selectedValue={filtro} onValueChange={setFiltro} style={styles.picker}>
            <Picker.Item label="Últimos 7 dias" value="ultimos7" />
            <Picker.Item label="Últimos 30 dias" value="ultimos30" />
            <Picker.Item label="Todos os dados" value="todos" />
            <Picker.Item label="Filtrar por mês e ano" value="mesAno" />
            <Picker.Item label="Filtrar por ano" value="ano" />
          </Picker>
        </View>

        {filtro === 'mesAno' && (
          <View style={styles.filtrosMesAno}>
            <Picker selectedValue={mesSelecionado} onValueChange={setMesSelecionado} style={[styles.picker, { flex: 1, marginRight: 5 }]}>
              {[...Array(12)].map((_, i) => (
                <Picker.Item key={i} label={`Mês ${i + 1}`} value={i + 1} />
              ))}
            </Picker>
            <Picker selectedValue={anoSelecionado} onValueChange={setAnoSelecionado} style={[styles.picker, { flex: 1 }]}>
              {Array.from({ length: 15 }, (_, i) => 2018 + i).map(ano => (
                <Picker.Item key={ano} label={`${ano}`} value={ano} />
              ))}
            </Picker>
          </View>
        )}

        {filtro === 'ano' && (
          <View style={styles.filtrosAno}>
            <Picker selectedValue={anoSelecionado} onValueChange={setAnoSelecionado} style={[styles.picker, { flex: 1 }]}>
              {Array.from({ length: 15 }, (_, i) => 2018 + i).map(ano => (
                <Picker.Item key={ano} label={`${ano}`} value={ano} />
              ))}
            </Picker>
          </View>
        )}

        <View style={styles.sectionBox}>
          <Text style={styles.subtitulo}>Gráfico de Variação</Text>
          <LineChart
            data={chartData}
            width={screenWidth}
            height={220}
            chartConfig={{
              backgroundGradientFrom: '#001f3f',
              backgroundGradientTo: '#001f3f',
              color: () => '#00aced',
              labelColor: () => '#ffffff',
              propsForDots: {
                r: '3',
                strokeWidth: '1',
                stroke: '#007AFF',
              },
              propsForBackgroundLines: {
                stroke: '#003366',
              },
            }}
            withDots={true}
            withShadow={false}
            withInnerLines={true}
            withOuterLines={false}
            withHorizontalLabels={true}
            withVerticalLabels={false} // sem rótulos de data
            bezier
            style={{
              borderRadius: 10,
            }}
          />
        </View>

        {(alertas.length === 0 && sintomasTexto.length === 0) ? (
          <Text style={styles.texto}>Nenhum alerta ou associação de sintomas para exibir.</Text>
        ) : (
          <>
            <View style={styles.sectionBox}>
              <Text style={styles.subtitulo}>Alertas da análise:</Text>
              {alertas.map((item, i) => (
                <Text key={`alerta-${i}`} style={styles.texto}>• {item}</Text>
              ))}
            </View>

            <View style={[styles.sectionBox, { marginTop: 10 }]}>
              <Text style={styles.subtitulo}>Conclusões sobre sintomas:</Text>
              {sintomasTexto.map((item, i) => (
                <Text key={`sintoma-${i}`} style={styles.texto}>• {item}</Text>
              ))}
            </View>
          </>
        )}

        <Text style={[styles.subtitulo, { marginTop: 20 }]}>Medições:</Text>
        {registros.map((item) => (
          <View key={item.id} style={styles.registroBox}>
            <Text style={styles.texto}><Text style={styles.label}>Data:</Text> {formatarData(item.timestamp)}</Text>
            <Text style={styles.texto}><Text style={styles.label}>Valor:</Text> {item.valor ?? 'N/A'} mg/dL</Text>
            {item.sintomas && item.sintomas.length > 0 && (
              <Text style={styles.texto}><Text style={styles.label}>Sintomas:</Text> {item.sintomas.join(', ')}</Text>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.botaoContainer}>
        <TouchableOpacity onPress={compartilharRelatorio} style={styles.botao}>
          <Text style={styles.botaoTexto}>Compartilhar Relatório</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RelatorioCompleto;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001f3f',
    padding: 20,
  },
  titulo: {
    color: '#fff',
    fontSize: 22,
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
    color: '#fff',
    backgroundColor: '#003366',
  },
  texto: {
    color: '#fff',
    fontSize: 16,
    marginVertical: 2,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  registroBox: {
    borderWidth: 1,
    borderColor: '#007AFF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
  },
  botao: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionBox: {
    borderWidth: 1,
    borderColor: '#007AFF',
    padding: 10,
    borderRadius: 10,
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
