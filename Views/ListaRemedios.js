import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import notifee, { TriggerType, RepeatFrequency, AndroidImportance,
} from '@notifee/react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useConfiguracoes, tamanhosFonte } from './Configuracoes';
import { criarEstilos } from '../estilos/listaRemedios';

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

  // 🧹 Função para cancelar todas as notificações associadas a um medicamento
  const cancelarNotificacoesDoMedicamento = async (id) => {
    try {
      const doc = await firestore().collection('medicamentos').doc(id).get();
      if (doc.exists) {
        const dados = doc.data();
        const notificationIds = dados.notificationIds || [];
        if (notificationIds.length > 0) {
          for (const nId of notificationIds) {
            try {
              await notifee.cancelNotification(nId);
            } catch (erro) {
              console.warn('Erro ao cancelar notificação:', erro);
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao cancelar notificações:', error);
    }
  };

  // 🗑️ Função de exclusão com cancelamento de notificações
  const confirmarExclusao = (id) => {
    Alert.alert('Excluir', 'Deseja excluir este medicamento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sim',
        onPress: async () => {
          try {
            await cancelarNotificacoesDoMedicamento(id);
            await firestore().collection('medicamentos').doc(id).delete();
            setMedicamentos(prev => prev.filter(item => item.id !== id));
          } catch (error) {
            console.error('Erro ao excluir medicamento:', error);
            Alert.alert('Erro ao excluir o medicamento');
          }
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

export default ListaRemedios;
