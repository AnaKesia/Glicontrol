import React, {
  useState, useCallback, useMemo,
} from 'react';
import {
  View, Text, SectionList, TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import {
  useFocusEffect, useNavigation,
} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  isToday, isYesterday, format,
} from 'date-fns';
import firestore from '@react-native-firebase/firestore';
import { Alert } from 'react-native';

import { buscarAtividadesFisicasUsuario } from '../firebaseService';
import {
  useConfiguracoes, tamanhosFonte,
} from './Configuracoes';
import {
  criarEstilosListaAtividadesFisicas,
} from '../estilos/listaAtividadesFisicas';

export default function ListaAtividadesFisicas() {
  const navigation = useNavigation();

  const { config, temas } = useConfiguracoes();
  const temaAtual = temas[config.tema];
  const fonteAtual = tamanhosFonte[config.fonte];
  const styles = criarEstilosListaAtividadesFisicas(
    temaAtual, fonteAtual
  );

  const [atividades, setAtividades] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('Todas');

  const tiposFiltro = [
    'Todas', 'Caminhada', 'Corrida',
    'Bicicleta', 'Musculação', 'Alongamento',
    'Dança', 'Yoga', 'Outro',
  ];

  const carregarAtividades = async () => {
    try {
      const dados =
        await buscarAtividadesFisicasUsuario();
      setAtividades(dados);
    } catch (error) {
      console.log(
        'Erro ao buscar atividades:',
        error
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarAtividades();
    }, [])
  );

  const atividadesFiltradas = useMemo(() => {
    if (filtroTipo === 'Todas')
      return atividades;

    return atividades.filter(
      a => a.tipo === filtroTipo
    );
  }, [atividades, filtroTipo]);

  const atividadesAgrupadas = useMemo(() => {
    const grupos = {};

    atividadesFiltradas.forEach(item => {
      if (!item.timestamp) return;

      const data = item.timestamp;
      let chave;
      let titulo;

      if (isToday(data)) {
        chave = 'hoje';
        titulo = 'Hoje';
      } else if (isYesterday(data)) {
        chave = 'ontem';
        titulo = 'Ontem';
      } else {
        chave = format(data, 'yyyy-MM-dd');
        titulo = format(data, 'dd/MM/yyyy');
      }

      if (!grupos[chave]) {
        grupos[chave] = {
          title: titulo,
          data: [],
          totalMinutos: 0,
        };
      }

      grupos[chave].data.push(item);
      grupos[chave].totalMinutos += item.minutos || 0;
    });

    return Object.values(grupos);
  }, [atividadesFiltradas]);

  const renderItem = ({ item }) => {
    const tipoExibido =
      item.tipo === 'Outro' && item.tipoPersonalizado
        ? item.tipoPersonalizado
        : item.tipo;

    return (
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.tipo}>{tipoExibido}</Text>
            <Text style={styles.minutos}>⏱ {item.minutos} minutos</Text>
          </View>

          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('RegistroAtividade', { editar: true, dados: item })
              }
              style={{ marginRight: 15 }}
            >
              <Icon name="edit" size={22} color={temaAtual.botaoFundo} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={async () => {
                try {
                  await firestore()
                    .collection('atividadesFisicas')
                    .doc(item.id)
                    .delete();

                  Alert.alert('Sucesso', 'Atividade excluída!');
                  carregarAtividades();
                } catch (e) {
                  console.error(e);
                  Alert.alert('Erro', 'Não foi possível excluir.');
                }
              }}
            >
              <Icon name="delete" size={22} color="red" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };


  const renderSectionHeader = ({
    section,
  }) => (
    <View style={styles.secaoHeader}>
      <Text style={styles.secaoTitulo}>
        {section.title}
      </Text>

      <Text style={styles.secaoTotal}>
        {section.totalMinutos} min
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        Atividades Físicas
      </Text>

      <Text style={styles.label}>
        Filtrar por tipo
      </Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={filtroTipo}
          onValueChange={setFiltroTipo}
          style={{ fontSize: fonteAtual, color: temaAtual.texto }}
          itemStyle={{ fontSize: fonteAtual, color: temaAtual.texto }}
        >
          {tiposFiltro.map(tipo => (
            <Picker.Item
              key={tipo}
              label={tipo}
              value={tipo}
            />
          ))}
        </Picker>
      </View>

      <SectionList
        sections={atividadesAgrupadas}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
        ListEmptyComponent={
          <Text style={styles.vazio}>
            Nenhuma atividade registrada.
          </Text>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate(
            'RegistroAtividade'
          )
        }
      >
        <Icon
          name="add"
          size={28}
          color={temaAtual.botaoTexto}
        />
      </TouchableOpacity>
    </View>
  );
}
