import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert, LayoutAnimation, UIManager, Platform,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Dropdown, MultiSelect } from 'react-native-element-dropdown';
import { buscarRefeicoesUsuario, deletarRefeicao } from '../firebaseService';
import { useConfiguracoes, tamanhosFonte } from './Configuracoes';
import firestore from '@react-native-firebase/firestore';
import { analisarImpactoGlicemicoGemini } from '../services/AnaliseGlicemicaIA';
import { criarEstilos } from '../estilos/listaRefeicao';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const tiposDisponiveis = [
  { label: 'Café da manhã', value: 'Café da Manhã' },
  { label: 'Almoço', value: 'Almoço' },
  { label: 'Lanche', value: 'Lanche' },
  { label: 'Jantar', value: 'Jantar' },
  { label: 'Outro', value: 'Outro' },
];

const opcoesOrdenacao = [
  { label: 'Mais recente → Mais antiga', value: 'desc' },
  { label: 'Mais antiga → Mais recente', value: 'asc' },
];

const ListaRefeicoes = () => {
  const [refeicoes, setRefeicoes] = useState([]);
  const [ordenacao, setOrdenacao] = useState('desc');
  const [tiposSelecionados, setTiposSelecionados] = useState([]);
  const [expandido, setExpandido] = useState(null);
  const navigation = useNavigation();

  const { config, temas } = useConfiguracoes();
  const tema = temas[config.tema];
  const fontSize = tamanhosFonte[config.fonte];
  const styles = criarEstilos(tema, fontSize, config);

  const carregarRefeicoes = async () => {
    try {
      const lista = await buscarRefeicoesUsuario();

      const atualizadas = await Promise.all(
        lista.map(async (item) => {
          if (
            (!item.analiseGlicemica || item.analiseGlicemica === 'Nenhuma análise' || item.analiseGlicemica === '') &&
            item.observacoes?.trim()
          ) {
            try {
              const explicacao = await analisarImpactoGlicemicoGemini(item.observacoes);
              await firestore().collection('refeicoes').doc(item.id).update({
                analiseGlicemica: explicacao || 'Análise falhou',
              });
              return { ...item, analiseGlicemica: explicacao || 'Análise falhou' };
            } catch {
              return { ...item, analiseGlicemica: 'Análise falhou' };
            }
          }
          return item;
        })
      );

      setRefeicoes(atualizadas);
    } catch (error) {
      console.error('Erro ao carregar refeições:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarRefeicoes();
    }, [])
  );

  const confirmarExclusao = (id) => {
    Alert.alert('Excluir Refeição', 'Tem certeza que deseja excluir esta refeição?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await deletarRefeicao(id);
          carregarRefeicoes();
        },
      },
    ]);
  };

  const filtrarEOrdenar = () => {
    let listaFiltrada = [...refeicoes];

    if (tiposSelecionados.length > 0) {
      listaFiltrada = listaFiltrada.filter((r) => tiposSelecionados.includes(r.tipo));
    }

    listaFiltrada.sort((a, b) => {
      const ta = a.timestamp.toDate();
      const tb = b.timestamp.toDate();
      return ordenacao === 'desc' ? tb - ta : ta - tb;
    });

    return listaFiltrada;
  };

  const alternarAnalise = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandido(expandido === id ? null : id);
  };

  const renderItem = ({ item }) => {
    const data = item.timestamp.toDate();
    const dataFormatada = `${data.toLocaleDateString()} ${data.toLocaleTimeString()}`;
    const estaExpandido = expandido === item.id;

    return (
      <View style={styles.item}>
        <TouchableOpacity style={styles.itemContent} onPress={() => alternarAnalise(item.id)}>
          <Text style={styles.itemTitle}>{item.tipo}</Text>
          <Text style={styles.itemSubtitle}>{dataFormatada}</Text>
          <Text style={styles.itemSubtitle}>
            {item.calorias ? `${item.calorias} kcal` : 'Sem info de calorias'}
          </Text>
          {item.observacoes ? (
            <Text style={styles.itemObservacoes}>Obs: {item.observacoes}</Text>
          ) : null}

          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: tema.accent,
              borderRadius: 12,
              paddingVertical: 6,
              paddingHorizontal: 12,
              alignSelf: 'flex-start',
              marginTop: 8,
            }}
            activeOpacity={0.7}
            onPress={() => alternarAnalise(item.id)}
          >
            <Text style={{ color: '#28a745', fontSize: fontSize }}>Análise IA</Text>
          </TouchableOpacity>

          {estaExpandido && (
            <View style={{ marginTop: 6 }}>
              <Text style={styles.itemAnalise}>
                Análise IA: {item.analiseGlicemica || 'Nenhuma análise'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('InserirRefeicao', { refeicao: item })}
          >
            <Icon name="edit" size={24} color="blue" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => confirmarExclusao(item.id)}>
            <Icon name="delete" size={24} color="red" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Refeições</Text>

      <View style={styles.filtrosContainer}>
        <Text style={styles.filtroLabel}>Ordem:</Text>
        <Dropdown
          style={styles.dropdown}
          data={opcoesOrdenacao}
          labelField="label"
          valueField="value"
          value={ordenacao}
          onChange={(item) => setOrdenacao(item.value)}
          placeholder="Selecione a ordem"
          placeholderStyle={styles.dropdownPlaceholder}
          selectedTextStyle={styles.dropdownText}
          itemTextStyle={styles.dropdownItemText}
        />

        <Text style={styles.filtroLabel}>Tipos:</Text>
        <MultiSelect
          style={styles.dropdown}
          data={tiposDisponiveis}
          labelField="label"
          valueField="value"
          placeholder="Selecione os tipos"
          value={tiposSelecionados}
          onChange={(itens) => setTiposSelecionados(itens)}
          placeholderStyle={styles.dropdownPlaceholder}
          selectedTextStyle={styles.dropdownText}
          itemTextStyle={styles.dropdownItemText}
        />
      </View>

      <FlatList
        data={filtrarEOrdenar()}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma refeição registrada.</Text>}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('InserirRefeicao')}>
        <Icon name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default ListaRefeicoes;
