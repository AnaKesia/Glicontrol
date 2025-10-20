import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import notifee from '@notifee/react-native';

import LoginScreen from './Views/LoginScreen';
import RegisterScreen from './Views/RegisterScreen';
import PaginaInicial from './Views/PaginaInicial';
import InserirGlicemia from './Views/InserirGlicemia';
import ListaMedicoes from './Views/ListaMedicoes';
import CadastrarMedicamento from './Views/CadastrarMedicamento';
import ListaRemedios from './Views/ListaRemedios';
import ListaRefeicoes from './Views/ListaRefeicoes';
import InserirRefeicao from './Views/InserirRefeicao';
import DrawerNavigator from './Views/DrawerNavigator';
import RegistrarSintoma from './Views/RegistrarSintoma';
import ListaSintomas from './Views/ListaSintomas';
import ConfirmarUsoMedicamento from './Views/ConfirmarUsoMedicamento';
import ListaUsoMedicamento from './Views/ListaUsoMedicamento';
import Relatorios from './Views/Relatorios';
import RelatorioCompleto from './Views/RelatorioCompleto';
import TelaConfiguracoes from './Views/TelaConfiguracoes';
import { ConfiguracoesProvider } from './Views/Configuracoes';

import 'react-native-gesture-handler';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const criarCanalNotificacoes = async () => {
      await notifee.createChannel({
        id: 'medicamentos',
        name: 'Notificações de Medicamentos',
      });
    };

    criarCanalNotificacoes();

    const unsubscribe = auth().onAuthStateChanged((usr) => {
      setUser(usr);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, []);

  if (initializing) return null;

  return (
    <ConfiguracoesProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <>
              <Stack.Screen name="HomeDrawer" component={DrawerNavigator} />
              <Stack.Screen name="PaginaInicial" component={PaginaInicial} />
              <Stack.Screen name="InserirGlicemia" component={InserirGlicemia} />
              <Stack.Screen name="CadastrarMedicamento" component={CadastrarMedicamento} />
              <Stack.Screen name="ListaMedicoes" component={ListaMedicoes} />
              <Stack.Screen name="ListaRefeicoes" component={ListaRefeicoes} />
              <Stack.Screen name="InserirRefeicao" component={InserirRefeicao} />
              <Stack.Screen name="RegistrarSintoma" component={RegistrarSintoma} />
              <Stack.Screen name="ListaSintomas" component={ListaSintomas} />
              <Stack.Screen name="ListaRemedios" component={ListaRemedios} />
              <Stack.Screen name="ConfirmarUsoMedicamento" component={ConfirmarUsoMedicamento} />
              <Stack.Screen name="ListaUsoMedicamento" component={ListaUsoMedicamento} />
              <Stack.Screen name="Relatorios" component={Relatorios} />
              <Stack.Screen name="RelatorioCompleto" component={RelatorioCompleto} />
              <Stack.Screen name="TelaConfiguracoes" component={TelaConfiguracoes} />
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Registro" component={RegisterScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ConfiguracoesProvider>
  );
}
