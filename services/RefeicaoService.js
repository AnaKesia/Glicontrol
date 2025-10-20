import { criarRefeicao, editarRefeicao } from '../firebaseService';
import { analisarImpactoGlicemicoGemini } from './AnaliseGlicemicaIA';

export const salvarRefeicao = async ({ id, tipo, calorias, observacoes, data }) => {
  const dados = {
    tipo,
    calorias: typeof calorias === 'number' && calorias >= 0 ? calorias : null,
    observacoes,
    timestamp: new Date(data),
    analiseGlicemica: 'Análise em andamento...',
  };

  let docRef;

  if (id) {
    await editarRefeicao(id, dados);
    docRef = { id };
  } else {
    docRef = await criarRefeicao(tipo, calorias, observacoes, data);
    await editarRefeicao(docRef.id, { analiseGlicemica: 'Análise em andamento...' });
  }

  try {
    const analise = await analisarImpactoGlicemicoGemini(observacoes);
    await editarRefeicao(docRef.id, { analiseGlicemica: analise });
    return analise;
  } catch (err) {
    console.error('Erro na IA:', err);
    await editarRefeicao(docRef.id, { analiseGlicemica: 'Análise falhou' });
    return 'Análise falhou';
  }
};