import React, { useState } from 'react';
import {
  View, Text, TextInput, Button, Alert, ScrollView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { usePressao } from '../hooks/usoPressao';
import { useConfiguracoes, tamanhosFonte } from './Configuracoes';
import { TimePicker } from '../hooks/TimePicker';
import { criarEstilos } from '../estilos/inserirGlicemia';

const InserirPressao = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const pressao = route.params?.pressao;

  const { config, temas } = useConfiguracoes();
  const tema = temas[config.tema];
  const fonte = tamanhosFonte[config.fonte];
  const styles = criarEstilos(tema, fonte);

  const [mostrarTimePicker, setMostrarTimePicker] = useState(false);

  // Use o hook que já tem o estado de classificação
  const {
    sistolica, handleSistolicaChange,
    diastolica, handleDiastolicaChange,
    dataHora, setDataHora,
    observacao, setObservacao,
    classificacao,
    salvar
  } = usePressao(pressao);

  const handleSalvar = async () => {
    try {
      await salvar(); // já salva a classificação calculada pelo hook
      Alert.alert('Sucesso', 'Pressão registrada com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', error.message || 'Falha ao salvar os dados.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.innerContainer}>
        <Text style={styles.title}>{pressao ? 'Editar Pressão' : 'Nova Pressão'}</Text>

        <Text style={styles.label}>Pressão Sistólica (mmHg):</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 120"
          placeholderTextColor="#b0b0b0"
          keyboardType="numeric"
          value={sistolica}
          onChangeText={handleSistolicaChange}
        />

        <Text style={styles.label}>Pressão Diastólica (mmHg):</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 80"
          placeholderTextColor="#b0b0b0"
          keyboardType="numeric"
          value={diastolica}
          onChangeText={handleDiastolicaChange}
        />

        <Text style={[styles.label, { marginTop: 10 }]}>
          Classificação: {classificacao || '—'}
        </Text>

        <Button title="Selecionar Horário" onPress={() => setMostrarTimePicker(true)} />
        <Text style={styles.horaSelecionada}>
          {dataHora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>

        <TimePicker
          dataHora={dataHora}
          setDataHora={setDataHora}
          mostrar={mostrarTimePicker}
          setMostrar={setMostrarTimePicker}
        />

        <Text style={[styles.label, { marginTop: 20 }]}>Observações (opcional):</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Digite uma observação"
          placeholderTextColor="#999"
          value={observacao}
          onChangeText={t => setObservacao(t.trimStart())}
          multiline
        />

        <View style={{ marginTop: 30 }}>
          <Button
            title={pressao ? 'Salvar Alterações' : 'Salvar Pressão'}
            onPress={handleSalvar}
            color={tema.botaoFundo}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default InserirPressao;
