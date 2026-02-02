import React, { useState } from 'react';
import {
  View, Text, TextInput, Button, Alert, ScrollView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { usePressao } from '../hooks/usoPressao';
import { useConfiguracoes, tamanhosFonte } from './Configuracoes';
import { TimePicker } from '../hooks/TimePicker';
import { criarEstilos } from '../estilos/inserirPressao';

const InserirPressao = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const pressao = route.params?.pressao;

  const { config, temas } = useConfiguracoes();
  const tema = temas[config.tema];
  const fonte = tamanhosFonte[config.fonte];
  const styles = criarEstilos(tema, fonte);

  const {
    sistolica, handleSistolicaChange,
    diastolica, handleDiastolicaChange,
    dataHora, setDataHora,
    observacao, setObservacao,
    classificacao,
    salvar
  } = usePressao(pressao);

  const getClassificacaoCor = () => {
    if (!classificacao) return { cor: tema.texto, fundo: tema.fundoBotaoSecundario };

    if (classificacao === 'Normal') {
      return { cor: '#dcfce7', fundo: '#22c55e' };
    } else if (classificacao === 'Pré-hipertensão') {
      return { cor: '#ffdb58', fundo: '#f59e0b' };
    } else if (classificacao === 'Hipertensão estágio 1') {
      return { cor: '#ea580c', fundo: '#fed7aa' };
    } else if (classificacao === 'Hipertensão estágio 2' || classificacao === 'Crise hipertensiva') {
      return { cor: '#cddddd', fundo: '#ef4444' };
    }

    return { cor: tema.texto, fundo: tema.fundoBotaoSecundario };
  };

  const corClassificacao = getClassificacaoCor();

  const handleSalvar = async () => {
    try {
      await salvar();
      Alert.alert('Sucesso', 'Pressão registrada com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', error.message || 'Falha ao salvar os dados.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.innerContainer}>
        <Text style={styles.title}>
          {pressao ? 'Editar Pressão' : 'Nova Medição de Pressão'}
        </Text>

        {/* Inputs lado a lado */}
        <View style={styles.inputContainer}>
          <View style={styles.inputHalf}>
            <Text style={styles.label}>Sistólica</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 120"
              placeholderTextColor="#b0b0b0"
              keyboardType="numeric"
              value={sistolica}
              onChangeText={handleSistolicaChange}
            />
            <Text style={styles.subLabel}>mmHg</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.inputHalf}>
            <Text style={styles.label}>Diastólica</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 80"
              placeholderTextColor="#b0b0b0"
              keyboardType="numeric"
              value={diastolica}
              onChangeText={handleDiastolicaChange}
            />
            <Text style={styles.subLabel}>mmHg</Text>
          </View>
        </View>

        {/* Card destaque com resultado e classificação */}
        {sistolica && diastolica && (
          <View style={[styles.resultCard, { backgroundColor: corClassificacao.fundo }]}>
            <Text style={styles.resultLabel}>Sua Pressão</Text>
            <Text style={styles.resultValue}>
              {sistolica}/{diastolica}
            </Text>
            <Text style={[styles.classificacaoTexto, { color: corClassificacao.cor }]}>
              {classificacao || '—'}
            </Text>
          </View>
        )}

        <Button title="Selecionar Horário" onPress={() => TimePicker({ dataHora, setDataHora })}/>

        <Text style={[styles.label, { marginTop: 20 }]}>Observações (opcional):</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Digite uma observação"
          placeholderTextColor="#999"
          value={observacao}
          onChangeText={t => setObservacao(t.trimStart())}
          multiline
        />

        {/* Botão Salvar */}
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