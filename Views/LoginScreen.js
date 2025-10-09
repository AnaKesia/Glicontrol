import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';

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
      navigation.navigate('PaginaInicial');
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
    position: 'relative',
  },
  input: {
    backgroundColor: '#fff',
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  tooltip: {
    position: 'absolute',
    top: -40,
    left: 10,
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 6,
    zIndex: 1,
  },
  tooltipText: {
    color: '#007AFF',
    fontSize: 12,
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -6,
    left: 10,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
  },
  registroContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registro: {
    color: '#fff',
  },
  registrarLink: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    color: '#fff',
  },
});
