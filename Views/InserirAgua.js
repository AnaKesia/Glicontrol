import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Alert, ScrollView, TouchableOpacity
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useConfiguracoes, tamanhosFonte } from './Configuracoes';
import { criarEstilos } from '../estilos/inserirAgua';

const InserirAgua = () => {
  const [quantidade, setQuantidade] = useState('');
  const navigation = useNavigation();
  const route = useRoute();
  const registroEdicao = route.params?.registroEdicao || null; // 🔹 Recebe o registro, se for edição

  const { config, temas } = useConfiguracoes();
  const tema = temas[config.tema];
  const fonte = tamanhosFonte[config.fonte];
  const styles = criarEstilos(tema, fonte);

  const opcoesRapidas = [200, 300, 500, 750, 1000];

  // 🔹 Preenche o campo automaticamente se for edição
  useEffect(() => {
    if (registroEdicao) {
      setQuantidade(String(registroEdicao.quantidade));
    }
  }, [registroEdicao]);

  const handleSalvar = async () => {
    const user = auth().currentUser;
    if (!user) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    if (!quantidade) {
      Alert.alert('Atenção', 'Por favor, insira a quantidade de água.');
      return;
    }

    try {
      if (registroEdicao) {
        // 🔹 Atualiza o documento existente
        await firestore().collection('agua').doc(registroEdicao.id).update({
          quantidade: parseFloat(quantidade),
        });
        Alert.alert('Sucesso', 'Registro atualizado com sucesso!');
      } else {
        // 🔹 Cria um novo documento
        await firestore().collection('agua').add({
          usuarioId: user.uid,
          quantidade: parseFloat(quantidade),
          timestamp: firestore.FieldValue.serverTimestamp(),
        });
        Alert.alert('Sucesso', 'Registro de água salvo com sucesso!');
      }

      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar água:', error);
      Alert.alert('Erro', 'Não foi possível salvar o registro.');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>
          {registroEdicao ? 'Editar Consumo de Água' : 'Registrar Consumo de Água'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Quantidade (ml)"
          placeholderTextColor={tema.txtplaceholder}
          keyboardType="numeric"
          value={quantidade}
          onChangeText={t => setQuantidade(t.replace(/[^0-9.,]/g, ''))}
        />

        <Text style={styles.label}>Selecione uma quantidade rápida:</Text>
        <View style={styles.botoesRapidosContainer}>
          {opcoesRapidas.map((qtd) => (
            <TouchableOpacity
              key={qtd}
              style={styles.botaoRapido}
              onPress={() => setQuantidade(String(qtd))}
            >
              <Text style={styles.botaoRapidoTexto}>{qtd} ml</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.botaoSalvar} onPress={handleSalvar}>
          <Text style={styles.botaoSalvarTexto}>
            {registroEdicao ? 'Salvar Alterações' : 'Salvar'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default InserirAgua;
