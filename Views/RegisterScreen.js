import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRegister } from '../hooks/useRegister';
import { styles } from '../estilos/registro';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const { registrar, erros } = useRegister();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleRegister = async () => {
    try {
      const { user } = await registrar(nome, email, senha);
      Alert.alert('Sucesso', 'Usuário registrado com sucesso!');
      console.log('Usuário registrado:', user.email);
    } catch (error) {
      Alert.alert('Erro de registro', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome de usuário"
        placeholderTextColor="#ccc"
        value={nome}
        onChangeText={setNome}
      />
      {erros.nome && <Text style={styles.erro}>{erros.nome}</Text>}

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#ccc"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {erros.email && <Text style={styles.erro}>{erros.email}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#ccc"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />
      {erros.senha && <Text style={styles.erro}>{erros.senha}</Text>}

      <Button title="Registrar" onPress={handleRegister} />
    </View>
  );
};

export default RegisterScreen;
