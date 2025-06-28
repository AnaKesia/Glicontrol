import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, Alert, Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';

import { GlicemiaService } from '../services/GlicemiaService';
import { validarMedicao } from '../utils/validacao';

const glicemiaService = new GlicemiaService();

const InserirGlicemiaScreen = () => {
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
      setValor(String(medicao.valor));
      setCategoria(medicao.categoria);
      setDataHora(
        medicao.timestamp?.seconds
          ? new Date(medicao.timestamp.seconds * 1000)
          : new Date()
      );
      setObservacao(medicao.observacao || '');
    }
  }, [medicao]);

  const handleSalvar = async () => {
    const erro = validarMedicao(valor, categoria);
    if (erro) {
      Alert.alert('Erro', erro);
      return;
    }

    const dados = {
      valor: Number(valor),
      categoria,
      timestamp: dataHora,
      observacao,
    };

    try {
      const mensagem = await glicemiaService.salvarMedicao(dados, medicao?.id);
      Alert.alert('Sucesso', mensagem);
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar a medição.');
    }
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
        onValueChange={setCategoria}
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
          is24Hour
          display="default"
          onChange={(event, date) => {
            setMostrarRelogio(Platform.OS === 'ios');
            if (date) setDataHora(date);
          }}
        />
      )}

      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Observações (opcional)"
        multiline
        value={observacao}
        onChangeText={setObservacao}
        autoCapitalize="sentences"
        autoCorrect
      />

      <Button
        title={medicao ? 'Salvar Alterações' : 'Salvar Medição'}
        onPress={handleSalvar}
      />
    </View>
  );
};

export default InserirGlicemiaScreen;

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
