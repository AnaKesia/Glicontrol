import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PaginaInicial from './PaginaInicial';
import ListaMedicoes from './ListaMedicoes';
import ListaRemedios from './ListaRemedios';
import ListaRefeicoes from './ListaRefeicoes';
import Relatorios from './Relatorios';
import RelatorioCompleto from './RelatorioCompleto';
import TelaConfiguracoes from './TelaConfiguracoes'
import ListaAgua from './ListaAgua'
import ListaPressao from './ListaPressao'
import Perfil from './Perfil'

import auth from '@react-native-firebase/auth';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const handleLogout = () => {
    auth().signOut();
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <DrawerItemList {...props} />

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#001f3f' },
        headerTintColor: '#fff',
        drawerActiveTintColor: '#007AFF',
        drawerInactiveTintColor: '#000',
      }}
    >
      {}
      <Drawer.Screen name="Início" component={PaginaInicial} />
      <Drawer.Screen name="Medições" component={ListaMedicoes} />
      <Drawer.Screen name="Medicamentos" component={ListaRemedios} />
      <Drawer.Screen name="Refeições" component={ListaRefeicoes} />
      <Drawer.Screen name="Relatório" component={RelatorioCompleto} />
      <Drawer.Screen name="Consumo de água" component={ListaAgua} />
      <Drawer.Screen name="Pressão arterial" component={ListaPressao} />
      <Drawer.Screen name="Configurações" component={TelaConfiguracoes} />
      <Drawer.Screen name="Perfil" component={Perfil} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginTop: 'auto',
    padding: 20,
    backgroundColor: '#dc3545',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
