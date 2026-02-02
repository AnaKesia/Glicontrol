import React, { useState } from 'react';
import {
  View, Text, TextInput, Button, Alert, ScrollView, TouchableOpacity
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useGlicemia } from '../hooks/usoGlicemia';
import { useConfiguracoes, tamanhosFonte } from './Configuracoes';
import { TimePicker } from '../hooks/TimePicker';
import { criarEstilos } from '../estilos/inserirGlicemia';

const sintomasListados = [
  'Tontura', 'Visão turva', 'Dor de cabeça', 'Suor excessivo',
  'Fome repentina', 'Palpitação', 'Formigamento', 'Outro',
];

const InserirGlicemia = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const medicao = route.params?.medicao;

  const { config, temas } = useConfiguracoes();
  const tema = temas[config.tema];
  const fonte = tamanhosFonte[config.fonte];
  const styles = criarEstilos(tema, fonte);

  const [mostrarSintomas, setMostrarSintomas] = useState(false);
  const [mostrarPeso, setMostrarPeso] = useState(false);

  const {
    valor, setValor,
    categoria, setCategoria,
    dataHora, setDataHora,
    observacao, setObservacao,
    sintomas, setSintomas,
    intensidade, setIntensidade,
    peso, setPeso,
    salvar
  } = useGlicemia(medicao);

  const toggleSintoma = (sintoma) => {
    setSintomas(prev =>
      prev.includes(sintoma) ? prev.filter(s => s !== sintoma) : [...prev, sintoma]
    );
  };

  const handleSalvar = async () => {
    try {
      await salvar({ peso });
      Alert.alert('Sucesso', 'Dados salvos com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      Alert.alert('Erro', error.message || 'Falha ao salvar os dados.');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>
          {medicao ? 'Editar Medição' : 'Nova Medição'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Insira medição"
          placeholderTextColor="#b0b0b0"
          keyboardType="numeric"
          value={valor}
          onChangeText={t => setValor(t.replace(/[^0-9.,]/g, ''))}
        />

        <Picker
          selectedValue={categoria}
          style={styles.input}
          onValueChange={setCategoria}
          dropdownIconColor={tema.texto}
        >
          <Picker.Item label="Jejum" value="jejum" />
          <Picker.Item label="Pós-Café" value="pos-cafe" />
          <Picker.Item label="Pós-Almoço" value="pos-almoco" />
          <Picker.Item label="Pós-Janta" value="pos-janta" />
          <Picker.Item label="Antes de Dormir" value="antes-dormir" />
          <Picker.Item label="Outro" value="outro" />
        </Picker>

        <Button title="Selecionar Horário" onPress={() => TimePicker({ dataHora, setDataHora })}/>

        <TouchableOpacity
          style={[styles.toggleBotao, { backgroundColor: tema.fundoBotaoSecundario, marginTop: 20 }]}
          onPress={() => setMostrarSintomas(!mostrarSintomas)}
        >
          <Text style={{ color: tema.texto, fontSize: fonte, fontWeight: 'bold' }}>
            {mostrarSintomas ? '▶Ocultar Sintomas' : '▼Mostrar Sintomas'}
          </Text>
        </TouchableOpacity>

        {mostrarSintomas && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.label}>Sintomas (opcional):</Text>
            <View style={styles.sintomasContainer}>
              {sintomasListados.map(item => {
                const selecionado = sintomas.includes(item);
                return (
                  <TouchableOpacity
                    key={item}
                    onPress={() => toggleSintoma(item)}
                    style={[
                      styles.sintomaButton,
                      { backgroundColor: selecionado ? tema.botaoFundo : tema.fundoBotaoSecundario },
                    ]}
                  >
                    <Text style={{
                      color: selecionado ? tema.botaoTexto : tema.texto,
                      fontSize: fonte
                    }}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {sintomas.length > 0 && (
              <>
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
                      <Text style={{
                        color: intensidade === nivel ? tema.botaoTexto : tema.texto,
                        fontWeight: 'bold',
                        fontSize: fonte
                      }}>
                        {nivel}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        <Text style={[styles.label, { marginTop: 20 }]}>Observações (opcional):</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Digite uma observação sobre a medição ou sintomas"
          value={observacao}
          onChangeText={t => setObservacao(t.trimStart())}
          multiline
          placeholderTextColor="#999"
        />

        <View style={{ marginTop: 30 }}>
          <Button
            title={medicao ? 'Salvar Alterações' : 'Salvar Medição'}
            onPress={handleSalvar}
            color={tema.botaoFundo}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default InserirGlicemia;