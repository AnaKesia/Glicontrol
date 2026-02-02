import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, SectionList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { formatarData } from '../utils/dataUtils';
import { buscarMedicoesUsuario, deletarMedicao } from '../firebaseService';
import { useConfiguracoes, tamanhosFonte } from './Configuracoes';
import { criarEstilos } from '../estilos/listaMedicoes';
import { isToday, isYesterday, startOfWeek, isSameDay, format } from 'date-fns';

const ListaMedicoes = () => {
  const navigation = useNavigation();
  const [medicoes, setMedicoes] = useState([]);

  const { config, temas } = useConfiguracoes();
  const tema = temas[config.tema];
  const fonteBase = tamanhosFonte[config.fonte];
  const styles = criarEstilos(tema, fonteBase);

  const carregarMedicoes = useCallback(async () => {
    try {
      const dados = await buscarMedicoesUsuario();

      const medicoesFormatadas = dados.map((m) => ({
        ...m,
        sintomas: Array.isArray(m.sintomas) ? m.sintomas : [],
        intensidade: m.sintomas && m.sintomas.length > 0 ? m.intensidade || '' : '',
      }));

      setMedicoes(medicoesFormatadas);
    } catch (error) {
      console.log('Erro ao carregar medições:', error);
    }
  }, []);

  const confirmarRemocao = (id) => {
    Alert.alert('Confirmar', 'Deseja remover esta medição?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          await deletarMedicao(id);
          carregarMedicoes();
        },
      },
    ]);
  };

  const medicoesAgrupadas = useMemo(() => {
    const grupos = {};

    medicoes.forEach((item) => {
      let chaveData, labelData;

      if (item.timestamp?.toDate) {
        const data = new Date(item.timestamp.toDate());

        if (isToday(data)) {
          chaveData = 'hoje';
          labelData = 'Hoje';
        } else if (isYesterday(data)) {
          chaveData = 'ontem';
          labelData = 'Ontem';
        } else if (isSameDay(data, startOfWeek(new Date(), { weekStartsOn: 1 }))) {
          chaveData = 'semana';
          labelData = 'Esta semana';
        } else {
          chaveData = format(data, 'dd/MM/yyyy');
          labelData = format(data, 'dd/MM/yyyy');
        }

        if (!grupos[chaveData]) {
          grupos[chaveData] = { title: labelData, data: [] };
        }
        grupos[chaveData].data.push(item);
      }
    });

    return Object.values(grupos).sort((a, b) => {
      const ordem = { 'hoje': 0, 'ontem': 1, 'semana': 2 };
      return (ordem[a.title.toLowerCase()] ?? 999) - (ordem[b.title.toLowerCase()] ?? 999);
    });
  }, [medicoes]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', carregarMedicoes);
    return unsubscribe;
  }, [navigation, carregarMedicoes]);

  const renderItem = ({ item }) => (
    <ItemMedicao
      item={item}
      onEditar={() => navigation.navigate('InserirGlicemia', { medicao: item })}
      onExcluir={() => confirmarRemocao(item.id)}
      tema={tema}
      fonteBase={fonteBase}
    />
  );

  const renderSectionHeader = ({ section: { title } }) => (
    <Text style={styles.secaoTitulo}>{title}</Text>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Histórico de Medições</Text>
      <SectionList
        sections={medicoesAgrupadas}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhuma medição encontrada</Text>}
      />
    </View>
  );
};

const ItemMedicao = ({ item, onEditar, onExcluir, tema, fonteBase }) => {
  const styles = criarEstilos(tema, fonteBase);

  const getStatusEmoji = (valor) => {
    const glicemia = parseFloat(valor);
    if (glicemia >= 70 && glicemia <= 130) return '✅';
    if (glicemia > 130 && glicemia <= 180) return '⚠️';
    return '❌';
  };

  const getCategoriaCor = (valor) => {
    const glicemia = parseFloat(valor);
    if (glicemia >= 70 && glicemia <= 130) return { fundo: '#4ade80', borda: '#22c55e' };
    if (glicemia > 130 && glicemia <= 180) return { fundo: '#fbbf24', borda: '#f59e0b' };
    return { fundo: '#f87171', borda: '#ef4444' };
  };

  const categoriaCor = getCategoriaCor(item.valor);

  return (
    <View style={[styles.item, { borderLeftColor: categoriaCor.borda, backgroundColor: categoriaCor.fundo }]}>
      <View style={styles.cabecalho}>
        <View style={styles.valorContainer}>
          <Text style={styles.valorTexto}>
            📊 {item.valor} mg/dL
          </Text>
          <Text style={styles.statusEmoji}>{getStatusEmoji(item.valor)}</Text>
        </View>
      </View>

      <View style={styles.linhaInfo}>
        <Text style={styles.icon}>🕐</Text>
        <Text style={styles.texto}>{formatarData(item.timestamp)}</Text>
      </View>

      {Array.isArray(item.sintomas) && item.sintomas.length > 0 && (
        <>
          <View style={styles.linhaInfo}>
            <Text style={styles.icon}>🔔</Text>
            <Text style={styles.texto}>{item.sintomas.join(', ')}</Text>
          </View>
          <View style={styles.linhaInfo}>
            <Text style={styles.icon}>📈</Text>
            <Text style={styles.texto}>Intensidade: {item.intensidade}</Text>
          </View>
        </>
      )}

      {item.observacao ? (
        <View style={styles.linhaInfo}>
          <Text style={styles.icon}>📝</Text>
          <Text style={styles.texto}>{item.observacao}</Text>
        </View>
      ) : null}

      <View style={styles.acoes}>
        <TouchableOpacity onPress={onEditar} style={styles.botaoEditar}>
          <Icon name="edit" size={18} color="#0084ff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onExcluir} style={styles.botaoExcluir}>
          <Icon name="delete" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ListaMedicoes;
