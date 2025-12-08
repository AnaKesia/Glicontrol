import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useConfiguracoes, tamanhosFonte } from './Configuracoes';
import { criarEstilos } from '../estilos/listaAgua';

const ListaAgua = () => {
  const [registros, setRegistros] = useState([]);
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [totalDia, setTotalDia] = useState(0);

  const { config, temas } = useConfiguracoes();
  const tema = temas[config.tema];
  const fonte = tamanhosFonte[config.fonte];
  const styles = criarEstilos(tema, fonte);
  const navigation = useNavigation();

  const carregarRegistros = async () => {
    try {
      const user = auth().currentUser;
      if (!user) return;

      const inicio = new Date(dataSelecionada);
      inicio.setHours(0, 0, 0, 0);
      const fim = new Date(dataSelecionada);
      fim.setHours(23, 59, 59, 999);

      const querySnapshot = await firestore()
        .collection('agua')
        .where('usuarioId', '==', user.uid)
        .where('timestamp', '>=', inicio)
        .where('timestamp', '<=', fim)
        .orderBy('timestamp', 'desc')
        .get();

      const lista = [];
      let total = 0;

      querySnapshot.forEach((doc) => {
        const dados = doc.data();
        lista.push({ id: doc.id, ...dados });
        total += dados.quantidade || 0;
      });

      setRegistros(lista);
      setTotalDia(total);
    } catch (erro) {
      console.error('Erro ao carregar água:', erro);
      Alert.alert('Erro', 'Não foi possível carregar os registros de água.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarRegistros();
    }, [dataSelecionada])
  );

  const formatarHora = (timestamp) => {
    if (!timestamp) return '';
    const data = timestamp.toDate ? timestamp.toDate() : timestamp;
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatarData = (data) =>
    data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const excluirRegistro = (id) => {
    Alert.alert('Excluir', 'Deseja excluir este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await firestore().collection('agua').doc(id).delete();
            carregarRegistros();
          } catch (erro) {
            console.error('Erro ao excluir registro:', erro);
            Alert.alert('Erro', 'Não foi possível excluir o registro.');
          }
        },
      },
    ]);
  };

  const editarRegistro = (item) => {
    navigation.navigate('InserirAgua', { registroEdicao: item });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Água Consumida</Text>

      <View style={styles.topoLinha}>
        <TouchableOpacity onPress={() => setMostrarCalendario(true)}>
          <Text style={styles.dataTexto}>📅 {formatarData(dataSelecionada)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoAdd}
          onPress={() => navigation.navigate('InserirAgua')}
        >
          <Icon name="plus" size={24} color={tema.botaoTexto} />
        </TouchableOpacity>
      </View>

      {mostrarCalendario && (
        <DateTimePicker
          value={dataSelecionada}
          mode="date"
          display="calendar"
          onChange={(event, selectedDate) => {
            setMostrarCalendario(false);
            if (selectedDate) setDataSelecionada(selectedDate);
          }}
        />
      )}

      <Text style={styles.total}>Total do dia: {totalDia} ml</Text>

      <FlatList
        data={registros}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardConteudo}>
              <View>
                <Text style={styles.textoCard}>{item.quantidade} ml</Text>
                <Text style={styles.hora}>{formatarHora(item.timestamp)}</Text>
              </View>

              <View style={styles.acoes}>
                <TouchableOpacity onPress={() => editarRegistro(item)} style={styles.botaoAcao}>
                  <Icon name="pencil" size={22} color={tema.botaoTexto} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => excluirRegistro(item.id)} style={styles.botaoAcao}>
                  <Icon name="delete" size={22} color="#ff4d4d" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhum registro neste dia.</Text>
        }
        contentContainerStyle={registros.length === 0 && { flexGrow: 1, justifyContent: 'center' }}
      />
    </View>
  );
};

export default ListaAgua;
