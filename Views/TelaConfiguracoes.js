import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useConfiguracoes, temas, tamanhosFonte } from './Configuracoes';

const TelaConfiguracoes = () => {
  const { config, atualizarConfig } = useConfiguracoes();

  return (
    <View style={[styles.container, { backgroundColor: temas[config.tema].fundo }]}>
      <Text style={[styles.titulo, { color: temas[config.tema].texto }]}>Configurações</Text>

      <Text style={[styles.label, { color: temas[config.tema].texto }]}>Tema:</Text>
      <View style={styles.botaoGrupo}>
        <TouchableOpacity
          style={[
            styles.botao,
            { backgroundColor: config.tema === 'claro' ? temas.claro.botaoFundo : temas.claro.fundo },
          ]}
          onPress={() => atualizarConfig({ tema: 'claro' })}
        >
          <Text style={{ color: temas.claro.botaoTexto }}>Claro</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.botao,
            { backgroundColor: config.tema === 'escuro' ? temas.escuro.botaoFundo : temas.escuro.fundo },
          ]}
          onPress={() => atualizarConfig({ tema: 'escuro' })}
        >
          <Text style={{ color: temas.escuro.botaoTexto }}>Escuro</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.label, { color: temas[config.tema].texto }]}>Tamanho da fonte:</Text>
      <View style={styles.botaoGrupo}>
        {['pequena', 'media', 'grande'].map((tamanho) => (
          <TouchableOpacity
            key={tamanho}
            style={[
              styles.botao,
              {
                backgroundColor:
                  config.fonte === tamanho ? temas[config.tema].botaoFundo : temas[config.tema].fundo,
              },
            ]}
            onPress={() => atualizarConfig({ fonte: tamanho })}
          >
            <Text style={{ color: temas[config.tema].botaoTexto }}>
              {tamanho.charAt(0).toUpperCase() + tamanho.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.preview, { color: temas[config.tema].texto, fontSize: tamanhosFonte[config.fonte] }]}>
        Exemplo de texto no tamanho selecionado
      </Text>
    </View>
  );
};

export default TelaConfiguracoes;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginTop: 10,
    marginBottom: 5,
  },
  botaoGrupo: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  botao: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    borderRadius: 8,
  },
  preview: {
    marginTop: 20,
  },
});
