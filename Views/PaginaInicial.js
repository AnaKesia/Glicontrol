import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, ScrollView,
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
import { prepararRegistrosDePressao, analisarPressao } from '../services/analisePressao';

const screenWidth = Dimensions.get('window').width;

const HomeScreen = () => {
  const navigation = useNavigation();
  const [labels, setLabels] = useState([]);
  const [glicemias, setGlicemias] = useState([]);
  const [alertaRecente, setAlertaRecente] = useState(null);
  const [proximoMedicamento, setProximoMedicamento] = useState(null);
  const [menuAberto, setMenuAberto] = useState(false);
  const [alertasPressao, setAlertasPressao] = useState([]);

  const { config } = useConfiguracoes();
  const tema = temas[config.tema] || temas.escuro;
  const fonte = tamanhosFonte[config.fonte] || tamanhosFonte.media;
  const styles = criarEstilos(tema, fonte);

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
        setAlertaRecente(Array.isArray(alertas) && alertas.length > 0 ? alertas[0] : null);
      } else {
        setLabels([]);
        setGlicemias([]);
        setAlertaRecente(null);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar medições: ' + error.message);
    }
  };

  const carregarPressao = async () => {
    try {
      const usuario = auth().currentUser;
      if (!usuario) return;

      const registros = await prepararRegistrosDePressao(usuario.uid);

      const tresDiasAtras = Date.now() - (3 * 24 * 60 * 60 * 1000);

      const registrosRecentes = registros.filter((item) => {
        const dataRegistro = item.timestamp ? item.timestamp.toMillis?.() ?? item.timestamp : null;
        return dataRegistro && dataRegistro >= tresDiasAtras;
      });

      if (registrosRecentes.length > 0) {
        const alertas = analisarPressao(registrosRecentes);
        setAlertasPressao(alertas);
      } else {
        setAlertasPressao([]);
      }

    } catch (error) {
      console.log("Erro ao carregar pressão:", error);
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

        const horarios = Array.isArray(medicamento.Horarios)
          ? medicamento.Horarios
          : medicamento.Horário
          ? [medicamento.Horário]
          : [];

        horarios.forEach(horario => {
          const [hora, minuto] = horario.split(':').map(Number);
          const dataHorario = new Date();
          dataHorario.setHours(hora, minuto, 0, 0);
          if (dataHorario < agora) dataHorario.setDate(dataHorario.getDate() + 1);

          const diferenca = dataHorario - agora;
          if (diferenca < menorDiferenca) {
            menorDiferenca = diferenca;
            proximo = { ...medicamento, horarioProximo: horario };
          }
        });
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

        const horarios = Array.isArray(medicamento.Horarios)
          ? medicamento.Horarios
          : medicamento.Horário
          ? [medicamento.Horário]
          : [];

        for (const h of horarios) {
          const [hora, minuto] = h.split(':').map(Number);
          let horarioNotificacao = new Date();
          horarioNotificacao.setHours(hora, minuto, 0, 0);
          if (horarioNotificacao <= agora) horarioNotificacao.setDate(horarioNotificacao.getDate() + 1);

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

        if (medicamento.IntervaloHoras) {
          const base = new Date();
          base.setHours(0, 0, 0, 0);
          const horas = medicamento.IntervaloHoras;
          for (let i = 0; i < 24; i += horas) {
            let horarioNotificacao = new Date(base);
            horarioNotificacao.setHours(i, 0, 0, 0);
            if (horarioNotificacao <= agora) horarioNotificacao.setDate(horarioNotificacao.getDate() + 1);

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
      carregarPressao();
      carregarProximoMedicamento();
    }, [])
  );

  const handleLogout = () => {
    auth()
      .signOut()
      .then(() => navigation.replace('Login'))
      .catch(error => Alert.alert('Erro', 'Falha ao deslogar: ' + error.message));
  };

  const data = {
    labels: labels.length > 0 ? labels : ['--:--'],
    datasets: [
      {
        data: glicemias.length > 0 ? glicemias : [0],
        strokeWidth: 2,
        color: (opacity = 1) => tema.botaoFundo,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 15 }}>
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
              propsForDots: { r: '4', strokeWidth: '2', stroke: tema.texto },
              propsForBackgroundLines: { stroke: tema.texto + '33' },
            }}
            bezier
            style={styles.chart}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.alertaContainer,
            {
              backgroundColor:
                ((alertaRecente && alertaRecente.startsWith('⚠️')) ||
                  (alertasPressao && alertasPressao.length > 0 &&
                    String(alertasPressao[0]).startsWith('⚠️')))
                  ? '#ffc107'
                  : tema.botaoFundo,
            },
          ]}
          onPress={() => navigation.navigate('Relatorios')}
        >
          <Text
            style={[
              styles.alertaTitulo,
              {
                color:
                  ((alertaRecente && alertaRecente.startsWith('⚠️')) ||
                    (alertasPressao && alertasPressao.length > 0 &&
                      String(alertasPressao[0]).startsWith('⚠️')))
                    ? '#000'
                    : tema.botaoTexto,
              },
            ]}
          >
            {
              ((alertaRecente && alertaRecente.startsWith('⚠️')) ||
                (alertasPressao && alertasPressao.length > 0 &&
                  String(alertasPressao[0]).startsWith('⚠️')))
                ? '⚠️ Alerta Recente'
                : '✅ Sem alertas recentes'
            }
          </Text>

          <View>

            {/* Exibe alerta de glicemia somente se for ⚠️ ou ✔️ */}
            {alertaRecente &&
              (alertaRecente.startsWith('⚠️') || alertaRecente.startsWith('✔️')) && (
                <Text
                  style={[
                    styles.alertaTexto,
                    { color: alertaRecente.startsWith('⚠️') ? '#000' : tema.botaoTexto },
                  ]}
                >
                  {alertaRecente}
                </Text>
              )}

            {/* Exibe alerta de pressão somente se for ⚠️ ou ✔️ */}
            {(alertasPressao && alertasPressao.length > 0 &&
              (String(alertasPressao[0]).startsWith('⚠️') ||
               String(alertasPressao[0]).startsWith('✔️'))
            ) && (
              <Text
                style={[
                  styles.alertaTexto,
                  {
                    color: String(alertasPressao[0]).startsWith('⚠️') ? '#000' : tema.botaoTexto,
                    marginTop: alertaRecente ? 6 : 0,
                  },
                ]}
              >
                {alertasPressao[0]}
              </Text>
            )}

            {/* Se nenhum alerta válido */}
            {(
              (!alertaRecente || !alertaRecente.startsWith('⚠️')) &&
              (!alertasPressao || alertasPressao.length === 0 ||
                (!String(alertasPressao[0]).startsWith('⚠️') &&
                 !String(alertasPressao[0]).startsWith('✔️')))
            ) && (
              <Text style={[styles.alertaTexto, { color: tema.botaoTexto }]}>
                Tudo sob controle nos últimos dias.
              </Text>
            )}

          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.medicamentoContainer} onPress={() => navigation.navigate('Medicamentos')}>
          <Text style={styles.medicamentoTitulo}>💊 Próximo Medicamento</Text>
          {proximoMedicamento ? (
            <>
              <Text style={styles.medicamentoNome}>{proximoMedicamento.Nome}</Text>
              <Text style={styles.medicamentoDetalhe}>Dose: {proximoMedicamento.Dose}</Text>
              <Text style={styles.medicamentoDetalhe}>Horário: {proximoMedicamento.horarioProximo}</Text>
            </>
          ) : (
            <Text style={styles.medicamentoDetalhe}>Nenhum medicamento agendado.</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setMenuAberto(!menuAberto)}
      >
        <Icon name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {menuAberto && (
        <View style={styles.menuFlutuante}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuAberto(false);
              navigation.navigate('InserirGlicemia');
            }}
          >
            <Text style={styles.menuItemTexto}>Registrar Medição</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuAberto(false);
              navigation.navigate('InserirPressao');
            }}
          >
            <Text style={styles.menuItemTexto}>Registrar Pressão</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuAberto(false);
              navigation.navigate('InserirAgua');
            }}
          >
            <Text style={styles.menuItemTexto}>Registrar Água</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuAberto(false);
              navigation.navigate('RegistroAtividade');
            }}
          >
            <Text style={styles.menuItemTexto}>Registrar Atividade Física</Text>
          </TouchableOpacity>

        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('ListaRefeicoes')}>
          <Icon name="restaurant" size={24} color={'#ffffff'} />
          <Text style={[styles.footerText, { color: '#ffffff' }]}>Refeições</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('RelatorioCompleto')}>
          <Icon name="healing" size={24} color={'#ffffff'} />
          <Text style={[styles.footerText, { color: '#ffffff' }]}>Relatório</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('TelaConfiguracoes')}>
          <Icon name="settings" size={24} color={'#ffffff'} />
          <Text style={[styles.footerText, { color: '#ffffff' }]}>Configurações</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;
