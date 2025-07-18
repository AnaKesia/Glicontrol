import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import notifee, {
  TriggerType,
  RepeatFrequency,
  AndroidImportance,
} from '@notifee/react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useConfiguracoes, tamanhosFonte } from './Configuracoes';

const ListaRemedios = ({ navigation }) => {
  const { config, temas } = useConfiguracoes();
  const tema = temas[config.tema];
  const tamanhoFonte = tamanhosFonte[config.fonte];

  const [medicamentos, setMedicamentos] = useState([]);

  useEffect(() => {
    const userId = auth().currentUser?.uid;
    const unsubscribe = firestore()
      .collection('medicamentos')
      .where('userid', '==', userId)
      .onSnapshot(async snapshot => {
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        lista.sort((a, b) => {
          const ha = a.Horarios?.[0] || '';
          const hb = b.Horarios?.[0] || '';
          return ha.localeCompare(hb);
        });

        setMedicamentos(lista);
        await agendarTodasNotificacoes(lista);
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
      tema={tema}
      tamanhoFonte={tamanhoFonte}
    />
  );

  const styles = criarEstilos(tema, tamanhoFonte);

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

const ItemMedicamento = ({ item, onEditar, onExcluir, onConfirmarUso, tema, tamanhoFonte }) => {
  const renderHorarios = () => {
    if (Array.isArray(item.Horarios) && item.Horarios.length > 0) {
      return <Text style={{ color: tema.texto, fontSize: tamanhoFonte }}>Horários: {item.Horarios.join(', ')}</Text>;
    } else if (item.IntervaloHoras) {
      return <Text style={{ color: tema.texto, fontSize: tamanhoFonte }}>A cada {item.IntervaloHoras} horas</Text>;
    } else if (item.Horário) {
      return <Text style={{ color: tema.texto, fontSize: tamanhoFonte }}>Horário: {item.Horário}</Text>;
    } else {
      return <Text style={{ color: tema.texto, fontSize: tamanhoFonte }}>Sem horário definido</Text>;
    }
  };

  const styles = criarEstilos(tema, tamanhoFonte);

  return (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.nome}>{item.Nome}</Text>
        <Text style={{ color: tema.texto, fontSize: tamanhoFonte }}>Dose: {item.Dose}</Text>
        {renderHorarios()}
        {item.Observações ? (
          <Text style={{ color: tema.texto, fontSize: tamanhoFonte }}>Obs: {item.Observações}</Text>
        ) : null}
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
};

const criarEstilos = (tema, fontSize) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: tema.fundo,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderBottomWidth: 1,
      borderColor: tema.borda || '#ccc',
    },
    nome: {
      fontWeight: 'bold',
      fontSize: fontSize,
      color: tema.texto,
    },
    empty: {
      textAlign: 'center',
      marginTop: 50,
      fontSize: fontSize,
      color: tema.texto + 'bb',
    },
    addButton: {
      position: 'absolute',
      right: 20,
      bottom: 20,
      backgroundColor: tema.botaoFundo,
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

export default ListaRemedios;
