import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';

const ListaUsoMedicamento = ({ navigation }) => {
  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const userId = auth().currentUser?.uid;
    if (!userId) return;

    const unsubscribe = firestore()
      .collection('usoMedicamentos')
      .where('usuarioId', '==', userId)
      .orderBy('timestamp', 'desc')
      .onSnapshot(snapshot => {
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRegistros(lista);
        setCarregando(false);
      }, error => {
        console.error('Erro ao buscar registros:', error);
        setCarregando(false);
      });

    return unsubscribe;
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={{ marginRight: 16 }} disabled>
          <Icon name="menu-book" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const confirmarExclusao = (id) => {
    Alert.alert('Excluir', 'Deseja excluir este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await firestore().collection('usoMedicamentos').doc(id).delete();
            // Remove localmente para atualizar a lista instantaneamente
            setRegistros(prev => prev.filter(item => item.id !== id));
          } catch (err) {
            console.error('Erro ao excluir:', err);
            Alert.alert('Erro', 'Não foi possível excluir o registro.');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    let dataTexto = 'Data inválida';
    try {
      if (item.timestamp?.toDate) {
        dataTexto = format(new Date(item.timestamp.toDate()), 'dd/MM/yyyy HH:mm');
      }
    } catch (e) {
      console.warn('Erro ao formatar data:', e);
    }

    return (
      <View style={styles.item}>
        <Text style={styles.texto}>
          <Text style={styles.bold}>Medicamento:</Text> {item.NomeMedicamento || 'Desconhecido'}
        </Text>
        <Text style={styles.texto}>
          <Text style={styles.bold}>Dose:</Text> {item.dose ?? '-'}
        </Text>
        <Text style={styles.texto}>
          <Text style={styles.bold}>Tomado:</Text> {item.tomou ? 'Sim' : 'Não'}
        </Text>
        <Text style={styles.texto}>
          <Text style={styles.bold}>Data:</Text> {dataTexto}
        </Text>

        {item.observacoes?.trim() ? (
          <Text style={styles.texto}>
            <Text style={styles.bold}>Observações:</Text> {item.observacoes.trim()}
          </Text>
        ) : null}

        <View style={styles.botoes}>
          <TouchableOpacity
            style={styles.botaoEditar}
            onPress={() => navigation.navigate('ConfirmarUsoMedicamento', { editar: true, dados: item })}
          >
            <Icon name="edit" size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.botaoExcluir}
            onPress={() => confirmarExclusao(item.id)}
          >
            <Icon name="delete" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };


  if (carregando) {
    return (
      <View style={styles.carregando}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={registros}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum registro encontrado.</Text>}
      />
    </View>
  );
};

export default ListaUsoMedicamento;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#001f3f', padding: 16 },
  item: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  texto: { color: '#fff', marginBottom: 4 },
  bold: { fontWeight: 'bold' },
  botoes: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  botaoEditar: { padding: 6, backgroundColor: '#fff', borderRadius: 6 },
  botaoExcluir: { padding: 6, backgroundColor: '#dc3545', borderRadius: 6 },
  vazio: { color: '#ccc', fontSize: 16, textAlign: 'center', marginTop: 30 },
  carregando: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
