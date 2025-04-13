import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarErro, setMostrarErro] = useState(false);
  const navigation = useNavigation();

  const handleLogin = () => {
    if (!email || !senha) {
      setMostrarErro(true);
      return;
    }

    setMostrarErro(false);
    console.log('Login com:', email, senha);
  };

  const handleRegistro = () => {
    navigation.navigate('Registro');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <View style={styles.inputContainer}>
        {mostrarErro && !email && (
          <View style={styles.tooltip}>
            <Text style={styles.tooltipText}>Preencha esse campo.</Text>
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
        {mostrarErro && !senha && (
          <View style={styles.tooltip}>
            <Text style={styles.tooltipText}>Preencha esse campo</Text>
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
        <TouchableOpacity onPress={handleRegistro}>
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
