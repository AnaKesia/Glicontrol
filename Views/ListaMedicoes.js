import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { buscarMedicoesUsuario, deletarMedicao } from '../firebaseService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { formatarData } from '../utils/dataUtils';

const ListaMedicoes = () => {
  const navigation = useNavigation();
  const [medicoes, setMedicoes] = useState([]);

  const carregarMedicoes = useCallback(async () => {
    const dados = await buscarMedicoesUsuario();
    setMedicoes(dados);
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

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', carregarMedicoes);
    return unsubscribe;
  }, [navigation, carregarMedicoes]);

  const renderItem = ({ item }) => <ItemMedicao item={item} onEditar={() => navigation.navigate('InserirGlicemia', { medicao: item })} onExcluir={() => confirmarRemocao(item.id)} />;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Lista de Medições:</Text>
      <FlatList
        data={medicoes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhuma medição encontrada</Text>}
      />
    </View>
  );
};

const ItemMedicao = ({ item, onEditar, onExcluir }) => {
  const navigation = useNavigation();

  const irParaSintomas = () => {
    navigation.navigate('RegistrarSintoma', { glicemiaId: item.id });
  };

  return (
    <View style={styles.item}>
      <Text style={styles.texto}>Valor: {item.valor} mg/dL</Text>
      <Text style={styles.texto}>Categoria: {item.categoria.charAt(0).toUpperCase() + item.categoria.slice(1).toLowerCase()}</Text>
      <Text style={styles.texto}>Data: {formatarData(item.timestamp)}</Text>
      {item.observacoes?.trim() && <Text style={styles.texto}>Observações: {item.observacoes}</Text>}
      <View style={styles.acoes}>
        <TouchableOpacity onPress={onEditar} style={styles.botaoEditar}>
          <Icon name="edit" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onExcluir} style={styles.botaoExcluir}>
          <Icon name="delete" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={irParaSintomas} style={styles.botaoSintoma}>
          <Icon name="healing" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ListaMedicoes;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001f3f',
    padding: 20,
  },
  item: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  texto: {
    color: '#fff',
    marginBottom: 5,
  },
  acoes: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  botaoEditar: {
    marginRight: 10,
    backgroundColor: '#28a745',
    padding: 8,
    borderRadius: 5,
  },
  botaoExcluir: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 5,
  },
    titulo: {
      color: '#fff',
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 20,
      alignSelf: 'center',
    },
    vazio: {
      color: '#ccc',
      fontSize: 18,
      alignSelf: 'center',
      marginTop: 30,
    },
    botaoSintoma: {
      backgroundColor: '#00AAFF',
      padding: 8,
      borderRadius: 5,
      marginLeft: 10,
    },
});
