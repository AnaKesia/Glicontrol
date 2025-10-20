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
import { criarEstilos } from '../estilos/inserirRefeicao';
import { launchImageLibrary } from 'react-native-image-picker';
import { analisarImagemRefeicao } from '../services/analiseImagemIA';

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

   const analisarImagem = async () => {
     try {
       const result = await launchImageLibrary({
         mediaType: 'photo',
         quality: 0.8,
         includeBase64: true,
       });

       if (result.assets && result.assets.length > 0) {
         const asset = result.assets[0];

         if (!asset.base64) {
           Alert.alert('Erro', 'Não foi possível obter a imagem em base64.');
           return;
         }

         setObservacoes(prev => (prev ? prev + '\nPor favor, aguarde um momento...' : 'Por favor, aguarde um momento...'));

         const textoGerado = await analisarImagemRefeicao(asset.base64, asset.type);

         setObservacoes(prev => {
           const linhas = prev.split('\n').filter(linha => linha !== 'Por favor, aguarde um momento...');
           const novoTexto = linhas.length > 0 ? linhas.join('\n') + '\n' + textoGerado : textoGerado;
           return novoTexto;
         });
       }
     } catch (err) {
       console.error('Erro ao analisar imagem:', err);
       Alert.alert('Erro', 'Não foi possível analisar a imagem.');
     }
   };

  const salvar = async () => {
    if (!tipo || !observacoes.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

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
          setObservacoes(prev => (prev ? prev + '\nPor favor, aguarde um momento...' : 'Por favor, aguarde um momento...'));

          const explicacao = await analisarImpactoGlicemicoGemini(observacoes);

          setObservacoes(prev => {
            const linhas = prev.split('\n').filter(linha => linha !== 'Por favor, aguarde um momento...');
            const novoTexto = linhas.length > 0 ? linhas.join('\n') + '\n' + explicacao : explicacao;
            return novoTexto;
          });

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

      <TouchableOpacity style={styles.imageButton} onPress={analisarImagem}>
        <Text style={styles.imageButtonText}>📷 Analisar Imagem</Text>
      </TouchableOpacity>

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