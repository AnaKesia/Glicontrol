import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useGlicemia } from '../hooks/usoGlicemia';
import { useConfiguracoes, tamanhosFonte } from './Configuracoes';
import { TimePicker } from '../hooks/TimePicker';
import { criarEstilos } from '../estilos/inserirGlicemia';

const InserirGlicemia = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const medicao = route.params?.medicao;

  const { config, temas } = useConfiguracoes();
  const tema = temas[config.tema];
  const fonte = tamanhosFonte[config.fonte];

  const [mostrarTimePicker, setMostrarTimePicker] = useState(false);

  const { valor, setValor, categoria, setCategoria, dataHora, setDataHora, observacao, setObservacao, salvar } = useGlicemia(medicao);

  const handleSalvar = async () => {
    try {
      const mensagem = await salvar();
      Alert.alert('Sucesso', mensagem, [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (erro) {
      Alert.alert('Erro', erro.message || 'Não foi possível salvar a medição.');
    }
  };

  const styles = criarEstilos(tema, fonte);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{medicao ? 'Editar Medição' : 'Nova Medição'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Valor da glicemia (mg/dL)"
        placeholderTextColor={tema.placeholder}
        keyboardType="numeric"
        value={valor}
        onChangeText={t => setValor(t.replace(/[^0-9.,]/g, ''))}
      />

      <Picker selectedValue={categoria} style={styles.input} onValueChange={setCategoria} dropdownIconColor={tema.texto}>
        <Picker.Item label="Jejum" value="jejum" />
        <Picker.Item label="Pós-Café" value="pos-cafe" />
        <Picker.Item label="Pós-Almoço" value="pos-almoco" />
        <Picker.Item label="Pós-Janta" value="pos-janta" />
        <Picker.Item label="Antes de Dormir" value="antes-dormir" />
        <Picker.Item label="Outro" value="outro" />
      </Picker>

      <Button title="Selecionar Horário" onPress={() => setMostrarTimePicker(true)} />
      <Text style={styles.horaSelecionada}>{dataHora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      <TimePicker dataHora={dataHora} setDataHora={setDataHora} mostrar={mostrarTimePicker} setMostrar={setMostrarTimePicker} />

      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Observações (opcional)"
        placeholderTextColor={tema.placeholder}
        multiline
        value={observacao}
        onChangeText={setObservacao}
        autoCapitalize="sentences"
        autoCorrect
      />

      <Button title={medicao ? 'Salvar Alterações' : 'Salvar Medição'} onPress={handleSalvar} color={tema.botaoFundo} />
    </View>
  );
};

export default InserirGlicemia;
