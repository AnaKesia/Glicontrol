import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format, isToday, isYesterday, startOfWeek, isSameDay } from 'date-fns';
import { useConfiguracoes, tamanhosFonte } from './Configuracoes';
import { criarEstilos } from '../estilos/listaUsoMedicamentos';

const ListaUsoMedicamento = ({ navigation }) => {
  const { config, temas } = useConfiguracoes();
  const tema = temas[config.tema];
  const tamanhoFonte = tamanhosFonte[config.fonte];

  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [medicamentosUnicos, setMedicamentosUnicos] = useState([]);
  const [mostrarToggle, setMostrarToggle] = useState(false);

  useEffect(() => {
    const userId = auth().currentUser?.uid;
    if (!userId) return;

    const unsubscribe = firestore()
      .collection('usoMedicamentos')
      .where('usuarioId', '==', userId)
      .orderBy('timestamp', 'desc')
      .onSnapshot(snapshot => {
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRegistros(lista);

        const unicos = [...new Set(lista
          .map(item => item.NomeMedicamento)
          .filter(Boolean)
        )].sort();
        setMedicamentosUnicos(unicos);

        setCarregando(false);
      }, error => {
        console.error('Erro ao buscar registros:', error);
        setCarregando(false);
      });

    return unsubscribe;
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={{ marginRight: 16 }} disabled>
          <Icon name="menu-book" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const confirmarExclusao = (id) => {
    Alert.alert('Excluir', 'Deseja excluir este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await firestore().collection('usoMedicamentos').doc(id).delete();
            setRegistros(prev => prev.filter(item => item.id !== id));
            Alert.alert('Sucesso', 'Registro excluído!');
          } catch (err) {
            console.error('Erro ao excluir:', err);
            Alert.alert('Erro', 'Não foi possível excluir o registro.');
          }
        },
      },
    ]);
  };

  const registrosFiltrados = useMemo(() => {
    if (!filtro.trim()) return registros;
    return registros.filter(item =>
      (item.NomeMedicamento || '').toLowerCase().includes(filtro.toLowerCase())
    );
  }, [registros, filtro]);

  const registrosAgrupados = useMemo(() => {
    const grupos = {};

    registrosFiltrados.forEach(item => {
      let chaveData;
      let labelData;

      try {
        if (item.timestamp?.toDate) {
          const data = new Date(item.timestamp.toDate());

          if (isToday(data)) {
            chaveData = 'hoje';
            labelData = 'Hoje';
          } else if (isYesterday(data)) {
            chaveData = 'ontem';
            labelData = 'Ontem';
          } else if (isSameDay(data, startOfWeek(new Date()))) {
            chaveData = 'semana';
            labelData = 'Esta semana';
          } else {
            chaveData = format(data, 'dd/MM/yyyy');
            labelData = format(data, 'dd/MM/yyyy');
          }

          if (!grupos[chaveData]) {
            grupos[chaveData] = { label: labelData, dados: [] };
          }
          grupos[chaveData].dados.push(item);
        }
      } catch (e) {
        console.warn('Erro ao agrupar por data:', e);
      }
    });

    return Object.values(grupos);
  }, [registrosFiltrados]);

  const styles = criarEstilos(tema, tamanhoFonte, config.tema);

  const renderItem = ({ item }) => {
    let dataTexto = 'Data inválida';
    try {
      if (item.timestamp?.toDate) {
        dataTexto = format(new Date(item.timestamp.toDate()), 'HH:mm');
      }
    } catch (e) {
      console.warn('Erro ao formatar data:', e);
    }

    const tomouMedicamento = item.tomou;

    return (
      <View style={styles.item}>
        <View style={styles.itemHeader}>
          <View style={styles.medicamentoInfo}>
            <Icon name="medical-services" size={20} color={tema.botaoTexto} style={styles.icone} />
            <View style={styles.textoContainer}>
              <Text style={styles.textoMedicamento}>{item.NomeMedicamento || 'Desconhecido'}</Text>
              <Text style={styles.dose}>{item.dose ?? '-'}</Text>
            </View>
          </View>

          <View style={styles.statusContainer}>
            {tomouMedicamento ? (
              <View style={styles.statusTomou}>
                <Icon name="check-circle" size={24} color="#22c55e" />
                <Text style={styles.statusTextoVerde}>Tomado</Text>
              </View>
            ) : (
              <View style={styles.statusNaoTomou}>
                <Icon name="cancel" size={24} color="#ef4444" />
                <Text style={styles.statusTextoVermelho}>Não tomado</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.infoSecundaria}>
          <Icon name="access-time" size={16} color={tema.botaoTexto} style={{ marginRight: 6 }} />
          <Text style={styles.texto}>{dataTexto}</Text>
        </View>

        {item.observacoes?.trim() ? (
          <View style={styles.observacoesContainer}>
            <Icon name="notes" size={16} color={tema.botaoTexto} style={{ marginRight: 6 }} />
            <Text style={styles.observacoes}>{item.observacoes.trim()}</Text>
          </View>
        ) : null}

        <View style={styles.botoes}>
          <TouchableOpacity
            style={styles.botaoEditar}
            onPress={() => navigation.navigate('ConfirmarUsoMedicamento', { editar: true, dados: item })}
          >
            <Icon name="edit" size={18} color={tema.texto} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.botaoExcluir}
            onPress={() => confirmarExclusao(item.id)}
          >
            <Icon name="delete" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.label}</Text>
      <Text style={styles.sectionCount}>{section.dados.length}</Text>
    </View>
  );

  if (carregando) {
    return (
      <View style={styles.carregando}>
        <ActivityIndicator size="large" color={tema.botaoFundo} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Lista de uso dos medicamentos</Text>

      <View style={styles.filtroContainer}>
        <Icon name="search" size={20} color={tema.texto} style={styles.filtroIcon} />
        <TextInput
          style={styles.filtroInput}
          placeholder="Filtrar por medicamento..."
          placeholderTextColor="#999"
          value={filtro}
          onChangeText={setFiltro}
        />
        {filtro ? (
          <TouchableOpacity onPress={() => setFiltro('')}>
            <Icon name="close" size={20} color={tema.texto} />
          </TouchableOpacity>
        ) : null}
      </View>

      {medicamentosUnicos.length > 0 && (
        <View>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setMostrarToggle(!mostrarToggle)}
          >
            <Icon name="filter-list" size={18} color="#fff" />
            <Text style={styles.toggleTexto}>
              {filtro ? `Filtrado: ${filtro}` : 'Medicamentos'}
            </Text>
            <Icon
              name={mostrarToggle ? "expand-less" : "expand-more"}
              size={18}
              color="#fff"
            />
          </TouchableOpacity>

          {mostrarToggle && (
            <View style={styles.toggleLista}>
              <TouchableOpacity
                style={[styles.toggleItem, !filtro && styles.toggleItemSelecionado]}
                onPress={() => {
                  setFiltro('');
                  setMostrarToggle(false);
                }}
              >
                <Text style={[styles.toggleItemTexto, !filtro && styles.toggleItemTextoSelecionado]}>
                  Todos
                </Text>
              </TouchableOpacity>

              {medicamentosUnicos.map(med => (
                <TouchableOpacity
                  key={med}
                  style={[styles.toggleItem, filtro === med && styles.toggleItemSelecionado]}
                  onPress={() => {
                    setFiltro(med);
                    setMostrarToggle(false);
                  }}
                >
                  <Icon
                    name="medical-services"
                    size={16}
                    color={filtro === med ? '#ffffff' : tema.botaoFundo}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={[styles.toggleItemTexto, filtro === med && styles.toggleItemTextoSelecionado]}>
                    {med}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      <FlatList
        data={registrosAgrupados}
        keyExtractor={(section, index) => `${section.label}-${index}`}
        renderItem={({ item: section }) => (
          <View>
            {renderSectionHeader({ section })}
            {section.dados.map(item => (
              <View key={item.id}>
                {renderItem({ item })}
              </View>
            ))}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.vazio}>
            {filtro ? 'Nenhum medicamento encontrado.' : 'Nenhum registro encontrado.'}
          </Text>
        }
      />
    </View>
  );
};

export default ListaUsoMedicamento;
