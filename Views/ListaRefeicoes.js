import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { buscarRefeicoesUsuario, deletarRefeicao } from '../firebaseService';

const ListaRefeicoes = () => {
  const [refeicoes, setRefeicoes] = useState([]);
  const navigation = useNavigation();

  const carregarRefeicoes = async () => {
    try {
      const lista = await buscarRefeicoesUsuario();
      setRefeicoes(lista);
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
          <Text style={styles.itemSubtitle}>{item.calorias} kcal</Text>
          {item.observacoes ? (
            <Text style={styles.itemObservacoes}>{item.observacoes}</Text>
          ) : null}
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
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma refeição registrada.</Text>}
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

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
    justifyContent: 'space-between',
  },
  itemContent: { flex: 1, marginRight: 8 },
  itemTitle: { fontSize: 16, fontWeight: 'bold' },
  itemSubtitle: { fontSize: 14, color: '#555' },
  itemObservacoes: { fontSize: 13, color: '#888', marginTop: 4 },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007bff',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#555' },
});

export default ListaRefeicoes;
