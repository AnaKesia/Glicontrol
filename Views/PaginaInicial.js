import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import notifee, { TriggerType, RepeatFrequency } from '@notifee/react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { buscarMedicoesUsuario } from '../firebaseService';

const screenWidth = Dimensions.get('window').width;

const HomeScreen = () => {
  const navigation = useNavigation();
  const [labels, setLabels] = useState([]);
  const [glicemias, setGlicemias] = useState([]);

  const carregarMedicoes = async () => {
    try {
      const dados = await buscarMedicoesUsuario();

      if (dados.length > 0) {
        const labelsAux = [];
        const valores = [];

        const ultimos = dados.slice(0, 5).reverse();

        ultimos.forEach(item => {
          const data = new Date(item.timestamp.seconds * 1000);
          const hora = data.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          labelsAux.push(hora);
          valores.push(item.valor);
        });

        setLabels(labelsAux);
        setGlicemias(valores);
      } else {
        setLabels([]);
        setGlicemias([]);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar medições: ' + error.message);
    }
  };

  const agendarNotificacoesMedicamentos = async () => {
    const usuario = auth().currentUser;
    if (!usuario) return;

    try {
      const querySnapshot = await firestore()
        .collection('medicamentos')
        .where('userid', '==', usuario.uid)
        .where('Notificar', '==', true)
        .get();

      await notifee.cancelAllNotifications();

      for (const doc of querySnapshot.docs) {
        const medicamento = doc.data();
        const [hora, minuto] = medicamento.Horário.split(':').map(Number);

        const agora = new Date();
        let horarioNotificacao = new Date();
        horarioNotificacao.setHours(hora);
        horarioNotificacao.setMinutes(minuto);
        horarioNotificacao.setSeconds(0);
        horarioNotificacao.setMilliseconds(0);

        if (horarioNotificacao <= agora) {
          horarioNotificacao.setDate(horarioNotificacao.getDate() + 1);
        }

        await notifee.createTriggerNotification(
          {
            title: 'Hora de tomar o medicamento',
            body: `${medicamento.Nome} - ${medicamento.Dose}`,
            android: { channelId: 'medicamentos' },
          },
          {
            type: TriggerType.TIMESTAMP,
            timestamp: horarioNotificacao.getTime(),
            repeatFrequency: RepeatFrequency.DAILY,
          }
        );
      }
    } catch (error) {
      console.error('Erro ao agendar notificações:', error);
    }
  };

  useEffect(() => {
    agendarNotificacoesMedicamentos();
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarMedicoes();
    }, [])
  );

  const handleLogout = () => {
    auth()
      .signOut()
      .then(() => {
        navigation.replace('Login');
      })
      .catch(error => {
        Alert.alert('Erro', 'Falha ao deslogar: ' + error.message);
      });
  };

  const data = {
    labels: labels.length > 0 ? labels : ['--:--'],
    datasets: [
      {
        data: glicemias.length > 0 ? glicemias : [0],
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Últimas Medições de Glicemia</Text>

      <TouchableOpacity onPress={() => navigation.navigate('ListaMedicoes')}>
        <LineChart
          data={data}
          width={screenWidth - 30}
          height={220}
          chartConfig={{
            backgroundColor: '#007AFF',
            backgroundGradientFrom: '#007AFF',
            backgroundGradientTo: '#001f3f',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: () => '#fff',
          }}
          bezier
          style={styles.chart}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('InserirGlicemia')}
      >
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001f3f',
    padding: 20,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
    alignSelf: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});
