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
import { criarEstilos } from '../estilos/paginaInicial';

const screenWidth = Dimensions.get('window').width;

const HomeScreen = () => {
  const navigation = useNavigation();
  const [labels, setLabels] = useState([]);
  const [glicemias, setGlicemias] = useState([]);
  const [alertaRecente, setAlertaRecente] = useState(null);
  const [proximoMedicamento, setProximoMedicamento] = useState(null);

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

  const carregarProximoMedicamento = async () => {
    const usuario = auth().currentUser;
    if (!usuario) return;

    try {
      const querySnapshot = await firestore()
        .collection('medicamentos')
        .where('userid', '==', usuario.uid)
        .get();

      const agora = new Date();
      let proximo = null;
      let menorDiferenca = Infinity;

      querySnapshot.forEach(doc => {
        const medicamento = doc.data();

        if (Array.isArray(medicamento.Horarios)) {
          medicamento.Horarios.forEach(horario => {
            const [hora, minuto] = horario.split(':').map(Number);
            const dataHorario = new Date();
            dataHorario.setHours(hora, minuto, 0, 0);

            if (dataHorario < agora) {
              dataHorario.setDate(dataHorario.getDate() + 1);
            }

            const diferenca = dataHorario - agora;
            if (diferenca < menorDiferenca) {
              menorDiferenca = diferenca;
              proximo = { ...medicamento, horarioProximo: horario };
            }
          });
        }
        // Caso tenha apenas um horário
        else if (medicamento.Horário) {
          const [hora, minuto] = medicamento.Horário.split(':').map(Number);
          const dataHorario = new Date();
          dataHorario.setHours(hora, minuto, 0, 0);

          if (dataHorario < agora) {
            dataHorario.setDate(dataHorario.getDate() + 1);
          }

          const diferenca = dataHorario - agora;
          if (diferenca < menorDiferenca) {
            menorDiferenca = diferenca;
            proximo = { ...medicamento, horarioProximo: medicamento.Horário };
          }
        }
      });

      setProximoMedicamento(proximo);
    } catch (error) {
      console.error('Erro ao buscar próximo medicamento:', error);
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
      carregarProximoMedicamento();
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
              stroke: tema.texto + '33',
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

      <TouchableOpacity
        style={styles.medicamentoContainer}
        onPress={() => navigation.navigate('Medicamentos')}
      >
        <Text style={styles.medicamentoTitulo}>💊 Próximo Medicamento</Text>
        {proximoMedicamento ? (
          <>
            <Text style={styles.medicamentoNome}>{proximoMedicamento.Nome}</Text>
            <Text style={styles.medicamentoDetalhe}>Dose: {proximoMedicamento.Dose}</Text>
            <Text style={styles.medicamentoDetalhe}>
              Horário: {proximoMedicamento.horarioProximo}
            </Text>
          </>
        ) : (
          <Text style={styles.medicamentoDetalhe}>
            Nenhum medicamento agendado.
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('InserirGlicemia')}
      >
        <Icon name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('ListaRefeicoes')}
        >
          <Icon name="restaurant" size={24} color={'#ffffff'} />
          <Text style={[styles.footerText, { color: '#ffffff' }]}>Refeições</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('ListaSintomas')}
        >
          <Icon name="healing" size={24} color={'#ffffff'} />
          <Text style={[styles.footerText, { color: '#ffffff' }]}>Sintomas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('TelaConfiguracoes')}
        >
          <Icon name="settings" size={24} color={'#ffffff'} />
          <Text style={[styles.footerText, { color: '#ffffff' }]}>Configurações</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

export default HomeScreen;
