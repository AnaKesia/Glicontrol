import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
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
  const [filtro, setFiltro] = useState('');

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
          style={{ marginRight: 16, flexDirection: 'row', alignItems: 'center' }}
        >
          <Icon name="menu-book" size={24} color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 6, fontSize: 16 }}>Registros</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const medicamentosFiltrados = useMemo(() => {
    if (!filtro.trim()) return medicamentos;
    return medicamentos.filter(item =>
      (item.Nome || '').toLowerCase().includes(filtro.toLowerCase())
    );
  }, [medicamentos, filtro]);

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
      {/* Título */}
      <Text style={styles.titulo}>Meus Medicamentos</Text>

      {/* Busca */}
      <View style={styles.filtroContainer}>
        <Icon name="search" size={20} color="#666" style={styles.filtroIcon} />
        <TextInput
          style={styles.filtroInput}
          placeholder="Buscar medicamento..."
          placeholderTextColor="#999"
          value={filtro}
          onChangeText={setFiltro}
        />
        {filtro ? (
          <TouchableOpacity onPress={() => setFiltro('')} style={{ padding: 4 }}>
            <Icon name="close" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={medicamentosFiltrados}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {filtro ? 'Nenhum medicamento encontrado.' : 'Nenhum medicamento cadastrado.'}
          </Text>
        }
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
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
          <Text style={{ fontSize: 16, marginRight: 6 }}>🕐</Text>
          <Text style={{ color: tema.texto, fontSize: tamanhoFonte }}>
            {item.Horarios.join(', ')}
          </Text>
        </View>
      );
    } else if (item.IntervaloHoras) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
          <Text style={{ fontSize: 16, marginRight: 6 }}>⏱️</Text>
          <Text style={{ color: tema.texto, fontSize: tamanhoFonte }}>
            A cada {item.IntervaloHoras}h
          </Text>
        </View>
      );
    } else if (item.Horário) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
          <Text style={{ fontSize: 16, marginRight: 6 }}>🕐</Text>
          <Text style={{ color: tema.texto, fontSize: tamanhoFonte }}>
            {item.Horário}
          </Text>
        </View>
      );
    } else {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
          <Text style={{ fontSize: 16, marginRight: 6 }}>🕐</Text>
          <Text style={{ color: tema.texto, fontSize: tamanhoFonte, opacity: 0.6 }}>
            Sem horário definido
          </Text>
        </View>
      );
    }
  };

  const styles = criarEstilos(tema, tamanhoFonte);

  return (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 20, marginRight: 8 }}>💊</Text>
          <Text style={styles.nome}>{item.Nome}</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
          <Text style={{ fontSize: 16, marginRight: 6 }}>📏</Text>
          <Text style={{ color: tema.texto, fontSize: tamanhoFonte }}>
            {item.Dose}
          </Text>
        </View>

        {renderHorarios()}

        {item.Observações ? (
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginVertical: 4 }}>
            <Text style={{ fontSize: 16, marginRight: 6 }}>📝</Text>
            <Text style={{ color: tema.texto, fontSize: tamanhoFonte, flex: 1 }}>
              {item.Observações}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={onEditar} style={styles.editButton}>
          <Icon name="edit" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onExcluir} style={styles.deleteButton}>
          <Icon name="delete" size={24} color="#ef4444" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onConfirmarUso} style={styles.checkButton}>
          <Icon name="check-circle" size={24} color="#22c55e" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ListaRemedios;
