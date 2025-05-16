import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const InserirGlicemia = () => {
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('jejum');
  const [dataHora, setDataHora] = useState(new Date());
  const [observacao, setObservacao] = useState('');
  const [mostrarRelogio, setMostrarRelogio] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const medicao = route.params?.medicao;

  useEffect(() => {
    if (medicao) {
      setValor(medicao.valor.toString());
      setCategoria(medicao.categoria);
      setDataHora(medicao.timestamp?.seconds ? new Date(medicao.timestamp.seconds * 1000) : new Date());
      setObservacao(medicao.observacao || medicao.observacoes || '');
    }
  }, [medicao]);

  const handleSalvar = async () => {
    const usuario = auth().currentUser;

    if (!usuario) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }

    if (!valor || isNaN(Number(valor)) || !categoria) {
      Alert.alert('Erro', 'Preencha todos os campos corretamente');
      return;
    }

    try {
      const dados = {
        usuarioId: usuario.uid,
        valor: Number(valor),
        categoria,
        timestamp: firestore.Timestamp.fromDate(dataHora),
        observacao: observacao || '',
      };

      if (medicao?.id) {
        // Atualizar
        await firestore()
          .collection('medicoes')
          .doc(medicao.id)
          .set(dados, { merge: true });
        Alert.alert('Sucesso', 'Medição atualizada!');
      } else {
        // Criar nova
        await firestore().collection('medicoes').add(dados);
        Alert.alert('Sucesso', 'Medição registrada!');
      }

      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar medição:', error);
      Alert.alert('Erro', 'Não foi possível salvar a medição.');
    }
  };

  const aoAlterarHorario = (event, selectedDate) => {
    const horaEscolhida = selectedDate || dataHora;
    setMostrarRelogio(Platform.OS === 'ios');
    setDataHora(horaEscolhida);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{medicao ? 'Editar Medição' : 'Nova Medição'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Valor da glicemia (mg/dL)"
        keyboardType="numeric"
        value={valor}
        onChangeText={setValor}
      />

      <Picker
        selectedValue={categoria}
        style={styles.input}
        onValueChange={(itemValue) => setCategoria(itemValue)}
      >
        <Picker.Item label="Jejum" value="jejum" />
        <Picker.Item label="Pós-Café" value="pos-cafe" />
        <Picker.Item label="Pós-Almoço" value="pos-almoco" />
        <Picker.Item label="Pós-Janta" value="pos-janta" />
        <Picker.Item label="Antes de Dormir" value="antes-dormir" />
        <Picker.Item label="Outro" value="outro" />
      </Picker>

      <Button title="Selecionar Horário" onPress={() => setMostrarRelogio(true)} />
      <Text style={styles.horaSelecionada}>
        Horário: {dataHora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>

      {mostrarRelogio && (
        <DateTimePicker
          value={dataHora}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={aoAlterarHorario}
        />
      )}

      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Observações (opcional)"
        multiline
        value={observacao}
        onChangeText={setObservacao}
        autoCapitalize="sentences"
        autoCorrect={true}
      />

      <Button title={medicao ? 'Salvar Alterações' : 'Salvar Medição'} onPress={handleSalvar} />
    </View>
  );
};

export default InserirGlicemia;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001f3f',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 15,
  },
  horaSelecionada: {
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
});
