// ListaPressao.js
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
import { criarEstilosListaPressao } from '../estilos/listaPressao';

const ListaPressao = () => {
  const [registros, setRegistros] = useState([]);
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  const { config, temas } = useConfiguracoes();
  const tema = temas[config.tema];
  const fonte = tamanhosFonte[config.fonte];
  const styles = criarEstilosListaPressao(tema, fonte);
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
        .collection('pressoes')
        .where('usuarioId', '==', user.uid)
        .where('timestamp', '>=', inicio)
        .where('timestamp', '<=', fim)
        .orderBy('timestamp', 'desc')
        .get();

      const lista = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });

      setRegistros(lista);
    } catch (erro) {
      console.error('Erro ao carregar pressões:', erro);
      Alert.alert('Erro', 'Não foi possível carregar os registros de pressão.');
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
            await firestore().collection('pressoes').doc(id).delete();
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
    navigation.navigate('InserirPressao', { pressao: item });
  };

  const corClassificacao = (classificacao) => {
    switch (classificacao) {
      case 'Crise hipertensiva': return '#ff0000';
      case 'Hipertensão estágio 2': return '#ff4500';
      case 'Hipertensão estágio 1': return '#ff8c00';
      case 'Pré-hipertensão': return '#ffd700';
      case 'Normal': return '#32cd32';
      default: return tema.cardFundo || '#1E1E1E';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Pressões Arteriais</Text>

      <View style={styles.topoLinha}>
        <TouchableOpacity onPress={() => setMostrarCalendario(true)}>
          <Text style={styles.dataTexto}>📅 {formatarData(dataSelecionada)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoAdd}
          onPress={() => navigation.navigate('InserirPressao')}
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

      <FlatList
        data={registros}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: corClassificacao(item.classificacao) }]}>
            <View style={styles.cardConteudo}>
              <View>
                <Text style={styles.textoCard}>
                  {item.sistolica}/{item.diastolica} mmHg
                </Text>
                <Text style={styles.hora}>{formatarHora(item.timestamp)}</Text>
                <Text style={styles.hora}>Classificação: {item.classificacao}</Text>
                {item.observacao ? <Text style={styles.hora}>Obs: {item.observacao}</Text> : null}
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

export default ListaPressao;
