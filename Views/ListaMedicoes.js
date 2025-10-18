import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { buscarMedicoesUsuario, deletarMedicao } from '../firebaseService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { formatarData } from '../utils/dataUtils';
import { useConfiguracoes, tamanhosFonte } from './Configuracoes';
import { criarEstilos } from '../estilos/listaMedicoes';

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
      <Text style={styles.texto}>
        Categoria: {item.categoria.charAt(0).toUpperCase() + item.categoria.slice(1).toLowerCase()}
      </Text>
      <Text style={styles.texto}>Data: {formatarData(item.timestamp)}</Text>

      {item.observacao != null && item.observacao.toString().trim() !== '' && (
        <Text style={styles.texto}>Observações: {item.observacao}</Text>
      )}

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
