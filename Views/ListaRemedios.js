import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';

const ListaRemedios = ({ navigation }) => {
  const [medicamentos, setMedicamentos] = useState([]);

  useEffect(() => {
    const userId = auth().currentUser?.uid;
    const unsubscribe = firestore()
      .collection('medicamentos')
      .where('userid', '==', userId)
      .onSnapshot(snapshot => {
        const lista = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => a.Horário.localeCompare(b.Horário));
        setMedicamentos(lista);
      });

    return unsubscribe;
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('ListaUsoMedicamento')}
          style={{ marginRight: 16 }}
        >
          <Icon name="menu-book" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const confirmarExclusao = (id) => {
    Alert.alert('Excluir', 'Deseja excluir este medicamento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sim',
        onPress: async () => {
          await firestore().collection('medicamentos').doc(id).delete();
          setMedicamentos(prev => prev.filter(item => item.id !== id));
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <ItemMedicamento
      item={item}
      onEditar={() => navigation.navigate('CadastrarMedicamento', { editar: true, dados: item })}
      onExcluir={() => confirmarExclusao(item.id)}
      onConfirmarUso={() => navigation.navigate('ConfirmarUsoMedicamento', { medicamento: item })}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={medicamentos}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum medicamento cadastrado.</Text>}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('CadastrarMedicamento')}
      >
        <Icon name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const ItemMedicamento = ({ item, onEditar, onExcluir, onConfirmarUso }) => (
  <View style={styles.item}>
    <View style={{ flex: 1 }}>
      <Text style={styles.nome}>{item.Nome}</Text>
      <Text>Dose: {item.Dose}</Text>
      <Text>Horário: {item.Horário}</Text>
      {item.Observações ? <Text>Obs: {item.Observações}</Text> : null}
    </View>
    <View style={styles.buttonsContainer}>
      <TouchableOpacity onPress={onEditar} style={styles.editButton}>
        <Icon name="edit" size={24} color="#007AFF" />
      </TouchableOpacity>
      <TouchableOpacity onPress={onExcluir} style={styles.deleteButton}>
        <Icon name="delete" size={24} color="red" />
      </TouchableOpacity>
      <TouchableOpacity onPress={onConfirmarUso} style={styles.checkButton}>
        <Icon name="check-circle" size={24} color="green" />
      </TouchableOpacity>
    </View>
  </View>
);

export default ListaRemedios;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  nome: { fontWeight: 'bold', fontSize: 16 },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#007AFF',
    borderRadius: 30,
    padding: 16,
    elevation: 5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  checkButton: {
    padding: 8,
  },
});
