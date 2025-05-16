import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import LoginScreen from './Views/LoginScreen';
import RegisterScreen from './Views/RegisterScreen';
import PaginaInicial from './Views/PaginaInicial';
import InserirGlicemia from './Views/InserirGlicemia';
import ListaMedicoes from './Views/ListaMedicoes';
import CadastrarMedicamento from './Views/CadastrarMedicamento';
import DrawerNavigator from './Views/DrawerNavigator';
import 'react-native-gesture-handler';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((usr) => {
      setUser(usr);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, []);

  if (initializing) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="HomeDrawer" component={DrawerNavigator} />
            <Stack.Screen name="InserirGlicemia" component={InserirGlicemia} />
            <Stack.Screen name="CadastrarMedicamento" component={CadastrarMedicamento} />
            <Stack.Screen name="ListaMedicoes" component={ListaMedicoes} />

          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Registro" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
