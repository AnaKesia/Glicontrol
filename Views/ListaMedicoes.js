import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { buscarMedicoesUsuario, deletarMedicao } from '../firebaseService';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ListaMedicoes = () => {
  const navigation = useNavigation();
  const [medicoes, setMedicoes] = useState([]);

  const carregarMedicoes = async () => {
    const dados = await buscarMedicoesUsuario();
    setMedicoes(dados);
  };

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
  }, [navigation]);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.texto}>Valor: {item.valor} mg/dL</Text>
      <Text style={styles.texto}>
        Categoria: {item.categoria.charAt(0).toUpperCase() + item.categoria.slice(1).toLowerCase()}
      </Text>
        <Text style={styles.texto}>
          Data:{' '}
          {item.timestamp && item.timestamp.seconds ? (
            new Date(item.timestamp.seconds * 1000).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          ) : (
            'Data inválida'
          )}
        </Text>

      {item.observacoes !== undefined && item.observacoes.trim() !== '' && (
        <Text style={styles.texto}>Observações: {item.observacoes}</Text>
      )}
      <View style={styles.acoes}>
        <TouchableOpacity
          onPress={() => navigation.navigate('InserirGlicemia', { medicao: item })}
          style={styles.botaoEditar}
        >
          <Icon name="edit" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => confirmarRemocao(item.id)} style={styles.botaoExcluir}>
          <Icon name="delete" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
    <Text style={{ color: 'white', marginBottom: 10 }}>Lista de Medições:</Text>
     <FlatList
       data={medicoes}
       keyExtractor={(item) => item.id}
       renderItem={renderItem}
       contentContainerStyle={{ paddingBottom: 20 }}
       ListEmptyComponent={
         <Text style={{ color: 'white', textAlign: 'center', marginTop: 20 }}>
           Nenhuma medição encontrada
         </Text>
       }
     />
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
});
