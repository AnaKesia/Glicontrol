import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { styles } from '../estilos/login';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState({});
  const navigation = useNavigation();
  const { login } = useAuth();

  const validarCampos = () => {
    const novosErros = {};
    if (!email) novosErros.email = 'Informe seu e-mail.';
    else if (!/\S+@\S+\.\S+/.test(email)) novosErros.email = 'Formato de e-mail inválido.';

    if (!senha) novosErros.senha = 'Informe sua senha.';
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleLogin = async () => {
    if (!validarCampos()) return;

    try {
      const { user } = await login(email, senha);
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
      console.log('Usuário logado:', user.email);
    } catch (error) {
      Alert.alert('Erro de login', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <View style={styles.inputContainer}>
        {erros.email && (
          <View style={styles.tooltip}>
            <Text style={styles.tooltipText}>{erros.email}</Text>
            <View style={styles.tooltipArrow} />
          </View>
        )}
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#ccc"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        {erros.senha && (
          <View style={styles.tooltip}>
            <Text style={styles.tooltipText}>{erros.senha}</Text>
            <View style={styles.tooltipArrow} />
          </View>
        )}
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#ccc"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />
      </View>

      <Button title="Entrar" onPress={handleLogin} />

      <View style={styles.registroContainer}>
        <Text style={styles.registro}>Não tem uma conta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
          <Text style={styles.registrarLink}>Registrar-se</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
