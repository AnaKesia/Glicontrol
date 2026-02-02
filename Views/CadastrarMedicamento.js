import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, Alert,
  TouchableOpacity, Switch, ScrollView,
  KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { TimePicker } from '../hooks/TimePicker';
import { agendarNotificacao, cancelarNotificacoesAntigas } from '../utils/notificacoes';
import { prepararDados } from '../utils/medicamentoUtils';
import { useConfiguracoes } from './Configuracoes';
import { styles } from '../estilos/cadastrarMedicamento';

const CadastrarMedicamento = ({ route, navigation }) => {
  const editar = route.params?.editar;
  const dados = route.params?.dados;

  const [nome, setNome] = useState('');
  const [dose, setDose] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [notificar, setNotificar] = useState(false);
  const [modoNotificacao, setModoNotificacao] = useState('horarios');
  const [horarios, setHorarios] = useState([new Date()]);
  const [intervaloHoras, setIntervaloHoras] = useState('');

  const { config, temas, tamanhosFonte } = useConfiguracoes();
  const temaAtual = temas[config.tema];
  const tamanhoFonteAtual = tamanhosFonte[config.fonte];

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

  const handleSalvar = async () => {
    const usuario = auth().currentUser;
    if (!usuario || !nome.trim() || !dose.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    try {
      if (editar && dados?.notificationIds?.length) {
        await cancelarNotificacoesAntigas(dados.notificationIds);
      }

      let novosIds = [];
      if (notificar) {
        novosIds = await agendarNotificacao({ nome, dose, modoNotificacao, horarios, intervaloHoras });
      }

      const medicamento = prepararDados(
        usuario.uid,
        { nome, dose, observacoes, notificar, horarios, intervaloHoras },
        novosIds
      );

      if (editar && dados?.id) {
        await firestore().collection('medicamentos').doc(dados.id).update(medicamento);
      } else {
        await firestore().collection('medicamentos').add(medicamento);
      }

      Alert.alert('Sucesso', editar ? 'Medicamento atualizado!' : 'Medicamento cadastrado!');
      navigation.goBack();
    } catch (err) {
      console.error('Erro ao salvar medicamento:', err);
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
  };

  const formatarHorario = (date) => date.toTimeString().slice(0, 5);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: temaAtual.fundo }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.container,
              {
                flexGrow: 1,
                justifyContent: 'center',
                backgroundColor: temaAtual.fundo,
                paddingBottom: 40,
              },
            ]}
          >
            <Text
              style={[
                styles.title,
                { color: temaAtual.texto, fontSize: tamanhoFonteAtual + 6 }
              ]}
            >

              {editar ? 'Editar Medicamento' : 'Cadastrar Medicamento'}
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor:
                    temaAtual.fundo === '#cce6ff' ? '#fff' : '#003366',
                  color: temaAtual.texto,
                  fontSize: tamanhoFonteAtual,
                },
              ]}
              placeholder="Nome"
              placeholderTextColor={temaAtual.texto + '99'}
              value={nome}
              onChangeText={setNome}
            />

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor:
                    temaAtual.fundo === '#cce6ff' ? '#fff' : '#003366',
                  color: temaAtual.texto,
                  fontSize: tamanhoFonteAtual,
                },
              ]}
              placeholder="Dose"
              placeholderTextColor={temaAtual.texto + '99'}
              value={dose}
              onChangeText={setDose}
            />


            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor:
                    temaAtual.fundo === '#cce6ff' ? '#fff' : '#003366',
                  color: temaAtual.texto,
                  fontSize: tamanhoFonteAtual,
                },
              ]}
              placeholder="Observações (opcional)"
              placeholderTextColor={temaAtual.texto + '99'}
              value={observacoes}
              onChangeText={setObservacoes}
            />


            <View style={styles.switchContainer}>
              <Text style={[styles.switchLabel, { color: temaAtual.texto, fontSize: tamanhoFonteAtual, }]}>
                Deseja ser notificado?
              </Text>
              <Switch value={notificar} onValueChange={setNotificar} />
            </View>

            {notificar && (
              <>
                <View style={styles.switchContainer}>
                  <Text style={[styles.switchLabel, { color: temaAtual.texto, fontSize: tamanhoFonteAtual, }]}>
                    Modo:
                  </Text>
                  <TouchableOpacity onPress={() => setModoNotificacao('horarios')}>
                    <Text
                      style={{
                        color:
                          modoNotificacao === 'horarios'
                            ? temaAtual.botaoFundo
                            : '#ccc', fontSize: tamanhoFonteAtual,
                        marginRight: 10,
                      }}
                    >
                      Horários
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setModoNotificacao('intervalo')}>
                    <Text
                      style={{
                        color:
                          modoNotificacao === 'intervalo'
                            ? temaAtual.botaoFundo
                            : '#ccc', fontSize: tamanhoFonteAtual
                      }}
                    >
                      A cada X horas
                    </Text>
                  </TouchableOpacity>
                </View>

                {modoNotificacao === 'horarios' ? (
                  <>
                    {horarios.map((h, i) => (
                     <TouchableOpacity
                       key={i}
                       onPress={() =>
                         TimePicker({
                           dataHora: h,
                           onConfirm: (date) => atualizarHorario(i, date),
                         })
                       }
                     >
                        <Text style={[styles.horarioText, { color: temaAtual.texto, fontSize: tamanhoFonteAtual}]}>
                          Horário {i + 1}: {formatarHorario(h)}
                        </Text>
                      </TouchableOpacity>
                    ))}

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 15,
                      }}
                    >
                      <Button
                        title="Adicionar horário"
                        onPress={() => setHorarios([...horarios, new Date()])}
                        color={temaAtual.botaoFundo}
                      />
                      {horarios.length > 1 && (
                        <Button
                          title="Remover último"
                          color="red"
                          onPress={() => setHorarios(horarios.slice(0, -1))}
                        />
                      )}
                    </View>
                  </>
                ) : (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor:
                          temaAtual.fundo === '#cce6ff' ? '#fff' : '#003366',
                        color: temaAtual.texto, fontSize: tamanhoFonteAtual,
                      },
                    ]}
                    placeholder="A cada quantas horas?"
                    placeholderTextColor={temaAtual.texto + '99'}
                    value={intervaloHoras}
                    onChangeText={(text) => setIntervaloHoras(text.replace(/[^0-9]/g, ''))}
                    keyboardType="numeric"
                  />
                )}
              </>
            )}

            <View style={{ marginTop: 20 }}>
              <Button
                title={editar ? 'Salvar Alterações' : 'Salvar Medicamento'}
                onPress={handleSalvar}
                color={temaAtual.botaoFundo}
              />
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default CadastrarMedicamento;
