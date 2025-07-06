
const GEMINI_API_KEY = 'AIzaSyDqH5QxZxhb8SpQ-_LEmhTteXmzYmpSHgE';

const MODEL_NAME = 'gemini-1.5-flash-latest';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

export const analisarImpactoGlicemicoGemini = async (refeicaoTexto) => {
  if (!refeicaoTexto || refeicaoTexto.trim() === '') {
    return 'Nenhuma observação fornecida para análise.';
  }

  const prompt = `
    Você é um assistente de nutrição que dá dicas rápidas e fáceis de entender.
    Analise a refeição: "${refeicaoTexto}"

    Responda em no máximo 5 linhas e com linguagem muito simples:
    1.  Classifique o impacto no açúcar do sangue como impacto: ALTO, MÉDIO ou BAIXO.
    2.  Explique o motivo principal em poucas palavras.
    3.  Dê uma dica prática ou uma recomendação.

    Após sua análise, adicione em uma nova linha o seguinte aviso obrigatório:
    "Aviso: Esta análise é uma estimativa de IA e não substitui a orientação profissional."
    `;

  try {
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro da API Google:', errorData);
      throw new Error(`Erro na API: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    return text;

  } catch (error) {
    console.error('Erro na chamada fetch para a API Gemini:', error);
    return 'Falha na comunicação com o serviço de análise. Verifique sua chave de API e conexão.';
  }
};