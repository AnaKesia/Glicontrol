import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  Switch, Alert, TouchableOpacity, ScrollView, Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useConfiguracoes } from './Configuracoes';
import { criarEstilos } from '../estilos/confirmarUsoMedicamento';

const ConfirmarUsoMedicamento = ({ route, navigation }) => {
  const editar = route.params?.editar || false;
  const dados = route.params?.dados || route.params?.medicamento;

  const [listaMedicamentos, setListaMedicamentos] = useState([]);
  const [medicamentoSelecionado, setMedicamentoSelecionado] = useState(
    dados.medicamentoId || dados.id
  );
  const [dose, setDose] = useState(
    dados.Dose?.toString() || dados.dose?.toString() || '0'
  );
  const [tomou, setTomou] = useState(dados?.tomou ?? true);
  const [observacoes, setObservacoes] = useState(dados?.observacoes || '');

  const [dataHora, setDataHora] = useState(
    dados?.timestamp?.toDate ? dados.timestamp.toDate() : new Date()
  );
  const [mostrarPicker, setMostrarPicker] = useState(false);

  const { config, temas, tamanhosFonte } = useConfiguracoes();
  const tema = temas[config.tema];
  const fonte = tamanhosFonte[config.fonte];
  const styles = criarEstilos(tema, fonte);

  useEffect(() => {
    const carregarMedicamentos = async () => {
      try {
        const userId = auth().currentUser?.uid;
        if (!userId) return;

        const snapshot = await firestore()
          .collection('medicamentos')
          .where('userid', '==', userId)
          .get();

        const meds = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setListaMedicamentos(meds);
      } catch (error) {
        console.error('Erro ao carregar medicamentos:', error);
        Alert.alert('Erro', 'Erro ao carregar medicamentos.');
      }
    };

    carregarMedicamentos();
  }, []);

  useEffect(() => {
    if (!tomou) {
      setDose('0');
    } else {
      const med = listaMedicamentos.find((m) => m.id === medicamentoSelecionado);
      if (med) setDose(med.Dose?.toString() || '0');
    }
  }, [tomou, medicamentoSelecionado]);

  const salvarRegistro = async () => {
    const userId = auth().currentUser?.uid;
    if (!userId) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    const medicamentoSelecionadoObj =
      listaMedicamentos.find((m) => m.id === medicamentoSelecionado) || {
        Nome: dados.NomeMedicamento || 'Desconhecido',
      };

    const timestampFinal =
      editar && dados?.timestamp?.toDate
        ? new Date(dataHora)
        : new Date(dataHora);

    const registro = {
      usuarioId: userId,
      medicamentoId: medicamentoSelecionado,
      NomeMedicamento: medicamentoSelecionadoObj?.Nome || 'Desconhecido',
      dose: parseFloat(dose),
      tomou,
      observacoes: observacoes.trim(),
      timestamp: timestampFinal,
    };

    try {
      if (editar && dados?.id) {
        await firestore().collection('usoMedicamentos').doc(dados.id).update(registro);
        Alert.alert('Sucesso', 'Registro atualizado!');
      } else {
        await firestore().collection('usoMedicamentos').add(registro);
        Alert.alert('Sucesso', 'Registro salvo com sucesso!');
      }

      navigation.goBack();
    } catch (e) {
      console.error('Erro ao salvar registro de uso:', e);
      Alert.alert('Erro', 'Não foi possível salvar o registro.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>
        {editar ? 'Editar Registro de Uso' : 'Confirmar Uso do Medicamento'}
      </Text>

      <Text style={styles.label}>Medicamento:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={medicamentoSelecionado}
          onValueChange={(itemValue) => setMedicamentoSelecionado(itemValue)}
          dropdownIconColor={tema.texto}
          style={{ color: tema.texto }}
        >
          {listaMedicamentos.map((med) => (
            <Picker.Item key={med.id} label={med.Nome} value={med.id} />
          ))}
        </Picker>
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Tomou o medicamento?</Text>
        <Switch
          value={tomou}
          onValueChange={setTomou}
          trackColor={{ false: '#ccc', true: '#007AFF' }}
          thumbColor={tomou ? '#fff' : '#888'}
        />
      </View>

      <Text style={styles.label}>Dose:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={dose}
        onChangeText={setDose}
        editable={tomou}
        placeholder="Digite a dose"
        placeholderTextColor={tema.texto + '88'}
      />

      <Text style={styles.label}>Data e hora:</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setMostrarPicker(true)}
      >
        <Text style={{ color: '#000' }}>
          {dataHora.toLocaleDateString()} {dataHora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </TouchableOpacity>

      {mostrarPicker && (
        <DateTimePicker
          value={dataHora}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setMostrarPicker(false);
            if (date) setDataHora(date);
          }}
        />
      )}

      <Text style={styles.label}>Observações (opcional):</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Ex: tomou com comida, sentiu efeitos..."
        value={observacoes}
        onChangeText={setObservacoes}
        multiline
        placeholderTextColor={tema.texto + '88'}
      />

      <TouchableOpacity style={styles.botaoSalvar} onPress={salvarRegistro}>
        <Text style={styles.botaoTexto}>
          {editar ? 'Salvar Alterações' : 'Salvar Registro'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ConfirmarUsoMedicamento;