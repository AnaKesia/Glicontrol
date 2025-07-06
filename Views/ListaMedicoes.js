import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { buscarMedicoesUsuario, deletarMedicao } from '../firebaseService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { formatarData } from '../utils/dataUtils';
import { useConfiguracoes, tamanhosFonte } from './Configuracoes';

const ListaMedicoes = () => {
  const navigation = useNavigation();
  const [medicoes, setMedicoes] = useState([]);

  const { config, temas } = useConfiguracoes();
  const tema = temas[config.tema];
  const fonteBase = tamanhosFonte[config.fonte];
  const styles = criarEstilos(tema, fonteBase);

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

  const renderItem = ({ item }) => (
    <ItemMedicao
      item={item}
      onEditar={() => navigation.navigate('InserirGlicemia', { medicao: item })}
      onExcluir={() => confirmarRemocao(item.id)}
      tema={tema}
      fonteBase={fonteBase}
    />
  );

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

const ItemMedicao = ({ item, onEditar, onExcluir, tema, fonteBase }) => {
  const navigation = useNavigation();
  const styles = criarEstilos(tema, fonteBase);

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

const criarEstilos = (tema, fonteBase) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tema.fundo,
      padding: 20,
    },
    titulo: {
      color: tema.texto,
      fontSize: fonteBase + 4,
      fontWeight: '700',
      marginBottom: 20,
      alignSelf: 'center',
    },
   item: {
      backgroundColor: tema.cartao,
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
    },
    texto: {
      color: tema.texto,
      fontSize: fonteBase,
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
    botaoSintoma: {
      backgroundColor: '#00AAFF',
      padding: 8,
      borderRadius: 5,
      marginLeft: 10,
    },
    vazio: {
      color: tema.textoSecundario ?? tema.texto,
      fontSize: fonteBase + 2,
      alignSelf: 'center',
      marginTop: 30,
    },
  });
