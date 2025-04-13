import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const RegisterScreen = ({ navigation }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleRegister = () => {
    if (!email || !senha || !nome) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    createUserWithEmailAndPassword(auth, email, senha)
      .then(userCredential => {
        console.log('Usuário registrado:', userCredential.user);
        Alert.alert('Sucesso', 'Usuário registrado com sucesso!');
        navigation.goBack();
      })
      .catch(error => {
        console.error('Erro ao registrar:', error);
        Alert.alert('Erro', error.message);
      });
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
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#ccc"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#ccc"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />
      <Button title="Registrar" onPress={handleRegister} />
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001f3f',
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
  input: {
    backgroundColor: '#fff',
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
});
