import { useState, useEffect } from 'react';
import { GlicemiaService } from '../services/GlicemiaService';
import { validarMedicao } from '../utils/validacao';

export const useGlicemia = (medicao) => {
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('jejum');
  const [dataHora, setDataHora] = useState(new Date());
  const [observacao, setObservacao] = useState('');

  const glicemiaService = new GlicemiaService();

  useEffect(() => {
    if (medicao) {
      setValor(String(medicao.valor ?? ''));
      setCategoria(medicao.categoria ?? 'jejum');
      if (medicao.timestamp?.seconds) {
        setDataHora(new Date(medicao.timestamp.seconds * 1000));
      }
      setObservacao(medicao.observacao || '');
    }
  }, [medicao]);

  const salvar = async () => {
    const valorNumerico = Number(valor.replace(',', '.'));
    if (!valor || isNaN(valorNumerico) || valorNumerico <= 0) {
      throw new Error('Insira um valor numérico válido maior que zero.');
    }
    const erro = validarMedicao(valor, categoria);
    if (erro) throw new Error(erro);

    const dados = { valor: valorNumerico, categoria, timestamp: dataHora, observacao: observacao.trim() };
    return await glicemiaService.salvarMedicao(dados, medicao?.id);
  };

  return { valor, setValor, categoria, setCategoria, dataHora, setDataHora, observacao, setObservacao, salvar };
};
