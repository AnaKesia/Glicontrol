export function associarSintomas(registros, intervalo = null) {
  if (!Array.isArray(registros) || registros.length === 0) {
    return ['Nenhum registro de glicemia com sintomas para analisar.'];
  }

  let registrosFiltrados = registros;
  if (intervalo) {
    registrosFiltrados = registros.filter(r => {
      const data = r.timestamp.toDate ? r.timestamp.toDate() : new Date(r.timestamp);
      if (intervalo.inicio && data < intervalo.inicio) return false;
      if (intervalo.fim && data >= intervalo.fim) return false;
      return true;
    });
  }

  if (registrosFiltrados.length === 0) {
    return ['Nenhum registro com sintomas no período selecionado.'];
  }

  const sintomasPorTipo = {};

  registrosFiltrados.forEach(r => {
    if (Array.isArray(r.sintomas)) {
      r.sintomas.forEach(s => {
        if (!sintomasPorTipo[s]) sintomasPorTipo[s] = [];
        sintomasPorTipo[s].push(Number(r.valor));
      });
    }
  });

  const analises = [];

  for (const sintoma in sintomasPorTipo) {
    const valores = sintomasPorTipo[sintoma].filter(v => !isNaN(v));
    if (valores.length > 0) {
      const media = valores.reduce((a, b) => a + b, 0) / valores.length;
      let avaliacao = 'normal';
      if (media < 70) avaliacao = 'baixos';
      else if (media > 180) avaliacao = 'altos';
      analises.push(`🔍 Sintoma "${sintoma}" esteve associado a valores ${avaliacao} de glicemia (média de ${media.toFixed(1)} mg/dL no período).`);
    }
  }

  return analises.length > 0 ? analises : ['Nenhuma associação significativa entre sintomas e glicemia no período selecionado.'];
}
