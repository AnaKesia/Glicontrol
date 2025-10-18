import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { buscarRefeicoesUsuario, deletarRefeicao } from '../firebaseService';
import { useConfiguracoes, tamanhosFonte } from './Configuracoes';
import firestore from '@react-native-firebase/firestore';
import { analisarImpactoGlicemicoGemini } from '../services/AnaliseGlicemicaIA';
import { criarEstilos } from '../estilos/listaRefeicao';

const ListaRefeicoes = () => {
  const [refeicoes, setRefeicoes] = useState([]);
  const navigation = useNavigation();

  const { config, temas } = useConfiguracoes();
  const tema = temas[config.tema];
  const fonte = tamanhosFonte[config.fonte];
  const styles = criarEstilos(tema, fonte, config);

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
            } catch (error) {
              console.error('Erro ao atualizar análise IA:', error);
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
    Alert.alert(
      'Excluir Refeição',
      'Tem certeza que deseja excluir esta refeição?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await deletarRefeicao(id);
            carregarRefeicoes();
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const data = item.timestamp.toDate();
    const dataFormatada = `${data.toLocaleDateString()} ${data.toLocaleTimeString()}`;

    return (
      <View style={styles.item}>
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{item.tipo}</Text>
          <Text style={styles.itemSubtitle}>{dataFormatada}</Text>
          <Text style={styles.itemSubtitle}>{item.calorias ? `${item.calorias} kcal` : 'Sem info de calorias'}</Text>
          {item.observacoes ? (
            <Text style={styles.itemObservacoes}>Obs: {item.observacoes}</Text>
          ) : null}
          <Text style={styles.itemAnalise}>
            Análise: {item.analiseGlicemica || 'Nenhuma análise'}
          </Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('InserirRefeicao', { refeicao: item })}
          >
            <Icon name="edit" size={24} color="blue" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => confirmarExclusao(item.id)}
          >
            <Icon name="delete" size={24} color="red" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={refeicoes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma refeição registrada.</Text>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('InserirRefeicao')}
      >
        <Icon name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default ListaRefeicoes;
