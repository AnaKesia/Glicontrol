import { formatarData } from '../utils/formatarData';

export function analisarGlicemia(registros, intervalo = null) {
  if (!Array.isArray(registros) || registros.length === 0) {
    return ['Nenhum registro de glicemia para analisar.'];
  }

  const registrosOrdenados = [...registros].sort((a, b) => {
    const da = a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
    const db = b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
    return da - db;
  });

  let registrosFiltrados = registrosOrdenados;

  if (intervalo?.inicio || intervalo?.fim) {
    registrosFiltrados = registrosOrdenados.filter(r => {
      const data = r.timestamp.toDate ? r.timestamp.toDate() : new Date(r.timestamp);
      if (intervalo.inicio && data < intervalo.inicio) return false;
      if (intervalo.fim && data >= intervalo.fim) return false;
      return true;
    });
  }

  if (registrosFiltrados.length === 0) {
    return ['Nenhum registro no intervalo selecionado para analisar.'];
  }

  const alertas = [];

  // Hipoglicemia matinal
  const matinais = registrosFiltrados.filter(r => {
    const d = r.timestamp.toDate ? r.timestamp.toDate() : new Date(r.timestamp);
    const h = d.getHours();
    return h >= 6 && h <= 9 && Number(r.valor) < 70;
  });

  if (matinais.length >= 3) {
    alertas.push('⚠️ Possível hipoglicemia recorrente pela manhã.');
  }

  // Variação brusca ≤ 2h
  for (let i = 1; i < registrosFiltrados.length; i++) {
    const atual = registrosFiltrados[i];
    const anterior = registrosFiltrados[i - 1];

    const v1 = Number(anterior.valor);
    const v2 = Number(atual.valor);

    const t1 = anterior.timestamp.toDate ? anterior.timestamp.toDate() : new Date(anterior.timestamp);
    const t2 = atual.timestamp.toDate ? atual.timestamp.toDate() : new Date(atual.timestamp);

    const diffMin = Math.abs(t2 - t1) / 60000;

    if (!isNaN(v1) && !isNaN(v2) && Math.abs(v2 - v1) >= 50 && diffMin <= 120) {
      alertas.push(`⚠️ Variação brusca detectada entre ${formatarData(anterior.timestamp)} e ${formatarData(atual.timestamp)}.`);
    }
  }

  // Queda progressiva
  for (let i = 2; i < registrosFiltrados.length; i++) {
    const v1 = Number(registrosFiltrados[i - 2].valor);
    const v2 = Number(registrosFiltrados[i - 1].valor);
    const v3 = Number(registrosFiltrados[i].valor);

    if (v1 > v2 && v2 > v3) {
      alertas.push(
        `⚠️ Queda progressiva entre ${formatarData(registrosFiltrados[i - 2].timestamp)}, ${formatarData(registrosFiltrados[i - 1].timestamp)} e ${formatarData(registrosFiltrados[i].timestamp)}.`
      );
      break;
    }
  }

  // Muitas medições
  for (let i = 0; i < registrosFiltrados.length; i++) {
    const inicio = registrosFiltrados[i].timestamp.toDate ? registrosFiltrados[i].timestamp.toDate() : new Date(registrosFiltrados[i].timestamp);
    let count = 1;

    for (let j = i + 1; j < registrosFiltrados.length; j++) {
      const atual = registrosFiltrados[j].timestamp.toDate ? registrosFiltrados[j].timestamp.toDate() : new Date(registrosFiltrados[j].timestamp);
      if ((atual - inicio) / 60000 <= 60) count++;
      else break;
    }

    if (count > 5) {
      alertas.push('⚠️ Muitas medições em curto intervalo (mais de 5 em 1 hora).');
      break;
    }
  }

  // Valores extremos
  registrosFiltrados.forEach(r => {
    const val = Number(r.valor);
    if (val > 400) {
      alertas.push(`⚠️ Valor extremamente alto: ${val} mg/dL em ${formatarData(r.timestamp)}.`);
    } else if (val < 40) {
      alertas.push(`⚠️ Valor extremamente baixo: ${val} mg/dL em ${formatarData(r.timestamp)}.`);
    }
  });

  return alertas.length ? alertas : ['Nenhum alerta significativo no período.'];
}
