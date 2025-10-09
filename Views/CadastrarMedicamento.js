import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, Alert, StyleSheet,
  TouchableOpacity, Switch, ScrollView
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import notifee, { TriggerType, RepeatFrequency, AndroidImportance } from '@notifee/react-native';
import { TimePicker } from '../hooks/TimePicker';

const CadastrarMedicamento = ({ route, navigation }) => {
  const editar = route.params?.editar;
  const dados = route.params?.dados;

  const [nome, setNome] = useState('');
  const [dose, setDose] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [notificar, setNotificar] = useState(false);
  const [modoNotificacao, setModoNotificacao] = useState('horarios');
  const [horarios, setHorarios] = useState([new Date()]);
  const [mostrarIndex, setMostrarIndex] = useState(null);
  const [intervaloHoras, setIntervaloHoras] = useState('');

  useEffect(() => {
    if (editar && dados) {
      setNome(dados.Nome);
      setDose(dados.Dose);
      setObservacoes(dados.Observacoes || '');
      setNotificar(dados.Notificar || false);

      if (dados.Horarios) {
        const lista = dados.Horarios.map(h => {
          const [hora, minuto] = h.split(':').map(Number);
          const nova = new Date();
          nova.setHours(hora, minuto, 0, 0);
          return nova;
        });
        setHorarios(lista);
        setModoNotificacao('horarios');
      } else if (dados.IntervaloHoras) {
        setIntervaloHoras(String(dados.IntervaloHoras));
        setModoNotificacao('intervalo');
      }
    }
  }, [editar, dados]);

  const formatarHorario = (date) => date.toTimeString().slice(0, 5);

  const prepararDados = (uid, notificationIds = []) => ({
    userid: uid,
    Nome: nome.trim(),
    Dose: dose.trim(),
    Observacoes: observacoes.trim(),
    Notificar: notificar,
    Horarios: modoNotificacao === 'horarios' ? horarios.map(formatarHorario) : null,
    IntervaloHoras: modoNotificacao === 'intervalo' ? parseInt(intervaloHoras, 10) : null,
    notificationIds,
  });

  const cancelarNotificacoesAntigas = async (ids = []) => {
    try {
      for (const id of ids) {
        await notifee.cancelNotification(id);
      }
    } catch (err) {
      console.warn('Erro ao cancelar notificações antigas:', err);
    }
  };

  const agendarNotificacao = async () => {
    const novosIds = [];

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

          const id = await notifee.createTriggerNotification(
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

          novosIds.push(id);
        }
      } else if (modoNotificacao === 'intervalo') {
        const horas = parseInt(intervaloHoras);
        const base = new Date();
        base.setHours(0, 0, 0, 0);
        const notificacoes = [];

        for (let i = 0; i < 24; i += horas) {
          const data = new Date(base);
          data.setHours(i);
          if (data > agora) notificacoes.push(data);
        }

        for (const data of notificacoes) {
          const id = await notifee.createTriggerNotification(
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

          novosIds.push(id);
        }
      }

      return novosIds;
    } catch (err) {
      console.error('Erro ao agendar notificação:', err);
      Alert.alert('Erro ao agendar notificação');
      return [];
    }
  };

  const handleSalvar = async () => {
    const usuario = auth().currentUser;
    if (!usuario || !nome.trim() || !dose.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    try {
      let antigosIds = dados?.notificationIds || [];
      if (editar && antigosIds.length > 0) {
        await cancelarNotificacoesAntigas(antigosIds);
      }

      let novosIds = [];
      if (notificar) {
        novosIds = await agendarNotificacao();
      }

      const medicamento = prepararDados(usuario.uid, novosIds);

      if (editar && dados?.id) {
        await firestore().collection('medicamentos').doc(dados.id).update(medicamento);
      } else {
        await firestore().collection('medicamentos').add(medicamento);
      }

      Alert.alert('Sucesso', editar ? 'Medicamento atualizado!' : 'Medicamento cadastrado!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar medicamento:', error);
      Alert.alert('Erro ao salvar os dados');
    }
  };

  const atualizarHorario = (index, date) => {
    if (date) {
      const novos = [...horarios];
      date.setSeconds(0);
      date.setMilliseconds(0);
      novos[index] = date;
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

              <TimePicker
                dataHora={horarios[mostrarIndex]}
                setDataHora={(date) => atualizarHorario(mostrarIndex, date)}
                mostrar={mostrarIndex !== null}
                setMostrar={() => setMostrarIndex(null)}
              />
            </>
          ) : (
            <TextInput
              style={styles.input}
              placeholder="A cada quantas horas?"
              value={intervaloHoras}
              onChangeText={text => setIntervaloHoras(text.replace(/[^0-9]/g, ''))}
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
