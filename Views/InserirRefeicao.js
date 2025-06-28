import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';

const tiposRefeicao = ['Café da Manhã', 'Almoço', 'Lanche', 'Jantar', 'Outro'];

const InserirRefeicao = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const refeicao = route.params?.refeicao;

  const [tipo, setTipo] = useState(refeicao?.tipo || '');
  const [calorias, setCalorias] = useState(refeicao?.calorias?.toString() || '');
  const [observacoes, setObservacoes] = useState(refeicao?.observacoes || '');
  const [data, setData] = useState(refeicao?.timestamp?.toDate() || new Date());
  const [mostrarData, setMostrarData] = useState(false);

  const salvar = async () => {
    if (!tipo || !calorias) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    const userId = auth().currentUser.uid;
    const dados = {
      tipo,
      calorias: parseInt(calorias),
      observacoes,
      usuarioId: userId,
      timestamp: firestore.Timestamp.fromDate(data),
    };

    try {
      if (refeicao) {
        await firestore().collection('refeicoes').doc(refeicao.id).set(dados, { merge: true });
        Alert.alert('Sucesso', 'Refeição atualizada!');
      } else {
        await firestore().collection('refeicoes').add(dados);
        Alert.alert('Sucesso', 'Refeição registrada!');
      }
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar refeição:', error);
      Alert.alert('Erro', 'Não foi possível salvar a refeição.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tipo de Refeição:</Text>
      <Picker selectedValue={tipo} onValueChange={setTipo} style={styles.input}>
        <Picker.Item label="Selecione..." value="" />
        {tiposRefeicao.map(item => (
          <Picker.Item key={item} label={item} value={item} />
        ))}
      </Picker>

      <Text style={styles.label}>Calorias:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={calorias}
        onChangeText={setCalorias}
      />

      <Text style={styles.label}>Observações:</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        multiline
        value={observacoes}
        onChangeText={setObservacoes}
      />

      <TouchableOpacity onPress={() => setMostrarData(true)} style={styles.dateButton}>
        <Text style={styles.dateButtonText}>Selecionar Data e Hora</Text>
      </TouchableOpacity>
      <Text style={styles.selectedDate}>{data.toLocaleString()}</Text>

      {mostrarData && (
        <DateTimePicker
          value={data}
          mode="datetime"
          display="default"
          onChange={(event, selectedDate) => {
            setMostrarData(false);
            if (selectedDate) setData(selectedDate);
          }}
        />
      )}

      <TouchableOpacity style={styles.saveButton} onPress={salvar}>
        <Text style={styles.saveButtonText}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default InserirRefeicao;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#001f3f' },
  label: { color: '#fff', marginBottom: 5, marginTop: 15 },
  input: { backgroundColor: '#fff', padding: 10, borderRadius: 5 },
  dateButton: { backgroundColor: '#007AFF', padding: 10, marginTop: 10, borderRadius: 5 },
  dateButtonText: { color: '#fff', textAlign: 'center' },
  selectedDate: { color: '#fff', marginTop: 5 },
  saveButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 5, marginTop: 20 },
  saveButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});
