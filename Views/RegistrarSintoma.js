import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { useConfiguracoes, tamanhosFonte } from './Configuracoes';
import { salvarSintoma } from '../services/sintomasService';
import { criarEstilos } from '../estilos/registrarSintoma';

const sintomasListados = [
  'Tontura', 'Visão turva', 'Dor de cabeça', 'Suor excessivo',
  'Fome repentina', 'Palpitação', 'Formigamento', 'Outro',
];

const RegistrarSintoma = ({ route, navigation }) => {
  const { glicemiaId, sintoma: sintomaEdicao } = route.params || {};

  const [sintomasSelecionados, setSintomasSelecionados] = useState([]);
  const [intensidade, setIntensidade] = useState('moderada');
  const [anotacao, setAnotacao] = useState('');

  const { config, temas } = useConfiguracoes();
  const tema = temas[config.tema];
  const fonte = tamanhosFonte[config.fonte];
  const styles = criarEstilos(tema, fonte);

  useEffect(() => {
    if (sintomaEdicao) {
      setSintomasSelecionados(
        Array.isArray(sintomaEdicao.sintoma) ? sintomaEdicao.sintoma : [sintomaEdicao.sintoma]
      );
      setIntensidade(sintomaEdicao.intensidade || 'moderada');
      setAnotacao(sintomaEdicao.anotacao || '');
    }
  }, [sintomaEdicao]);

  const toggleSintoma = (sintoma) => {
    setSintomasSelecionados(prev =>
      prev.includes(sintoma) ? prev.filter(s => s !== sintoma) : [...prev, sintoma]
    );
  };

  const validar = () => {
    if (!sintomasSelecionados.length) {
      Alert.alert('Erro', 'Selecione ao menos um sintoma');
      return false;
    }
    const user = auth().currentUser;
    if (!user) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return false;
    }
    return true;
  };

  const handleSalvar = async () => {
    if (!validar()) return;

    const userId = auth().currentUser.uid;
    const registro = {
      glicemiaId: sintomaEdicao?.glicemiaId || glicemiaId,
      sintoma: sintomasSelecionados,
      intensidade,
      anotacao: anotacao.trim(),
      timestamp: sintomaEdicao?.timestamp || new Date(),
      usuarioId: userId,
    };

    try {
      await salvarSintoma(registro, sintomaEdicao?.id);
      Alert.alert('Sucesso', sintomaEdicao ? 'Sintoma atualizado!' : 'Sintomas registrados!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar sintoma:', error);
      Alert.alert('Erro ao salvar os sintomas');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{sintomaEdicao ? 'Editar Sintoma' : 'Registrar Sintoma'}</Text>

      <Text style={styles.label}>Selecione os sintomas:</Text>
      <View style={styles.sintomasContainer}>
        {sintomasListados.map(item => {
          const selecionado = sintomasSelecionados.includes(item);
          return (
            <TouchableOpacity
              key={item}
              onPress={() => toggleSintoma(item)}
              style={[
                styles.sintomaButton,
                { backgroundColor: selecionado ? tema.botaoFundo : tema.fundoBotaoSecundario },
              ]}
            >
              <Text style={[styles.sintomaTexto, { color: selecionado ? tema.botaoTexto : tema.texto }]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.label}>Intensidade:</Text>
      <View style={styles.buttonGroup}>
        {['leve', 'moderada', 'forte'].map(nivel => (
          <TouchableOpacity
            key={nivel}
            style={[
              styles.intensidadeButton,
              { backgroundColor: intensidade === nivel ? tema.botaoFundo : tema.fundoBotaoSecundario },
            ]}
            onPress={() => setIntensidade(nivel)}
          >
            <Text style={{ color: intensidade === nivel ? tema.botaoTexto : tema.texto, fontWeight: 'bold', fontSize: fonte }}>
              {nivel}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { marginTop: 20 }]}>Anotação (opcional):</Text>
      <TextInput
        style={[styles.input, { height: 80, color: tema.texto, backgroundColor: tema.inputFundo }]}
        placeholder="Digite uma observação"
        value={anotacao}
        onChangeText={t => setAnotacao(t.trimStart())}
        multiline
        placeholderTextColor={tema.texto + '99'}
      />

      <View style={{ marginTop: 30 }}>
        <TouchableOpacity
          style={[styles.botao, { backgroundColor: tema.botaoFundo }]}
          onPress={handleSalvar}
        >
          <Text style={[styles.botaoTexto, { color: tema.botaoTexto }]}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default RegistrarSintoma;
