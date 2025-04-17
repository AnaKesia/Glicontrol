import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const screenWidth = Dimensions.get('window').width;

const HomeScreen = () => {
  const navigation = useNavigation();

  const data = {
    labels: ['06:00', '09:00', '12:00', '15:00', '18:00'],
    datasets: [
      {
        data: [90, 110, 150, 130, 100],
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medições de Glicemia (Hoje)</Text>

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

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('InserirGlicemia')}
      >
        <Icon name="plus" color="#fff" size={24} />
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
});
