import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, Alert, StyleSheet,
  TouchableOpacity, Platform, Switch
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import notifee, { TriggerType, RepeatFrequency, AndroidImportance } from '@notifee/react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const CadastrarMedicamento = ({ route, navigation }) => {
  const editar = route.params?.editar;
  const dados = route.params?.dados;

  const [nome, setNome] = useState('');
  const [dose, setDose] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [horario, setHorario] = useState(new Date());
  const [mostrarHorario, setMostrarHorario] = useState(false);
  const [notificar, setNotificar] = useState(false);

  useEffect(() => {
    if (editar && dados) {
      setNome(dados.Nome);
      setDose(dados.Dose);
      setObservacoes(dados.Observações || '');
      setNotificar(dados.Notificar || false);

      const [hora, minuto] = dados.Horário.split(':').map(Number);
      const novaHora = new Date();
      novaHora.setHours(hora);
      novaHora.setMinutes(minuto);
      novaHora.setSeconds(0);
      novaHora.setMilliseconds(0);
      setHorario(novaHora);
    }
  }, [editar, dados]);

  const formatarHorario = (date) => {
    return date.toTimeString().slice(0, 5);
  };

  const prepararDados = (uid) => ({
    userid: uid,
    Nome: nome.trim(),
    Dose: dose.trim(),
    Observações: observacoes.trim(),
    Horário: formatarHorario(horario),
    Notificar: notificar,  // <<< Aqui salva o campo
  });

  const agendarNotificacao = async () => {
    try {
      await notifee.createChannel({
        id: 'medicamentos',
        name: 'Lembretes de Medicamentos',
        importance: AndroidImportance.HIGH,
      });

      const agora = new Date();
      let dataNotificacao = new Date(horario);
      dataNotificacao.setSeconds(0);
      dataNotificacao.setMilliseconds(0);

      if (dataNotificacao <= agora) {
        dataNotificacao.setDate(dataNotificacao.getDate() + 1);
      }

      await notifee.createTriggerNotification(
        {
          title: 'Hora de tomar o medicamento',
          body: `${nome} - ${dose}`,
          android: { channelId: 'medicamentos', smallIcon: 'ic_launcher' },
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: dataNotificacao.getTime(),
          repeatFrequency: RepeatFrequency.DAILY,
        }
      );
    } catch (err) {
      console.error('Erro ao agendar notificação:', err);
      Alert.alert('Erro ao agendar notificação');
    }
  };

  const handleSalvar = async () => {
    const usuario = auth().currentUser;
    if (!usuario || !nome.trim() || !dose.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    const medicamento = prepararDados(usuario.uid);

    try {
      if (editar && dados?.id) {
        await firestore().collection('medicamentos').doc(dados.id).update(medicamento);
      } else {
        await firestore().collection('medicamentos').add(medicamento);
      }

      if (notificar) await agendarNotificacao();

      Alert.alert('Sucesso', editar ? 'Medicamento atualizado!' : 'Medicamento cadastrado!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar medicamento:', error);
      Alert.alert('Erro ao salvar os dados');
    }
  };

  const onChangeHorario = (_, selectedTime) => {
    if (selectedTime) {
      selectedTime.setSeconds(0);
      selectedTime.setMilliseconds(0);
      setHorario(selectedTime);
    }
    setMostrarHorario(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{editar ? 'Editar Medicamento' : 'Cadastrar Medicamento'}</Text>

      <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} />
      <TextInput style={styles.input} placeholder="Dose" value={dose} onChangeText={setDose} />
      <TextInput
        style={styles.input}
        placeholder="Observações (opcional)"
        value={observacoes}
        onChangeText={setObservacoes}
      />

      <TouchableOpacity onPress={() => setMostrarHorario(true)} style={styles.horarioButton}>
        <Text style={styles.horarioText}>{`Horário: ${formatarHorario(horario)}`}</Text>
      </TouchableOpacity>

      {mostrarHorario && (
        <DateTimePicker
          value={horario}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeHorario}
        />
      )}

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Deseja ser notificado?</Text>
        <Switch value={notificar} onValueChange={setNotificar} />
      </View>

      <Button
        title={editar ? 'Salvar Alterações' : 'Salvar Medicamento'}
        onPress={handleSalvar}
        color="#007AFF"
      />
    </View>
  );
};

export default CadastrarMedicamento;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#001f3f' },
  title: { color: '#fff', fontSize: 24, textAlign: 'center', marginBottom: 20 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 15,
  },
  horarioButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  horarioText: { color: '#000' },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: { color: '#fff', fontSize: 16 },
});
