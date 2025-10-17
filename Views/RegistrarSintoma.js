import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, Button, Alert, TouchableOpacity, ScrollView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useConfiguracoes, tamanhosFonte } from './Configuracoes';

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
    setSintomasSelecionados((prev) =>
      prev.includes(sintoma) ? prev.filter(s => s !== sintoma) : [...prev, sintoma]
    );
  };

  const handleSalvar = async () => {
    if (sintomasSelecionados.length === 0) {
      Alert.alert('Erro', 'Selecione ao menos um sintoma');
      return;
    }

    const user = auth().currentUser;
    if (!user) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }
    const userId = user.uid;

    const registro = {
      glicemiaId: sintomaEdicao?.glicemiaId || glicemiaId,
      sintoma: sintomasSelecionados,
      intensidade,
      anotacao: anotacao.trim(),
      timestamp: sintomaEdicao?.timestamp || firestore.FieldValue.serverTimestamp(),
      usuarioId: userId,
    };

    try {
      if (sintomaEdicao?.id) {
        await firestore().collection('sintomas').doc(sintomaEdicao.id).set(registro, { merge: true });
        Alert.alert('Sucesso', 'Sintoma atualizado!');
      } else {
        await firestore().collection('sintomas').add(registro);
        Alert.alert('Sucesso', 'Sintomas registrados!');
      }
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar sintoma:', error);
      Alert.alert('Erro ao salvar os sintomas');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {sintomaEdicao ? 'Editar Sintoma' : 'Registrar Sintoma'}
      </Text>

      <Text style={styles.label}>Selecione os sintomas:</Text>
      <View style={styles.sintomasContainer}>
        {sintomasListados.map((item) => {
          const selecionado = sintomasSelecionados.includes(item);
          return (
            <TouchableOpacity
              key={item}
              onPress={() => toggleSintoma(item)}
              style={[
                styles.sintomaButton,
                selecionado && styles.sintomaSelecionado,
              ]}
            >
              <Text style={[styles.sintomaTexto, { color: selecionado ? '#fff' : tema.texto }]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.label}>Intensidade:</Text>
      <View style={styles.buttonGroup}>
        {['leve', 'moderada', 'forte'].map((nivel) => (
          <TouchableOpacity
            key={nivel}
            style={[
              styles.intensidadeButton,
              intensidade === nivel && styles.intensidadeSelecionada,
            ]}
            onPress={() => setIntensidade(nivel)}
          >
            <Text style={[styles.buttonText, { color: intensidade === nivel ? '#fff' : '#000' }]}>{nivel}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { marginTop: 20 }]}>Anotação (opcional):</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Digite uma observação"
        value={anotacao}
        onChangeText={(text) => setAnotacao(text.trimStart())}
        multiline
        placeholderTextColor={tema.texto + '99'}
      />

      <View style={{ marginTop: 30 }}>
        <Button title="Salvar" onPress={handleSalvar} color={tema.botaoFundo} />
      </View>
    </ScrollView>
  );
};

export default RegistrarSintoma;

const criarEstilos = (tema, fonte) => StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: tema.fundo,
    flexGrow: 1,
  },
  title: {
    fontSize: fonte + 4,
    color: tema.texto,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    color: tema.texto,
    fontSize: fonte,
    marginBottom: 10,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: fonte,
    color: '#000',
  },
  sintomasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 15,
  },
  sintomaButton: {
    backgroundColor: '#007AFF33',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    margin: 5,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  sintomaSelecionado: {
    backgroundColor: '#007AFF',
    borderColor: '#fff',
  },
  sintomaTexto: {
    fontSize: fonte,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  intensidadeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ccc',
    borderRadius: 5,
  },
  intensidadeSelecionada: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: fonte,
  },
});
