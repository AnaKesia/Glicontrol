import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';

import firestore from '@react-native-firebase/firestore';
import { criarAtividadeFisica } from '../firebaseService';
import { useConfiguracoes, tamanhosFonte } from './Configuracoes';
import { criarEstilosRegistrarAtividade } from '../estilos/registrarAtividade';

export default function RegistrarAtividade() {
  const navigation = useNavigation();
  const route = useRoute();
  const editar = route.params?.editar;
  const dadosEditar = route.params?.dados;

  const { config, temas } = useConfiguracoes();
  const temaAtual = temas[config.tema];
  const fonteAtual = tamanhosFonte[config.fonte];
  const styles = criarEstilosRegistrarAtividade(temaAtual, fonteAtual);

  const [minutos, setMinutos] = useState(dadosEditar?.minutos ? String(dadosEditar.minutos) : '');
  const [atividade, setAtividade] = useState(dadosEditar?.tipo ?? 'Caminhada');
  const [atividadePersonalizada, setAtividadePersonalizada] = useState(dadosEditar?.tipoPersonalizado ?? '');
  const [dataAtividade, setDataAtividade] = useState(
    dadosEditar?.timestamp?.toDate ? dadosEditar.timestamp.toDate() : new Date()
  );

  const [mostrarPicker, setMostrarPicker] = useState(false);

  const atividadesPadrao = [
    'Caminhada','Corrida',
    'Bicicleta', 'Musculação','Alongamento',
    'Dança', 'Yoga', 'Outro',
  ];

  const limparFormulario = () => {
    setMinutos('');
    setAtividade('Caminhada');
    setAtividadePersonalizada('');
    setDataAtividade(new Date());
  };

  useFocusEffect(
    useCallback(() => {
      if (!editar) limparFormulario();
    }, [editar])
  );

  function onChangeData(event, selectedDate) {
    setMostrarPicker(false);
    if (selectedDate) setDataAtividade(selectedDate);
  }

  async function salvarAtividade() {
    if (!minutos || Number(minutos) <= 0) {
      Alert.alert('Erro', 'Informe os minutos da atividade física.');
      return;
    }
    if (atividade === 'Outro' && atividadePersonalizada.trim() === '') {
      Alert.alert('Erro', 'Informe qual atividade foi realizada.');
      return;
    }

    try {
      if (editar && dadosEditar?.id) {
        await firestore()
          .collection('atividadesFisicas')
          .doc(dadosEditar.id)
          .update({
            minutos: Number(minutos),
            tipo: atividade,
            tipoPersonalizado: atividade === 'Outro' ? atividadePersonalizada.trim() : null,
            timestamp: dataAtividade,
          });
        Alert.alert('Sucesso', 'Atividade atualizada!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await criarAtividadeFisica({
          minutos: Number(minutos),
          tipo: atividade,
          tipoPersonalizado: atividade === 'Outro' ? atividadePersonalizada.trim() : null,
          data: dataAtividade,
        });
        Alert.alert('Sucesso', 'Atividade registrada com sucesso!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível salvar a atividade.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        {editar ? 'Editar Atividade Física' : 'Registrar Atividade Física'}
      </Text>

      <Text style={styles.label}>
        Data da atividade
      </Text>

      <TouchableOpacity
        style={styles.input}
        onPress={() => setMostrarPicker(true)}
      >
        <Text style={styles.inputTexto}>
          {dataAtividade.toLocaleDateString('pt-BR')}
        </Text>
      </TouchableOpacity>

      {mostrarPicker && (
        <DateTimePicker
          value={dataAtividade}
          mode="date"
          display={
            Platform.OS === 'ios'
              ? 'spinner'
              : 'default'
          }
          onChange={onChangeData}
          maximumDate={new Date()}
        />
      )}

      <Text style={styles.label}>
        Minutos de atividade
      </Text>
      <TextInput
        style={[styles.input, styles.inputTexto]}
        placeholder="Ex: 30"
        placeholderTextColor={temaAtual.txtplaceholder}
        keyboardType="numeric"
        value={minutos}
        onChangeText={setMinutos}
      />

      <Text style={styles.label}>
        Tipo de atividade
      </Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={atividade}
          onValueChange={setAtividade}
          style={{
            fontSize: fonteAtual,
            color: temaAtual.texto,
          }}
        >
          {atividadesPadrao.map(item => (
            <Picker.Item
              key={item}
              label={item}
              value={item}
            />
          ))}
        </Picker>
      </View>

      {atividade === 'Outro' && (
        <>
          <Text style={styles.label}>
            Qual atividade?
          </Text>
          <TextInput
            style={[styles.input, styles.inputTexto]}
            placeholder="Descreva a atividade"
            placeholderTextColor={temaAtual.txtplaceholder}
            value={atividadePersonalizada}
            onChangeText={setAtividadePersonalizada}
          />
        </>
      )}

      <TouchableOpacity
        style={styles.botao}
        onPress={salvarAtividade}
      >
        <Text style={styles.botaoTexto}>
          Salvar
        </Text>
      </TouchableOpacity>
    </View>
  );
}
