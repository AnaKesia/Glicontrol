import firestore from '@react-native-firebase/firestore';

export const buscarHistoricoPeso = async (userId) => {
  const doc = await firestore().collection('usuarios').doc(userId).get();
  if (!doc.exists) return [];

  const data = doc.data();
  return Array.isArray(data.historicoPeso) ? data.historicoPeso : [];
};

export const analisarPeso = (historico, intervalo) => {
  if (!historico || historico.length === 0) {
    return {
      avaliacao: "Não há dados suficientes no período.",
      lista: []
    };
  }

  const registros = historico.map(item => ({
    peso: item.peso,
    timestamp: item.timestamp.toDate ? item.timestamp.toDate() : new Date(item.timestamp)
  }));

  const filtrados = registros.filter(r => {
    if (!intervalo) return true;
    if (intervalo.inicio && r.timestamp < intervalo.inicio) return false;
    if (intervalo.fim && r.timestamp >= intervalo.fim) return false;
    return true;
  });

  if (filtrados.length === 0) {
    return {
      avaliacao: "Não há dados suficientes no período.",
      lista: []
    };
  }

  const pesos = filtrados.map(i => i.peso);
  const menor = Math.min(...pesos);
  const maior = Math.max(...pesos);

  let avaliacao = "";

  if (menor === maior) {
    avaliacao = "O peso se manteve consistente no período.";
  } else {
    avaliacao = `O peso variou entre ${menor} kg e ${maior} kg no período selecionado.`;
  }

  return {
    avaliacao,
    lista: filtrados.sort((a, b) => b.timestamp - a.timestamp)
  };
};
