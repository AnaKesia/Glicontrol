import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ConfiguracoesContext = createContext();

export const useConfiguracoes = () => useContext(ConfiguracoesContext);

export const temas = {
  claro: {
    fundo: '#cce6ff',
    texto: '#003366',
    botaoFundo: '#007AFF',
    botaoTexto: '#fff',
  },
  escuro: {
    fundo: '#001f3f',
    texto: '#fff',
    botaoFundo: '#007AFF',
    botaoTexto: '#fff',
  },
};

export const tamanhosFonte = {
  pequena: 14,
  media: 18,
  grande: 22,
};

const CHAVE_TEMA = '@configuracoes:tema';
const CHAVE_FONTE = '@configuracoes:fonte';

export const ConfiguracoesProvider = ({ children }) => {
  const [config, setConfig] = useState({
    tema: 'escuro',
    fonte: 'media',
  });

  useEffect(() => {
    const carregarConfigSalva = async () => {
      try {
        const temaSalvo = await AsyncStorage.getItem(CHAVE_TEMA);
        const fonteSalva = await AsyncStorage.getItem(CHAVE_FONTE);
        setConfig({
          tema: temaSalvo ?? 'escuro',
          fonte: fonteSalva ?? 'media',
        });
      } catch (e) {
        console.error('Erro ao carregar configurações salvas:', e);
      }
    };
    carregarConfigSalva();
  }, []);

  const atualizarConfig = async (novasConfigs) => {
    try {
      if (novasConfigs.tema) {
        await AsyncStorage.setItem(CHAVE_TEMA, novasConfigs.tema);
      }
      if (novasConfigs.fonte) {
        await AsyncStorage.setItem(CHAVE_FONTE, novasConfigs.fonte);
      }

      setConfig((anterior) => ({ ...anterior, ...novasConfigs }));
    } catch (e) {
      console.error('Erro ao salvar configuração:', e);
    }
  };

  return (
    <ConfiguracoesContext.Provider value={{ config, atualizarConfig, temas, tamanhosFonte }}>
      {children}
    </ConfiguracoesContext.Provider>
  );
};
