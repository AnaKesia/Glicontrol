import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Platform
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useConfiguracoes, tamanhosFonte } from './Configuracoes';
import { TimePicker } from '../hooks/TimePicker';
import { analisarImpactoGlicemicoGemini } from '../services/AnaliseGlicemicaIA';

const tiposRefeicao = ['Café da Manhã', 'Almoço', 'Lanche', 'Jantar', 'Outro'];

const InserirRefeicao = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const refeicao = route.params?.refeicao;

  const { config, temas } = useConfiguracoes();
  const tema = temas[config.tema];
  const tamanhoFonte = tamanhosFonte[config.fonte];
  const styles = criarEstilos(tema, tamanhoFonte);

  const [tipo, setTipo] = useState(
    refeicao && tiposRefeicao.includes(refeicao.tipo) ? refeicao.tipo : ''
  );
  const [calorias, setCalorias] = useState(refeicao?.calorias?.toString() || '');
  const [observacoes, setObservacoes] = useState(refeicao?.observacoes || '');
  const [data, setData] = useState(refeicao?.timestamp?.toDate() || new Date());
  const [mostrarData, setMostrarData] = useState(false);

  const salvar = async () => {
    if (!tipo || !observacoes.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    // ✅ Verifica se o usuário está autenticado
    const currentUser = auth().currentUser;
    if (!currentUser) {
      Alert.alert('Erro', 'Usuário não autenticado. Faça login novamente.');
      return;
    }
    const userId = currentUser.uid;

    let valorCalorias = null;
    if (calorias.trim() !== '') {
      const valor = parseInt(calorias);
      if (isNaN(valor) || valor < 0) {
        Alert.alert('Erro', 'Informe um valor de calorias válido (não negativo).');
        return;
      }
      valorCalorias = valor;
    }

    const dados = {
      tipo,
      observacoes: observacoes.trim(),
      usuarioId: userId,
      timestamp: firestore.Timestamp.fromDate(data),
    };

    if (valorCalorias !== null) {
      dados.calorias = valorCalorias;
    }

    try {
      let docRef;
      let precisaReanalisar = false;

      if (refeicao) {
        if (refeicao.observacoes !== observacoes.trim()) {
          precisaReanalisar = true;
          dados.analiseGlicemica = 'Análise em andamento...';
        } else if (refeicao.analiseGlicemica) {
          dados.analiseGlicemica = refeicao.analiseGlicemica;
        }

        docRef = firestore().collection('refeicoes').doc(refeicao.id);
        await docRef.set(dados, { merge: true });
      } else {
        docRef = await firestore().collection('refeicoes').add({
          ...dados,
          analiseGlicemica: 'Análise em andamento...',
        });
        precisaReanalisar = true;
      }

      if (precisaReanalisar && observacoes.trim() !== '') {
        try {
          const explicacao = await analisarImpactoGlicemicoGemini(observacoes);
          await docRef.update({ analiseGlicemica: explicacao });
        } catch (err) {
          console.error('Erro na IA:', err);
          await docRef.update({ analiseGlicemica: 'Análise falhou' });
        }
      }

      Alert.alert('Sucesso', refeicao ? 'Refeição atualizada!' : 'Refeição registrada!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar refeição:', error);
      Alert.alert('Erro', 'Não foi possível salvar a refeição.');
    }
  };

  return (
    <View style={styles.container}>
          <Text style={styles.label}>Tipo de Refeição:</Text>
          <View style={[styles.pickerContainer, { borderColor: tema.texto }]}>
            <Picker
              selectedValue={tipo}
              onValueChange={setTipo}
              style={[styles.picker, { color: tema.texto, fontSize: tamanhoFonte }]}
              dropdownIconColor={tema.texto}
            >
              <Picker.Item label="Selecione..." value="" />
              {tiposRefeicao.map(item => (
                <Picker.Item key={item} label={item} value={item} />
              ))}
            </Picker>
          </View>

      <Text style={styles.label}>Calorias:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={calorias}
        onChangeText={setCalorias}
        placeholder="Ex: 350"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Observações:</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        multiline
        value={observacoes}
        onChangeText={setObservacoes}
        placeholder="Ex: suco, sobremesa..."
        placeholderTextColor="#888"
      />

      <TouchableOpacity onPress={() => setMostrarData(true)} style={styles.dateButton}>
        <Text style={styles.dateButtonText}>Selecionar Hora</Text>
      </TouchableOpacity>
      <Text style={styles.selectedDate}>{data.toLocaleString()}</Text>

      <TimePicker
        dataHora={data}
        setDataHora={setData}
        mostrar={mostrarData}
        setMostrar={setMostrarData}
      />

      <TouchableOpacity style={styles.saveButton} onPress={salvar}>
        <Text style={styles.saveButtonText}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default InserirRefeicao;

const criarEstilos = (tema, fontSize) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: tema.fundo,
    },
    label: {
      color: tema.texto,
      marginBottom: 5,
      marginTop: 15,
      fontSize,
    },
    input: {
      backgroundColor: '#fff',
      padding: 10,
      borderRadius: 5,
      fontSize,
    },
    pickerContainer: {
       borderWidth: 1,
       borderRadius: 5,
       marginBottom: 10,
     },
    dateButton: {
      backgroundColor: '#007AFF',
      padding: 10,
      marginTop: 10,
      borderRadius: 5,
    },
    dateButtonText: {
      color: '#fff',
      textAlign: 'center',
      fontSize,
    },
    selectedDate: {
      color: tema.texto,
      marginTop: 5,
      fontSize,
    },
    saveButton: {
      backgroundColor: '#28a745',
      padding: 15,
      borderRadius: 5,
      marginTop: 20,
    },
    saveButtonText: {
      color: '#fff',
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize,
    },
  });
