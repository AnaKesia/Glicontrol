import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, Alert, StyleSheet,
  TouchableOpacity, Platform, Switch, ScrollView
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
  const [notificar, setNotificar] = useState(false);

  const [modoNotificacao, setModoNotificacao] = useState('horarios'); // 'horarios' ou 'intervalo'
  const [horarios, setHorarios] = useState([new Date()]);
  const [mostrarIndex, setMostrarIndex] = useState(null);
  const [intervaloHoras, setIntervaloHoras] = useState('');

  useEffect(() => {
    if (editar && dados) {
      setNome(dados.Nome);
      setDose(dados.Dose);
      setObservacoes(dados.Observações || '');
      setNotificar(dados.Notificar || false);

      if (dados.Horarios) {
        const lista = dados.Horarios.map(h => {
          const [hora, minuto] = h.split(':').map(Number);
          const nova = new Date();
          nova.setHours(hora);
          nova.setMinutes(minuto);
          nova.setSeconds(0);
          nova.setMilliseconds(0);
          return nova;
        });
        setHorarios(lista);
        setModoNotificacao('horarios');
      } else if (dados.IntervaloHoras) {
        setIntervaloHoras(String(dados.IntervaloHoras));
        setModoNotificacao('intervalo');
      } else if (dados.Horário) {
        const [hora, minuto] = dados.Horário.split(':').map(Number);
        const nova = new Date();
        nova.setHours(hora);
        nova.setMinutes(minuto);
        nova.setSeconds(0);
        nova.setMilliseconds(0);
        setHorarios([nova]);
        setModoNotificacao('horarios');
      }
    }
  }, [editar, dados]);

  const formatarHorario = (date) => date.toTimeString().slice(0, 5);

  const prepararDados = (uid) => ({
    userid: uid,
    Nome: nome.trim(),
    Dose: dose.trim(),
    Observações: observacoes.trim(),
    Notificar: notificar,
    Horarios: modoNotificacao === 'horarios' ? horarios.map(formatarHorario) : null,
    IntervaloHoras: modoNotificacao === 'intervalo' ? parseInt(intervaloHoras) : null,
  });

  const agendarNotificacao = async () => {
    try {
      await notifee.createChannel({
        id: 'medicamentos',
        name: 'Lembretes de Medicamentos',
        importance: AndroidImportance.HIGH,
      });

      const agora = new Date();

      if (modoNotificacao === 'horarios') {
        for (const h of horarios) {
          const data = new Date(h);
          if (data <= agora) data.setDate(data.getDate() + 1);

          await notifee.createTriggerNotification(
            {
              title: 'Hora de tomar o medicamento',
              body: `${nome} - ${dose}`,
              android: { channelId: 'medicamentos', smallIcon: 'ic_launcher' },
            },
            {
              type: TriggerType.TIMESTAMP,
              timestamp: data.getTime(),
              repeatFrequency: RepeatFrequency.DAILY,
            }
          );
        }
      }

      else if (modoNotificacao === 'intervalo') {
        const horas = parseInt(intervaloHoras);
        const base = new Date();
        base.setHours(0, 0, 0, 0); // meia-noite de hoje

        const notificacoes = [];

        for (let i = 0; i < 24; i += horas) {
          const data = new Date(base);
          data.setHours(i);

          if (data > agora) {
            notificacoes.push(data);
          }
        }

        for (const data of notificacoes) {
          await notifee.createTriggerNotification(
            {
              title: 'Lembrete de medicamento',
              body: `${nome} - repetir a cada ${horas}h`,
              android: { channelId: 'medicamentos', smallIcon: 'ic_launcher' },
            },
            {
              type: TriggerType.TIMESTAMP,
              timestamp: data.getTime(),
              repeatFrequency: RepeatFrequency.DAILY,
            }
          );
        }
      }
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

  const atualizarHorario = (index, selectedTime) => {
    if (selectedTime) {
      const novos = [...horarios];
      selectedTime.setSeconds(0);
      selectedTime.setMilliseconds(0);
      novos[index] = selectedTime;
      setHorarios(novos);
    }
    setMostrarIndex(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{editar ? 'Editar Medicamento' : 'Cadastrar Medicamento'}</Text>

      <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} />
      <TextInput style={styles.input} placeholder="Dose" value={dose} onChangeText={setDose} />
      <TextInput
        style={styles.input}
        placeholder="Observações (opcional)"
        value={observacoes}
        onChangeText={setObservacoes}
      />

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Deseja ser notificado?</Text>
        <Switch value={notificar} onValueChange={setNotificar} />
      </View>

      {notificar && (
        <>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Modo:</Text>
            <TouchableOpacity onPress={() => setModoNotificacao('horarios')}>
              <Text style={{ color: modoNotificacao === 'horarios' ? '#fff' : '#ccc' }}>Horários</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModoNotificacao('intervalo')}>
              <Text style={{ color: modoNotificacao === 'intervalo' ? '#fff' : '#ccc' }}>A cada X horas</Text>
            </TouchableOpacity>
          </View>

          {modoNotificacao === 'horarios' ? (
            <>
              {horarios.map((h, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setMostrarIndex(i)}
                  style={styles.horarioButton}
                >
                  <Text style={styles.horarioText}>Horário {i + 1}: {formatarHorario(h)}</Text>
                </TouchableOpacity>
              ))}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                <Button
                  title="Adicionar horário"
                  onPress={() => setHorarios([...horarios, new Date()])}
                />
                {horarios.length > 1 && (
                  <Button
                    title="Remover último"
                    color="red"
                    onPress={() => setHorarios(horarios.slice(0, -1))}
                  />
                )}
              </View>
              {mostrarIndex !== null && (
                <DateTimePicker
                  value={horarios[mostrarIndex]}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(_, date) => atualizarHorario(mostrarIndex, date)}
                />
              )}
            </>
          ) : (
            <TextInput
              style={styles.input}
              placeholder="A cada quantas horas?"
              value={intervaloHoras}
              onChangeText={setIntervaloHoras}
              keyboardType="numeric"
            />
          )}
        </>
      )}

      <Button
        title={editar ? 'Salvar Alterações' : 'Salvar Medicamento'}
        onPress={handleSalvar}
        color="#007AFF"
      />
    </ScrollView>
  );
};

export default CadastrarMedicamento;

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#001f3f' },
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
    marginBottom: 10,
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
