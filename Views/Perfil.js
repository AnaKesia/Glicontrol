import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useConfiguracoes, tamanhosFonte } from './Configuracoes';
import { criarEstilos } from '../estilos/relatorios';

const Perfil = () => {
  const [nome, setNome] = useState('');
  const [peso, setPeso] = useState('');
  const [email, setEmail] = useState('');
  const [carregando, setCarregando] = useState(true);

  const user = auth().currentUser;
  const uid = user?.uid;

  const { config, temas } = useConfiguracoes();
  const tema = temas[config.tema];
  const fonte = tamanhosFonte[config.fonte];
  const styles = criarEstilos(tema, fonte);

  useEffect(() => {
    if (!uid) return;

    const carregarPerfil = async () => {
      try {
        setEmail(user.email);

        const doc = await firestore().collection('usuarios').doc(uid).get();

        if (doc.exists) {
          const data = doc.data() || {};

          if (typeof data.nome === 'string') {
            setNome(data.nome);
          }

          if (data.pesoAtual !== undefined && data.pesoAtual !== null) {
            setPeso(String(data.pesoAtual));
          }
        }
      } catch (e) {
        console.error("Erro ao carregar perfil:", e);
      } finally {
        setCarregando(false);
      }
    };

    carregarPerfil();
  }, [uid]);

  const salvarPerfil = async () => {
    if (!uid) return;

    if (!nome.trim()) {
      Alert.alert("Atenção", "Informe seu nome.");
      return;
    }

    const pesoNumero = peso ? Number(peso) : null;
    if (peso && isNaN(pesoNumero)) {
      Alert.alert("Atenção", "Peso deve ser um número válido.");
      return;
    }

    try {
      const ref = firestore().collection('usuarios').doc(uid);

      const doc = await ref.get();
      const data = doc.exists ? (doc.data() || {}) : {};

      const historico = Array.isArray(data.historicoPeso) ? data.historicoPeso : [];

      if (pesoNumero) {
        historico.push({
          peso: pesoNumero,
          timestamp: new Date()
        });
      }

      await ref.set(
        {
          nome,
          email: user.email,
          pesoAtual: pesoNumero || null,
          historicoPeso: historico
        },
        { merge: true }
      );

      Alert.alert("Sucesso", "Perfil atualizado!");
    } catch (e) {
      console.error("Erro ao salvar perfil:", e);
      Alert.alert("Erro", "Não foi possível salvar suas informações.");
    }
  };

  if (carregando) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={tema.botaoFundo} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { padding: 20 }]}>
      <Text style={styles.titulo}>Perfil</Text>

      <Text style={styles.texto}>Nome</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Seu nome"
        placeholderTextColor="#aaa"
      />

      <Text style={[styles.texto, { marginTop: 15 }]}>E-mail</Text>
      <TextInput
        style={[styles.input, { opacity: 0.7 }]}
        editable={false}
        value={email}
      />

      <Text style={[styles.texto, { marginTop: 15 }]}>Peso atual (kg)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={peso}
        onChangeText={setPeso}
        placeholder="Ex: 72"
        placeholderTextColor="#aaa"
      />

      <TouchableOpacity style={[styles.botao, { marginTop: 25 }]} onPress={salvarPerfil}>
        <Text style={styles.textoBotao}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Perfil;
