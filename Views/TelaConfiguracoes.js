import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useConfiguracoes, temas, tamanhosFonte } from './Configuracoes';
import { styles } from '../estilos/telaConfiguracoes';
import { deletarContaEDados } from '../services/usuarioService';

const TelaConfiguracoes = () => {
  const { config, atualizarConfig } = useConfiguracoes();
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  const handleDeletarConta = async () => {
    if (!confirmarExclusao) {
      setConfirmarExclusao(true);
      Alert.alert(
        'Tem certeza?',
        'Clicar novamente confirmará a exclusão da sua conta e todos os seus dados.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const mensagem = await deletarContaEDados();
      Alert.alert('Conta excluída', mensagem);
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setConfirmarExclusao(false);
    }
  };

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

      <Text
        style={[
          styles.preview,
          { color: temas[config.tema].texto, fontSize: tamanhosFonte[config.fonte] },
        ]}
      >
        Exemplo de texto no tamanho selecionado
      </Text>


      <TouchableOpacity
        onPress={handleDeletarConta}
        style={[
          styles.botao,
          {
            backgroundColor: confirmarExclusao ? '#aa0000' : '#cc0000',
            marginTop: 40,
            alignSelf: 'center',
            paddingHorizontal: 20,
          },
        ]}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>
          {confirmarExclusao ? 'Clique novamente para confirmar' : 'Deletar conta'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TelaConfiguracoes;
