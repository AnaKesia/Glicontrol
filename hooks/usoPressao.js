import { useState, useEffect } from 'react';
import { PressaoService } from '../services/PressaoService';

export const usePressao = (pressao) => {
  const [sistolica, setSistolica] = useState('');
  const [diastolica, setDiastolica] = useState('');
  const [dataHora, setDataHora] = useState(new Date());
  const [observacao, setObservacao] = useState('');
  const [classificacao, setClassificacao] = useState('');

  const pressaoService = new PressaoService();

  useEffect(() => {
    if (pressao) {
      setSistolica(String(pressao.sistolica ?? ''));
      setDiastolica(String(pressao.diastolica ?? ''));
      if (pressao.timestamp?.seconds) {
        setDataHora(new Date(pressao.timestamp.seconds * 1000));
      }
      setObservacao(pressao.observacao || '');
      setClassificacao(pressao.classificacao || '');
    }
  }, [pressao]);

  const calcularClassificacao = (sist, diast) => {
    const s = Number(sist);
    const d = Number(diast);
    if (!s || !d) return '';
    if (s >= 180 || d >= 110) return 'Crise hipertensiva';
    if (s >= 160 || d >= 100) return 'Hipertensão estágio 2';
    if (s >= 140 || d >= 90) return 'Hipertensão estágio 1';
    if (s >= 120 || d >= 80) return 'Pré-hipertensão';
    return 'Normal';
  };

  const handleSistolicaChange = (valor) => {
    setSistolica(valor.replace(/[^0-9]/g, ''));
    setClassificacao(calcularClassificacao(valor, diastolica));
  };

  const handleDiastolicaChange = (valor) => {
    setDiastolica(valor.replace(/[^0-9]/g, ''));
    setClassificacao(calcularClassificacao(sistolica, valor));
  };

  const salvar = async () => {
    const s = Number(sistolica);
    const d = Number(diastolica);
    if (!s || !d) {
      throw new Error('Insira valores válidos para sistólica e diastólica.');
    }

    const dados = {
      sistolica: s,
      diastolica: d,
      timestamp: dataHora,
      observacao: observacao.trim(),
      classificacao,
    };

    const idPressao = await pressaoService.salvarPressao(dados, pressao?.id);
    return idPressao;
  };

  return {
    sistolica, setSistolica, handleSistolicaChange,
    diastolica, setDiastolica, handleDiastolicaChange,
    dataHora, setDataHora,
    observacao, setObservacao,
    classificacao,
    salvar,
  };
};
