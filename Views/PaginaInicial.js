import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

const screenWidth = Dimensions.get('window').width;

const HomeScreen = () => {
  const navigation = useNavigation();
  const [labels, setLabels] = useState([]);
  const [glicemias, setGlicemias] = useState([]);

const carregarMedicoes = async () => {
  const userId = auth().currentUser?.uid;
  if (!userId) return;

  const agora = new Date();
  const inicioDoDia = new Date(
    agora.getFullYear(),
    agora.getMonth(),
    agora.getDate(),
    0, 0, 0
  );

  try {
    const snapshot = await firestore()
      .collection('medicoes')
      .where('usuarioId', '==', userId)
      .where('timestamp', '>=', firestore.Timestamp.fromDate(inicioDoDia))
      .orderBy('timestamp', 'desc')
      .get();

    const labelsAux = [];
    const dados = [];
    const dadosLocais = [];

    snapshot.forEach(doc => {
      const { valor, timestamp, observacoes } = doc.data();
      const data = new Date(timestamp.seconds * 1000);

      const hora = data.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      labelsAux.unshift(hora);
      dados.unshift(valor);
      dadosLocais.unshift({ valor, hora, observacoes });
    });

    if (dados.length > 0) {
      setLabels(labelsAux);
      setGlicemias(dados);
      await AsyncStorage.setItem('medicoesHoje', JSON.stringify(dadosLocais));
    } else {
      console.log('Nenhuma medição encontrada hoje.');
    }
  } catch (error) {
    console.warn('Erro ao buscar do Firebase. Tentando dados locais.');
    try {
      const cache = await AsyncStorage.getItem('medicoesHoje');
      if (cache) {
        const dadosLocais = JSON.parse(cache);
        setLabels(dadosLocais.map(d => d.hora));
        setGlicemias(dadosLocais.map(d => d.valor));
      }
    } catch (err) {
      console.error('Erro ao carregar dados locais:', err);
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    }
  }
};


  useEffect(() => {
    carregarMedicoes();
  }, []);

  const handleLogout = () => {
    auth()
      .signOut()
      .then(() => {
        navigation.replace('Login');
      })
      .catch(error => {
        console.error('Erro ao deslogar:', error);
      });
  };

  const data = {
    labels: labels.length > 0 ? labels : ['--:--'],
    datasets: [
      {
        data: glicemias.length > 0 ? glicemias : [0],
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.container}>


      <Text style={styles.title}>Últimas Medições de Glicemia</Text>

    <TouchableOpacity onPress={() => navigation.navigate('ListaMedicoes')}>
      <LineChart
        data={data}
        width={screenWidth - 30}
        height={220}
        chartConfig={{
          backgroundColor: '#007AFF',
          backgroundGradientFrom: '#007AFF',
          backgroundGradientTo: '#001f3f',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: () => '#fff',
        }}
        bezier
        style={styles.chart}
      />
    </TouchableOpacity>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('InserirGlicemia')}
      >
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001f3f',
    padding: 20,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
    alignSelf: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  logoutButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
});
