import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import notifee, { TriggerType, RepeatFrequency } from '@notifee/react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { buscarMedicoesUsuario } from '../firebaseService';
import { analisarGlicemia } from '../services/analiseGlicemia';
import { useConfiguracoes, temas, tamanhosFonte } from './Configuracoes';

const screenWidth = Dimensions.get('window').width;

const HomeScreen = () => {
  const navigation = useNavigation();
  const [labels, setLabels] = useState([]);
  const [glicemias, setGlicemias] = useState([]);
  const [alertaRecente, setAlertaRecente] = useState(null);

  // Pegar tema e fonte do contexto
  const { config } = useConfiguracoes();
  const tema = temas[config.tema] || temas.escuro;
  const fonte = tamanhosFonte[config.fonte] || tamanhosFonte.media;

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

        const alertas = analisarGlicemia(dados);
        if (Array.isArray(alertas) && alertas.length > 0) {
          setAlertaRecente(alertas[0]);
        } else {
          setAlertaRecente(null);
        }
      } else {
        setLabels([]);
        setGlicemias([]);
        setAlertaRecente(null);
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
        const agora = new Date();

        if (medicamento.Horário) {
          const [hora, minuto] = medicamento.Horário.split(':').map(Number);
          let horarioNotificacao = new Date();
          horarioNotificacao.setHours(hora, minuto, 0, 0);

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

        } else if (Array.isArray(medicamento.Horarios)) {
          for (const h of medicamento.Horarios) {
            const [hora, minuto] = h.split(':').map(Number);
            let horarioNotificacao = new Date();
            horarioNotificacao.setHours(hora, minuto, 0, 0);

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
        } else if (medicamento.IntervaloHoras) {
          const horas = medicamento.IntervaloHoras;
          const base = new Date();
          base.setHours(0, 0, 0, 0);

          for (let i = 0; i < 24; i += horas) {
            let horarioNotificacao = new Date(base);
            horarioNotificacao.setHours(i, 0, 0, 0);

            if (horarioNotificacao <= agora) {
              horarioNotificacao.setDate(horarioNotificacao.getDate() + 1);
            }

            await notifee.createTriggerNotification(
              {
                title: 'Lembrete de medicamento',
                body: `${medicamento.Nome} - repetir a cada ${horas}h`,
                android: { channelId: 'medicamentos' },
              },
              {
                type: TriggerType.TIMESTAMP,
                timestamp: horarioNotificacao.getTime(),
                repeatFrequency: RepeatFrequency.DAILY,
              }
            );
          }
        }
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
        color: (opacity = 1) => tema.botaoFundo, // Linha no gráfico com cor do tema
      },
    ],
  };

  const styles = criarEstilos(tema, fonte);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Últimas Medições de Glicemia</Text>

      <TouchableOpacity onPress={() => navigation.navigate('ListaMedicoes')}>
        <LineChart
          data={data}
          width={screenWidth - 30}
          height={220}
          chartConfig={{
            backgroundColor: tema.botaoFundo,
            backgroundGradientFrom: tema.botaoFundo,
            backgroundGradientTo: tema.fundo,
            decimalPlaces: 0,
            color: (opacity = 1) => tema.texto,
            labelColor: () => tema.texto,
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: tema.texto,
            },
            propsForBackgroundLines: {
              stroke: tema.texto + '33', // linha de grade transparente
            },
          }}
          bezier
          style={styles.chart}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.alertaContainer,
          { backgroundColor: alertaRecente?.startsWith('⚠️') ? '#ffc107' : tema.botaoFundo },
        ]}
        onPress={() => navigation.navigate('Relatorios')}
      >
        <Text
          style={[
            styles.alertaTitulo,
            { color: alertaRecente?.startsWith('⚠️') ? '#000' : tema.botaoTexto },
          ]}
        >
          {alertaRecente?.startsWith('⚠️') ? '⚠️ Alerta Recente' : '✅ Sem alertas recentes'}
        </Text>
        <Text
          style={[
            styles.alertaTexto,
            { color: alertaRecente?.startsWith('⚠️') ? '#000' : tema.botaoTexto },
          ]}
        >
          {alertaRecente || 'Tudo sob controle nos últimos dias.'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('InserirGlicemia')}>
        <Icon name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;

const criarEstilos = (tema, fonte) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tema.fundo,
      padding: 20,
    },
    title: {
      fontSize: fonte + 2,
      color: tema.texto,
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
      backgroundColor: tema.botaoFundo,
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
    },
    alertaContainer: {
      marginTop: 20,
      padding: 15,
      borderRadius: 10,
    },
    alertaTitulo: {
      fontWeight: 'bold',
      fontSize: fonte,
      marginBottom: 5,
    },
    alertaTexto: {
      fontSize: fonte - 2,
    },
  });
