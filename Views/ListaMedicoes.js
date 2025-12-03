import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { formatarData } from '../utils/dataUtils';
import { buscarMedicoesUsuario, deletarMedicao } from '../firebaseService';
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
    try {
      const dados = await buscarMedicoesUsuario();

      const medicoesFormatadas = dados.map((m) => ({
        ...m,
        sintomas: Array.isArray(m.sintomas) ? m.sintomas : [],
        intensidade: m.sintomas && m.sintomas.length > 0 ? m.intensidade || '' : '',
      }));

      setMedicoes(medicoesFormatadas);
    } catch (error) {
      console.log('Erro ao carregar medições:', error);
    }
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
  const styles = criarEstilos(tema, fonteBase);

  return (
    <View style={styles.item}>
      <Text style={styles.texto}>Valor: {item.valor} mg/dL</Text>
      <Text style={styles.texto}>
        Categoria: {item.categoria.charAt(0).toUpperCase() + item.categoria.slice(1).toLowerCase()}
      </Text>
      <Text style={styles.texto}>Data: {formatarData(item.timestamp)}</Text>

      {item.sintomas.length > 0 && (
        <>
          <Text style={styles.texto}>Sintomas: {item.sintomas.join(', ')}</Text>
          <Text style={styles.texto}>Intensidade: {item.intensidade}</Text>
        </>
      )}

      {item.observacao ? (
        <Text style={styles.texto}>Observações: {item.observacao}</Text>
      ) : null}

      <View style={styles.acoes}>
        <TouchableOpacity onPress={onEditar} style={styles.botaoEditar}>
          <Icon name="edit" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onExcluir} style={styles.botaoExcluir}>
          <Icon name="delete" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ListaMedicoes;
