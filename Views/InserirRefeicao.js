import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { useConfiguracoes, tamanhosFonte } from './Configuracoes';
import { criarEstilos } from '../estilos/inserirRefeicao';
import { TimePicker } from '../hooks/TimePicker';
import { salvarRefeicao } from '../services/RefeicaoService';
import { analisarImagem } from '../services/ImagemService';

const tiposRefeicao = ['Café da Manhã', 'Almoço', 'Lanche', 'Jantar', 'Outro'];

const InserirRefeicao = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const refeicao = route.params?.refeicao;

  const { config, temas } = useConfiguracoes();
  const tema = temas[config.tema];
  const tamanhoFonte = tamanhosFonte[config.fonte];
  const styles = criarEstilos(tema, tamanhoFonte);

  const [tipo, setTipo] = useState(refeicao?.tipo || '');
  const [calorias, setCalorias] = useState(refeicao?.calorias?.toString() || '');
  const [observacoes, setObservacoes] = useState(refeicao?.observacoes || '');
  const [data, setData] = useState(refeicao?.timestamp?.toDate() || new Date());
  const [mostrarData, setMostrarData] = useState(false);

  const handleAnalyzeImage = async () => {
    try {
      setObservacoes(prev => (prev ? prev + '\nPor favor, aguarde um momento...' : 'Por favor, aguarde um momento...'));
      const texto = await analisarImagem();
      setObservacoes(prev => {
        const linhas = prev.split('\n').filter(l => l !== 'Por favor, aguarde um momento...');
        return linhas.length ? linhas.join('\n') + '\n' + texto : texto;
      });
    } catch (err) {
      Alert.alert('Erro', err.message);
    }
  };

  const handleSave = async () => {
    if (!tipo || !observacoes.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setObservacoes(prev => (prev ? prev + '\nPor favor, aguarde um momento...' : 'Por favor, aguarde um momento...'));
      const analise = await salvarRefeicao({
        id: refeicao?.id,
        tipo,
        calorias: calorias ? parseInt(calorias) : null,
        observacoes,
        data,
      });
      setObservacoes(prev => prev.replace('Por favor, aguarde um momento...', analise));
      Alert.alert('Sucesso', refeicao ? 'Refeição atualizada!' : 'Refeição registrada!');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível salvar a refeição.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tipo de Refeição:</Text>
      <View style={[styles.pickerContainer, { borderColor: tema.texto }]}>
        <Picker selectedValue={tipo} onValueChange={setTipo} style={[styles.picker, { color: tema.texto, fontSize: tamanhoFonte }]} dropdownIconColor={tema.texto}>
          <Picker.Item label="Selecione..." value="" />
          {tiposRefeicao.map(item => <Picker.Item key={item} label={item} value={item} />)}
        </Picker>
      </View>

      <Text style={styles.label}>Calorias:</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={calorias}
      onChangeText={text => {
      let num = text.replace(/[^0-9]/g, ''); setCalorias(num);
      }} placeholder="Ex: 350" placeholderTextColor="#888" />

      <TouchableOpacity style={styles.imageButton} onPress={handleAnalyzeImage}>
        <Text style={styles.imageButtonText}>📷 Analisar Imagem</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Observações:</Text>
      <TextInput style={[styles.input, { height: 80 }]} multiline value={observacoes} onChangeText={setObservacoes} placeholder="Ex: suco, sobremesa..." placeholderTextColor="#888" />

      <TouchableOpacity onPress={() => setMostrarData(true)} style={styles.dateButton}>
        <Text style={styles.dateButtonText}>Selecionar Hora</Text>
      </TouchableOpacity>
      <Text style={styles.selectedDate}>{data.toLocaleString()}</Text>

      <TimePicker dataHora={data} setDataHora={setData} mostrar={mostrarData} setMostrar={setMostrarData} />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default InserirRefeicao;
