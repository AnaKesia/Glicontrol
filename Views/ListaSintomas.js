import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { buscarSintomasPorUsuario, buscarMedicaoPorId, deletarSintoma } from '../firebaseService';
import { formatarData } from '../utils/dataUtils';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useConfiguracoes } from './Configuracoes';

const ListaSintomas = () => {
  const [sintomas, setSintomas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const navigation = useNavigation();

  const { config, temas, tamanhosFonte } = useConfiguracoes();
  const tema = temas[config.tema];
  const tamanhoBase = tamanhosFonte[config.fonte];
  const styles = criarEstilos(tema, tamanhoBase);

  const carregarDados = async () => {
    try {
      const lista = await buscarSintomasPorUsuario();

      const sintomasComGlicemia = await Promise.all(
        lista.map(async (s) => {
          let valorGlicemia = '?';
          try {
            const medicao = await buscarMedicaoPorId(s.glicemiaId);
            valorGlicemia = medicao?.valor ?? '?';
          } catch (e) {
            console.log('Erro ao buscar medição:', e);
          }
          return { ...s, valorGlicemia };
        })
      );

      const sintomasOrdenados = sintomasComGlicemia.sort((a, b) => {
        const dataA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
        const dataB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
        return dataB - dataA;
      });

      setSintomas(sintomasOrdenados);
    } catch (e) {
      console.error('Erro ao carregar sintomas:', e);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', carregarDados);
    return unsubscribe;
  }, [navigation]);

  const confirmarExclusao = (id) => {
    Alert.alert('Confirmar', 'Deseja excluir este sintoma?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await deletarSintoma(id);
          carregarDados();
        },
      },
    ]);
  };

  const irParaEdicao = (sintoma) => {
    navigation.navigate('RegistrarSintoma', { sintoma });
  };

  if (carregando) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={tema.botaoFundo} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Sintomas Registrados</Text>
      <FlatList
        data={sintomas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.texto}>Sintomas: {Array.isArray(item.sintoma) ? item.sintoma.join(', ') : item.sintoma}</Text>
            <Text style={styles.texto}>Intensidade: {item.intensidade}</Text>
            {item.anotacao ? <Text style={styles.texto}>Anotação: {item.anotacao}</Text> : null}
            <Text style={styles.texto}>Glicemia: {item.valorGlicemia} mg/dL</Text>
            <Text style={styles.texto}>Data: {formatarData(item.timestamp)}</Text>
            <View style={styles.acoes}>
              <TouchableOpacity onPress={() => irParaEdicao(item)} style={styles.botaoEditar}>
                <Icon name="edit" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmarExclusao(item.id)} style={styles.botaoExcluir}>
                <Icon name="delete" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum sintoma registrado.</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default ListaSintomas;

const criarEstilos = (tema, tamanhoBase) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tema.fundo,
      padding: 20,
    },
    titulo: {
      color: tema.texto,
      fontSize: tamanhoBase + 6,
      fontWeight: 'bold',
      marginBottom: 20,
      alignSelf: 'center',
    },
    item: {
      backgroundColor: tema.botaoFundo,
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
    },
    texto: {
      color: tema.botaoTexto,
      fontSize: tamanhoBase,
      marginBottom: 5,
    },
    vazio: {
      color: tema.texto,
      fontSize: tamanhoBase + 2,
      alignSelf: 'center',
      marginTop: 30,
    },
    acoes: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 10,
    },
    botaoEditar: {
      backgroundColor: '#28a745',
      padding: 8,
      borderRadius: 5,
      marginRight: 10,
    },
    botaoExcluir: {
      backgroundColor: '#dc3545',
      padding: 8,
      borderRadius: 5,
    },
  });
